/**
 * Tests for plugins/djinn/scripts/setup-project.mjs: what it detects, the
 * config it drafts from the real template (and from the Codex plugin's
 * generated copy), and every way the command line refuses.
 *
 * Written by Claude Opus 5.5 for Donald, 2026-10-05. Status: passing, not
 * reviewed.
 *
 * Run: node --test tests/*.test.mjs
 *
 * @interacts  imports the script's exported helpers; runs it, and the Codex
 *             plugin's generated copy, as child processes in temp git repos
 * @deps       node:test, node:assert, node:child_process, node:fs, node:os,
 *             node:path, node:url; git on PATH. No packages.
 * @alloc      one temp repo per test, removed after it
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectBase, detectCommands, draftFacts, draftText, yamlScalar } from '../plugins/djinn/scripts/setup-project.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(ROOT, 'plugins/djinn/scripts/setup-project.mjs');
const CODEX_COPY = join(ROOT, 'adapters/codex/plugin/scripts/setup-project.mjs');
const TEMPLATE = readFileSync(join(ROOT, 'plugins/djinn/templates/config.yaml'), 'utf8');

const G = ['-c', 'user.email=qa@example.invalid', '-c', 'user.name=qa'];

/** A temp git repo on branch `branch` holding `files`, one commit. */
function withRepo(files, fn, branch = 'main') {
  const root = mkdtempSync(join(tmpdir(), 'djinn-setup-'));
  try {
    spawnSync('git', ['init', '-q', '-b', branch], { cwd: root });
    for (const [p, body] of Object.entries(files)) {
      mkdirSync(dirname(join(root, p)), { recursive: true });
      writeFileSync(join(root, p), body);
    }
    writeFileSync(join(root, 'README.md'), 'x\n');
    spawnSync('git', [...G, 'add', '.'], { cwd: root });
    spawnSync('git', [...G, 'commit', '-qm', 'init'], { cwd: root });
    const run = (script, ...args) => spawnSync('node', [script, ...args], { cwd: root, encoding: 'utf8' });
    fn({ root, run });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('base branch: a local main or master is found and named', () => {
  withRepo({}, ({ root }) => assert.deepEqual(detectBase(root), { value: 'master', why: 'local branch' }), 'master');
});

test('base branch: none of the usual names means null, never a guess', () => {
  withRepo({}, ({ root }) => assert.equal(detectBase(root), null), 'feature-x');
});

test('base branch: origin/HEAD wins over local names', () => {
  withRepo({}, ({ root }) => {
    spawnSync('git', ['update-ref', 'refs/remotes/origin/release', 'HEAD'], { cwd: root });
    spawnSync('git', ['symbolic-ref', 'refs/remotes/origin/HEAD', 'refs/remotes/origin/release'], { cwd: root });
    assert.deepEqual(detectBase(root), { value: 'release', why: 'origin/HEAD' });
  });
});

test('commands come from package.json with the runner its lockfile names', () => {
  withRepo({ 'package.json': '{"scripts":{"build":"tsc","test":"vitest"}}', 'yarn.lock': '' }, ({ root }) => {
    const c = detectCommands(root);
    assert.equal(c.build.value, 'yarn run build');
    assert.equal(c.test.value, 'yarn test');
  });
});

test('npm init\'s placeholder test script is not a test command', () => {
  withRepo({ 'package.json': '{"scripts":{"test":"echo \\"Error: no test specified\\" && exit 1"}}' }, ({ root }) => {
    assert.equal(detectCommands(root).test, null);
  });
});

test('pytest from pyproject, through uv when there is a uv.lock; a Makefile fills the gaps', () => {
  withRepo({ 'pyproject.toml': '[tool.pytest.ini_options]\n', 'uv.lock': '', Makefile: 'build:\n\ttrue\n' }, ({ root }) => {
    const c = detectCommands(root);
    assert.equal(c.test.value, 'uv run pytest');
    assert.equal(c.build.value, 'make build');
  });
});

test('a command is single quoted in YAML, quotes doubled; none stays bare', () => {
  assert.equal(yamlScalar('none'), 'none');
  assert.equal(yamlScalar("npm run a: b && echo 'x'"), "'npm run a: b && echo ''x'''");
});

test('the draft fills the detected lines and keeps every other template line', () => {
  withRepo({ 'package.json': '{"scripts":{"test":"t"}}', 'package-lock.json': '{}', 'AGENTS.md': '' }, ({ root }) => {
    const text = draftText(TEMPLATE, draftFacts(root), '2026-01-02');
    assert.match(text, /^# Djinn Relay per-project config, drafted by djinn setup on 2026-01-02\./);
    assert.match(text, /^base_branch: main$/m);
    assert.match(text, /^test_cmd: 'npm test'$/m);
    assert.match(text, /^build_cmd: none$/m);
    assert.match(text, /^known_bugs_index: none$/m);
    assert.match(text, /^conventions_files:\n {2}- AGENTS\.md\n/m);
    assert.match(text, /^ {2}manifests: \[package\.json\]/m);
    assert.match(text, /^ {2}lockfiles: \[package-lock\.json\]/m);
    assert.ok(text.includes('# Free text every agent reads as architecture context.'));
    assert.equal(text.split('\n').length, TEMPLATE.split('\n').length);
  });
});

test('no conventions files gives an empty list, and given values win', () => {
  withRepo({}, ({ root }) => {
    const text = draftText(TEMPLATE, draftFacts(root, { base: 'dev', build: 'make', test: 'none' }), '2026-01-02');
    assert.match(text, /^conventions_files: \[\]$/m);
    assert.match(text, /^base_branch: dev$/m);
    assert.match(text, /^build_cmd: 'make'$/m);
    assert.match(text, /^test_cmd: none$/m);
  });
});

test('a changed template fails loudly instead of writing a half-filled config', () => {
  assert.throws(() => draftText(TEMPLATE.replace('base_branch: main', 'base: main'), draftFacts(tmpdir()), 'd'), /template changed/);
});

test('the command line drafts without writing, then writes on --write, then refuses to overwrite', () => {
  withRepo({ 'package.json': '{"scripts":{"build":"b"}}' }, ({ root, run }) => {
    const draft = run(SCRIPT);
    assert.equal(draft.status, 0);
    assert.match(draft.stdout, /^djinn setup: draft, nothing written yet$/m);
    assert.match(draft.stdout, /^build_cmd: npm run build \(package\.json scripts\.build\)$/m);
    assert.ok(!existsSync(join(root, '.djinn/config.yaml')));
    const write = run(SCRIPT, '--write');
    assert.equal(write.status, 0);
    assert.match(write.stdout, /wrote \.djinn\/config\.yaml/);
    const first = readFileSync(join(root, '.djinn/config.yaml'), 'utf8');
    const again = run(SCRIPT, '--write', '--base', 'other');
    assert.match(again.stdout, /^already set up/);
    assert.equal(readFileSync(join(root, '.djinn/config.yaml'), 'utf8'), first);
  });
});

test('--write with no base branch found writes nothing and asks for --base', () => {
  withRepo({}, ({ root, run }) => {
    const r = run(SCRIPT, '--write');
    assert.equal(r.status, 1);
    assert.match(r.stdout, /not written: no base branch found; pass --base <branch>/);
    assert.ok(!existsSync(join(root, '.djinn/config.yaml')));
    assert.equal(run(SCRIPT, '--write', '--base', 'trunk').status, 0);
  }, 'feature-x');
});

test('outside a repo root, or with a bad flag, it refuses', () => {
  withRepo({ 'sub/x.txt': '' }, ({ root }) => {
    const r = spawnSync('node', [SCRIPT], { cwd: join(root, 'sub'), encoding: 'utf8' });
    assert.equal(r.status, 1);
    assert.match(r.stdout, /run this from the root of a git repo/);
    assert.equal(spawnSync('node', [SCRIPT, '--force'], { cwd: root }).status, 2);
  });
});

test('the Codex plugin copy drafts from its own template copy with the marker stripped', () => {
  withRepo({}, ({ root, run }) => {
    assert.equal(run(CODEX_COPY, '--write').status, 0);
    const text = readFileSync(join(root, '.djinn/config.yaml'), 'utf8');
    assert.ok(!text.includes('GENERATED'));
    assert.ok(!text.includes('Do not edit this copy'));
    assert.match(text, /^# Djinn Relay per-project config, drafted by djinn setup/);
  });
});
