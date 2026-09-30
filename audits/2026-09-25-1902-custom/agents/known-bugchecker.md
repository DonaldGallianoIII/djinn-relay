---
title: known-bugchecker report, audits/2026-09-25-1902-custom
author: Claude Opus 5.5 (known-bugchecker)
date: 2026-09-25
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Index
path: ~/Conventions/code/KNOWN-BUGS.md, entries: 38, patterns checked: 11/38

Notes on the index itself:
- It links no detail files. All 38 entries sit inline under topic headings, so there were no detail files to open.
- No entry carries a tier word or a stable pattern id. The ids below are slugs of the entry titles. A hit would have been rated `MEDIUM (index entry has no tier)`. There were no hits.
- Only 11 entries have a `Detection:` line, which is what the index calls the grep signature. The other 27 are listed under Checked and Clean as not checked.
- Every fenced file is markdown or YAML with no executable code. The index patterns target TypeScript, browser, and GPU code, so they had nothing to match beyond prose that mentions the same words.

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
- `.djinn/config.yaml`: all 11 signatures ran. Only hit: line 33 has the word "interface" in prose inside `project_notes`, not an `interface` declaration. No hit.
- `plugins/djinn/.claude-plugin/plugin.json`: all 11 signatures ran, no hit.
- `plugins/djinn/CONTRACTS.md`: all 11 signatures ran, no hit.
- `plugins/djinn/README.md`: all 11 signatures ran, no hit.
- `plugins/djinn/agents/consolidator.md`: all 11 signatures ran. Line 98 has `restore` as a search-term example in prose, not a restore loop. No hit.
- `plugins/djinn/agents/perf-reviewer.md`: all 11 signatures ran. Lines 86, 91, and 92 mention "async" and "function" in reviewer instructions, not code. No hit.
- `plugins/djinn/agents/synthesis.md`: all 11 signatures ran, no hit.
- `plugins/djinn/commands/dispatch.md`: all 11 signatures ran, no hit.
- `plugins/djinn/commands/review.md`: all 11 signatures ran, no hit.
- `plugins/djinn/commands/status.md`: all 11 signatures ran, no hit.
- `plugins/djinn/relay.md`: all 11 signatures ran, no hit.
- guard-flag-not-reset-on-exception: ran against every fenced file, no hit.
- async-reentrant-void-call: ran against every fenced file, no hit.
- dispose-during-pending-async: ran against every fenced file, no hit.
- unmanaged-observers-listeners-timers: ran against every fenced file, no hit.
- restore-or-init-appends-without-clearing: ran against every fenced file, no hit.
- silent-data-truncation-on-restore: ran against every fenced file, no hit.
- transient-runtime-data-in-persisted-buffer: ran against every fenced file, no hit.
- allocation-per-frame: ran against every fenced file, no hit (hot_paths: none).
- splice-inside-a-loop: ran against every fenced file, no hit.
- accepted-parameter-silently-ignored: ran against every fenced file, no hit.
- duplicate-type-definitions: ran against every fenced file, no hit.
- undo-stack-mutated-before-async-apply: no search signature in index entry, not checked.
- no-render-pause-on-blur: no search signature in index entry, not checked.
- ui-not-synced-after-bulk-restore: no search signature in index entry, not checked.
- async-restore-without-input-guard: no search signature in index entry, not checked.
- legality-predicate-duplicated: no search signature in index entry, not checked.
- string-keyed-map-in-hot-path: no search signature in index entry, not checked.
- getcomputedstyle-in-hot-path: no search signature in index entry, not checked.
- unbatched-uploads-in-interpolation-loop: no search signature in index entry, not checked.
- gpu-resources-never-garbage-collected: no search signature in index entry, not checked.
- preservedrawingbuffer-on-webgl-canvas: no search signature in index entry, not checked.
- command-buffer-accumulation: no search signature in index entry, not checked.
- bare-canvas-in-css-grid: no search signature in index entry, not checked.
- large-export-canvases-retained: no search signature in index entry, not checked.
- fencepost-from-float-division: no search signature in index entry, not checked.
- as-any-where-type-known: no search signature in index entry, not checked.
- fixed-sleeps-instead-of-signals: no search signature in index entry, not checked.
- signal-true-the-whole-time: no search signature in index entry, not checked.
- bare-button-as-signal: no search signature in index entry, not checked.
- trusting-the-click-as-save: no search signature in index entry, not checked.
- selecting-by-id-on-framework-form: no search signature in index entry, not checked.
- reading-reactive-form-synchronously: no search signature in index entry, not checked.
- focus-armed-on-stray-keystroke: no search signature in index entry, not checked.
- wildcard-cors-on-loopback-server: no search signature in index entry, not checked.
- caps-counted-per-page-load: no search signature in index entry, not checked.
- buffer-cleared-on-failed-send: no search signature in index entry, not checked.
- synthetic-events-recorded-as-human: no search signature in index entry, not checked.
- generic-auto-fill: no search signature in index entry, not checked.

## Files read outside the fence
none
