---
title: known-bugchecker report, audits/2026-09-25-1912-custom
author: Claude Opus 5.5 (known-bugchecker)
date: 2026-09-25
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Index
path: ~/Conventions/code/KNOWN-BUGS.md, entries: 38, patterns checked: 16/38

Notes on the index:
- It links no detail files. Every entry is written inline as a section of the
  index file itself, so the index is the only file read.
- No entry carries a stable pattern id. The ids below are slugs made from
  each entry's bold title.
- No entry carries a tier word. No hit occurred, so no default tier was applied.
- 22 entries have no Detection line and no literal code token to search for.
  They are listed below as not checked and are left out of the numerator.
- Every fenced file is markdown or YAML prose. There is no executable code in
  the fence, so every entry here targets constructs that cannot occur in it.

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
- `.djinn/config.yaml`: all 16 searchable entries ran. One raw hit, `interface` at line 36 (duplicate-type-definitions), is English prose ("CONTRACTS.md is the interface every"), not a type definition. No hit.
- `plugins/djinn/CONTRACTS.md`: all 16 searchable entries ran, no hit.
- `plugins/djinn/README.md`: all 16 searchable entries ran, no hit.
- `plugins/djinn/agents/bugs-reviewer.md`: all 16 searchable entries ran. Raw hits: `async` at line 60 (async-reentrant-void-call) and `dispose` at line 161 (dispose-during-pending-async). Both are prose inside a reviewer checklist and an example sentence, not code. No hit.
- `plugins/djinn/agents/consolidator.md`: all 16 searchable entries ran, no hit.
- `plugins/djinn/agents/integration-reviewer.md`: all 16 searchable entries ran. Raw hit: `continue` at line 172 (silent-data-truncation-on-restore). It is the prose "New findings continue in the normal tiers", not a restore loop. No hit.
- `plugins/djinn/agents/known-bugchecker.md`: all 16 searchable entries ran, no hit.
- `plugins/djinn/agents/security-reviewer.md`: all 16 searchable entries ran. Raw hit: `dispose` at line 96 (dispose-during-pending-async). It is the prose "double dispose): Breaker agent." in a routing list, not code. No hit.
- `plugins/djinn/agents/synthesis.md`: all 16 searchable entries ran, no hit.
- `plugins/djinn/commands/dispatch.md`: all 16 searchable entries ran. Raw hit: `continue` at line 172 (silent-data-truncation-on-restore). It is the prose "print the WARN line again and continue.", not a restore loop. No hit.
- `plugins/djinn/commands/status.md`: all 16 searchable entries ran, no hit.
- guard-flag-not-reset-on-exception (`_busy`, `= true`): ran against every fenced file, no hit.
- async-reentrant-void-call (`async`): ran against every fenced file, prose hit only, no hit.
- dispose-during-pending-async (`dispose`, `async`): ran against every fenced file, prose hits only, no hit.
- unmanaged-observers-listeners-timers (`.add(`, `addEventListener`, `setInterval`, `setTimeout`): ran against every fenced file, no hit.
- restore-or-init-appends-without-clearing (`.push(`): ran against every fenced file, no hit.
- silent-data-truncation-on-restore (`continue`): ran against every fenced file, prose hits only, no hit.
- allocation-per-frame (`new Set(` and constructs inside render loops): ran against every fenced file. No render loop exists in the fence. No hit.
- string-keyed-map-in-hot-path (`${x},${y}` key shape): ran against every fenced file, no hit.
- splice-inside-a-loop (`.splice(`): ran against every fenced file, no hit.
- getcomputedstyle-in-hot-path (`getComputedStyle`): ran against every fenced file, no hit.
- preservedrawingbuffer-on-webgl-canvas (`preserveDrawingBuffer`): ran against every fenced file, no hit.
- accepted-parameter-silently-ignored (function parameters absent from the body): ran against every fenced file. No function definitions in the fence. No hit.
- duplicate-type-definitions (`interface`): ran against every fenced file, prose hit only, no hit.
- as-any-where-type-is-known (`as any`): ran against every fenced file, no hit.
- fixed-sleeps-instead-of-signals (`sleep(`): ran against every fenced file, no hit.
- wildcard-cors-on-loopback-server (`Access-Control-Allow-Origin`): ran against every fenced file, no hit.
- undo-stack-mutated-before-async-apply: no search signature in index entry, not checked.
- no-render-pause-on-blur: no search signature in index entry, not checked.
- transient-runtime-data-in-persisted-buffer: no search signature in index entry, not checked. Its Detection line is a manual procedure, not a search.
- ui-not-synced-after-bulk-restore: no search signature in index entry, not checked.
- async-restore-without-input-guard: no search signature in index entry, not checked.
- legality-predicate-duplicated: no search signature in index entry, not checked.
- unbatched-uploads-in-interpolation-loop: no search signature in index entry, not checked.
- gpu-resources-never-garbage-collected: no search signature in index entry, not checked.
- command-buffer-accumulation: no search signature in index entry, not checked.
- bare-canvas-in-css-grid: no search signature in index entry, not checked.
- large-export-canvases-retained: no search signature in index entry, not checked.
- fencepost-from-float-division: no search signature in index entry, not checked.
- signal-true-the-whole-time: no search signature in index entry, not checked.
- bare-button-as-signal: no search signature in index entry, not checked.
- trusting-the-click-as-save: no search signature in index entry, not checked.
- selecting-by-id-on-framework-form: no search signature in index entry, not checked.
- reading-reactive-form-synchronously: no search signature in index entry, not checked.
- focus-armed-on-stray-keystroke: no search signature in index entry, not checked.
- caps-counted-per-page-load: no search signature in index entry, not checked.
- buffer-cleared-on-failed-send: no search signature in index entry, not checked.
- synthetic-events-recorded-as-human: no search signature in index entry, not checked. `isTrusted` is the fix token, not the bug signature.
- generic-auto-fill: no search signature in index entry, not checked.

## Files read outside the fence
none
