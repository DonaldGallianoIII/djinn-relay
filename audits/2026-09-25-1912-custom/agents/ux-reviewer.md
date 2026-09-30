---
title: ux-reviewer report, audits/2026-09-25-1912-custom
author: Claude Opus 5.5 (ux-reviewer)
date: 2026-09-25
status: audit finding, not yet deliberated
---

## Round 1 re-check
Prior round: `audits/2026-09-25-1902-custom/synthesis.md`. Checked against the files as they now stand.

- MEDIUM-3: NOT RESOLVED. The status half landed: `plugins/djinn/commands/status.md:81` to `:85` prints one `next: /djinn:brief <folder> <id>` per blocking entry with the right folder per round, and `plugins/djinn/commands/dispatch.md:178` to `:187` now derives the round from the highest existing `round-<k>/`, so a brief from `round-2/` no longer rewrites `round-2/`. What remains: `plugins/djinn/commands/dispatch.md:285` still tells the user `/djinn:brief <audit-folder>/round-<n> <id> for each finding`, which is the exact mechanism MEDIUM-3 named for carried findings (see LOW-1), and a status output that mixes rounds leads into a dispatch that asks a question it cannot answer (see REC-1).
- LOW-5: NOT RESOLVED (small remainder). `status.md:19` to `:21` now skips folders without `synthesis.md`, which fixes the ideas and aborted case. No wording for a missing `audits/` or for "no audit has a synthesis yet".
- LOW-6: RESOLVED. `.djinn/config.yaml:9` to `:11` explain why and say "Always pass --base"; `base_branch` is now at `:12`.
- LOW-8: RESOLVED. `plugins/djinn/README.md:30` to `:32` name all four commands.
- LOW-9: RESOLVED. `status.md:36` to `:39` give both causes and point at the final report.
- LOW-10: RESOLVED. `README.md:152` to `:153` scope the ledger rule and exempt status.
- LOW-11: NOT RESOLVED (small remainder). The round triggers now fire for round `n`, but `plugins/djinn/agents/bugs-reviewer.md:102` and `:106` still use STILL OPEN, and `plugins/djinn/agents/known-bugchecker.md:116` uses STILL PRESENT, where synthesis and status use NOT RESOLVED.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
LOW-1. `plugins/djinn/commands/dispatch.md:285` Dispatch's final "Next step" still sends every FIX THEN SHIP finding to `/djinn:brief <audit-folder>/round-<n> <id>`, which is wrong for a finding carried from an earlier round, while `/djinn:status` now prints the correct line.
Mechanism: under the new verdict rule (`plugins/djinn/agents/synthesis.md:191` to `:194`) a round `n` FIX THEN SHIP can be caused entirely by a carried round 1 MEDIUM-3. Dispatch's report then prints `/djinn:brief audits/X/round-<n> MEDIUM-3`. Brief (`plugins/djinn/commands/brief.md:31` to `:32`) looks the id up in `round-<n>/synthesis.md` only: it stops with "not found", or, if round `n` raised its own MEDIUM-3, silently briefs the wrong finding. The user reads this line right after a dispatch, which is the moment they are most likely to act on it.
Traced: `dispatch.md:276` (verdict) to `:285` (next step, unchanged by this diff) to `brief.md:31`; compare `status.md:82` to `:84`, which maps round 1 to the audit folder and round `k` to `round-<k>`. Proposed: replace the `:285` line with `FIX THEN SHIP: run /djinn:status <original audit folder> and run its next: lines.` One source of truth, and review.md:233 already points there.

### DEBT
none

### REC
REC-1. `plugins/djinn/commands/status.md:61` to `:62` and `plugins/djinn/commands/dispatch.md:52` The status example itself produces briefs in two folders, and dispatch treats that as an error to ask about.
Friction: status prints `next: /djinn:brief <audit>/round-2 HIGH-1` and `next: /djinn:brief <audit> MEDIUM-3`. Following both writes `<audit>/round-2/fixes/HIGH-1-<slug>.md` and `<audit>/fixes/MEDIUM-3-<slug>.md` (`brief.md:118` to `:119`). Dispatching both hits `dispatch.md:52`: "All briefs should share one audit folder. If not, flag it and ask." The user has no answer to give. Dispatching them in two runs is worse: the first creates round 3, the second computes round 4 and stops at `dispatch.md:183` to `:184` after the fixers already edited code. Past the round number, `<audit-folder>` after Step 7.1 is still the brief's folder, not the original: `dispatch.md:193` reads `<audit-folder>/context.md`, which exists only in the original folder (`commands/review.md:80`; round folders hold `agents/`, `fence.txt`, `synthesis.md`, `findings.json`), so a round-2 brief halts there asking for a base ref. `:210` tells reviewers the fixes are in `<audit-folder>/fixes/*.diff` and `:234` tells consolidator the same, one folder only. Brief has the same gap at `brief.md:29` (outside the fence).
Proposed: say once, at `dispatch.md:52`, that briefs share one audit when they share one original audit folder (a `round-<k>` folder counts as its parent), and name two variables from Step 2 on: `<audit>` for the original folder and `<brief-folder>` for where each brief lives. Then `context.md` reads from `<audit>`, diffs and reports write to each brief's `<brief-folder>/fixes/`, and the reviewer and consolidator prompts list diffs by full path the way `:220` to `:221` now do for synthesis.
Effort to adopt (estimate): hours (text only, about 8 lines across dispatch.md and one in brief.md).
Downside: none beyond the edit. For integration-reviewer and bugs-reviewer to trace; synthesis may treat it as evidence that MEDIUM-3 is still partly open.

REC-2. `plugins/djinn/commands/status.md:81` At round 3, status still prints "ready to run" `next:` lines, and following them spends fixer tokens and edits code with no re-review.
Friction: `README.md:155` says "Three review rounds maximum, then a human decides." Dispatch checks the cap only in Step 7.1 (`dispatch.md:183` to `:184`), which runs "After all batches land" (`:176`). The Step 5 plan (`:85`) promises "round <n> review spawns" without saying `n` would be 4. So a user copying status's next line at round 3 gets unreviewed edits and a "Max 3 rounds reached" message at the end.
Proposed: in status, when `round` is 3 and `blocking` is not `none`, print `next: round 3 was the last automatic round; decide with a human before dispatching` instead of brief lines. In dispatch, move the round cap check into Step 2 validation so the plan says it before `go`.
Effort to adopt (estimate): minutes.
Downside: none.

REC-3. `plugins/djinn/commands/status.md:84` "A fresh brief is how a second attempt starts" is true but leaves the user three surprises on a NOT RESOLVED finding.
Friction: (a) the fresh brief likely gets the same slug as the landed one, so `brief.md:121` to `:123` refuses to overwrite and asks for a suffix; (b) brief fills WHAT and WHY from the round 1 finding text (`brief.md:31` to `:35`), not from the status table's evidence cell that says what remains (`synthesis.md:79` to `:80`), so the user must open the later synthesis by hand to learn why it failed; (c) dispatch writes `fixes/<id>.diff` and `fixes/<id>-report.md` by id, not by brief name (`dispatch.md:136`, `:146`), so the second attempt overwrites the first attempt's diff and report. Item (c) is for bugs-reviewer.
Proposed: add an optional `evidence` string to `prior` records in findings.json (CONTRACTS.md section 12, a `schemaVersion` bump) and have status print it under a `[not resolved]` row; or have brief, when the id shows NOT RESOLVED in a later round's status table, quote that row's evidence into WHY. Name second-attempt artifacts `<id>-attempt-2.diff`.
Effort to adopt (estimate): hours.
Downside: a schema bump, or brief reading one more file.

REC-4. `plugins/djinn/README.md:74` to `:85` and `:138` to `:139` The "See what is still open" paragraph does not mention the new `next:` lines, and the folder tree shows no `fixes/` under `round-2/`, though briefs against round 2 now land there (`synthesis.md:74` to `:76`, `dispatch.md:220` to `:221`).
Friction: a first-time reader of the tree cannot tell where a round 2 fix goes or that status hands them the command.
Proposed: one sentence, "Each blocking finding gets a `next:` line; copy it to start the fix," and add `fixes/` to the `round-2/` line of the tree.
Effort to adopt (estimate): minutes.
Downside: none.

REC-5. integration-reviewer: `plugins/djinn/agents/bugs-reviewer.md:98`, `plugins/djinn/agents/integration-reviewer.md:160`, `plugins/djinn/agents/known-bugchecker.md:114`, `plugins/djinn/agents/security-reviewer.md:133` tell round `n` reviewers to open the prior synthesis or report "at the path given", but the round prompt at `plugins/djinn/commands/dispatch.md:208` to `:214` gives no such path and says "Do not re-verify round <n-1> findings; synthesis owns that."

## Checked and Clean
- `plugins/djinn/commands/status.md`: `next:` folder mapping (round 1 to audit folder, round `k` to `round-<k>`) matches `brief.md:19` to `:22`, and the id it passes is bare, which brief accepts; the example lines agree with the example `blocking` line. Every status tag is a text label (`[not resolved]`, `[regressed]`), no meaning carried by color.
- `plugins/djinn/commands/dispatch.md`: new round rule never reuses an existing round folder, and the findings.json retry prompt now names the prior round's file.
- `plugins/djinn/agents/synthesis.md`: Round column and "FIX THEN SHIP when open holds a HIGH or MEDIUM" make status's `blocking` line and the verdict agree, so the Step 4 mismatch note should now be rare.
- `plugins/djinn/CONTRACTS.md`: the rebuild caveat says plainly which old audits can lose a LOW; readable as written.
- `plugins/djinn/agents/consolidator.md`, `.djinn/config.yaml`: wording only, sound.
- Design strength: status printing the exact command to run, per finding, is the right shape for a person who should not have to learn the folder rules.

## Files read outside the fence
- `plugins/djinn/commands/brief.md` (target of next: lines)
- `plugins/djinn/commands/review.md` (grep: who writes context.md)
- `plugins/djinn/relay.md` (grep hits, brief usage)
- `plugins/djinn/agents/perf-reviewer.md` (grep hits, round wording)
- `plugins/djinn/agents/pipe-connector.md` (grep hits only)
- `plugins/djinn/templates/fix-brief.md` (grep hit only)

## Counts
HIGH 0, MEDIUM 0, LOW 1, DEBT 0, REC 5
