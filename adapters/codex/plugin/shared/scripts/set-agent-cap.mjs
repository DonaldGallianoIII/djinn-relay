/**
 * Set Codex's agent concurrency cap for good: max_concurrent_threads_per_session
 * under [agents] in config.toml. A djinn skill offers this at the end of a run
 * when the session's cap was low, and runs it only on the owner's yes. Codex
 * asks the owner to approve the write, since config.toml is outside the repo.
 *
 * The edit is the smallest one that works: change the one line if it exists
 * under [agents], add it under an existing [agents], or append the table.
 * Any other spelling of the setting (a dotted key, an inline table) is left
 * alone and reported, because a line edit cannot be trusted there. A backup
 * is written first, and `codex --strict-config doctor` must still report the
 * config loaded afterward, or the backup is put back.
 *
 * Written by Claude Opus 5.5 for Donald, 2026-10-05. Status: tested against
 * throwaway config files and a stand-in codex, not yet run on a real
 * config, not reviewed.
 *
 * Usage: node set-agent-cap.mjs [<cap>]     cap defaults to 8
 * Reads CODEX_HOME (default ~/.codex). CODEX_BIN overrides the codex binary,
 * for tests. Exit 0 when set or already set, 1 when refused or rolled back,
 * 2 for a usage error.
 *
 * @interacts  reads and writes $CODEX_HOME/config.toml, writes one backup
 *             beside it, runs `codex [--strict-config] doctor` twice
 * @deps       node:fs, node:path, node:os, node:child_process. No packages.
 * @complexity O(l), l lines in config.toml (tens)
 * @alloc      the file's text and its line array, released at exit
 */

import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CONFIG = {
  key: 'max_concurrent_threads_per_session',
  table: 'agents',
  defaultCap: 8,
  maxCap: 64,
  loadedMark: /✓\s+config\s+loaded/,
};

const TABLE_HEADER = /^\s*\[\s*([^\]\s]+)\s*\]\s*(#.*)?$/;
const KEY_LINE = new RegExp(`^\\s*${CONFIG.key}\\s*=`);

/** True when this codex accepts the config in its current state. */
function loads(codex, home, strict) {
  const args = strict ? ['--strict-config', 'doctor'] : ['doctor'];
  const r = spawnSync(codex, args, { env: { ...process.env, CODEX_HOME: home }, encoding: 'utf8', input: '' });
  return CONFIG.loadedMark.test(`${r.stdout}${r.stderr}`);
}

/** The new file text, or a reason the line edit is refused. */
export function edit(text, cap) {
  const lines = text === '' ? [] : text.split('\n');
  let table = null;
  let header = -1;
  let found = -1;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(TABLE_HEADER);
    if (h) {
      table = h[1];
      if (table === CONFIG.table) header = i;
      continue;
    }
    if (KEY_LINE.test(lines[i])) {
      if (table !== CONFIG.table) return { refuse: `the setting appears outside [${CONFIG.table}] at line ${i + 1}` };
      found = i;
    } else if (lines[i].includes(CONFIG.key)) {
      return { refuse: `the setting appears in a form this script does not edit, at line ${i + 1}` };
    }
  }
  const line = `${CONFIG.key} = ${cap}`;
  if (found >= 0) {
    if (lines[found].trim() === line) return { same: true };
    lines[found] = line;
  } else if (header >= 0) {
    lines.splice(header + 1, 0, line);
  } else {
    if (lines.length && lines[lines.length - 1] !== '') lines.push('');
    lines.push(`[${CONFIG.table}]`, line, '');
  }
  return { text: lines.join('\n') };
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..*$/, '');
}

function main(argv) {
  const cap = argv.length ? Number(argv[0]) : CONFIG.defaultCap;
  if (argv.length > 1 || !Number.isInteger(cap) || cap < 1 || cap > CONFIG.maxCap) {
    console.error(`usage: node set-agent-cap.mjs [<cap from 1 to ${CONFIG.maxCap}>]`);
    return 2;
  }
  const home = process.env.CODEX_HOME || join(homedir(), '.codex');
  const codex = process.env.CODEX_BIN || 'codex';
  const file = join(home, 'config.toml');
  const before = existsSync(file) ? readFileSync(file, 'utf8') : '';

  // Strict when the config already passes strict, so a misspelled key would
  // fail; plain when some other setting already trips strict mode.
  const strict = loads(codex, home, true);
  if (!strict && !loads(codex, home, false)) {
    console.log(`not changed: ${file} does not load in Codex as it is; fix that first (codex doctor says why)`);
    return 1;
  }

  const result = edit(before, cap);
  if (result.refuse) {
    console.log(`not changed: ${result.refuse} of ${file}. Set ${CONFIG.key} = ${cap} under [${CONFIG.table}] by hand.`);
    return 1;
  }
  if (result.same) {
    console.log(`already set: ${CONFIG.key} = ${cap} in ${file}`);
    return 0;
  }

  const backup = `${file}.djinn-backup-${stamp()}`;
  if (existsSync(file)) copyFileSync(file, backup);
  const tmp = `${file}.djinn-tmp`;
  writeFileSync(tmp, result.text);
  renameSync(tmp, file);

  if (!loads(codex, home, strict)) {
    if (existsSync(backup)) copyFileSync(backup, file);
    else writeFileSync(file, before);
    console.log(`rolled back: Codex did not load ${file} after the edit, so the old file is back. Nothing changed.`);
    return 1;
  }
  const kept = existsSync(backup) ? ` (backup: ${backup})` : '';
  console.log(`set ${CONFIG.key} = ${cap} under [${CONFIG.table}] in ${file}${kept}. It takes effect in your next Codex session.`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
