---
title: synthesis, audits/2026-09-25-1912-custom
author: Claude Opus 5.5 (synthesis)
date: 2026-09-25
status: agent output, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

scope: custom (verify direct prompt edits made for audits/2026-09-25-1902-custom)
agents expected: known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
agents received: known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
agents missing: none
changed files in fence: 11

## Prior review status
| Prior id | Status | Evidence |
|----------|--------|----------|
| MEDIUM-1 | RESOLVED | `plugins/djinn/agents/synthesis.md:191` to `:194` now fires FIX THEN SHIP on any HIGH or MEDIUM in `open`, carried or new, and `:197` to `:199` redefine SHIP to match. `CONTRACTS.md:331` to `:332` ties the verdict to `open`. `commands/status.md:79` to `:80` and `:91` to `:95` now agree with that rule, so a carried NOT RESOLVED MEDIUM with no new findings gives FIX THEN SHIP and `dispatch.md:284` "Nothing blocks a merge" is true when it prints. Residue on the ESCALATE path is LOW-4. |
| MEDIUM-2 | RESOLVED | `plugins/djinn/agents/synthesis.md:70` to `:73` takes one row per HIGH and MEDIUM in the prior `open`, "whatever round raised it"; the table has a Round column (`:102` to `:103`, `:115`); `:89` to `:91` and `CONTRACTS.md:327` to `:329` re-check every open HIGH and MEDIUM each round; `:209` to `:210` lets an entry leave `open` through a RESOLVED row, now reachable for any round. Residue on the no-findings.json fallback path is LOW-1. |
| MEDIUM-3 | NOT RESOLVED | Two of three parts landed: `commands/status.md:81` to `:85` prints `next: /djinn:brief <folder> <id>` with round 1 mapped to the audit folder and round `k` to `round-<k>`, and `commands/dispatch.md:178` to `:187` computes the round as 1 + the highest existing `round-<k>`, so it no longer rewrites `round-2/`. What remains: `commands/dispatch.md:285` to `:286` still prints `/djinn:brief <audit-folder>/round-<n> <id>` for every blocking id, carried ones included. See MEDIUM-1. |

## Fix List

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/dispatch.md:285` Dispatch's Next step still sends every FIX THEN SHIP id to `/djinn:brief <audit-folder>/round-<n> <id>`, and the verdict now blocks on findings carried from earlier rounds (`agents/synthesis.md:191` to `:194`). Wrong output: in round 3, a round 1 MEDIUM-3 left NOT RESOLVED produces `/djinn:brief <audit>/round-3 MEDIUM-3`; brief looks the bare id up only in `round-3/synthesis.md` (`commands/brief.md:21` to `:22`, `:31` to `:32`), so it stops with "not found", or, if round 3 raised its own MEDIUM-3, silently briefs the wrong defect. An `R2 MEDIUM-1` id from the verdict line does not parse as `<TIER>-<n>` at all. `/djinn:status` prints the correct lines (`commands/status.md:81` to `:85`), so the two commands contradict each other. This is the unresolved part of prior MEDIUM-3. Source: bugs-reviewer (MEDIUM), confirmed by integration-reviewer (MEDIUM), ux-reviewer (LOW). Report: agents/bugs-reviewer.md

MEDIUM-2. `plugins/djinn/commands/dispatch.md:52` Status's own `next:` lines put the briefs for one audit into two folders (`commands/status.md:61` to `:62`, `:81` to `:85`; brief writes to `<folder>/fixes/`, `commands/brief.md:118` to `:119`), and dispatch has no rule for that set: "All briefs should share one audit folder. If not, flag it and ask." The user has no documented answer. If they say go, Steps 6 and 7 use one `<audit-folder>` for every report and diff (`:136`, `:146`), for the reviewer glob (`:210`) and for the consolidator (`:234`). Wrong output with the audit root chosen: a round 2 finding's diff lands in the root `fixes/`, and `agents/synthesis.md:74` to `:76` credits it to round 1's same-numbered finding. Wrong output with the round folder chosen: Step 7.3 reads `<audit>/round-2/context.md`, which no command writes, and halts after the fixes already landed (`:193` to `:194`). Source: bugs-reviewer (MEDIUM), confirmed by integration-reviewer (MEDIUM), ux-reviewer (REC-1, same mechanism). Report: agents/integration-reviewer.md

MEDIUM-3. `plugins/djinn/commands/dispatch.md:136` A second attempt at a NOT RESOLVED finding, the path `commands/status.md:84` to `:85` now prescribes ("a fresh brief is how a second attempt starts"), overwrites the first attempt's fix report and diff. Brief's collision check fires exactly when the new filename `<finding-id>-<slug>.md` matches the landed one, and the suffix it offers renames the file only (`commands/brief.md:121` to `:123`); the frontmatter `id` is `{{FIX_ID}}` = `<finding-id>-<slug>` (`commands/brief.md:81`, `templates/fix-brief.md:2`), unchanged. Dispatch then writes `<audit-folder>/fixes/<id>-report.md` and `<id>.diff` (`:136`, `:146`) with no existence check. Wrong output: the round 1 landing record, which the round 2 status table cites as evidence, is replaced by the round 3 attempt, against CONTRACTS.md:177 and README.md:6 to :7. Source: bugs-reviewer (MEDIUM), confirmed by integration-reviewer (LOW-4), ux-reviewer (REC-3 item c), plus bugs-reviewer Blast radius on `plugins/djinn/commands/brief.md:121`. Report: agents/bugs-reviewer.md

### LOW
LOW-1. `plugins/djinn/agents/synthesis.md:72` With no prior findings.json, status table rows come from "the prior synthesis's HIGH and MEDIUM", which misses a carried finding that appears only as a NOT RESOLVED or REGRESSED row in the prior status table; CONTRACTS.md:334 to :336 says the rebuild reads "Fix List and status table". The same wording is at `:170` to `:171`. Needs a failed findings.json retry in round 2. Residue of prior MEDIUM-2. Source: bugs-reviewer (LOW), confirmed by integration-reviewer (LOW). Report: agents/bugs-reviewer.md

LOW-2. `plugins/djinn/agents/bugs-reviewer.md:96`, `plugins/djinn/agents/integration-reviewer.md:160`, `plugins/djinn/agents/known-bugchecker.md:114`, `plugins/djinn/agents/security-reviewer.md:133` The prior LOW-11 fix made these round sections fire in every round, and every round's dispatch prompt forbids what they instruct and passes no prior path (`commands/dispatch.md:209` to `:213`: "Do not re-verify round <n-1> findings; synthesis owns that"). bugs-reviewer.md:17 to :20 and known-bugchecker.md:24 to :25 also forbid guessing a path. security-reviewer's heading `## Round <n-1> status` (`:134`) is the heading of synthesis's authoritative table. Source: integration-reviewer (LOW), confirmed by bugs-reviewer (LOW-3), ux-reviewer (REC-5). Report: agents/integration-reviewer.md

LOW-3. `plugins/djinn/agents/bugs-reviewer.md:105` The rewritten round section still says "in the Round 1 synthesis" and uses STILL OPEN (`:102`, `:106`); known-bugchecker.md:116 uses STILL PRESENT, where synthesis and status use NOT RESOLVED. Remainder of prior LOW-11. Source: bugs-reviewer (LOW-2), confirmed by integration-reviewer (LOW-1, last clause), ux-reviewer (prior re-check, LOW-11). Report: agents/bugs-reviewer.md

LOW-4. `plugins/djinn/CONTRACTS.md:331` "FIX THEN SHIP exactly when `open` holds a HIGH or MEDIUM" rules out ESCALATE whenever `open` holds one, while `agents/synthesis.md:188` to `:191` checks ESCALATE first, and CONTRACTS.md:3 to :4 says the contract wins. Source: bugs-reviewer (LOW). Report: agents/bugs-reviewer.md

LOW-5. `plugins/djinn/commands/status.md:19` Bare `/djinn:status` now skips folders with no synthesis, but has no wording for a missing `audits/` or for no folder holding a `synthesis.md`. Remainder of prior LOW-5. Source: bugs-reviewer (LOW), confirmed by ux-reviewer (prior re-check, LOW-5). Report: agents/bugs-reviewer.md

LOW-6. `plugins/djinn/commands/dispatch.md:256` The dispatch ledger counts are this round's Fix List while the verdict now counts carried findings, so a line can read `round-3=FIX THEN SHIP H0 M0 ...` with nothing explaining it; relay.md:114 to :116 says the ledger alone answers "what got fixed". Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md

LOW-7. `plugins/djinn/agents/consolidator.md:75` "The last one wins on whether a finding is resolved" matches by id, but the round 3 status table can hold round 1 MEDIUM-1 and round 2 MEDIUM-1, and dispatch pastes bare dispositions (`commands/dispatch.md:235`). Proposal output only. Source: integration-reviewer (LOW). Report: agents/integration-reviewer.md

LOW-8. `plugins/djinn/commands/dispatch.md:185` "Original audit folder" is defined in Step 7.1 only; Steps 7.2 to 7.6 say `<audit-folder>`, which for a brief in `round-<k>/` is the round folder. A literal reading halts at `:193` (no `context.md` there) after fixes landed, and `:190`, `:200`, `:213` would nest `round-2/round-3/`, which `:186` forbids. Applies to any single round-folder brief, which status now prints by default. Source: integration-reviewer (LOW-6), confirmed by ux-reviewer (REC-1, context.md clause). Report: agents/integration-reviewer.md

LOW-9. `plugins/djinn/relay.md:100` (Blast radius, outside the fence) Verdicts still say SHIP is "zero HIGH and zero MEDIUM after normalization" and FIX THEN SHIP "a HIGH or MEDIUM remains" (`:102`), the per-round rule the prior MEDIUM-1 fix replaced. Source: integration-reviewer (Blast radius LOW). Report: agents/integration-reviewer.md

LOW-10. `plugins/djinn/relay.md:6` (Blast radius, outside the fence) "Every command leaves a folder of artifacts and one line in a ledger" is false for `/djinn:status`, the same claim README.md:152 to :153 was corrected for; relay.md:179 itself says status writes no ledger line. Source: integration-reviewer (Blast radius LOW). Report: agents/integration-reviewer.md

LOW-11. `plugins/djinn/commands/brief.md:29` (Blast radius, outside the fence) Brief reads `<audit-folder>/context.md`, which a `round-<k>` folder never has, with no missing-file rule; status's `next:` lines now route round 2 and 3 findings there. Pre-existing text. Source: integration-reviewer (Blast radius LOW), confirmed by ux-reviewer (REC-1, last sentence). Report: agents/integration-reviewer.md

LOW-12. `plugins/djinn/agents/perf-reviewer.md:134` (Blast radius, outside the fence) Prior LOW-3 unchanged: perf-reviewer still writes a `## Round <n-1> status` table of findings "assigned to you" against `commands/dispatch.md:212`. Source: integration-reviewer (Blast radius LOW). Report: agents/integration-reviewer.md

### DEBT
none

### REC
REC-1. integration-reviewer: let `/djinn:brief` accept `R<k> <id>` (or a `(round, id)` pair) and resolve the folder itself, then have dispatch Step 9 and status print that same form. Removes MEDIUM-1 and part of MEDIUM-2.
REC-2. integration-reviewer: add a worked three-round example to CONTRACTS.md section 12 covering a two-folder dispatch and a second attempt on a NOT RESOLVED finding.
REC-3. ux-reviewer: `plugins/djinn/commands/status.md:81` at round 3 with blockers, print "round 3 was the last automatic round; decide with a human" instead of `next:` lines, and move dispatch's round cap check (`commands/dispatch.md:183` to `:184`) into Step 2 so the plan says it before fixers edit code. Today the Step 5 plan (`:85`) promises a round 4 review that never runs.
REC-4. ux-reviewer: `plugins/djinn/commands/status.md:84` for a NOT RESOLVED entry, carry the status table's evidence to the user (an optional `evidence` string in `prior`, with a `schemaVersion` bump, or brief quoting that row into WHY), so a second attempt starts from what remains rather than the original finding text.
REC-5. ux-reviewer: `plugins/djinn/README.md:74` mention the `next:` lines in "See what is still open", and add `fixes/` to the `round-2/` line of the folder tree (`:138` to `:139`).

## Conflicts Resolved
- MEDIUM-1: bugs-reviewer and integration-reviewer said MEDIUM, ux-reviewer said LOW, all on the same mechanism. The file shows `commands/dispatch.md:285` to `:286` unchanged and `agents/synthesis.md:191` to `:194` now naming carried ids, so the wrong-brief path is reached every time a carried finding blocks, which is the case the prior fix was built for. Kept: MEDIUM. ux-reviewer's LOW follows its REC-by-default rule, not a different reading of the code.
- MEDIUM-2: bugs-reviewer's trace says the round 1 and round 2 MEDIUM-1 diffs both write `A/fixes/MEDIUM-1.diff` and overwrite each other. The file does not support that sub-claim: the dispatch `<id>` is the brief frontmatter id, `<finding-id>-<slug>` (`commands/brief.md:81`, `templates/fix-brief.md:2`), and two different findings get two slugs. The rest of the mechanism holds: attribution by folder (`agents/synthesis.md:74` to `:76`) credits the round 2 diff to round 1's same-numbered finding, and the round-folder choice halts at `dispatch.md:193`. Kept: MEDIUM, with the overwrite sub-claim dropped from the entry.
- MEDIUM-3: bugs-reviewer said MEDIUM, integration-reviewer said LOW ("Code is unaffected; the audit trail is not"). The file shows the overwrite is real and happens exactly when brief's suffix prompt fires, since that prompt fires only when `<finding-id>-<slug>` repeats. The lost file is the landing record CONTRACTS.md:177 requires and the prior status table cites; keeping that record is a stated function of the relay (README.md:6 to :7). Kept: MEDIUM, on the prescribed path in `status.md:84` to `:85`. The human may reasonably rate it LOW on the ground that no verdict changes.
- Prior MEDIUM-3 status: integration-reviewer and ux-reviewer said NOT RESOLVED; bugs-reviewer split it (round-number half closed, Next-step half open as its MEDIUM-1). The file agrees with all three: `dispatch.md:178` to `:187` fixed, `:285` to `:286` not. Recorded as NOT RESOLVED.

## Fix disagreements (human decides)
- MEDIUM-1: option A (bugs-reviewer, ux-reviewer) replaces `dispatch.md:285` to `:286` with "FIX THEN SHIP: run `/djinn:status <original audit folder>` and follow its `next:` lines". Option B (bugs-reviewer alternative) copies status's folder mapping into Step 9. Option C (integration-reviewer REC-1) teaches brief to accept `R<k> <id>`. Recommendation: A, one source of truth, inside the fence, and `review.md` already points at status.
- MEDIUM-2: option A (bugs-reviewer, ux-reviewer REC-1) treats the original folder and its `round-<k>/` folders as one audit at Step 2, names `<audit>` and `<brief-folder>` from then on, writes each brief's report and diff to its own `fixes/`, reads `context.md` from `<audit>`, and lists landed diffs by full path in the reviewer and consolidator prompts. Option B refuses a mixed-folder set at Step 2 with a message to dispatch per folder, which then hits the round cap on the second run (`dispatch.md:183` to `:184`). Recommendation: A, since B trades one dead end for another; A also closes LOW-8.
- MEDIUM-3: option A (bugs-reviewer) has dispatch refuse to overwrite an existing `fixes/<id>.diff` or `-report.md` and write `<id>-r<n>.*`, with synthesis keying a diff by folder plus id prefix. Option B (bugs-reviewer Blast radius, ux-reviewer REC-3) has brief put its suffix on the frontmatter `id` too, for example `-attempt-2`. Recommendation: A, because dispatch is the writer, it is inside the fence, and it guards every id collision, not only the re-brief one.

## Re-tiered
- MEDIUM-1 absorbs ux-reviewer LOW-1: same file, same line, same mechanism; kept at MEDIUM per Conflicts Resolved.
- MEDIUM-2 absorbs ux-reviewer REC-1 (two-folder dispatch); REC-1's `context.md` clause goes to LOW-8 and its `brief.md:29` clause to LOW-11.
- MEDIUM-3 absorbs integration-reviewer LOW-4, ux-reviewer REC-3 item (c), and bugs-reviewer's Blast radius entry on `commands/brief.md:121`: same overwrite mechanism.
- LOW-2 absorbs ux-reviewer REC-5 (labeled "integration-reviewer:" in the ux report): same defect as integration-reviewer LOW-1, a real contradiction, so kept once at LOW.
- REC-4 is ux-reviewer REC-3 items (a) and (b) only.
- No finding moved up.

## Dismissed by synthesis
none (bugs-reviewer's MEDIUM-2 overwrite sub-claim is dropped inside the entry, see Conflicts Resolved; the finding itself stands)

## Coverage
- `.djinn/config.yaml`: covered by known-bugchecker, bugs-reviewer, ux-reviewer (integration-reviewer mentions it only in its prior re-check)
- `plugins/djinn/CONTRACTS.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/README.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/agents/bugs-reviewer.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/agents/consolidator.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/agents/integration-reviewer.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/agents/known-bugchecker.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/agents/security-reviewer.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/agents/synthesis.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/commands/dispatch.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- `plugins/djinn/commands/status.md`: covered by known-bugchecker, bugs-reviewer, integration-reviewer, ux-reviewer
- known-bugchecker's coverage is nominal: its index targets TypeScript, browser and GPU code, 16 of 38 entries have a search signature, and every fenced file is prose.
- Agents missing: none
- synthesis noticed, unreviewed: `plugins/djinn/commands/brief.md:81` sets the frontmatter `id` to `<finding-id>-<slug>`, so dispatch writes `fixes/HIGH-1-<slug>.diff` and `fixes/HIGH-1-<slug>-report.md` (`commands/dispatch.md:136`, `:146`), while `agents/synthesis.md:74` to `:75`, `commands/dispatch.md:220` to `:221` and `README.md:136` to `:137` describe `fixes/LOW-1.diff` and `HIGH-1.diff`. Any fix option for MEDIUM-2 or MEDIUM-3 that keys on the diff filename depends on which form is real.

## Fence
- Files synthesis read: `plugins/djinn/CONTRACTS.md`, `audits/2026-09-25-1912-custom/fence.txt`, the four reports in `audits/2026-09-25-1912-custom/agents/`, `audits/2026-09-25-1902-custom/synthesis.md` (prior review, named by the orchestrator), `plugins/djinn/commands/dispatch.md`, `plugins/djinn/commands/status.md`, `plugins/djinn/agents/synthesis.md`, `plugins/djinn/agents/consolidator.md` (lines 36 to 83), `plugins/djinn/agents/bugs-reviewer.md` (lines 10 to 109), `plugins/djinn/agents/integration-reviewer.md` (lines 155 to 174), `plugins/djinn/agents/security-reviewer.md` (lines 128 to 142), `plugins/djinn/agents/known-bugchecker.md` (lines 15 to 122), `.djinn/config.yaml`, `plugins/djinn/README.md`, and cited files outside the fence: `plugins/djinn/commands/brief.md`, `plugins/djinn/templates/fix-brief.md` (grep for `id:` and `FIX_ID`), `plugins/djinn/agents/perf-reviewer.md` (lines 130 to 139), `plugins/djinn/relay.md` (lines 1 to 10, plus a grep for ledger and verdict lines). Also a grep for round wording across five agent files in the fence.
- Reviewer reads outside the fence:
  - bugs-reviewer: `plugins/djinn/commands/brief.md` (consumes status next lines)
  - bugs-reviewer: `plugins/djinn/templates/fix-brief.md` (source of brief id)
  - integration-reviewer: `plugins/djinn/commands/brief.md` (consumes status next lines)
  - integration-reviewer: `plugins/djinn/commands/review.md` (context.md writer, retry)
  - integration-reviewer: `plugins/djinn/relay.md` (verdict and ledger claims)
  - integration-reviewer: `plugins/djinn/agents/fixer.md` (grep for round assumptions)
  - integration-reviewer: `plugins/djinn/agents/perf-reviewer.md` (prior LOW-3 re-check)
  - integration-reviewer: `the arena repo/fixtures/audit-three-rounds/` (glob for round context.md)
  - ux-reviewer: `plugins/djinn/commands/brief.md` (target of next: lines)
  - ux-reviewer: `plugins/djinn/commands/review.md` (grep: who writes context.md)
  - ux-reviewer: `plugins/djinn/relay.md` (grep hits, brief usage)
  - ux-reviewer: `plugins/djinn/agents/perf-reviewer.md` (grep hits, round wording)
  - ux-reviewer: `plugins/djinn/agents/pipe-connector.md` (grep hits only)
  - ux-reviewer: `plugins/djinn/templates/fix-brief.md` (grep hit only)
  - known-bugchecker: none reported

## Counts
HIGH 0, MEDIUM 3, LOW 12, DEBT 0, REC 5

## Verdict: FIX THEN SHIP
Blocking: MEDIUM-1, MEDIUM-2, MEDIUM-3.
