---
title: Fixing a finding carried from an earlier round, the open problem
author: Claude Opus 5.5, for Donald (the arena repo docs/decisions.md D22)
date: 2026-09-25
status: design note, not decided
---

# Fixing a finding carried from an earlier round

## What works in 2.2.0

- Every round's synthesis writes `findings.json`. Its `open` list is every
  HIGH, MEDIUM and LOW still open across all rounds.
- The verdict counts carried findings, so a NOT RESOLVED MEDIUM can no
  longer sit under a SHIP.
- Every open HIGH and MEDIUM is re-checked every round until one marks it
  RESOLVED.
- Dispatch numbers the next round from the round folders that exist, never
  from a brief's path.
- `/djinn:status` prints the open list, what blocks, and which folder raised
  each blocking finding.

## What does not work yet

A finding raised in round 1, still open in round 3, can be seen but not
cleanly fixed through the relay. Two reviews of 2.2.0
(`audits/2026-09-25-1902-custom`, `audits/2026-09-25-1912-custom`) traced
three separate ways it breaks:

1. **Briefs land in different folders.** `/djinn:brief` writes into the
   folder whose synthesis raised the finding. A round 1 finding's brief goes
   in the audit folder's `fixes/`, and a round 2 finding's goes in
   `round-2/fixes/`. Dispatch expects every brief of one run in one folder
   ("flag it and ask") and uses that folder for the diffs, the reports and
   the next round's context.
   - If it picks the audit folder, a round 2 fix's diff is filed as round
     1's.
   - If it picks the round folder, it stops looking for `context.md`, which
     only the audit folder has, after the fixes already landed.
2. **A second attempt erases the first.** Re-briefing a NOT RESOLVED
   finding makes a new brief file with the same id. Dispatch then writes
   `fixes/<id>-report.md` and `<id>.diff` over the first attempt's, which
   CONTRACTS.md section 6 calls the landing record.
3. **Diff names disagree.** Brief ids carry a slug (`HIGH-1-rename-fn`), so
   dispatch writes `fixes/HIGH-1-rename-fn.diff`. The synthesis prompt,
   dispatch's own synthesis prompt and the README describe
   `fixes/HIGH-1.diff`. Nothing breaks today, because synthesis reads the
   diffs it is handed. Any fix above that matches diffs by name would.

The same gap was in 2.1.0: a NOT RESOLVED finding lived only in a status
table, and briefing it had the same problems. 2.2.0 made it visible. 2.2.0
does not make it worse, now that `/djinn:status` names where a finding was
raised instead of printing a brief command.

## Options

**A. One fixes folder per audit.** Every brief of an audit, whatever round
raised it, lives in `<audit>/fixes/`, and its file name carries the round:
`R2-MEDIUM-1-<slug>.md`. Dispatch always works from the audit folder.
Attempts are numbered: `R1-MEDIUM-3-<slug>-report.md`, then
`R1-MEDIUM-3-<slug>-attempt-2-report.md`. The diff naming is settled in the
same change. Cost: brief, dispatch, synthesis and the README all change,
plus the contract's file layout. This is the cleanest option.

**B. Re-raise, don't carry.** A finding NOT RESOLVED in round `n` is raised
again as a new finding of round `n+1`, with a line naming the original. The
original leaves `open`. Every open finding then belongs to the latest round,
and today's brief and dispatch already handle that. Cost: the history is
spread over rounds, and `/djinn:status` would need to show the chain. This
is the smallest change.

**C. Leave it, say it.** Keep 2.2.0 as is: visible, not fixable through the
relay. A human briefs a carried finding by hand against the latest round.
Cost: nothing now. The limit is documented here and in dispatch's next
step.

## Recommendation

**B**, if this gets built. It reuses the part of djinn that already works
(everything current lives in the latest round) instead of teaching three
commands about folders. It also answers "second attempt erases the first",
because a second attempt is a new finding with its own id. **C** is what
2.2.0 ships with until Donald picks.
