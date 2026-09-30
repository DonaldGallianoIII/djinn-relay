---
title: known-bugchecker report, audits/2026-09-27-1806-custom
author: Claude Opus 5.5 (known-bugchecker)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Index
path: ~/Conventions/code/KNOWN-BUGS.md, entries: 46, patterns checked: 22/46

The index keeps every entry inline, with no linked detail files, no pattern ids and no tier words. Pattern ids below are slugs of each entry's bold title. Every hit is MEDIUM with `(index entry has no tier)`. 24 entries carry no Detection line and were not checked; they are listed under Checked and Clean.

## Flagged
- deep-equality-over-a-large-value plugins/djinn/agents/fixer.md:100
- hand-mutation-left-in-the-source plugins/djinn/agents/proof-runner.md:138

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/fixer.md:100` deep-equality-over-a-large-value (index entry has no tier), unverified.
Quoted line: `Your narrowed run carries no heap cap of its own. When the dispatch prompt`
Match: the entry's Detection names "a test script with no `max-old-space-size`", and its Prevention says to cap every test child's heap. fixer.md:95 to 99 tells the fixer to build its own narrowed test command, which skips any cap the project put in `test_cmd`. Lines 100 to 102 add a cap only "When the dispatch prompt gives `proof.heap_mb`". The template ships `heap_mb: none` (`plugins/djinn/templates/config.yaml:90`), and dispatch.md:136 passes `none` straight through. So the default path is an uncapped test run made by an agent, which is the setup the 2026-09-27 incident ran under. New in this diff (patch lines 569 to 571). The prompt states the gap out loud, but it does not close it: there is no "refuse" or "skip tests" rule when the cap is absent.

MEDIUM-2. `plugins/djinn/agents/proof-runner.md:138` hand-mutation-left-in-the-source (index entry has no tier), unverified.
Quoted line: `3. A grep of the fixed files for a hand mutant: \`if (false)\`, \`if (true)\`,` continuing at :139 `\`&& false\`, \`|| true\`, \`MUTANT\`. A hit on a changed line stops the whole`
Match: the entry's Detection is any `if (false)`, `if (true)`, `&& false`, `|| true` or `MUTANT` in src, qa or tools, and it names a mutant that "commits" as one outcome. proof-runner narrows that check in two ways. First, it only stops on "a changed line". A mutant that was already committed, which index mode's "fixed by hand" entries make likely, is not on a changed line, so proof-runner runs it. Second, it greps only "the fixed files" and never the test file it picked under Choosing the file (:102 to :125). A mutant on a test file's verdict line reads as PASS. Both are the entry's trigger: a mutant still in place gets run and recorded. Cross-file check needed: `plugins/djinn/commands/review.md:212` greps the fenced files the same way, which may cover the first gap for a review run but not for a proof run.

### LOW
none

### DEBT
none

### REC
none

## Checked and Clean
- `.djinn/config.yaml`: every checked entry ran, no hit. `test_cmd: none`, so no agent-run test lane.
- `plugins/djinn/.claude-plugin/plugin.json`: every checked entry ran, no hit.
- `plugins/djinn/CONTRACTS.md`: every checked entry ran, no hit. `MUTANT` at :327 is a ledger status word, not code.
- `plugins/djinn/README.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/accessibility-reviewer.md`: every checked entry ran. `?? SHAPES.at(-1)` at :50 and `?? list.at(-1)` at :184 are detection text quoted from the index. No hit.
- `plugins/djinn/agents/breaker.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/bugs-reviewer.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/consolidator.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/cost-complexity-reviewer.md`: every checked entry ran, no hit. It has no Bash run of tests.
- `plugins/djinn/agents/data-contract-reviewer.md`: every checked entry ran. `=== undefined) return` at :172 is detection text. No hit.
- `plugins/djinn/agents/devils-advocate.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/fixer.md`: every checked entry except deep-equality-over-a-large-value ran, no hit. See MEDIUM-1.
- `plugins/djinn/agents/gate-auditor.md`: deep-equality-over-a-large-value, hand-mutation-left-in-the-source and a-check-that-passes-by-not-checking checked against the prompt as the dispatch asked. Clean. Its Bash list at :88 to :98 forbids `node`, `npm` and every test run, so it cannot trip deep-equality. Its mutant grep at :182 to :194 covers `src/`, `qa/`, `tools/` and `tests/`, tracked and untracked, plus the scripts block and CI, which is wider than the entry's Detection. Its scope 2 at :196 to :213 carries the entry's `catch { return }` and `=== undefined` guards word for word. Every code-shaped hit in the file (:186 to :202, :253, :276) is quoted detection text.
- `plugins/djinn/agents/integration-reviewer.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/live-system-reviewer.md`: every checked entry ran. `Access-Control-Allow-Origin: *` at :44 and `setTimeout` at :202 are detection text. No hit.
- `plugins/djinn/agents/multiuser-reviewer.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/perf-reviewer.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/proof-runner.md`: deep-equality-over-a-large-value is clean. The guard is present: a required `proof.heap_mb` with refusal at :63 to :72, `NODE_OPTIONS` plus the runner flag and `timeout` at :147, `--test-concurrency=1`, one file per call, and output cut to 16 KB plus 4 KB so a full assertion dump cannot flood the run. a-check-that-passes-by-not-checking is clean against the entry's Detection (`catch { return }`, `=== undefined` guards): the prompt reads exit codes, not sentinels, and :172 to :175 says a PASS does not prove the file exercises the fix. hand-mutation-left-in-the-source: see MEDIUM-2.
- `plugins/djinn/agents/security-reviewer.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/synthesis.md`: every checked entry ran, no hit.
- `plugins/djinn/agents/test-strategist.md`: every checked entry ran, no hit. It runs no `test_cmd` (:45).
- `plugins/djinn/agents/ux-reviewer.md`: every checked entry ran, no hit.
- `plugins/djinn/commands/dispatch.md`: every checked entry ran, no hit. The landing lane at :206 runs `test_cmd` as configured, so any cap is the project script's, which the entry's Detection covers. That line is not new in this diff.
- `plugins/djinn/commands/review.md`: every checked entry ran. The regex at :84 and the mutant grep at :212 to :216 are detection text. No hit.
- `plugins/djinn/relay.md`: every checked entry ran, no hit.
- `plugins/djinn/templates/config.yaml`: every checked entry ran, no hit.
- guard-flag-not-reset-on-exception, async-reentrant-void-call, dispose-during-pending-async, unmanaged-observers-listeners-and-timers, no-render-pause-on-blur, restore-or-init-appends-without-clearing, silent-data-truncation-on-restore, transient-runtime-data-in-a-persisted-buffer, validator-skips-what-the-resolver-defaults, regeneration-drops-hand-kept-keys, allocation-per-frame, splice-inside-a-loop, getcomputedstyle-in-a-hot-path, gpu-resources-never-garbage-collected, accepted-parameter-silently-ignored, duplicate-type-definitions, a-check-that-passes-by-not-checking, loopback-dev-server-serves-the-whole-root, paid-call-before-the-intent-is-saved, the-non-color-encoding-runs-out: each ran against every fenced file. There were no hits outside quoted detection text in prose.
- undo-stack-mutated-before-the-async-apply, ui-not-synced-after-bulk-state-restore, async-restore-without-an-input-guard, legality-predicate-duplicated-between-mask-and-apply, string-keyed-map-in-a-hot-path, unbatched-uploads-in-an-interpolation-loop, preservedrawingbuffer-on-a-webgl-canvas, command-buffer-accumulation, a-bare-canvas-in-a-css-grid, large-export-canvases-retained, a-fencepost-derived-from-a-float-division, as-any-where-the-type-is-known, fixed-sleeps-instead-of-signals, a-signal-that-is-true-the-whole-time, a-bare-button-as-the-signal, trusting-the-click-as-the-save, selecting-by-id-on-a-framework-rendered-form, reading-a-reactive-form-synchronously, focus-armed-on-a-stray-keystroke, wildcard-cors-on-a-loopback-server, caps-counted-per-page-load, buffer-cleared-on-a-failed-send, synthetic-events-recorded-as-human-input, the-generic-auto-fill: no search signature in index entry, not checked.

## Files read outside the fence
none
