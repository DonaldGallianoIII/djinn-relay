---
title: known-bugchecker report, audits/2026-09-29-1428-custom
author: Claude Opus 5.5 (known-bugchecker)
date: 2026-09-29
status: audit finding, not yet deliberated
---

## Index
path: ~/Conventions/code/KNOWN-BUGS.md, entries: 46, patterns checked: 21/46

The index gives no pattern ids. Ids below are `<language>/<detail file>/<entry title as a slug>`, the same scheme round 1 used. Every entry carries a `Tier when hit:` line. 25 entries have no `Detection:` line, or one that is a procedure and not a search, and are listed under Checked and Clean as not checked.

Round 2. The round 1 known-bugchecker report (audits/2026-09-29-1303-custom/agents/known-bugchecker.md) filed no findings, so there is nothing to recheck. No `Round 1 recheck` section is written: CONTRACTS.md section 3 reserves prior-finding status to synthesis, and CONTRACTS.md wins over the agent prompt.

The one executable file new to the fence is `tools/check-private.sh`, a bash script. Every signature was read for its shell equivalent there, and for its Python equivalent in the script at `plugins/djinn/commands/learn.md:465` to `:786` and the reward at `plugins/djinn/CONTRACTS.md:1247` to `:1278`. Every other fenced file is markdown, YAML or JSON prose.

## Flagged
- any/tests-and-checks/check-passes-by-not-checking tools/check-private.sh:29
- any/tests-and-checks/check-passes-by-not-checking tools/check-private.sh:21

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `tools/check-private.sh:29` any/tests-and-checks/check-passes-by-not-checking, unverified.
Quoted line: `  hits=$(git -c core.quotePath=false grep --untracked -l -F -e "$pattern" -- . ':!plugins' ':!tools/check-private.sh' ':!audits' 2>/dev/null)`
Match: the entry's trigger is an error guard that tests a sentinel the callee never returns on error, so a failed check reads as a pass; here git grep's stderr goes to /dev/null and its exit status is dropped by the assignment, and `:30` tests only for non-empty stdout, so a git grep that errors (exit 128, empty stdout) leaves `failed=0` and `:41` prints `private check: clean`. The script is the leak guard in build_cmd (`.djinn/config.yaml:22`) that ruling R1 relies on. No realistic erroring input was traced; a downstream reviewer confirms whether one exists.

MEDIUM-2. `tools/check-private.sh:21` any/tests-and-checks/check-passes-by-not-checking, unverified.
Quoted line: `paths=$(git -c core.quotePath=false ls-files --cached --others --exclude-standard -- ':!plugins' | grep -E '^(learn|local)/' )`
Match: same trigger as MEDIUM-1; `set -o pipefail` at `:14` sets the substitution's status on a git failure, but nothing reads that status, and `:22` tests only for non-empty output, so a failed `git ls-files` reads as no learn/ or local/ files. The `cd ... || exit 1` at `:15` guards the not-a-repo case only.

### LOW
none

### DEBT
none

### REC
none

## Checked and Clean

Per fenced file. Every file had all 21 runnable entries run against it: any/accessibility/non-color-encoding-runs-out, any/async-and-lifecycle/guard-flag-not-reset-on-exception, any/async-and-lifecycle/dispose-during-pending-async, any/hot-paths/splice-inside-a-loop, any/local-servers-and-tools/paid-call-before-intent-saved, any/state-and-persistence/restore-appends-without-clearing, any/state-and-persistence/silent-truncation-on-restore, any/state-and-persistence/validator-skips-resolver-default, any/state-and-persistence/regeneration-drops-hand-kept-keys, any/tests-and-checks/hand-mutation-left-in-source, any/tests-and-checks/check-passes-by-not-checking, js/async-and-lifecycle/async-reentrant-void-call, js/async-and-lifecycle/unmanaged-observers-listeners-timers, js/async-and-lifecycle/no-render-pause, js/gpu-and-canvas/gpu-resources-never-collected, js/hot-paths/allocation-per-frame, js/hot-paths/forced-layout-read-in-hot-path, js/local-servers-and-tools/loopback-server-serves-whole-root, js/tests-and-checks/deep-equality-over-large-value, ts/types/accepted-parameter-ignored, ts/types/duplicate-type-definitions.

- `.claude-plugin/marketplace.json`: all 21 ran, no hit.
- `.djinn/config.yaml`: all 21 ran, no hit. The build_cmd at `:22` fails loudly on an empty file list and pipefail fails a failed `git ls-files`, so the voice step is not a check that passes by not checking.
- `.gitignore`: all 21 ran, no hit.
- `plugins/djinn/.claude-plugin/plugin.json`: all 21 ran, no hit.
- `plugins/djinn/CONTRACTS.md`: all 21 ran. Hits read and cleared: `:383` `--max-old-space-size` (js/tests-and-checks/deep-equality-over-large-value; the flag set, not missing); `:497` and `:503` `MUTANT` (any/tests-and-checks/hand-mutation-left-in-source; a status word in a ledger template, outside src, qa and tools); `:1267` `given is None` in the reward scores 0.0, not a sentinel that passes (any/tests-and-checks/check-passes-by-not-checking). Clean.
- `plugins/djinn/README.md`: all 21 ran, no hit.
- `plugins/djinn/agents/gate-auditor.md`: all 21 ran. Hits at `:217` to `:233`, `:284`, `:307` are the agent's own list of the patterns to search for, prose, not code. Clean.
- `plugins/djinn/agents/learn-asked.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-fact-checker.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-harder.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-known.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-prepare.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-synthesis.md`: all 21 ran, no hit.
- `plugins/djinn/agents/proof-runner.md`: all 21 ran. Hits read and cleared: `:12` `assert.deepEqual` names the incident, prose; `:96`, `:117`, `:228`, `:327` `--max-old-space-size` set, not missing; `:265` `k.push(Buffer.alloc(...))` in the wrapper probe allocates on purpose to be killed, no restore (any/state-and-persistence/restore-appends-without-clearing); `:296` to `:312` the mutant grep list, prose. Clean.
- `plugins/djinn/commands/dispatch.md`: all 21 ran. Hits read and cleared: `:330` `--max-old-space-size` set on the lane; `:380` `MUTANT` a stop reason word. Clean.
- `plugins/djinn/commands/learn.md`: all 21 ran. Hits read and cleared for any/state-and-persistence/silent-truncation-on-restore and any/tests-and-checks/check-passes-by-not-checking: `:537` to `:545` `continue` skips only the shuffle, and the row is still written back at `:758`; `read_rows` at `:723` to `:739` keeps a blank or unparsable line as its raw text and records it in `bad`, which `:765` to `:767` prints as FAIL, so no row is dropped on rewrite; `:747` continues past the `secure=` argument, and `:782` fails when none was given; `:750` to `:753` and `:761` to `:764` set `failed = True` before each `continue`. Clean.
- `plugins/djinn/commands/review.md`: all 21 ran. Hits at `:110` (a UI trigger regex), `:360` and `:367` (the tree facts mutant grep and its cleanup note) are prompt text, not code. Clean.
- `plugins/djinn/relay.md`: all 21 ran, no hit.
- `plugins/djinn/templates/config.yaml`: all 21 ran. Hit at `:125`, `--max-old-space-size` in a comment giving an example runner: the flag present. Clean.
- `qa/human/learn-leak-guards.md`: all 21 ran, no hit. It sits under qa, the hand mutation signature's scope, and carries none of `if (false)`, `if (true)`, `&& false`, `|| true` or `MUTANT`.
- `tools/check-private.sh`: all 21 ran. Hits at `:21` and `:29` filed as MEDIUM-1 and MEDIUM-2. Every other entry: no hit; any/tests-and-checks/hand-mutation-left-in-source (in tools) found no `|| true`, `&& false` or `MUTANT`.

Per entry, runnable:
- any/accessibility/non-color-encoding-runs-out: ran against every fenced file, no hit.
- any/async-and-lifecycle/guard-flag-not-reset-on-exception: ran against every fenced file, no hit.
- any/async-and-lifecycle/dispose-during-pending-async: ran against every fenced file, no hit.
- any/hot-paths/splice-inside-a-loop: ran against every fenced file, no hit.
- any/local-servers-and-tools/paid-call-before-intent-saved: ran against every fenced file, no hit.
- any/state-and-persistence/restore-appends-without-clearing: ran against every fenced file, grep hit cleared as above.
- any/state-and-persistence/silent-truncation-on-restore: ran against every fenced file, grep hits cleared as above.
- any/state-and-persistence/validator-skips-resolver-default: ran against every fenced file, no hit.
- any/state-and-persistence/regeneration-drops-hand-kept-keys: ran against every fenced file, no hit.
- any/tests-and-checks/hand-mutation-left-in-source: ran against every fenced file, grep hits cleared as above.
- any/tests-and-checks/check-passes-by-not-checking: ran against every fenced file, two hits filed, the rest cleared as above.
- js/async-and-lifecycle/async-reentrant-void-call: ran against every fenced file, no hit.
- js/async-and-lifecycle/unmanaged-observers-listeners-timers: ran against every fenced file, no hit.
- js/async-and-lifecycle/no-render-pause: ran against every fenced file, no hit.
- js/gpu-and-canvas/gpu-resources-never-collected: ran against every fenced file, grep hit in `plugins/djinn/commands/review.md:110` is a regex in prompt text, cleared.
- js/hot-paths/allocation-per-frame: ran against every fenced file, no hit.
- js/hot-paths/forced-layout-read-in-hot-path: ran against every fenced file, no hit.
- js/local-servers-and-tools/loopback-server-serves-whole-root: ran against every fenced file, no hit.
- js/tests-and-checks/deep-equality-over-large-value: ran against every fenced file, grep hits cleared as above.
- ts/types/accepted-parameter-ignored: ran against every fenced file, no hit.
- ts/types/duplicate-type-definitions: ran against every fenced file, no hit.

Per entry, not checked:
- any/arithmetic/fencepost-from-float-division: no search signature in index entry, not checked.
- any/async-and-lifecycle/undo-stack-mutated-before-async-apply: no search signature in index entry, not checked.
- any/driving-a-third-party-page/fixed-sleeps-instead-of-signals: no search signature in index entry, not checked.
- any/driving-a-third-party-page/signal-true-the-whole-time: no search signature in index entry, not checked.
- any/driving-a-third-party-page/bare-button-as-signal: no search signature in index entry, not checked.
- any/driving-a-third-party-page/trusting-the-click-as-the-save: no search signature in index entry, not checked.
- any/driving-a-third-party-page/selecting-by-id-on-framework-form: no search signature in index entry, not checked.
- any/driving-a-third-party-page/reading-reactive-form-synchronously: no search signature in index entry, not checked.
- any/driving-a-third-party-page/focus-armed-on-stray-keystroke: no search signature in index entry, not checked.
- any/driving-a-third-party-page/caps-counted-per-page-load: no search signature in index entry, not checked.
- any/driving-a-third-party-page/buffer-cleared-on-failed-send: no search signature in index entry, not checked.
- any/driving-a-third-party-page/synthetic-events-as-human-input: no search signature in index entry, not checked.
- any/driving-a-third-party-page/generic-auto-fill: no search signature in index entry, not checked.
- any/hot-paths/unbatched-uploads-in-interpolation-loop: no search signature in index entry, not checked.
- any/state-and-persistence/transient-runtime-data-in-persisted-buffer: no search signature in index entry, not checked (its Detection line is a procedure, not a search).
- any/state-and-persistence/ui-not-synced-after-bulk-restore: no search signature in index entry, not checked.
- any/state-and-persistence/async-restore-without-input-guard: no search signature in index entry, not checked.
- any/state-and-persistence/legality-predicate-duplicated: no search signature in index entry, not checked.
- js/driving-a-third-party-page/wildcard-cors-on-loopback: no search signature in index entry, not checked.
- js/gpu-and-canvas/preserve-drawing-buffer: no search signature in index entry, not checked.
- js/gpu-and-canvas/command-buffer-accumulation: no search signature in index entry, not checked.
- js/gpu-and-canvas/bare-canvas-in-css-grid: no search signature in index entry, not checked.
- js/gpu-and-canvas/large-export-canvases-retained: no search signature in index entry, not checked.
- js/hot-paths/string-keyed-map-in-hot-path: no search signature in index entry, not checked.
- ts/types/as-any-where-type-known: no search signature in index entry, not checked.

## Files read outside the fence
- `~/Conventions/code/known-bugs/any-language/accessibility.md` (index detail file)
- `~/Conventions/code/known-bugs/any-language/arithmetic.md` (index detail file)
- `~/Conventions/code/known-bugs/any-language/async-and-lifecycle.md` (index detail file)
- `~/Conventions/code/known-bugs/any-language/driving-a-third-party-page.md` (index detail file)
- `~/Conventions/code/known-bugs/any-language/hot-paths.md` (index detail file)
- `~/Conventions/code/known-bugs/any-language/local-servers-and-tools.md` (index detail file)
- `~/Conventions/code/known-bugs/any-language/state-and-persistence.md` (index detail file)
- `~/Conventions/code/known-bugs/any-language/tests-and-checks.md` (index detail file)
- `~/Conventions/code/known-bugs/javascript/async-and-lifecycle.md` (index detail file)
- `~/Conventions/code/known-bugs/javascript/driving-a-third-party-page.md` (index detail file)
- `~/Conventions/code/known-bugs/javascript/gpu-and-canvas.md` (index detail file)
- `~/Conventions/code/known-bugs/javascript/hot-paths.md` (index detail file)
- `~/Conventions/code/known-bugs/javascript/local-servers-and-tools.md` (index detail file)
- `~/Conventions/code/known-bugs/javascript/tests-and-checks.md` (index detail file)
- `~/Conventions/code/known-bugs/typescript/types.md` (index detail file)
- Greps over `plugins/djinn/` also returned lines from unfenced agent files (multiuser-reviewer, bugs-reviewer, data-contract-reviewer, live-system-reviewer, cost-complexity-reviewer, fixer, accessibility-reviewer). Those lines were discarded and the files were not opened.
