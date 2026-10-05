/**
 * Render a repo's djinn audits as a small styled website and open it, so
 * the owner can read reports in a browser instead of raw markdown. Built on
 * demand into a cache folder, never into the repo, so no rendered copy can
 * go stale beside its source; the idea is borrowed from Donald's
 * render-doc tool, the code is not.
 *
 * Pages: an index of every audit (the ledger's lines, then any audit folder
 * the ledger does not name), and one page per audit with its verdict and
 * counts, a filterable findings table from findings.json, the synthesis of
 * each round, every agent report, and the run's own files. All text is
 * escaped; the one script on a page only shows and hides table rows.
 * Severity is always a word and a shape, never a color alone.
 *
 * Written by Claude Opus 5.5 for Donald, 2026-10-05. Status: tested against
 * fixture audits and real ones, not reviewed.
 *
 * Usage, from the repo root: node view.mjs [<audit-folder>] [--open] [--out <dir>]
 *   With a folder, --open lands on that audit's page; without, on the index.
 *
 * @interacts  reads audits/LEDGER.md and audits/<folder>/** (markdown,
 *             findings.json, fence.txt); writes only inside the cache
 *             folder, which it empties first; on --open starts the
 *             platform's browser launcher without waiting on it
 * @deps       node:fs, node:path, node:os, node:crypto, node:child_process,
 *             node:url. No packages.
 * @complexity O(a * s), a audits (tens), s bytes per audit (under 1 MB)
 * @alloc      one page string at a time, released after its write
 */

import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CONFIG = {
  auditsDir: 'audits',
  ledger: 'LEDGER.md',
  cacheName: 'djinn-view',
  title: 'djinn audits',
  runFiles: ['context.md', 'runtime.md', 'tree-facts.md', 'usage.md'],
  tiers: ['HIGH', 'MEDIUM', 'LOW', 'DEBT', 'REC'],
  marks: { HIGH: '▲', MEDIUM: '◆', LOW: '●', DEBT: '■', REC: '○' },
  verdictMarks: { SHIP: '✓', 'FIX THEN SHIP': '!', ESCALATE: '?' },
  safeLink: /^(https?:\/\/|#)/i,
  findingLine: /^(HIGH|MEDIUM|LOW|DEBT|REC)-(\d+)\.\s/,
  // djinn writes one fact per line ("Mechanism: ...", "Traced: ..."); a line
  // that opens with a short label and a colon starts a new line on the page.
  labelLine: /^[A-Za-z][\w ()/-]{0,40}:\s/,
  roundDir: /^round-(\d+)$/,
};

// Pure black, silver and cyan, Donald's pick (2026-10-05). Meaning never
// rides on color: tiers carry a word and a shape, verdicts a word and a mark.
const STYLE = `
:root { --bg:#000000; --panel:#0d0d0f; --panel-2:#16161a; --line:#2a2a2e; --ink:#c8c8cc;
  --ink-strong:#e8e8ec; --muted:#8a8a90; --accent:#22d3ee; --code:#111114; }
* { box-sizing:border-box; }
html { color-scheme:dark; }
body { margin:0; background:var(--bg); color:var(--ink);
  font:15px/1.55 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { max-width:1100px; margin:0 auto; padding:24px 16px 72px; }
a { color:var(--accent); }
a:focus-visible, button:focus-visible, input:focus-visible, summary:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
nav.crumbs { font-size:13px; color:var(--muted); margin-bottom:14px; }
h1, h2, h3, h4 { color:var(--ink-strong); line-height:1.25; }
h1 { font-size:26px; margin:0 0 6px; }
h2 { font-size:20px; margin:28px 0 10px; border-bottom:1px solid var(--line); padding-bottom:6px; }
h3 { font-size:16px; margin:20px 0 8px; }
h4 { font-size:15px; margin:16px 0 6px; }
p.sub { color:var(--muted); margin:0 0 18px; font-size:13px; }
code, pre { font-family:ui-monospace, "Cascadia Mono", Consolas, monospace; font-size:0.9em; }
code { background:var(--code); border:1px solid var(--line); border-radius:3px; padding:0 4px; }
pre { background:var(--code); border:1px solid var(--line); border-radius:4px; padding:10px 12px; overflow-x:auto; }
pre code { border:0; padding:0; background:none; }
table { border-collapse:collapse; width:100%; margin:8px 0 14px; font-size:14px; }
th, td { border:1px solid var(--line); padding:6px 8px; text-align:left; vertical-align:top; }
th { background:var(--panel-2); color:var(--ink-strong); font-weight:600; }
tr:nth-child(even) td { background:var(--panel); }
blockquote { margin:8px 0; padding:4px 12px; border-left:3px solid var(--accent); color:var(--muted); }
hr { border:0; border-top:1px solid var(--line); margin:18px 0; }
details { background:var(--panel); border:1px solid var(--line); border-radius:6px; margin:10px 0; }
details > summary { cursor:pointer; padding:10px 14px; color:var(--ink-strong); font-weight:600; }
details[open] > summary { border-bottom:1px solid var(--line); }
details > .body { padding:4px 16px 12px; }
.card { background:var(--panel); border:1px solid var(--line); border-radius:6px; padding:14px 16px; margin:12px 0; }
.verdict { display:inline-block; font-weight:700; letter-spacing:0.04em; color:var(--ink-strong);
  border:2px solid var(--accent); border-radius:4px; padding:4px 10px; margin-right:10px; }
.counts { display:inline-flex; flex-wrap:wrap; gap:8px; vertical-align:middle; }
.tier { white-space:nowrap; font-weight:600; color:var(--ink-strong); }
td.id { white-space:nowrap; }
.tier .mark { margin-right:4px; }
.verdict.small { font-size:12px; padding:1px 6px; white-space:nowrap; margin:0; border-width:1px; }
.count { border:1px solid var(--line); border-radius:4px; padding:2px 8px; background:var(--panel-2); }
.meta { color:var(--muted); font-size:13px; }
.filters { display:flex; flex-wrap:wrap; gap:12px; align-items:center; margin:8px 0; font-size:14px; }
.filters label { display:inline-flex; gap:5px; align-items:center; }
.filters input[type=search] { background:var(--panel-2); color:var(--ink-strong); border:1px solid var(--line);
  border-radius:4px; padding:5px 8px; min-width:240px; }
p.finding { scroll-margin-top:12px; }
p.finding:target { outline:2px solid var(--accent); outline-offset:4px; border-radius:2px; }
.empty { color:var(--muted); font-style:italic; }
`;

// The page script: tier boxes and a text box show and hide findings rows.
// It touches only row.hidden, never markup.
const FILTER_SCRIPT = `
for (const box of document.querySelectorAll('[data-filter-for]')) {
  const table = document.getElementById(box.dataset.filterFor);
  const tiers = box.querySelectorAll('input[type=checkbox]');
  const text = box.querySelector('input[type=search]');
  const shown = box.querySelector('[data-shown]');
  const apply = () => {
    const want = new Set([...tiers].filter((t) => t.checked).map((t) => t.value));
    const q = text.value.trim().toLowerCase();
    let n = 0;
    for (const row of table.tBodies[0].rows) {
      const ok = want.has(row.dataset.tier) && (!q || row.dataset.text.includes(q));
      row.hidden = !ok;
      if (ok) n += 1;
    }
    shown.textContent = n + ' shown';
  };
  for (const t of tiers) t.addEventListener('change', apply);
  text.addEventListener('input', apply);
  apply();
}
`;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape text for HTML content and attribute values. */
export function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** Inline markdown on one escaped line: code spans, bold, italic, safe links. */
function inline(raw) {
  const out = [];
  const parts = raw.split(/(`[^`]*`)/);
  for (const part of parts) {
    if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
      out.push(`<code>${esc(part.slice(1, -1))}</code>`);
      continue;
    }
    let t = esc(part);
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
      const real = href.replace(/&amp;/g, '&');
      return CONFIG.safeLink.test(real) ? `<a href="${esc(real)}">${label}</a>` : `${label} <code>${href}</code>`;
    });
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/(^|[\s(])\*([^*\s][^*]*)\*(?=$|[\s.,;:)])/g, '$1<em>$2</em>');
    out.push(t);
  }
  return out.join('');
}

/** Split leading YAML frontmatter from a markdown file. */
export function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: [], body: text };
  const meta = m[1].split('\n').map((l) => l.match(/^([A-Za-z_][\w -]*):\s*(.*)$/)).filter(Boolean).map((x) => [x[1], x[2]]);
  return { meta, body: text.slice(m[0].length) };
}

const isTableSep = (l) => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);
const cells = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
const listItem = (l) => l.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);

/**
 * Markdown to HTML for the subset djinn's files use: headings, paragraphs,
 * fenced code, pipe tables, bullet and numbered lists (nested by indent),
 * blockquotes, rules. With findingAnchors, a paragraph that opens with a
 * finding id (`HIGH-1. ...`) gets id f-HIGH-1, so the findings table can
 * link to it.
 */
export function renderMarkdown(text, { findingAnchors = false } = {}) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*$/.test(line)) { i++; continue; }
    const fence = line.match(/^\s*(```|~~~)/);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++;
      html.push(`<pre><code>${esc(body.join('\n'))}</code></pre>`);
      continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (h) {
      const level = Math.min(h[1].length + 1, 6);
      html.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { html.push('<hr>'); i++; continue; }
    if (line.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      html.push('<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }
    if (/^\s*>/.test(line)) {
      const body = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) body.push(lines[i++].replace(/^\s*>\s?/, ''));
      html.push(`<blockquote>${renderMarkdown(body.join('\n'))}</blockquote>`);
      continue;
    }
    if (listItem(line)) {
      const block = [];
      while (i < lines.length && (listItem(lines[i]) || (/^\s+\S/.test(lines[i]) && block.length))) block.push(lines[i++]);
      html.push(renderList(block));
      continue;
    }
    const para = [];
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,6}\s|\s*```|\s*~~~|\s*>)/.test(lines[i]) &&
      !(para.length && listItem(lines[i]))) para.push(lines[i++]);
    const joined = para.reduce((acc, l, k) => (k === 0 ? [l] : CONFIG.labelLine.test(l) ? [...acc, l] : [...acc.slice(0, -1), `${acc[acc.length - 1]} ${l}`]), []);
    const body = joined.map(inline).join('<br>');
    const id = findingAnchors && para[0].match(CONFIG.findingLine);
    html.push(id ? `<p class="finding" id="f-${id[1]}-${id[2]}">${body}</p>` : `<p>${body}</p>`);
  }
  return html.join('\n');
}

/** A list block: items at the first item's indent, deeper lines nested. */
function renderList(block) {
  const base = listItem(block[0])[1].length;
  const ordered = /\d/.test(listItem(block[0])[2]);
  const start = ordered ? Number(listItem(block[0])[2].slice(0, -1)) : 1;
  const items = [];
  for (const l of block) {
    const m = listItem(l);
    if (m && m[1].length <= base) items.push({ text: [m[3]], child: [] });
    else if (m) items[items.length - 1].child.push(l);
    else if (items[items.length - 1].child.length) items[items.length - 1].child.push(l);
    else items[items.length - 1].text.push(l.trim());
  }
  const tag = ordered ? 'ol' : 'ul';
  const open = ordered && start !== 1 ? `<ol start="${start}">` : `<${tag}>`;
  return open + items.map((it) => `<li>${inline(it.text.join(' '))}${it.child.length ? renderList(it.child) : ''}</li>`).join('') + `</${tag}>`;
}

/** Rows of LEDGER.md's table, as arrays of cell text, header and rule skipped. */
export function parseLedger(text) {
  return text.split('\n').filter((l) => l.trim().startsWith('|') && !isTableSep(l)).map(cells).slice(1);
}

function tierBadge(tier) {
  const mark = CONFIG.marks[tier] || '';
  return `<span class="tier"><span class="mark" aria-hidden="true">${mark}</span>${esc(tier)}</span>`;
}

function verdictBadge(verdict, small = false) {
  const word = String(verdict || 'no verdict');
  const key = Object.keys(CONFIG.verdictMarks).find((k) => word.startsWith(k));
  const mark = key ? `${CONFIG.verdictMarks[key]} ` : '';
  return `<span class="verdict${small ? ' small' : ''}">${esc(mark + word)}</span>`;
}

/** Who ran an audit, from the ledger's detail cell: Codex names its model; anything else is Claude. */
export function runtimeOf(detail) {
  const m = String(detail || '').match(/runtime=codex(?: model=(\S+))?(?: effort=(\S+))?/);
  if (!m) return 'Claude';
  return ['Codex', m[1], m[2]].filter(Boolean).join(' ');
}

function page(title, crumbs, body, withScript) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><style>${STYLE}</style></head>
<body><main>
<nav class="crumbs">${crumbs}</nav>
${body}
</main>${withScript ? `<script>${FILTER_SCRIPT}</script>` : ''}</body></html>
`;
}

const readIf = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
const isDir = (p) => existsSync(p) && statSync(p).isDirectory();

/** A rendered markdown file: its attribution as a meta line, then its body. */
function mdBlock(text, opts) {
  const { meta, body } = frontmatter(text);
  const line = meta.filter(([k]) => ['author', 'date', 'status'].includes(k)).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ');
  return (line ? `<p class="meta">${line}</p>` : '') + renderMarkdown(body, opts);
}

function findingsTable(id, rows, currentRound, withStatus = true) {
  if (!rows.length) return '<p class="empty">none</p>';
  const tiers = CONFIG.tiers.filter((t) => rows.some((r) => r.tier === t));
  const filters = `<div class="filters" data-filter-for="${id}">` +
    tiers.map((t) => `<label><input type="checkbox" value="${esc(t)}" checked>${tierBadge(t)}</label>`).join('') +
    `<label>Search <input type="search" placeholder="file, word or id"></label><span class="meta" data-shown></span></div>`;
  const body = rows.map((r) => {
    const shownId = r.round > 1 ? `R${r.round} ${r.id}` : r.id;
    const link = r.round === currentRound ? `<a href="#f-${esc(r.id)}">${esc(shownId)}</a>` : esc(shownId);
    const loc = r.file == null ? '-' : r.line == null ? r.file : `${r.file}:${r.line}`;
    const text = `${shownId} ${loc} ${r.title} ${r.source || ''}`.toLowerCase();
    const status = withStatus ? `<td>${esc(r.status || '')}</td>` : '';
    return `<tr data-tier="${esc(r.tier)}" data-text="${esc(text)}"><td>${tierBadge(r.tier)}</td><td class="id">${link}</td>` +
      `<td><code>${esc(loc)}</code></td><td>${esc(r.title)}</td><td>${esc(r.source || '')}</td>${status}</tr>`;
  }).join('');
  const head = `<th>Tier</th><th>Id</th><th>Location</th><th>Finding</th><th>Source</th>${withStatus ? '<th>Status</th>' : ''}`;
  return filters + `<table id="${id}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/** Every round of an audit, oldest first: the folder itself, then round-<n>/. */
function rounds(dir) {
  const list = [{ round: 1, dir }];
  for (const n of readdirSync(dir)) {
    const m = n.match(CONFIG.roundDir);
    if (m && isDir(join(dir, n))) list.push({ round: Number(m[1]), dir: join(dir, n) });
  }
  return list.sort((a, b) => a.round - b.round);
}

/** The HTML page for one audit folder. */
export function auditPage(name, dir) {
  const all = rounds(dir);
  const withJson = all.filter((r) => existsSync(join(r.dir, 'findings.json')));
  const latest = withJson.length ? withJson[withJson.length - 1] : null;
  let f = null;
  if (latest) {
    try { f = JSON.parse(readFileSync(join(latest.dir, 'findings.json'), 'utf8')); } catch { f = null; }
  }
  const parts = [`<h1>${esc(name)}</h1>`];
  if (f) {
    const count = (t) => (f.open || []).filter((x) => x.tier === t).length;
    const found = (t) => (f.findings || []).filter((x) => x.tier === t).length;
    parts.push(`<div class="card">${verdictBadge(f.verdict)}<span class="meta">round ${esc(f.round)}</span>` +
      `<p class="counts">${['HIGH', 'MEDIUM', 'LOW'].map((t) => `<span class="count">${tierBadge(t)} ${count(t)} open</span>`).join('')}` +
      `${['DEBT', 'REC'].map((t) => `<span class="count">${tierBadge(t)} ${found(t)}</span>`).join('')}</p></div>`);
    parts.push('<h2>Open across rounds</h2>', findingsTable('open-table', f.open || [], f.round));
    // Round 1's open list is its HIGH, MEDIUM and LOW findings, so only debt
    // and recommendations would be new in a second table.
    const roundRows = (f.findings || []).map((x) => ({ ...x, round: f.round }));
    if (f.round > 1) parts.push(`<h2>Found in round ${esc(f.round)}</h2>`, findingsTable('round-table', roundRows, f.round, false));
    else parts.push('<h2>Debt and recommendations</h2>', findingsTable('round-table', roundRows.filter((x) => ['DEBT', 'REC'].includes(x.tier)), f.round, false));
  } else {
    parts.push(`<div class="card">${verdictBadge(null)}<p class="meta">This audit has no readable findings.json (an ideas run, an early stop, or a review from before djinn 2.2.0). Its files are below.</p></div>`);
  }
  for (const r of [...all].reverse()) {
    const syn = readIf(join(r.dir, 'synthesis.md'));
    if (!syn) continue;
    const isLatest = latest && r.round === latest.round;
    parts.push(`<details${isLatest ? ' open' : ''}><summary>Synthesis, round ${r.round}</summary><div class="body">${mdBlock(syn, { findingAnchors: isLatest })}</div></details>`);
  }
  const agentDirs = all.map((r) => join(r.dir, 'agents')).filter(isDir);
  const reports = agentDirs.flatMap((d) => readdirSync(d).filter((n) => n.endsWith('.md')).sort().map((n) => join(d, n)));
  if (reports.length) {
    parts.push('<h2>Agent reports</h2>');
    for (const p of reports) {
      const label = p.slice(dir.length + 1).replace(/\.md$/, '');
      parts.push(`<details><summary>${esc(label)}</summary><div class="body">${mdBlock(readFileSync(p, 'utf8'))}</div></details>`);
    }
  }
  const runParts = CONFIG.runFiles.map((n) => [n, readIf(join(dir, n))]).filter(([, t]) => t);
  const fence = readIf(join(dir, 'fence.txt'));
  if (runParts.length || fence) {
    parts.push('<h2>Run details</h2>');
    for (const [n, t] of runParts) parts.push(`<details><summary>${esc(n)}</summary><div class="body">${mdBlock(t)}</div></details>`);
    if (fence) parts.push(`<details><summary>fence.txt</summary><div class="body"><pre><code>${esc(fence)}</code></pre></div></details>`);
  }
  const crumbs = `<a href="../index.html">all audits</a> / ${esc(name)}`;
  return page(`${name} · ${CONFIG.title}`, crumbs, parts.join('\n'), Boolean(f));
}

/** The index page: ledger lines, then audit folders the ledger does not name. */
export function indexPage(repoName, auditNames, ledgerText) {
  const rows = ledgerText ? parseLedger(ledgerText) : [];
  const known = new Set(auditNames);
  const named = new Set();
  const body = rows.map((r) => {
    const [when, command, folder, detail, outcome, counts] = r;
    const name = (folder || '').replace(/^audits\//, '').replace(/\/$/, '');
    named.add(name);
    const cell = known.has(name) ? `<a href="${esc(name)}/index.html">${esc(name)}</a>` : esc(folder || '');
    const verdict = (outcome || '').split(' (')[0];
    const tally = (counts || '').split(' ').filter((c) => /^[HMLDR]\d+$/.test(c)).join(' ');
    return `<tr><td>${esc(when || '')}</td><td>${esc(command || '')}</td><td>${cell}</td><td>${esc(runtimeOf(detail))}</td>` +
      `<td>${verdictBadge(verdict, true)}</td><td><code>${esc(tally || counts || '')}</code></td></tr>`;
  }).reverse().join('');
  const rest = auditNames.filter((n) => !named.has(n));
  const parts = [`<h1>${esc(CONFIG.title)}</h1>`, `<p class="sub">${esc(repoName)}, newest first. Built from audits/ just now; nothing here is stored in the repo.</p>`];
  parts.push(rows.length
    ? `<table><thead><tr><th>When</th><th>Command</th><th>Audit</th><th>Ran on</th><th>Outcome</th><th>Counts</th></tr></thead><tbody>${body}</tbody></table>`
    : '<p class="empty">audits/LEDGER.md has no lines yet.</p>');
  if (rest.length) {
    parts.push('<h2>Audit folders the ledger does not name</h2><ul>' + rest.map((n) => `<li><a href="${esc(n)}/index.html">${esc(n)}</a></li>`).join('') + '</ul>');
  }
  return page(CONFIG.title, esc(repoName), parts.join('\n'), false);
}

function cacheDir(repo) {
  const base = process.env.XDG_CACHE_HOME || join(homedir(), '.cache');
  const tag = createHash('sha256').update(repo).digest('hex').slice(0, 8);
  return join(base, CONFIG.cacheName, `${basename(repo)}-${tag}`);
}

function openInBrowser(file) {
  const wsl = existsSync('/proc/version') && /microsoft/i.test(readFileSync('/proc/version', 'utf8'));
  if (wsl) {
    const win = spawnSync('wslpath', ['-w', file], { encoding: 'utf8' }).stdout.trim();
    spawn('explorer.exe', [win], { detached: true, stdio: 'ignore' }).unref();
    return win;
  }
  const launcher = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open';
  spawn(launcher, [file], { detached: true, stdio: 'ignore' }).on('error', () => {}).unref();
  return file;
}

function main(argv) {
  let open = false;
  let out = null;
  let target = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--open') open = true;
    else if (argv[i] === '--out') out = resolve(argv[++i] || '');
    else if (argv[i].startsWith('--') || target) {
      console.error('usage: node view.mjs [<audit-folder>] [--open] [--out <dir>]');
      return 2;
    } else target = argv[i];
  }
  const repo = process.cwd();
  const audits = join(repo, CONFIG.auditsDir);
  if (!isDir(audits)) {
    console.log(`no ${CONFIG.auditsDir}/ folder here; run from the repo root of a project djinn has reviewed`);
    return 1;
  }
  const names = readdirSync(audits).filter((n) => isDir(join(audits, n))).sort();
  let landing = 'index.html';
  if (target) {
    const name = target.replace(/\/+$/, '').replace(new RegExp(`^${CONFIG.auditsDir}/`), '').split('/')[0];
    if (!names.includes(name)) {
      console.log(`no audit folder ${CONFIG.auditsDir}/${name}`);
      return 1;
    }
    landing = `${name}/index.html`;
  }
  const dest = out || cacheDir(repo);
  if (!out) rmSync(dest, { recursive: true, force: true });
  mkdirSync(dest, { recursive: true });
  writeFileSync(join(dest, 'index.html'), indexPage(basename(repo), names, readIf(join(audits, CONFIG.ledger))));
  for (const n of names) {
    mkdirSync(join(dest, n), { recursive: true });
    writeFileSync(join(dest, n, 'index.html'), auditPage(n, join(audits, n)));
  }
  const file = join(dest, landing);
  const shown = open ? openInBrowser(file) : file;
  console.log(`djinn view: ${names.length} audit(s) rendered. Open: ${pathToFileURL(file).href}`);
  if (open) console.log(`opened in your browser: ${shown}`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) process.exitCode = main(process.argv.slice(2));
