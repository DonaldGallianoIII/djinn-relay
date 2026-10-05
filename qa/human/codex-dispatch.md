---
title: QA, Codex adapter, brief and dispatch
author: Claude Opus 5.5, for Donald
date: 2026-10-05
status: written, not yet run. Covers the default group dispatch (one fixer for a selection) and the single-brief path; no live Codex run yet.
---

# Codex: brief, dispatch and the fixer

Uses `~/scratch/djinn-firstrun`, whose audit `audits/2026-10-05-1125-quick`
holds MEDIUM-1: `median` sorts the caller's array in place
(`src/math.js:10`). Run `codex plugin add djinn-codex@djinn-relay` first,
then start `codex` in that repo.

## Steps

1. `$djinn-dispatch audits/2026-10-05-1125-quick all blocking default`
   Expect, before anything changes: one group brief written under
   `audits/2026-10-05-1125-quick/fixes/` (`group-1-of-1-...md`), then the
   plan, opening with `Selected 1 findings (all blocking): MEDIUM-1` and
   `Planned: 1 fixer(s) in series, 1`, the build command
   `none configured, gates skipped`, the test command `npm test`, the
   round 2 reviewers, and `Proceed? Say "go" or specify changes.`
   `git status` shows nothing new in `src/`.

2. Open the group brief. Its `findings` list holds MEDIUM-1, its
   `work_set` lists `src/math.js`, and MEDIUM-1's section has a check that
   the caller's array is left as it was.

3. Reply `go`. Expect `batch 1: group-1-of-1-...`, then
   `batch 1: landed group-1-of-1-...`, then the round 2 review's wave
   lines, then the final report with `Findings: fixed 1, not present 0,
   blocked 0`. No Fix Report, diff or review report is printed.

4. Check the fix: `git diff src/math.js` shows `median` copying before it
   sorts (for example `[...xs].sort(...)`). Nothing outside `src/math.js`
   changed except under `audits/`.

5. Check the records: `fixes/` holds the group's report (author
   `Codex ... (fixer agent, via djinn-dispatch)`, a `## Findings` line
   `MEDIUM-1: FIXED`) and its `.diff`; `round-2/` holds the new review; the
   brief's `status:` reads `landed` and MEDIUM-1's entry `fixed`.

6. `$djinn-view audits/2026-10-05-1125-quick`: the page shows round 2 and
   whether MEDIUM-1 is resolved.

7. Nothing is committed: `git log --oneline -1` is still the feature
   branch's last commit.

8. Optional, the old way: `$djinn-brief audits/2026-10-05-1125-quick
   MEDIUM-1` on a fresh copy of the repo writes a single brief; dispatching
   it with `$djinn-dispatch <path> default` gives the same fix.
