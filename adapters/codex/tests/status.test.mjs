/**
 * Tests for the Codex djinn-status script: --full against the rules in
 * plugins/djinn/commands/status.md, and the short default form, using
 * throwaway audit folders.
 *
 * Written by Claude Opus 5.5 for Donald, 2026-10-05. Status: passing, not
 * reviewed.
 *
 * Run: node --test adapters/codex/tests/*.test.mjs
 *
 * @interacts  runs adapters/codex/plugin/skills/djinn-status/scripts/status.mjs
 *             as a child process; writes fixtures under the OS temp folder
 * @deps       node:test, node:assert, node:child_process, node:fs, node:os,
 *             node:path. No packages.
 * @alloc      one temp folder per test, removed in its finally block
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../plugin/skills/djinn-status/scripts/status.mjs',
);

const finding = (id, round, tier, extra = {}) => ({
  id, round, tier, file: 'src/a.js', line: 10, title: `title of ${id}`, source: 'bugs-reviewer', status: 'open', ...extra,
});

/** Build a repo with the given audit folders, run the script, clean up. */
function run(audits, ...args) {
  const root = mkdtempSync(join(tmpdir(), 'djinn-status-'));
  try {
    for (const [path, files] of Object.entries(audits)) {
      mkdirSync(join(root, path), { recursive: true });
      for (const [name, body] of Object.entries(files)) {
        writeFileSync(join(root, path, name), typeof body === 'string' ? body : JSON.stringify(body));
      }
    }
    mkdirSync(join(root, 'audits'), { recursive: true });
    return execFileSync('node', [SCRIPT, ...args], { cwd: root, encoding: 'utf8' });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const json = (round, verdict, open, prior = []) => ({
  schemaVersion: 1, audit: 'audits/x', round, verdict, findings: [], prior, open,
});

test('no folder named picks the newest audit that has a synthesis', () => {
  const out = run({
    'audits/2026-01-01-1000-a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', []) },
    'audits/2026-01-02-1000-b': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', []) },
    'audits/2026-01-03-1000-ideas': { 'notes.md': '' },
  });
  assert.match(out, /^djinn status: audits\/2026-01-02-1000-b, round 1, verdict SHIP$/m);
});

test('a folder without synthesis.md stops with the review question', () => {
  const out = run({ 'audits/a': { 'context.md': '' } }, 'audits/a');
  assert.equal(out.trim(), 'no synthesis.md in audits/a, has the review finished?');
});

test('a round folder argument uses the audit above it', () => {
  const out = run({
    'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', []) },
    'audits/a/round-2': { 'synthesis.md': '', 'findings.json': json(2, 'SHIP', []) },
  }, 'audits/a/round-2');
  assert.match(out, /^djinn status: audits\/a, round 2/m);
});

test('round-10 beats round-9 by number, not text', () => {
  const out = run({
    'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', []) },
    'audits/a/round-9': { 'synthesis.md': '', 'findings.json': json(9, 'SHIP', []) },
    'audits/a/round-10': { 'synthesis.md': '', 'findings.json': json(10, 'SHIP', []) },
  }, 'audits/a');
  assert.match(out, /round 10, verdict SHIP/);
});

test('latest round with synthesis but no findings.json says so and falls back', () => {
  const out = run({
    'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', []) },
    'audits/a/round-2': { 'synthesis.md': '' },
  }, 'audits/a');
  const lines = out.trim().split('\n');
  assert.equal(lines[0], 'round-2 has no findings.json; showing round 1');
  assert.match(lines[1], /round 1, verdict SHIP/);
});

test('no findings.json anywhere points at the latest synthesis.md', () => {
  const out = run({
    'audits/a': { 'synthesis.md': '' },
    'audits/a/round-2': { 'synthesis.md': '' },
  }, 'audits/a');
  assert.match(out, /^audits\/a has no findings\.json\./);
  assert.match(out, /Read audits\/a\/round-2\/synthesis\.md/);
  assert.doesNotMatch(out, /djinn status:/);
});

test('rows sort by tier, then round, then id number, with R prefixes and tags', () => {
  const open = [
    finding('LOW-2', 1, 'LOW'),
    finding('MEDIUM-10', 2, 'MEDIUM'),
    finding('MEDIUM-2', 2, 'MEDIUM', { status: 'regressed' }),
    finding('HIGH-1', 2, 'HIGH'),
    finding('MEDIUM-3', 1, 'MEDIUM', { status: 'not-resolved' }),
  ];
  const out = run({ 'audits/a': { 'synthesis.md': '' }, 'audits/a/round-2': { 'synthesis.md': '', 'findings.json': json(2, 'FIX THEN SHIP', open) } }, '--full', 'audits/a');
  const rows = out.split('\n').filter((l) => /^ {2}(HIGH|MEDIUM|LOW) /.test(l));
  assert.deepEqual(rows.map((r) => r.trim().split(/\s{2,}/)[1]), ['R2 HIGH-1', 'MEDIUM-3', 'R2 MEDIUM-2', 'R2 MEDIUM-10', 'LOW-2']);
  assert.match(rows[1], /\[not resolved\]$/);
  assert.match(rows[2], /\[regressed\]$/);
  assert.doesNotMatch(rows[4], /\[/);
  assert.match(out, /^open: HIGH 1, MEDIUM 3, LOW 1$/m);
  assert.match(out, /^blocking: R2 HIGH-1, MEDIUM-3, R2 MEDIUM-2, R2 MEDIUM-10$/m);
  assert.match(out, /^raised in: R2 HIGH-1 audits\/a\/round-2$/m);
  assert.match(out, /^raised in: MEDIUM-3 audits\/a$/m);
});

test('location is file:line, file, or a dash', () => {
  const open = [
    finding('LOW-1', 1, 'LOW'),
    finding('LOW-2', 1, 'LOW', { line: null }),
    finding('LOW-3', 1, 'LOW', { file: null, line: null }),
  ];
  const out = run({ 'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', open) } }, '--full', 'audits/a');
  const locs = out.split('\n').filter((l) => /^ {2}LOW/.test(l)).map((r) => r.trim().split(/\s{2,}/)[2]);
  assert.deepEqual(locs, ['src/a.js:10', 'src/a.js', '-']);
});

test('round 1 leaves out the resolved line; later rounds list RESOLVED only', () => {
  const r1 = run({ 'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', []) } }, '--full', 'audits/a');
  assert.doesNotMatch(r1, /resolved this round/);
  const prior = [
    { id: 'HIGH-1', round: 1, status: 'RESOLVED' },
    { id: 'LOW-1', round: 2, status: 'RESOLVED' },
    { id: 'LOW-2', round: 1, status: 'NOT RESOLVED' },
  ];
  const r3 = run({ 'audits/a': { 'synthesis.md': '' }, 'audits/a/round-3': { 'synthesis.md': '', 'findings.json': json(3, 'SHIP', [], prior) } }, '--full', 'audits/a');
  assert.match(r3, /^resolved this round: HIGH-1, R2 LOW-1$/m);
  const none = run({ 'audits/a': { 'synthesis.md': '' }, 'audits/a/round-2': { 'synthesis.md': '', 'findings.json': json(2, 'SHIP', [], [prior[2]]) } }, '--full', 'audits/a');
  assert.match(none, /^resolved this round: none$/m);
});

test('an empty open list says nothing is open and blocking none', () => {
  const out = run({ 'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', []) } }, 'audits/a');
  assert.match(out, /^open: nothing$/m);
  assert.match(out, /^blocking: none$/m);
  assert.doesNotMatch(out, /^note:/m);
});

test('verdict disagreeing with the open list adds the note, both ways', () => {
  const ship = run({ 'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', [finding('HIGH-1', 1, 'HIGH')]) } }, 'audits/a');
  assert.match(ship, /^note: findings\.json verdict SHIP disagrees/m);
  const fix = run({ 'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'FIX THEN SHIP', [finding('LOW-1', 1, 'LOW')]) } }, 'audits/a');
  assert.match(fix, /^note: findings\.json verdict FIX THEN SHIP disagrees/m);
});

test('titles print exactly as stored', () => {
  const title = 'Keeps `code`, colons: and (parens) as is';
  const out = run({ 'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', [finding('LOW-1', 1, 'LOW', { title })]) } }, '--full', 'audits/a');
  assert.ok(out.includes(title));
});

test('default is the short form: header, counts, blocking, where the list is', () => {
  const open = [finding('HIGH-1', 2, 'HIGH'), finding('MEDIUM-1', 1, 'MEDIUM'), finding('LOW-1', 1, 'LOW')];
  const prior = [{ id: 'LOW-9', round: 1, status: 'RESOLVED' }];
  const out = run({ 'audits/a': { 'synthesis.md': '' }, 'audits/a/round-2': { 'synthesis.md': '', 'findings.json': json(2, 'FIX THEN SHIP', open, prior) } }, 'audits/a');
  assert.deepEqual(out.trim().split('\n'), [
    'djinn status: audits/a, round 2, verdict FIX THEN SHIP',
    'open: HIGH 1, MEDIUM 1, LOW 1',
    'blocking: R2 HIGH-1, MEDIUM-1',
    'full list: add --full, or read audits/a/round-2/synthesis.md',
    'read it in your browser (djinn builds and opens the page): $djinn-view audits/a',
  ]);
});

test('short form keeps the verdict note', () => {
  const out = run({ 'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', [finding('HIGH-1', 1, 'HIGH')]) } }, 'audits/a');
  assert.match(out, /^note: findings\.json verdict SHIP disagrees/m);
});

test('--full may come before or after the folder; unknown flags are a usage error', () => {
  const audits = { 'audits/a': { 'synthesis.md': '', 'findings.json': json(1, 'SHIP', [finding('LOW-1', 1, 'LOW')]) } };
  assert.match(run(audits, 'audits/a', '--full'), /^ {2}LOW/m);
  assert.match(run(audits, '--full', 'audits/a'), /^ {2}LOW/m);
  assert.throws(() => run(audits, '--brief'), /usage: node status\.mjs/);
});
