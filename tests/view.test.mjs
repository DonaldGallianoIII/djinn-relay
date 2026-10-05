/**
 * Tests for plugins/djinn/scripts/view.mjs, the audit viewer: escaping, the
 * markdown subset djinn's files use, the ledger and runtime readers, both
 * page kinds, and the command line. Never passes --open, so no browser
 * starts.
 *
 * Written by Claude Opus 5.5 for Donald, 2026-10-05. Status: passing, not
 * reviewed.
 *
 * Run: node --test tests/*.test.mjs
 *
 * @interacts  imports view.mjs's exported renderers; runs it as a child
 *             process against temp repos with --out into the same temp
 * @deps       node:test, node:assert, node:child_process, node:fs, node:os,
 *             node:path, node:url. No packages.
 * @alloc      one temp folder per command line test, removed after it
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditPage, esc, frontmatter, indexPage, parseLedger, renderMarkdown, runtimeOf } from '../plugins/djinn/scripts/view.mjs';

const VIEW = resolve(dirname(fileURLToPath(import.meta.url)), '../plugins/djinn/scripts/view.mjs');

test('esc escapes the five characters that matter', () => {
  assert.equal(esc(`<a href="x" title='y'>&</a>`), '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
});

test('markup in report text stays text, in prose, code spans and code blocks', () => {
  const html = renderMarkdown('Saw <script>alert(1)</script> and `<img onerror=x>`\n\n```\n<b>raw</b>\n```');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<b>raw'));
  assert.match(html, /&lt;script&gt;/);
});

test('headings step down one level so the page title stays the only h1', () => {
  assert.equal(renderMarkdown('# Top\n## Next'), '<h2>Top</h2>\n<h3>Next</h3>');
});

test('pipe tables render with a head and a body', () => {
  const html = renderMarkdown('| a | b |\n|---|---|\n| 1 | `x` |');
  assert.equal(html, '<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td><code>x</code></td></tr></tbody></table>');
});

test('lists nest by indent and numbered lists keep their start', () => {
  assert.equal(renderMarkdown('- a\n  - b\n- c'), '<ul><li>a<ul><li>b</li></ul></li><li>c</li></ul>');
  assert.equal(renderMarkdown('3. x\n4. y'), '<ol start="3"><li>x</li><li>y</li></ol>');
});

test('blockquotes and rules render', () => {
  assert.equal(renderMarkdown('> quoted'), '<blockquote><p>quoted</p></blockquote>');
  assert.equal(renderMarkdown('---'), '<hr>');
});

test('a label line starts a new line inside a paragraph; wrapped prose does not', () => {
  assert.equal(renderMarkdown('HIGH-1. claim\nMechanism: how\nTraced: where'), '<p>HIGH-1. claim<br>Mechanism: how<br>Traced: where</p>');
  assert.equal(renderMarkdown('one sentence that\nwraps here'), '<p>one sentence that wraps here</p>');
});

test('finding paragraphs get anchors only when asked', () => {
  assert.match(renderMarkdown('MEDIUM-2. text', { findingAnchors: true }), /^<p class="finding" id="f-MEDIUM-2">/);
  assert.doesNotMatch(renderMarkdown('MEDIUM-2. text'), /id=/);
});

test('only http, https and anchor links become links', () => {
  assert.match(renderMarkdown('[ok](https://example.com)'), /<a href="https:\/\/example.com">ok<\/a>/);
  assert.match(renderMarkdown('[here](#x)'), /<a href="#x">here<\/a>/);
  const bad = renderMarkdown('[click](javascript:alert(1))');
  assert.doesNotMatch(bad, /<a /);
  const rel = renderMarkdown('[report](agents/bugs.md)');
  assert.doesNotMatch(rel, /<a /);
  assert.match(rel, /report <code>agents\/bugs\.md<\/code>/);
});

test('frontmatter splits off and reads its keys', () => {
  const { meta, body } = frontmatter('---\ntitle: t\nauthor: Codex x (bugs)\n---\nbody\n');
  assert.deepEqual(meta, [['title', 't'], ['author', 'Codex x (bugs)']]);
  assert.equal(body, 'body\n');
});

test('parseLedger skips the header and rule rows', () => {
  const rows = parseLedger('| when | command |\n|------|---------|\n| 2026 | review quick |\n');
  assert.deepEqual(rows, [['2026', 'review quick']]);
});

test('runtimeOf names Codex and its model, and calls everything else Claude', () => {
  assert.equal(runtimeOf('base=main@abc files=1 runtime=codex model=gpt-6.1-sol effort=medium'), 'Codex gpt-6.1-sol medium');
  assert.equal(runtimeOf('base=main@abc files=1'), 'Claude');
});

/** A temp repo with one audit; fn gets its paths. */
function withRepo(fn, { json = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'djinn-view-'));
  try {
    const audit = join(root, 'audits', '2026-01-01-1000-quick');
    mkdirSync(join(audit, 'agents'), { recursive: true });
    writeFileSync(join(root, 'audits', 'LEDGER.md'),
      '| when | command | audit folder | detail | outcome | counts |\n|---|---|---|---|---|---|\n' +
      '| 2026-01-01 10:05 | review quick | audits/2026-01-01-1000-quick | base=main@a files=1 runtime=codex model=m effort=e | FIX THEN SHIP (quick scope) | H1 M0 L0 D0 R0 failed=none |\n');
    writeFileSync(join(audit, 'synthesis.md'), '---\nauthor: Codex m (synthesis)\n---\n## Fix List\nHIGH-1. `a.js:3` Bad <thing>.\nMechanism: why\n');
    writeFileSync(join(audit, 'agents', 'bugs-reviewer.md'), '---\ntitle: bugs\n---\nQuoted `<script>` here.\n');
    writeFileSync(join(audit, 'fence.txt'), 'a.js\n');
    if (json) {
      writeFileSync(join(audit, 'findings.json'), JSON.stringify({
        schemaVersion: 1, audit: 'audits/2026-01-01-1000-quick', round: 1, verdict: 'FIX THEN SHIP',
        findings: [{ id: 'HIGH-1', tier: 'HIGH', file: 'a.js', line: 3, title: 'Bad <thing>.', source: 'bugs-reviewer' },
          { id: 'REC-1', tier: 'REC', file: null, line: null, title: 'Consider it.', source: 'bugs-reviewer' }],
        prior: [],
        open: [{ id: 'HIGH-1', round: 1, tier: 'HIGH', file: 'a.js', line: 3, title: 'Bad <thing>.', source: 'bugs-reviewer', status: 'open' }],
      }));
    }
    const run = (...args) => spawnSync('node', [VIEW, ...args], { cwd: root, encoding: 'utf8' });
    fn({ root, audit, run });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('an audit page carries the verdict, the tier words, links to anchors, and escaped reports', () => {
  withRepo(({ audit }) => {
    const html = auditPage('2026-01-01-1000-quick', audit);
    assert.match(html, /! FIX THEN SHIP/);
    assert.match(html, /▲<\/span>HIGH/);
    assert.match(html, /<a href="#f-HIGH-1">HIGH-1<\/a>/);
    assert.match(html, /id="f-HIGH-1"/);
    assert.match(html, /Debt and recommendations/);
    assert.match(html, /Consider it\./);
    assert.ok(!html.includes('<thing>'));
    assert.ok(!html.includes('<script>`'));
    assert.match(html, /<script>\nfor \(const box/);
  });
});

test('an audit with no findings.json still renders, says why, and carries no script', () => {
  withRepo(({ audit }) => {
    const html = auditPage('2026-01-01-1000-quick', audit);
    assert.match(html, /no readable findings\.json/);
    assert.ok(!html.includes('<script>'));
  }, { json: false });
});

test('the index lists ledger lines newest first with who ran them', () => {
  const ledger = '| when | command | audit folder | detail | outcome | counts |\n|---|---|---|---|---|---|\n' +
    '| 1 | review quick | audits/x | base=main files=1 | SHIP (quick scope) | H0 M0 L0 D0 R0 tokens=? |\n' +
    '| 2 | review quick | audits/y | runtime=codex model=m effort=e | FIX THEN SHIP (quick scope) | H1 M0 L0 D0 R0 |\n';
  const html = indexPage('repo', ['x', 'y', 'z'], ledger);
  assert.ok(html.indexOf('>y</a>') < html.indexOf('>x</a>'));
  assert.match(html, /<td>Claude<\/td>/);
  assert.match(html, /<td>Codex m e<\/td>/);
  assert.match(html, /<code>H0 M0 L0 D0 R0<\/code>/);
  assert.match(html, /Audit folders the ledger does not name<\/h2><ul><li><a href="z\/index.html">z<\/a>/);
});

test('the command line writes the site and prints a file link', () => {
  withRepo(({ root, run }) => {
    const out = join(root, 'site');
    const r = run('--out', out);
    assert.equal(r.status, 0);
    assert.match(r.stdout, /^djinn view: 1 audit\(s\) rendered\. Open: file:\/\/.*\/site\/index\.html$/m);
    assert.ok(existsSync(join(out, '2026-01-01-1000-quick', 'index.html')));
    const one = run('audits/2026-01-01-1000-quick/', '--out', out);
    assert.match(one.stdout, /site\/2026-01-01-1000-quick\/index\.html/);
    assert.ok(readFileSync(join(out, 'index.html'), 'utf8').includes('2026-01-01-1000-quick'));
  });
});

test('the command line stops plainly on a missing audit, no audits folder, or a bad flag', () => {
  withRepo(({ root, run }) => {
    assert.equal(run('audits/nope', '--out', join(root, 's')).status, 1);
    assert.equal(run('--bogus').status, 2);
    rmSync(join(root, 'audits'), { recursive: true });
    const r = run('--out', join(root, 's'));
    assert.equal(r.status, 1);
    assert.match(r.stdout, /no audits\/ folder here/);
  });
});
