---
title: known-bugchecker report, audits/2026-09-29-1654-custom
author: Claude Opus 5.5 (known-bugchecker)
date: 2026-09-29
status: audit finding, not yet deliberated
---

## Index
path: ~/Conventions/code/KNOWN-BUGS.md, entries: 46, patterns checked: 26/46

The index gives no pattern ids. Ids below are `<language>/<detail file>/<entry title as a slug>`, the scheme rounds 1 and 2 used. Every entry carries a `Tier when hit:` line, so no entry fell back to a default tier.

Change from round 2's scheme: five entries with no `Detection:` line name a literal in their own text (`sleep(`, `Access-Control-Allow-Origin: *`, `preserveDrawingBuffer`, a template literal Map key, `as any`). This round greps that literal, so they count as checked: 26 runnable where round 2 had 21. The other 20 have no search signature and are listed under Checked and Clean as not checked.

Round 3. No `Round 2 recheck` section: CONTRACTS.md section 3 gives prior-finding status to synthesis alone, and CONTRACTS.md wins over the agent prompt.

Executable content in the fence: `tools/check-private.sh` and `tools/pre-push.sh` (bash); the build_cmd at `.djinn/config.yaml:25` (bash); the Python check script at `plugins/djinn/commands/learn.md:503` to `:877`; and the loader and reward at `plugins/djinn/CONTRACTS.md:1259` to `:1275` and `:1330` to `:1378`. Each signature was read for its shell or Python equivalent there. Every other fenced file is markdown, YAML or JSON prose, and a signature hit in prose is not a finding.

## Flagged
none

## Findings

### HIGH
none

### MEDIUM
none

### LOW
none

### DEBT
none

### REC
none

## Checked and Clean

Per fenced file. Every file had all 26 runnable entries run against it (listed per entry below).

- `.claude-plugin/marketplace.json`: all 26 ran, no hit.
- `.djinn/config.yaml`: all 26 ran. Hit at `:51` (`interface every`, ts/types/duplicate-type-definitions) is prose. The build_cmd at `:25` fails loudly on an empty file list, and pipefail fails a failed `git ls-files`. It is not a check that passes by not checking. Clean.
- `.gitignore`: all 26 ran, no hit.
- `_FromClaude/APPLY-BRIEF.md`: all 26 ran, no hit.
- `_FromClaude/PROMPT-REVIEW-BRIEF.md`: all 26 ran, no hit.
- `_FromClaude/prompt-review-breaker.md`: all 26 ran. Hits at `:46` and `:48` (`dispose()`, any/async-and-lifecycle/dispose-during-pending-async) are prose quoting a prompt. Clean.
- `_FromClaude/prompt-review-bugs-reviewer.md`: all 26 ran. Hit at `:106` (`dispose()`) is prose. Clean.
- `_FromClaude/prompt-review-cmd-brief.md`: all 26 ran, no hit.
- `_FromClaude/prompt-review-cmd-review.md`: all 26 ran, no hit.
- `_FromClaude/prompt-review-dependency-reviewer.md`: all 26 ran. Hit at `:31` (`continue`, any/state-and-persistence/silent-truncation-on-restore) is prose. Clean.
- `_FromClaude/prompt-review-integration-reviewer.md`: all 26 ran. Hit at `:97` (`continue`) is prose. Clean.
- `_FromClaude/prompt-review-known-bugchecker.md`: all 26 ran, no hit.
- `_FromClaude/prompt-review-multiuser-reviewer.md`: all 26 ran. Hit at `:25` (`interface`) is prose. Clean.
- `_FromClaude/prompt-review-perf-reviewer.md`: all 26 ran, no hit.
- `_FromClaude/prompt-review-pipe-connector.md`: all 26 ran. Hit at `:45` (`dispose()`) is prose. Clean.
- `_FromClaude/prompt-review-security-reviewer.md`: all 26 ran, no hit.
- `docs/carried-findings.md`: all 26 ran, no hit.
- `docs/session-log-2026-09-12.md`: all 26 ran, no hit.
- `plugins/djinn/.claude-plugin/plugin.json`: all 26 ran, no hit.
- `plugins/djinn/CONTRACTS.md`: all 26 ran. Hits read and cleared:
  - `:389` `--max-old-space-size` (js/tests-and-checks/deep-equality-over-large-value): the flag is set, not missing.
  - `:503` and `:509` `MUTANT` (any/tests-and-checks/hand-mutation-left-in-source): a status word in a ledger template, outside src, qa and tools.
  - `:1368` and `:1376` (ts/types/accepted-parameter-ignored): `learn_reward` and `learn_reward_parts` accept `prompts` and `answer` and read neither. The guard is present. `:1323` to `:1325` fix the TRL reward shape, and TRL passes columns by keyword, so an underscore prefix is not available. The script at `commands/learn.md:722` fails any row whose `answer` column differs from the answer check's first term, and `:1252` keeps only runs whose check ends in a pass. So the ignored `answer` equals the term the reward reads on every row that reaches it.
  - `:1263` `passed(run)` (any/tests-and-checks/check-passes-by-not-checking): the empty case returns False, and a missing `check.txt` raises. It never reads as a pass.
- `plugins/djinn/README.md`: all 26 ran, no hit.
- `plugins/djinn/agents/data-contract-reviewer.md`: all 26 ran. Hit at `:173` (`=== undefined) return`, any/state-and-persistence/validator-skips-resolver-default) is the agent's own search instruction, prose. Clean.
- `plugins/djinn/agents/gate-auditor.md`: all 26 ran. Hits at `:217` to `:233`, `:284` and `:307` are the agent's own list of patterns to search for, prose. Clean.
- `plugins/djinn/agents/learn-asked.md`: all 26 ran, no hit.
- `plugins/djinn/agents/learn-fact-checker.md`: all 26 ran, no hit.
- `plugins/djinn/agents/learn-harder.md`: all 26 ran, no hit.
- `plugins/djinn/agents/learn-known.md`: all 26 ran, no hit.
- `plugins/djinn/agents/learn-prepare.md`: all 26 ran, no hit.
- `plugins/djinn/agents/learn-synthesis.md`: all 26 ran, no hit.
- `plugins/djinn/agents/legibility-reviewer.md`: all 26 ran, no hit.
- `plugins/djinn/agents/proof-runner.md`: all 26 ran. Hits read and cleared:
  - `:96`, `:117`, `:228` and `:327` `--max-old-space-size`: the flag is set, not missing.
  - `:265` `k.push(Buffer.alloc(...))` (any/state-and-persistence/restore-appends-without-clearing): the wrapper probe allocates on purpose so the cap kills it. It is not a restore.
  - `:296` to `:312`: the mutant grep list, prose.
- `plugins/djinn/commands/dispatch.md`: all 26 ran. Hits read and cleared: `:333` `--max-old-space-size` is set on the lane; `:383` `MUTANT` is a stop reason word; `:298` `continue` is prose.
- `plugins/djinn/commands/learn.md`: all 26 ran. Hits read and cleared:
  - `:585`, `:588` and `:592` `continue` (silent-truncation-on-restore): they skip only the shuffle, and the row is still written back at `:835`.
  - `read_rows` at `:773` to `:789` keeps a blank or unparsable line as its raw text and records it in `bad`, which `:844` to `:846` fails. No row is dropped on the rewrite.
  - `:819` and `:822` continue past the `secure=` and `root=` arguments, and `:872` fails when no valid `secure=` was given.
  - `:829` and `:843` set `failed = True` before each `continue`.
  - `:836` `open(path, "w")` (any/state-and-persistence/regeneration-drops-hand-kept-keys): the target was read at `:831`, every parsed row is dumped whole, and the write is skipped when nothing changed (`:834`).
  - `:809` `.add(` is a Python set, not an observable.
  - Every `def` from `:534` to `:802` reads every parameter it takes (ts/types/accepted-parameter-ignored).
- `plugins/djinn/commands/review.md`: all 26 ran. Hits at `:110` (a UI trigger regex naming `WebGLRenderer` and `addEventListener`), `:373` and `:380` (the tree facts mutant grep and its cleanup note) are prompt text, not code. Clean.
- `plugins/djinn/relay.md`: all 26 ran, no hit.
- `plugins/djinn/templates/config.yaml`: all 26 ran. The hit at `:125` is `--max-old-space-size` in an example runner comment, so the flag is present. Clean.
- `qa/human/learn-leak-guards.md`: all 26 ran, no hit. The file is under qa, the hand mutation signature's scope, and holds none of `if (false)`, `if (true)`, `&& false`, `|| true` or `MUTANT`.
- `tools/check-private.sh`: all 26 ran.
  - any/tests-and-checks/check-passes-by-not-checking, read in its shell form (an exit status dropped, so an error reads as clean): no hit. `grep_files` at `:69` to `:79` returns 2 on a git grep exit above 1, and passes 2 to 4 (`:100` to `:108`, `:112` to `:120`, `:138` to `:148`) set `failed=1` on it. `:82` to `:86` fail a nonzero `git ls-files`.
  - `:125` drops `git rev-parse`'s status with `2>/dev/null`. A failure there only leaves the patterns file unfound, and `:129` then prints `PRIVATE WORDS NOT CHECKED` in capitals. That is the entry's own prevention, a missing fixture that skips with a reason.
  - An empty pattern list fails at `:134` to `:136`.
  - The learn mark constants at `:42` to `:44` match the text the defining prompts write (`CONTRACTS.md:1423`, `learn-synthesis.md:454`, the six learn agents' headers), so pass 2 tests a sentinel that is actually produced.
  - any/tests-and-checks/hand-mutation-left-in-source (in tools): no `|| true`, `&& false` or `MUTANT`.
  - `:132` `> "$tmp"` writes the script's own temp file, not a regenerated output.
- `tools/pre-push.sh`: all 26 ran, no hit. It execs `tools/check-private.sh` and exits 1 when `git rev-parse` fails (`:12`). A missing patterns file passes the push with the capitals warning, which is the entry's prevention (skip with a reason). It is not a check that passes silently.

Per entry, runnable:
- any/accessibility/non-color-encoding-runs-out: ran against every fenced file, no hit.
- any/async-and-lifecycle/guard-flag-not-reset-on-exception: ran against every fenced file, no hit.
- any/async-and-lifecycle/dispose-during-pending-async: ran against every fenced file, prose hits cleared as above.
- any/driving-a-third-party-page/fixed-sleeps-instead-of-signals: ran by the literal `sleep` against every fenced file, no hit.
- any/hot-paths/splice-inside-a-loop: ran against every fenced file, no hit.
- any/local-servers-and-tools/paid-call-before-intent-saved: ran against every fenced file, no hit.
- any/state-and-persistence/restore-appends-without-clearing: ran against every fenced file, hit cleared as above.
- any/state-and-persistence/silent-truncation-on-restore: ran against every fenced file, hits cleared as above.
- any/state-and-persistence/validator-skips-resolver-default: ran against every fenced file, prose hit cleared as above.
- any/state-and-persistence/regeneration-drops-hand-kept-keys: ran against every fenced file, hit cleared as above.
- any/tests-and-checks/hand-mutation-left-in-source: ran against every fenced file, prose hits cleared as above.
- any/tests-and-checks/check-passes-by-not-checking: ran against every fenced file, hits cleared as above.
- js/async-and-lifecycle/async-reentrant-void-call: ran against every fenced file, no hit.
- js/async-and-lifecycle/unmanaged-observers-listeners-timers: ran against every fenced file, prose hit in `review.md:110` cleared.
- js/async-and-lifecycle/no-render-pause: ran against every fenced file, no hit.
- js/driving-a-third-party-page/wildcard-cors-on-loopback: ran by the literal `Access-Control-Allow-Origin` against every fenced file, no hit.
- js/gpu-and-canvas/gpu-resources-never-collected: ran against every fenced file, prose hit in `review.md:110` cleared.
- js/gpu-and-canvas/preserve-drawing-buffer: ran by the literal against every fenced file, no hit.
- js/hot-paths/allocation-per-frame: ran against every fenced file, no render loop in the fence, no hit.
- js/hot-paths/string-keyed-map-in-hot-path: ran by a template literal Map key grep against every fenced file, no hit.
- js/hot-paths/forced-layout-read-in-hot-path: ran against every fenced file, no hit.
- js/local-servers-and-tools/loopback-server-serves-whole-root: ran against every fenced file, no hit.
- js/tests-and-checks/deep-equality-over-large-value: ran against every fenced file, hits cleared as above; no test script in the fence (test_cmd none).
- ts/types/accepted-parameter-ignored: ran against every fenced file, hits in `CONTRACTS.md:1368` and `:1376` cleared as above.
- ts/types/duplicate-type-definitions: ran against every fenced file, prose hits cleared as above.
- ts/types/as-any-where-type-known: ran by the literal against every fenced file, no hit.

Per entry, not checked:
- any/arithmetic/fencepost-from-float-division: no search signature in index entry, not checked.
- any/async-and-lifecycle/undo-stack-mutated-before-async-apply: no search signature in index entry, not checked.
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
- js/gpu-and-canvas/command-buffer-accumulation: no search signature in index entry, not checked.
- js/gpu-and-canvas/bare-canvas-in-css-grid: no search signature in index entry, not checked.
- js/gpu-and-canvas/large-export-canvases-retained: no search signature in index entry, not checked.

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
- `audits/2026-09-29-1428-custom/agents/known-bugchecker.md` (prior round's id scheme)
- The repo-wide greps also returned lines from unfenced files: agents bugs-reviewer, live-system-reviewer, fixer, cost-complexity-reviewer, multiuser-reviewer, accessibility-reviewer and dependency-reviewer, `_FromClaude/prompt-review-gap-hunter.md`, `-format-reviewer.md` and `-cmd-dispatch.md`, and `tools/render_html.py`. Those lines were discarded and the files were not opened.
