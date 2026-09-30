---
title: known-bugchecker report, audits/2026-09-29-1303-custom
author: Claude Opus 5.5 (known-bugchecker)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Index
path: ~/Conventions/code/KNOWN-BUGS.md, entries: 46, patterns checked: 21/46

The index gives no pattern ids. Ids below are `<language>/<detail file>/<entry title as a slug>`. Every entry carries a `Tier when hit:` line. 25 entries have no `Detection:` line, or one that is a procedure and not a search, and are listed under Checked and Clean as not checked.

All 21 runnable signatures are code constructs (JavaScript, TypeScript, CSS). The fence is markdown prompts, JSONL rows, YAML and JSON. The only code in the fence is Python: the reference reward in `plugins/djinn/CONTRACTS.md:1039` to `:1070`, the JSONL check script in `plugins/djinn/commands/learn.md:320` to `:447`, and a two line `datasets` snippet in `plugins/djinn/agents/learn-synthesis.md:293` and `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md:79`. Each signature was also read for its Python equivalent in those blocks.

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

Per fenced file. Every file had all 21 runnable entries run against it: any/accessibility/non-color-encoding-runs-out, any/async-and-lifecycle/guard-flag-not-reset-on-exception, any/async-and-lifecycle/dispose-during-pending-async, any/hot-paths/splice-inside-a-loop, any/local-servers-and-tools/paid-call-before-intent-saved, any/state-and-persistence/restore-appends-without-clearing, any/state-and-persistence/silent-truncation-on-restore, any/state-and-persistence/validator-skips-resolver-default, any/state-and-persistence/regeneration-drops-hand-kept-keys, any/tests-and-checks/hand-mutation-left-in-source, any/tests-and-checks/check-passes-by-not-checking, js/async-and-lifecycle/async-reentrant-void-call, js/async-and-lifecycle/unmanaged-observers-listeners-timers, js/async-and-lifecycle/no-render-pause, js/gpu-and-canvas/gpu-resources-never-collected, js/hot-paths/allocation-per-frame, js/hot-paths/forced-layout-read-in-hot-path, js/local-servers-and-tools/loopback-server-serves-whole-root, js/tests-and-checks/deep-equality-over-large-value, ts/types/accepted-parameter-ignored, ts/types/duplicate-type-definitions.

- `.djinn/config.yaml`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/README.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/angles/e-01/learn-asked.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/angles/e-01/learn-harder.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/angles/e-01/learn-known.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/angles/e-01/learn-prepare.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/check.txt`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/context.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/dpo.jsonl`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/grpo.jsonl`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/input.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/items-DRAFT.yaml`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/quarantine.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/sft.jsonl`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/study-sheet.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/usage.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/verification/e-01.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run-<course>/LEDGER.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/README.md`: all 21 ran. Grep hit at `:79`, `ds.filter(...)` for js/hot-paths/allocation-per-frame: a Python snippet a reader copies into a loader, no render loop. Clean.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/angles/tB-06/learn-asked.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/angles/tB-06/learn-harder.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/angles/tB-06/learn-known.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/angles/tB-06/learn-prepare.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/check.txt`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/context.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/dpo.jsonl`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/grpo.jsonl`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/input.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/items-DRAFT.yaml`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/quarantine.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/sft.jsonl`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/study-sheet.md`: all 21 ran. Grep hit at `:63`, the word "continue" in a study question for any/state-and-persistence/silent-truncation-on-restore: prose, not a loop. Clean.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/usage.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/verification/tB-06.md`: all 21 ran, no hit.
- `docs/examples/learn-dry-run/LEDGER.md`: all 21 ran, no hit.
- `plugins/djinn/.claude-plugin/plugin.json`: all 21 ran, no hit.
- `plugins/djinn/CONTRACTS.md`: all 21 ran. Hits read and cleared: `:374` `--max-old-space-size` (js/tests-and-checks/deep-equality-over-large-value; the signature is a test script missing the flag, and this line sets it); `:488` and `:494` `MUTANT` (any/tests-and-checks/hand-mutation-left-in-source; a status word in a ledger template, and the signature's scope is src, qa and tools); `:1060` `continue` in `learn_reward` (any/state-and-persistence/silent-truncation-on-restore; a scoring loop that appends 0.0 before it continues, so no row is dropped, and no restore). The reward's `given is None` at `:1058` scores 0.0, so it is not a sentinel that passes (any/tests-and-checks/check-passes-by-not-checking). Clean.
- `plugins/djinn/README.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-asked.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-fact-checker.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-harder.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-known.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-prepare.md`: all 21 ran, no hit.
- `plugins/djinn/agents/learn-synthesis.md`: all 21 ran. Grep hit at `:293`, `ds.filter(...)` for js/hot-paths/allocation-per-frame: a Python loader snippet in the README template, no render loop. Clean.
- `plugins/djinn/commands/learn.md`: all 21 ran. Hits read and cleared for any/tests-and-checks/check-passes-by-not-checking and any/state-and-persistence/silent-truncation-on-restore: `:427` to `:428` skips a file not named sft, dpo or grpo, but prints a line that is not `rows read`, and `:454` to `:456` counts any such line and any missing file as a failure; `:432` to `:435` and `:438` to `:441` set `failed = True` before each `continue`. Every early `return` in the validators at `:333` to `:420` returns an error string, never an empty pass (any/state-and-persistence/validator-skips-resolver-default). Clean.
- `plugins/djinn/relay.md`: all 21 ran, no hit.
- `plugins/djinn/templates/config.yaml`: all 21 ran. Grep hit at `:125`, `--max-old-space-size` inside a comment giving an example runner: the flag present, not absent. Clean.

Per entry, runnable:
- any/accessibility/non-color-encoding-runs-out: ran against every fenced file, no hit.
- any/async-and-lifecycle/guard-flag-not-reset-on-exception: ran against every fenced file, no hit.
- any/async-and-lifecycle/dispose-during-pending-async: ran against every fenced file, no hit.
- any/hot-paths/splice-inside-a-loop: ran against every fenced file, no hit.
- any/local-servers-and-tools/paid-call-before-intent-saved: ran against every fenced file, no hit.
- any/state-and-persistence/restore-appends-without-clearing: ran against every fenced file, no hit.
- any/state-and-persistence/silent-truncation-on-restore: ran against every fenced file, grep hits cleared as above.
- any/state-and-persistence/validator-skips-resolver-default: ran against every fenced file, no hit.
- any/state-and-persistence/regeneration-drops-hand-kept-keys: ran against every fenced file, no hit.
- any/tests-and-checks/hand-mutation-left-in-source: ran against every fenced file, grep hits cleared as above.
- any/tests-and-checks/check-passes-by-not-checking: ran against every fenced file, grep hits cleared as above.
- js/async-and-lifecycle/async-reentrant-void-call: ran against every fenced file, no hit.
- js/async-and-lifecycle/unmanaged-observers-listeners-timers: ran against every fenced file, no hit.
- js/async-and-lifecycle/no-render-pause: ran against every fenced file, no hit.
- js/gpu-and-canvas/gpu-resources-never-collected: ran against every fenced file, no hit.
- js/hot-paths/allocation-per-frame: ran against every fenced file, grep hits cleared as above.
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
- any/state-and-persistence/transient-runtime-data-in-persisted-buffer: no search signature in index entry, not checked (its Detection line is a procedure, list every serializer, not a search).
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
- Greps over `plugins/djinn/` also returned lines from unfenced agent and command files. Those lines were discarded and the files were not opened.
