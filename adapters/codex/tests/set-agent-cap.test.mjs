/**
 * Tests for shared/scripts/set-agent-cap.mjs: every way the config edit can
 * go, against throwaway CODEX_HOME folders and a stand-in codex binary that
 * reports the config loaded or not on cue.
 *
 * Written by Claude Opus 5.5 for Donald, 2026-10-05. Status: passing, not
 * reviewed.
 *
 * Run: node --test adapters/codex/tests/*.test.mjs
 *
 * @interacts  runs set-agent-cap.mjs as a child process with CODEX_HOME and
 *             CODEX_BIN pointed into a temp folder; imports its edit()
 * @deps       node:test, node:assert, node:child_process, node:fs, node:os,
 *             node:path, node:url. No packages.
 * @alloc      one temp folder per test, removed in its finally block
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { edit } from '../plugin/shared/scripts/set-agent-cap.mjs';

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), '../plugin/shared/scripts/set-agent-cap.mjs');

// Stand-in for `codex [--strict-config] doctor`: broken on BROKEN, broken in
// strict mode on unknown_key, broken after the edit when FAKE_FAIL_AFTER is set.
const FAKE_CODEX = `#!/usr/bin/env node
const fs = require('node:fs');
const strict = process.argv.includes('--strict-config');
let text = '';
try { text = fs.readFileSync(process.env.CODEX_HOME + '/config.toml', 'utf8'); } catch {}
const broken = text.includes('BROKEN')
  || (strict && text.includes('unknown_key'))
  || (process.env.FAKE_FAIL_AFTER && text.includes('max_concurrent_threads_per_session'));
console.log(broken ? '  ✗ config       config could not be loaded' : '  ✓ config       loaded');
`;

function withHome(config, fn, env = {}) {
  const root = mkdtempSync(join(tmpdir(), 'djinn-cap-'));
  try {
    const bin = join(root, 'codex');
    writeFileSync(bin, FAKE_CODEX);
    chmodSync(bin, 0o755);
    const home = join(root, 'home');
    spawnSync('mkdir', ['-p', home]);
    if (config !== null) writeFileSync(join(home, 'config.toml'), config);
    const run = (...args) =>
      spawnSync('node', [SCRIPT, ...args], {
        env: { ...process.env, CODEX_HOME: home, CODEX_BIN: bin, ...env },
        encoding: 'utf8',
      });
    const read = () => readFileSync(join(home, 'config.toml'), 'utf8');
    const backups = () => readdirSync(home).filter((n) => n.includes('djinn-backup'));
    fn({ run, read, backups, home });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('no config.toml: creates one holding the agents table', () => {
  withHome(null, ({ run, read, backups }) => {
    const r = run();
    assert.equal(r.status, 0);
    assert.equal(read(), '[agents]\nmax_concurrent_threads_per_session = 8\n');
    assert.deepEqual(backups(), []);
  });
});

test('no agents table: appends it and leaves every other byte alone', () => {
  const before = 'model = "gpt-6.1-sol"\n\n[tui]\nanimations = false\n';
  withHome(before, ({ run, read, backups }) => {
    assert.equal(run().status, 0);
    assert.equal(read(), before + '\n[agents]\nmax_concurrent_threads_per_session = 8\n');
    assert.equal(backups().length, 1);
  });
});

test('agents table without the key: inserts it under the header', () => {
  withHome('[agents]\nmax_depth = 2\n\n[tui]\nx = 1\n', ({ run, read }) => {
    assert.equal(run().status, 0);
    assert.equal(read(), '[agents]\nmax_concurrent_threads_per_session = 8\nmax_depth = 2\n\n[tui]\nx = 1\n');
  });
});

test('key present with another value: replaces that one line', () => {
  withHome('[agents]\nmax_concurrent_threads_per_session = 3\n', ({ run, read }) => {
    const r = run('6');
    assert.equal(r.status, 0);
    assert.equal(read(), '[agents]\nmax_concurrent_threads_per_session = 6\n');
    assert.match(r.stdout, /next Codex session/);
  });
});

test('key already at the cap: says so and writes nothing', () => {
  withHome('[agents]\nmax_concurrent_threads_per_session = 8\n', ({ run, read, backups }) => {
    const r = run();
    assert.equal(r.status, 0);
    assert.match(r.stdout, /^already set/);
    assert.equal(read(), '[agents]\nmax_concurrent_threads_per_session = 8\n');
    assert.deepEqual(backups(), []);
  });
});

test('a dotted key or inline table is refused, file untouched', () => {
  for (const before of ['agents.max_concurrent_threads_per_session = 4\n', 'agents = { max_concurrent_threads_per_session = 4 }\n']) {
    withHome(before, ({ run, read }) => {
      const r = run();
      assert.equal(r.status, 1);
      assert.match(r.stdout, /^not changed: .* by hand\.$/m);
      assert.equal(read(), before);
    });
  }
});

test('Codex cannot load the result: the old file is put back', () => {
  const before = '[tui]\nx = 1\n';
  withHome(before, ({ run, read }) => {
    const r = run();
    assert.equal(r.status, 1);
    assert.match(r.stdout, /^rolled back/);
    assert.equal(read(), before);
  }, { FAKE_FAIL_AFTER: '1' });
});

test('a config that already fails to load is not touched', () => {
  withHome('BROKEN\n', ({ run, read, backups }) => {
    const r = run();
    assert.equal(r.status, 1);
    assert.match(r.stdout, /does not load in Codex as it is/);
    assert.equal(read(), 'BROKEN\n');
    assert.deepEqual(backups(), []);
  });
});

test('a config that fails only strict mode still gets the edit, checked plainly', () => {
  withHome('unknown_key = 1\n', ({ run, read }) => {
    assert.equal(run().status, 0);
    assert.match(read(), /\[agents\]\nmax_concurrent_threads_per_session = 8\n$/);
  });
});

test('a cap outside 1 to 64 or not a number is a usage error', () => {
  withHome(null, ({ run, home }) => {
    for (const bad of ['0', '65', 'eight', '2.5']) assert.equal(run(bad).status, 2);
    assert.ok(!existsSync(join(home, 'config.toml')));
  });
});

test('edit() leaves a comment on the agents header in place', () => {
  assert.equal(edit('[agents] # mine\n', 8).text, '[agents] # mine\nmax_concurrent_threads_per_session = 8\n');
});
