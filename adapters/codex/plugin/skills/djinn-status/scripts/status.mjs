/**
 * Print what is still open in a djinn audit, from its latest findings.json.
 * The Codex djinn-status skill runs this instead of having the model read
 * the JSON, so the session sees one command and the finished report, not
 * 40 KB of data. With --full the output follows plugins/djinn/commands/
 * status.md Steps 1 to 4, unchanged; that file is the spec. Without it the
 * script prints the short form: header, counts, blocking ids, and where the
 * full list is. Donald's call, 2026-10-05: the full table is a wall of text
 * in a terminal, and djinn's review already ends on one line of counts.
 *
 * Written by Claude Opus 5.5 for Donald, 2026-10-05. Status: tested against
 * every audit in this repo, not reviewed.
 *
 * Usage: node status.mjs [--full] [<audit-folder>]   (run from the repo root)
 * Exit 0 for every report or explained stop, 2 for a usage error.
 *
 * @interacts  reads audits/<folder>/synthesis.md (existence only) and
 *             findings.json, in the folder and its round-<n>/ subfolders;
 *             writes stdout only. Never reads synthesis.md prose.
 * @deps       node:fs, node:path. No packages.
 * @complexity O(a + f log f), a audit folders under audits/ (tens), f open
 *             findings (under 100 in practice)
 * @alloc      one parsed findings.json per run, released at exit
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const CONFIG = {
  auditsDir: 'audits',
  tierOrder: { HIGH: 0, MEDIUM: 1, LOW: 2 },
  blockingTiers: new Set(['HIGH', 'MEDIUM']),
  statusTags: { 'not-resolved': '[not resolved]', regressed: '[regressed]' },
  roundDir: /^round-(\d+)$/,
  // Column widths from the example rows in status.md Step 3.
  tierWidth: 8,
  idWidth: 13,
  locWidth: 21,
  minGap: 2,
};

const isDir = (p) => existsSync(p) && statSync(p).isDirectory();
const hasSynthesis = (dir) => existsSync(join(dir, 'synthesis.md'));
const idNumber = (id) => Number((id.match(/(\d+)$/) || [, 0])[1]);
const displayId = (e) => (e.round > 1 ? `R${e.round} ${e.id}` : e.id);

/** Step 1: resolve the audit folder, or return a message to print and stop. */
function findAudit(arg) {
  if (!arg) {
    if (!isDir(CONFIG.auditsDir)) {
      return { stop: `no ${CONFIG.auditsDir}/ folder here; run from the repo root` };
    }
    const picked = readdirSync(CONFIG.auditsDir)
      .filter((n) => isDir(join(CONFIG.auditsDir, n)) && hasSynthesis(join(CONFIG.auditsDir, n)))
      .sort()
      .pop();
    return picked ? { audit: join(CONFIG.auditsDir, picked) } : { stop: `no audit under ${CONFIG.auditsDir}/ has a synthesis.md` };
  }
  let audit = arg.replace(/\/+$/, '');
  if (CONFIG.roundDir.test(basename(audit))) audit = dirname(audit);
  if (!isDir(audit)) return { stop: `${audit} is not a folder` };
  if (!hasSynthesis(audit)) return { stop: `no synthesis.md in ${audit}, has the review finished?` };
  return { audit };
}

/** Step 2: rounds of this audit, highest first, each with its folder. */
function rounds(audit) {
  const list = [{ round: 1, dir: audit }];
  for (const n of readdirSync(audit)) {
    const m = n.match(CONFIG.roundDir);
    if (m && isDir(join(audit, n))) list.push({ round: Number(m[1]), dir: join(audit, n) });
  }
  return list.sort((a, b) => b.round - a.round);
}

function location(e) {
  if (e.file == null) return '-';
  return e.line == null ? e.file : `${e.file}:${e.line}`;
}

function pad(text, width) {
  return text.length + CONFIG.minGap > width ? text + ' '.repeat(CONFIG.minGap) : text.padEnd(width);
}

/** Steps 3 and 4: the report lines for one findings.json. */
function report(audit, f, full, latestSynthesis) {
  const out = [`djinn status: ${audit}, round ${f.round}, verdict ${f.verdict}`];
  const open = [...f.open].sort(
    (a, b) =>
      CONFIG.tierOrder[a.tier] - CONFIG.tierOrder[b.tier] || a.round - b.round || idNumber(a.id) - idNumber(b.id),
  );
  if (open.length === 0) {
    out.push('open: nothing');
  } else if (!full) {
    const count = (t) => open.filter((e) => e.tier === t).length;
    out.push(`open: HIGH ${count('HIGH')}, MEDIUM ${count('MEDIUM')}, LOW ${count('LOW')}`);
  } else {
    const count = (t) => open.filter((e) => e.tier === t).length;
    out.push(`open: HIGH ${count('HIGH')}, MEDIUM ${count('MEDIUM')}, LOW ${count('LOW')}`);
    for (const e of open) {
      const tag = CONFIG.statusTags[e.status];
      out.push(
        `  ${e.tier.padEnd(CONFIG.tierWidth)}${pad(displayId(e), CONFIG.idWidth)}${pad(location(e), CONFIG.locWidth)}${e.title}${tag ? `   ${tag}` : ''}`,
      );
    }
  }
  if (full && f.round > 1) {
    const resolved = (f.prior || []).filter((p) => p.status === 'RESOLVED').map(displayId);
    out.push(`resolved this round: ${resolved.length ? resolved.join(', ') : 'none'}`);
  }
  const blocking = open.filter((e) => CONFIG.blockingTiers.has(e.tier));
  out.push(`blocking: ${blocking.length ? blocking.map(displayId).join(', ') : 'none'}`);
  for (const e of full ? blocking : []) {
    out.push(`raised in: ${displayId(e)} ${e.round > 1 ? `${audit}/round-${e.round}` : audit}`);
  }
  if (open.length === 0) out.push('Nothing is open: every finding in this audit is fixed and proven.');
  else if (!full) out.push(`full list: add --full, or read ${latestSynthesis}`);
  const shipWithBlocking = f.verdict === 'SHIP' && blocking.length > 0;
  const fixWithoutBlocking = f.verdict === 'FIX THEN SHIP' && blocking.length === 0;
  if (shipWithBlocking || fixWithoutBlocking) {
    out.push(
      `note: findings.json verdict ${f.verdict} disagrees with its open list; trust synthesis.md and re-run the round's synthesis.`,
    );
  }
  out.push(`read it in your browser (djinn builds and opens the page): $djinn-view ${audit}`);
  return out;
}

function main(argv) {
  const full = argv.includes('--full');
  const rest = argv.filter((a) => a !== '--full');
  if (rest.length > 1 || rest.some((a) => a.startsWith('--'))) {
    console.error('usage: node status.mjs [--full] [<audit-folder>]');
    return 2;
  }
  const found = findAudit(rest[0]);
  if (found.stop) {
    console.log(found.stop);
    return 0;
  }
  const { audit } = found;
  const all = rounds(audit);
  const withJson = all.filter((r) => existsSync(join(r.dir, 'findings.json')));
  if (withJson.length === 0) {
    const latest = all.find((r) => hasSynthesis(r.dir));
    console.log(
      `${audit} has no findings.json. Either it was reviewed before djinn\n` +
        `2.2.0, when synthesis started writing one, or its synthesis did not write\n` +
        `one (review and dispatch say so in their final report). Read ${join(latest.dir, 'synthesis.md')}\n` +
        `for the findings.`,
    );
    return 0;
  }
  const lines = [];
  const top = all[0];
  if (top.round !== withJson[0].round && hasSynthesis(top.dir)) {
    lines.push(`round-${top.round} has no findings.json; showing round ${withJson[0].round}`);
  }
  let f;
  try {
    f = JSON.parse(readFileSync(join(withJson[0].dir, 'findings.json'), 'utf8'));
  } catch (err) {
    console.log(`${join(withJson[0].dir, 'findings.json')} is not valid JSON (${err.message}); read the round's synthesis.md`);
    return 0;
  }
  const latestSynthesis = join(withJson[0].dir, 'synthesis.md');
  console.log([...lines, ...report(audit, f, full, latestSynthesis)].join('\n'));
  return 0;
}

process.exitCode = main(process.argv.slice(2));
