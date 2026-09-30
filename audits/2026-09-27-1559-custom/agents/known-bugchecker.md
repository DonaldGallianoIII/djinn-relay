---
title: known-bugchecker report, audits/2026-09-27-1559-custom
author: Claude Opus 5.5 (known-bugchecker)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Index
path: ~/Conventions/code/KNOWN-BUGS.md, entries: 46, patterns checked: 46/46

The index is one self-contained file. It links no detail files, gives no entry a stable id or a tier word, and 23 of the 46 entries have no Detection line. The fenced file is a markdown prompt, so no code grep applies. As the dispatch asked, each entry was checked by reading the prompt for two things: does it lead its agent to miss the pattern where the pattern is in its lane, and does the prompt itself show the pattern. The ids below are slugs of the entry titles.

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
- `plugins/djinn/agents/cost-complexity-reviewer.md`: all 46 entries ran against it. No hit.
- deep-equality-large-value: the guard is present. Line 142 names node processes with no `--max-old-space-size`, test lanes included. Line 145 names "an assertion or a log call that prints a large value". Line 240 proposes the heap-flag convention.
- paid-call-before-intent: the guard is present. Line 135 says "or made before the intent to make it is saved". Lines 179 to 180 tier a resume that re-buys as HIGH.
- loopback-server-whole-root: this is security-reviewer's lane (lines 37 to 38 hand secrets to them). The cost-side twin is covered at line 153, "a dev server or worker nobody stops". No miss.
- no-render-pause: the guard is present at line 152, "a render loop drawing unchanged frames".
- caps-per-page-load: covered in general form at lines 180 to 181, "a cost control the code claims and does not apply". No miss.
- gpu-resources-not-gc, preserve-drawing-buffer, command-buffer-accumulation, large-export-canvases-retained: these are memory ceilings that item 3 (lines 140 to 145) does not name. The guard is lines 128 to 130: the prompt tells its agent to read `known_bugs_index` first, and says those patterns take priority over its own list. No miss.
- allocation-per-frame, string-keyed-map-hot-path, splice-inside-loop, forced-layout-read-hot-path, unbatched-uploads: perf-reviewer owns these (lines 29 to 32). Quadratic work over real bounds is item 6 (lines 156 to 159). No miss.
- regeneration-drops-hand-kept-keys: data loss, not cost. The re-buy half is covered at lines 179 to 180. No miss.
- check-passes-by-not-checking: the guard is present. A missing cost input is listed under "Inputs missing" (lines 66 to 71), and an uncited figure goes to UNVERIFIED (lines 101 to 103). An absent input is reported, not passed silently.
- duplicate-type-definitions: the prompt restates the severity ladder (lines 172 to 198) in cost terms. It keeps CONTRACTS.md section 1's five words, and line 175 says "the tier word decides everything". No divergence from the canonical definition.
- accepted-parameter-ignored: this was a near hit and is recorded here. Lines 63 to 64 list `hot_paths`, `conventions_files`, `deps.platform`, `build_cmd`, `test_cmd` and `goal_doc` as inputs, and the body never reads any of them again. Not filed, for three reasons. They are introduced as "Also:" background, not as inputs the agent must use. `hot_paths` belongs to perf-reviewer by lines 29 to 32. Test-lane heap is reached through the manifest scripts block (lines 87 to 88) instead. bugs-reviewer or gap-hunter may want to judge whether `test_cmd` and `goal_doc` should be read.
- guard-flag-not-reset-on-exception, async-reentrant-void-call, dispose-during-pending-async, undo-stack-mutated-before-async-apply, unmanaged-observers-listeners-timers: these are code lifecycle patterns. Nothing in the prompt leads its agent to cause or miss them. Always-on timers are covered at lines 150 to 153. No hit.
- restore-appends-without-clearing, silent-truncation-on-restore, transient-data-in-persisted-buffer, ui-not-synced-after-restore, async-restore-without-input-guard, legality-predicate-duplicated, validator-skips-resolver-default: these are state and persistence code patterns, outside this agent's lane. The prompt has no analog. No hit.
- bare-canvas-in-grid, float-division-fencepost, as-any-known-type: code only. No analog in the prompt. No hit.
- fixed-sleeps, signal-true-whole-time, bare-button-signal, trusting-click-as-save, selecting-by-id, reactive-form-sync-read, focus-armed-stray-key, wildcard-cors-loopback, buffer-cleared-failed-send, synthetic-events-as-human, generic-autofill: these patterns are about driving a third-party page. Retry storms are covered at lines 137 to 139. No analog in the prompt. No hit.
- hand-mutation-left: the prompt tells its agent to write only its report (lines 293 to 295) and never to edit source. No hit.
- non-color-encoding-runs-out: the prompt specifies no visual output. No hit.

## Files read outside the fence
none
