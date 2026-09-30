---
title: known-bugchecker report, audits/2026-09-27-1628-custom (round 2)
author: Claude Opus 5.5 (known-bugchecker)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Index
path: ~/Conventions/code/KNOWN-BUGS.md, entries: 46, patterns checked: 25/46

The index links no detail files. Each entry is an inline paragraph whose
Detection line is the search signature. No entry carries a stable id or a
tier word, so the ids below are slugs of the entry titles, and any hit would
have defaulted to MEDIUM. There were no hits.

## Round 1 recheck
none

The Round 1 known-bugchecker report is not in the audit folder. The Round 1
synthesis (`round-1-synthesis.md`) credits known-bugchecker with no finding.
It lists one near hit, not filed, as corroboration on LOW-7. With no Round 1
finding, there is nothing to report as RESOLVED or STILL PRESENT.

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
- `plugins/djinn/CONTRACTS.md` (changed lines 27 to 35 only): 25 signatures ran, no hit. These lines are severity prose with no code, flag, listener, write, test assertion or mark fallback.
- `plugins/djinn/agents/cost-complexity-reviewer.md`: 25 signatures ran. One grep hit, not a finding: line 171, "`--max-old-space-size` where a runaway would take the host down (test". It is prose telling the reviewer to look for this pattern, not a test script that lacks the flag. Hits in prose are not findings.
- guard-flag-not-reset-on-exception, async-reentrant-void-call, dispose-during-pending-async, unmanaged-observers-listeners-timers, no-render-pause-on-blur: ran against every fenced file, no hit.
- restore-appends-without-clearing, silent-truncation-on-restore, transient-runtime-data-in-persisted-buffer, validator-skips-what-resolver-defaults, regeneration-drops-hand-kept-keys: ran against every fenced file, no hit.
- allocation-per-frame, string-keyed-map-hot-path, splice-inside-loop, forced-layout-read-hot-path: ran against every fenced file, no hit.
- gpu-resources-not-collected, preserve-drawing-buffer (signature taken from the entry's own token): ran against every fenced file, no hit.
- accepted-parameter-ignored, duplicate-type-definitions, as-any-where-type-known (signature taken from the entry's own token): ran against every fenced file, no hit.
- deep-equality-over-large-value, hand-mutation-left-in-source, check-passes-by-not-checking: ran against every fenced file, no hit. The one near hit is covered under the file line above.
- loopback-server-serves-whole-root, paid-call-before-intent-saved: ran against every fenced file, no hit.
- non-color-encoding-runs-out: ran against every fenced file, no hit.
- undo-stack-mutated-before-async-apply, ui-not-synced-after-bulk-restore, async-restore-without-input-guard, legality-predicate-duplicated, unbatched-uploads-interpolation-loop, command-buffer-accumulation, bare-canvas-in-css-grid, large-export-canvases-retained, fencepost-from-float-division: no search signature in index entry, not checked.
- fixed-sleeps-instead-of-signals, signal-true-the-whole-time, bare-button-as-signal, trusting-click-as-save, selecting-by-id-framework-form, reading-reactive-form-synchronously, focus-armed-on-stray-keystroke, wildcard-cors-loopback, caps-counted-per-page-load, buffer-cleared-on-failed-send, synthetic-events-as-human-input, generic-auto-fill: no search signature in index entry, not checked.

## Files read outside the fence
none
