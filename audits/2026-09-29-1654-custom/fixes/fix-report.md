---
title: fix report, audits/2026-09-29-1654-custom
author: Claude Opus 5.5 (round 3 fix of the /djinn:learn review, run by hand on the coordinator's hand off)
date: 2026-09-29
status: landed
---

Donald, 2026-09-29: "go ahead and go with all rec and fix if you havent no
more audits". No review round follows. Commits on top of 9298889, none
pushed: dedda5f (scrub), ace13c7 (guards), 9c0921c (learn fixes), then
this folder.

## Fixed

- **MEDIUM-1, round 2 LOW-6, LOW-20, LOW-21, LOW-22.** The three project
  names read "a private project" and are on the gitignored list, with a
  bare quiz number form; the round 1 folder lost its quiz number, lecture
  paths and subject word; both fix report residues are reworded; this
  folder's `input-diff.patch` has every removed line of its `_FromClaude/`
  and `docs/` sections replaced by a marker, said at its top.
- **MEDIUM-2, MEDIUM-3, LOW-10, LOW-14, LOW-15, LOW-17.** The private check
  fails without its list unless `PRIVATE_CHECK_ALLOW_MISSING=1`; the
  pre-push hook reads git's refs and checks every added line, added path
  and message of the pushed range, the pushed tree and the working tree;
  the home path pattern covers `/Users/` and `C:\Users\`; `build_cmd` is
  one quoted YAML scalar that parses. `qa/bot/private-guards.sh` drives
  both in mktemp scratch repos through real pushes: 19 of 19 pass, and 10
  cases fail against the old scripts.
- **MEDIUM-4 to MEDIUM-10, every LOW, DEBT-1, DEBT-2.** A blind reader
  agent, a `banks` read, one secure rule, fresh release items, the status
  word, the claim based double key rule, misplaced pairs from Misplaces
  lines only, cue word and misplaced checks in the script, the Step 1
  tracked check, and the rest (commit 9c0921c).
- **RECs taken.** REC-1, 2 (CONTRIBUTING.md), 3, 4, 6 (checks run), 7, 8,
  9.

## Declined

- REC-5 and ruling R5: 6587f87 is public and stays; no force push.
- REC-6's reflog expire and gc: a history operation, Donald's call.
- LOW-23: the dry runs stay under the gitignored `local/`, where the
  dispatch put them; pass 1 of the check and the push hook fail on any
  `local/` path.

## Dry run

Stopped early on Donald's request, not graded. Both secure runs reached
the rewrite pass; the blind reader failed 9 of 9 course items and 4 of 10
teaching items by a cue, and answered each source from its stem alone,
leaning on no release item. No misplaced DPO pair was written in either
run (every Misplaces line read none). Untested: the misplaced check on
real rows, the second release read, and QA steps 1 to 9.

## Known remaining

- `git log -p 6587f87..HEAD` still holds 23 added lines with pattern hits,
  all in 9298889, which the later commits remove from the tree. The push
  hook refuses the push until the range is collapsed onto 6587f87.
