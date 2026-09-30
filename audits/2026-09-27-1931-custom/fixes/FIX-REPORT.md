---
title: fix pass report, audits/2026-09-27-1931-custom (djinn relay 2.3.0, final pass)
author: Claude Opus 5.5 (fix writer)
date: 2026-09-27
status: landed, unverified
---

# Final fix pass, 2.3.0 build

Source: `audits/2026-09-27-1931-custom/synthesis.md`: its Fix List, D1 to
D4, and the Rewrite plan's 15 groups, applied in the plan's order, shared
files first. Every D takes the recommended option, as Donald approved.
legibility-reviewer.md's three blast-radius LOWs (LOW-15, LOW-23, LOW-29)
are folded in as part of the build.

Nothing was run. No node, no python, no test, no build, no voice check.
Every edit was made with Edit or Write. Only read-only grep and git were
used. One stray `sed -i` aimed at `/dev/null` failed with "not a regular
file" and changed nothing; no file was edited from a shell. RESOLVED below
means "edited as the plan says", not "proven". Line numbers are as of this
pass. Paths are relative to `plugins/djinn/` unless they start with `.djinn/`.

## Fix disagreements, as applied

- **D1 (option A), resident cap on the lane and the fixer's runs.** New
  optional key `proof.lane_mem_mb`, the owner's figure. When both it and
  `memory_wrapper` are set, dispatch probes the wrapper once and then puts
  it, filled with `lane_mem_mb`, in front of the landing lane and every
  fixer test run. Without both, the plan, the ledger and the fixer report
  say `heap cap only, resident memory unbounded`, never `capped`. A
  `lane_mem_mb` over half of `free -m` total is refused. CONTRACTS.md:391,
  :231 (example block); commands/dispatch.md:70, :143, :150, :218, :330,
  :518, :521; agents/fixer.md:117; templates/config.yaml:102, :123.
- **D2 (option A), prove the wrapper.** proof-runner runs a probe once per
  invocation, after the half-of-total check: the filled wrapper starts
  `node -e` allocating one-MB Buffers to the resident figure plus
  `PROBE_MARGIN_MB`. Killed by the wrapper: proven. Ran to the end:
  refuse, `memory wrapper did not cap`. Any other exit: refuse, `memory
  wrapper did not start`. Never PASS or FAIL. New named constants
  `PROBE_MARGIN_MB` = 256 and `PROBE_TIMEOUT_S` = 60 in proof-runner,
  marked as design choices, not harness figures. CONTRACTS.md:367;
  agents/proof-runner.md:68, :118, :209, :260 (item 1b), :383, :450.
  Judgment call beyond the plan's text: dispatch reuses the same probe
  with `lane_mem_mb` before it trusts the wrapper for the lane and the
  fixer (commands/dispatch.md:70), because D1 puts an unproven wrapper in
  front of those runs otherwise.
- **D3 (option A), character allowlist.** `runner` and `memory_wrapper`
  may hold only letters, digits, space and `. _ / - = : , @ + { }`, with
  `{ }` only in `{file}`, `{heap_mb}`, `{mem_mb}`. A newline, `&`, `#`, a
  quote, `$` and the rest are refused, and so is a template that quotes
  its own `{file}`. CONTRACTS.md:373; agents/proof-runner.md:127;
  templates/config.yaml:126; commands/dispatch.md:56 (dispatch applies it
  to the wrapper too).
- **D4 (option A), chained `test_cmd`.** The lane writes `test_cmd` to
  `$RUN_TMP/test-cmd` with Write and runs
  `<wrapper> env NODE_OPTIONS=... timeout --kill-after=... <t>s bash -c "$(cat "$RUN_TMP/test-cmd")"`,
  so `npm run build && npm test` and `cd x && ...` sit whole under every
  cap. CONTRACTS.md:408; commands/dispatch.md:312, :330, :333.

## Findings

### MEDIUM

- R1 MEDIUM-5: RESOLVED (D1). The lane carries the probed wrapper when
  set and says `heap cap only` when not. commands/dispatch.md:70, :143,
  :330, :518, :521; CONTRACTS.md:391, :463.
- R1 MEDIUM-8: RESOLVED (D3). The denylist is replaced by the allowlist,
  which refuses a newline, a lone `&` and `#`. agents/proof-runner.md:127;
  CONTRACTS.md:373.
- MEDIUM-1: RESOLVED. `xargs -0 -r` everywhere, and an empty list runs
  nothing. CONTRACTS.md:540; commands/review.md:89, :208, :329 (tree
  facts); agents/gate-auditor.md:98. A plugin-wide grep finds no
  `xargs -0` without `-r`.
- MEDIUM-2: RESOLVED (D2). The probe, plus a wrapper start error during a
  run is a stop (`memory wrapper failed`), never a FAIL.
  agents/proof-runner.md:209, :260, :383, :410 area (Stop rules).
- MEDIUM-3: RESOLVED. The mutant grep skips whole-line comments, stops only
  on a line the landed change added, and lists every other hit under REC.
  agents/proof-runner.md:301, :304, :312.
- MEDIUM-4: RESOLVED. One `RUN_TMP` from `mktemp -d` per run, written as a
  literal path because the shell may not keep a variable between Bash
  calls; an empty `RUN_TMP` is a stop. CONTRACTS.md:564;
  commands/review.md:208; commands/dispatch.md:179;
  agents/proof-runner.md:251; agents/fixer.md:102 area. No `$TMPDIR`
  path is left in the plugin.
- MEDIUM-5: RESOLVED. Untracked work-set files are copied to
  `$RUN_TMP/pre/<batch>/` before each batch and diffed one file per call
  with `xargs -0 -r -I{}`; the false "fixer's own new files" sentence is
  replaced. commands/dispatch.md:188, :258.
- MEDIUM-6: RESOLVED (D4). commands/dispatch.md:312, :330.
- MEDIUM-7: RESOLVED (D1 for the wrapper). The fixer screens each test
  file with proof-runner's pre-run screen, feeds the name through
  `xargs -0 -r -I{}`, empties every paid key, and puts the wrapper first
  when given. The fixer prompt now carries the wrapper, `cost.paid_apis`
  names and the runner keys. CONTRACTS.md:644; agents/fixer.md:17, :102,
  :115, :117; commands/dispatch.md:218, :222.

### LOW

- LOW-1: RESOLVED. `-c core.quotePath=false` in every git prefix, `-z`
  lists, a newline path refused. CONTRACTS.md:577; commands/review.md:208;
  .djinn/config.yaml:19 (build_cmd).
- LOW-2: RESOLVED. The ref goes through a file, a regex, `check-ref-format`
  and `--end-of-options`; `merge_base` and the whole-number keys are
  checked; the command-valued keys are named as the only shell.
  CONTRACTS.md:550; commands/review.md:221; commands/dispatch.md:56, :312.
- LOW-3: RESOLVED. `--untracked <path-list-file>` fences a named subset
  past the stops. CONTRACTS.md:173; commands/review.md:236 area (item 3),
  :3 (usage); README.md:125; relay.md table row.
- LOW-4: RESOLVED. The map scope pastes the fence by path and count.
  commands/review.md:398.
- LOW-5: RESOLVED. `A<TAB><path>` only for untracked files new since the
  dispatch. commands/dispatch.md:414; CONTRACTS.md:201.
- LOW-6: RESOLVED. The lane timeout applies whenever set, with
  `--kill-after`, checked against `harness_timeout_max_s`.
  commands/dispatch.md:56, :333; CONTRACTS.md:391 area.
- LOW-7: RESOLVED. The patch carries the seven secret pathspecs and a
  `withheld:` line per left-out path. commands/review.md:270.
- LOW-8: RESOLVED. Every `git diff` carries `--no-ext-diff --no-textconv`.
  CONTRACTS.md:577; agents/proof-runner.md:283.
- LOW-9: RESOLVED. The screen reads relative, `#` subpath and workspace
  imports; an unresolved import is NOT RUN; Limits says deeper hops are
  not screened. agents/proof-runner.md:230, :450 area.
- LOW-10: RESOLVED. Runner loader flags refused, setup files refused until
  listed in the new `proof.setup_files` and screened, and the screen list
  gains `dotenv`, `load_dotenv`, `os.environ`, `os.getenv`, `subprocess`,
  `os.system`. agents/proof-runner.md:131, :137, :220; CONTRACTS.md:380.
- LOW-11: RESOLVED. The stop reads `the tree changed during <file>'s run
  (any writer)` with a count of newer paths. agents/proof-runner.md:283
  area, Stop rules; commands/dispatch.md:375.
- LOW-12: RESOLVED. The round's stop reads exactly the fixer-added list;
  `written by test runs` never counts. commands/dispatch.md:399.
- LOW-13: RESOLVED (D3). A quoted `{file}` in the template is refused, and
  the fill quotes once. agents/proof-runner.md:127, :321.
- LOW-14: RESOLVED. Seven secret pathspecs, `--exclude-dir=.git`, and
  mutant hits written as `path:line`. CONTRACTS.md:591;
  commands/review.md:361; agents/gate-auditor.md:116. See unverified item
  on pathspec magic.
- LOW-15: RESOLVED. legibility-reviewer never opens or reads a header of
  tree facts' secret-shaped paths, the section 9 shapes, `.netrc`, `*.p12`,
  `*.pfx`, `*.jks`, or a name holding `token` or `credential`, checked
  before each open. agents/legibility-reviewer.md:203.
- LOW-16: RESOLVED. Pattern files stay in `RUN_TMP`, never reach
  `AUDIT_DIR`; `triggers:` never holds the matched string.
  CONTRACTS.md:564; commands/review.md:89, context.md template.
- LOW-17: RESOLVED. The section 9 sentence is in both agent files and
  pasted by review Step 7. agents/devils-advocate.md:195;
  agents/test-strategist.md:48; commands/review.md:476.
- LOW-18: RESOLVED. The link-following sentence is in the contract, the
  paste and cost-complexity-reviewer. CONTRACTS.md:636;
  commands/review.md:470 area; agents/cost-complexity-reviewer.md:157.
- LOW-19: RESOLVED. `Threshold: <n> lines.` removed; the split plan's
  Lines column holds line ranges, not sizes. agents/pipe-connector.md:141,
  :166.
- LOW-20: RESOLVED. `map` added to the excluded scopes.
  agents/gate-auditor.md:3; agents/cost-complexity-reviewer.md:3;
  agents/accessibility-reviewer.md:3; agents/data-contract-reviewer.md:3.
- LOW-21: RESOLVED. `.sh`, `.bash`, `.zsh`, `.ps1` added.
  commands/review.md:89.
- LOW-22: RESOLVED. legibility-reviewer's Inputs read
  `integration-reviewer: running | not running`.
  agents/legibility-reviewer.md:115.
- LOW-23: RESOLVED. A missing map line is REC in both files.
  agents/legibility-reviewer.md:304; agents/pipe-connector.md:119.
- LOW-24: RESOLVED. The coverage rule names `fence.txt`.
  agents/synthesis.md:60.
- LOW-25: RESOLVED. One default map list, with `CONTRIBUTING.md`, kept in
  CONTRACTS.md:327 and quoted or pointed to by commands/review.md:157,
  agents/legibility-reviewer.md:121, templates/config.yaml:41 and
  relay.md:168.
- LOW-26: RESOLVED. A hand-mutant stop is MEDIUM.
  agents/proof-runner.md:410.
- LOW-27: RESOLVED. LEGIBILITY.md added; `project_notes` says seven agents
  and the map scope. .djinn/config.yaml:27, :52.
- LOW-28: RESOLVED. Tree facts lists gain secret-shaped names; the `live`
  round reads the whole tool. relay.md:23, :99; README.md:179.
- LOW-29: RESOLVED. "already ran the index, when it ran", with the map
  scope case. agents/legibility-reviewer.md:56.
- R1 LOW-22: RESOLVED. Import patterns carry the parent folder, and a hit
  counts only when the import resolves to the untracked path.
  commands/review.md:370.
- R1 LOW-28: RESOLVED. `review_copy` is resolved with `realpath -e` fed
  through `xargs -0 -r`, checked against the resolved home and code paths
  both ways, and `realpath -e` is on the Bash list.
  commands/review.md:624, :707.

Side effects: REC-7 applied (`MAX_IMPORTERS_PER_FINDING`,
agents/proof-runner.md:203). REC-2 partly applied (no blank pattern line,
an empty pattern file refused, CONTRACTS.md:540).

## Left out on purpose

- DEBT-1, DEBT-2, REC-1, REC-3 to REC-6, REC-8, REC-9: not in the Rewrite
  plan.
- The unfiled handed-off line (commands/dispatch.md ledger outcome for
  "halted on the untracked stop"): no finding, so not edited. One outcome
  word, `HALTED round: untracked stop`, would close it if Donald wants it.
- The nine DEFERRED round 1 LOWs: not in this plan.

## Files touched

1. plugins/djinn/CONTRACTS.md
2. plugins/djinn/commands/review.md
3. plugins/djinn/commands/dispatch.md
4. plugins/djinn/agents/proof-runner.md
5. plugins/djinn/agents/fixer.md
6. plugins/djinn/agents/gate-auditor.md
7. plugins/djinn/agents/synthesis.md
8. plugins/djinn/agents/legibility-reviewer.md
9. plugins/djinn/agents/pipe-connector.md
10. plugins/djinn/agents/devils-advocate.md
11. plugins/djinn/agents/test-strategist.md
12. plugins/djinn/agents/cost-complexity-reviewer.md
13. plugins/djinn/agents/accessibility-reviewer.md
14. plugins/djinn/agents/data-contract-reviewer.md
15. plugins/djinn/templates/config.yaml
16. plugins/djinn/relay.md
17. plugins/djinn/README.md
18. .djinn/config.yaml

Plus this report. The voice sweep over all 18 found no em or en dash. The
size-rule sweep found only perf benchmark thresholds in test-strategist.md
and the ban on size words in legibility-reviewer.md. The standing rulings
hold: no dollar figure, proof-runner never auto-spawned, `live` stays one
blind reader, no line limit, file length cap, line length rule or token
count added, the four safety caps untouched, the known-bugs index layout
and format-reviewer.md untouched.

## What is still unverified

1. The voice `build_cmd` was never run, old form or new. The new form
   (`set -o pipefail`, `ls-files -z` straight into `xargs -0 -r`) has not
   been run once.
2. The wrapper probe was never run. Not checked: that `node -e` reads
   `PROBE_MB`, that `Buffer.alloc(1048576, 1)` pages go resident, and that
   a wrapper kill shows as `EXIT=137` through the pipe.
3. `systemd-run --user --scope` under WSL: unknown whether a user bus
   exists there. If not, the probe should refuse with `did not start`,
   which is the intended outcome, but nobody has seen it.
4. Git flag support, never run: `git merge-base --end-of-options`,
   `git check-ref-format --branch` on a plain ref, and the `-z` form of
   `git diff --name-status -M -C`, whose rename records hold two paths
   and need their own conversion to tab lines.
5. Pathspec matching. Without `:(glob)` magic, `':!**/id_*'` and
   `':!**/.npmrc'` may not exclude a root-level `id_rsa` or `.npmrc`, and
   the older `':!.env*'` may not exclude a nested `sub/.env`. The
   `:(exclude,glob)**/<name>` form would cover both. Not changed here
   (the plan said "as written"). This needs Donald's call and one test.
6. `xargs -0 -r -I{}` with `git diff --no-index` and with the fixer's
   runner fill; `cp --parents -t` is GNU only.
7. The `RUN_TMP` literal-path rule depends on the orchestrator copying the
   path correctly between calls. No run has exercised it.
8. `bash -c "$(cat file)"` for a `test_cmd` holding a trailing newline or
   a heredoc. Not tried.
9. proof-runner's setup-file detection (reading the runner config for
   `setupFiles`, `globalSetup`, `setupFilesAfterEnv`, `require`,
   `conftest.py`) is a read by the agent, with no fixture.
10. `--untracked <path-list-file>` skips the count and segment stops
    entirely, a judgment call from breaker's second option.
11. No dry run of review then dispatch (REC-9), and no third review round,
    so no reader has checked these edits against each other.
