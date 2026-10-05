---
title: QA, Codex adapter, brief and dispatch
author: Claude Opus 5.5, for Donald
date: 2026-10-05
status: written, not yet run. The skills map commands/brief.md and commands/dispatch.md; no live Codex run yet.
---

# Codex: brief, dispatch and the fixer

Uses `~/scratch/djinn-firstrun`, whose audit `audits/2026-10-05-1125-quick`
holds MEDIUM-1: `median` sorts the caller's array in place
(`src/math.js:10`). Run `codex plugin add djinn-codex@djinn-relay` first,
then start `codex` in that repo.

## Steps

1. `$djinn-brief audits/2026-10-05-1125-quick MEDIUM-1`
   Expect a short report naming a new file under
   `audits/2026-10-05-1125-quick/fixes/`, and no code change:
   `git diff --stat` shows nothing new in `src/`.

2. Open the brief. Its `work_set` lists `src/math.js` and nothing else
   (a test file too is fine if it names one). Its success criteria say the
   caller's array is left as it was.

3. `$djinn-dispatch <that brief's path> default`
   Expect the plan from dispatch.md Step 5: one batch, MEDIUM-1, the build
   command `none configured, gates skipped`, the test command `npm test`,
   and the round 2 reviewers. Then: `Proceed? Say "go" or specify changes.`
   Check `git status` now: nothing changed yet.

4. Reply `go`. Expect `batch 1: MEDIUM-1`, then `batch 1: landed MEDIUM-1`,
   then the round 2 review's wave lines, then the final report. No Fix
   Report, diff or review report is printed.

5. Check the fix: `git diff src/math.js` shows `median` copying before it
   sorts (for example `[...xs].sort(...)`). Nothing outside `src/math.js`
   changed except under `audits/`.

6. Check the records: `audits/2026-10-05-1125-quick/fixes/` holds
   `MEDIUM-1-report.md` (author `Codex ... (fixer agent, via
   djinn-dispatch)`) and `MEDIUM-1.diff`; `round-2/` holds the new review;
   the brief's `status:` line reads `landed`.

7. `$djinn-view audits/2026-10-05-1125-quick`: the page shows round 2 and
   whether MEDIUM-1 is resolved.

8. Nothing is committed: `git log --oneline -1` is still the feature
   branch's last commit.
