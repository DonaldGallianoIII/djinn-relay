---
title: bugs-reviewer report, audits/2026-09-25-1912-custom
author: Claude Opus 5.5 (bugs-reviewer)
date: 2026-09-25
status: audit finding, not yet deliberated
---

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/dispatch.md:285` Prior MEDIUM-3 is still open here: dispatch's Next step sends every blocking id to `round-<n>`, so a carried round 1 finding gets briefed as the current round's finding with the same id, or not at all.
Mechanism: The fix put the folder mapping in status (`status.md:81` to `:85`) but left dispatch Step 9 as "`/djinn:brief <audit-folder>/round-<n> <id>` for each finding". The synthesis Verdict line prints round 1 ids bare (`agents/synthesis.md:193` to `:194`). brief looks up a bare `<TIER>-<n>` only in the folder it is given (`commands/brief.md:21`, `:31` to `:32`).
Traced: round 2 synthesis marks R1 MEDIUM-1 NOT RESOLVED and raises its own MEDIUM-1. Its Verdict line reads `MEDIUM-1, R2 MEDIUM-1` (`synthesis.md:191` to `:194`). Dispatch Step 9 prints `/djinn:brief A/round-2 <id>` for each (`dispatch.md:285` to `:286`). `/djinn:brief A/round-2 MEDIUM-1` finds round 2's MEDIUM-1 in `round-2/synthesis.md` (`brief.md:31`). `R2 MEDIUM-1` does not parse as `<TIER>-<n>` (`brief.md:21`). If the user strips the prefix, it resolves to that same round 2 MEDIUM-1, and the brief file already exists (`brief.md:121` to `:123`).
Trigger: finish a dispatch whose round 2 has the scenario above, then follow the dispatch report's own Next step. Round 1's MEDIUM-1 never gets a brief. Round 3 keeps it NOT RESOLVED, and the user is not told why. Failing line: "FIX THEN SHIP: /djinn:brief <audit-folder>/round-<n> <id> for each finding, then dispatch."
Fix: replace dispatch.md:285 to :286 with "FIX THEN SHIP: run `/djinn:status <audit-folder>` and follow its `next:` lines", or copy the status.md:81 to :85 mapping (bare id -> audit folder, `R<k>` -> `round-<k>`) into Step 9.

MEDIUM-2. `plugins/djinn/commands/dispatch.md:52` The two `next:` lines status now prints for one audit point at two folders, and dispatch runs every brief through one `<audit-folder>`. A round 2 fix's diff can then land in the audit root and be credited to round 1's finding with the same id.
Mechanism: status.md:81 to :85 sends a round 1 finding to the audit folder and a round 2 finding to `round-2`. Dispatch Step 2 wants "one audit folder" (`:52`) and says nothing about what to do after it flags the mismatch. Steps 6 to 8 then use a single `<audit-folder>` for reports and diffs (`:136`, `:146`), for the reviewer diff glob (`:210`), for the consolidator (`:234`) and for context.md (`:193`). The new synthesis rule assigns a diff to a round by its folder (`agents/synthesis.md:73` to `:76`).
Traced: the scenario's status output is `next: /djinn:brief A MEDIUM-1` and `next: /djinn:brief A/round-2 MEDIUM-1` (`status.md:61` to `:62`, `:81` to `:85`). The user dispatches both briefs. Dispatch flags them at `:52`, the user says go, and one `<audit-folder>` is used from there. Suppose it is A. The round 2 brief's diff is written to `A/fixes/MEDIUM-1.diff` (`:146`, bare-id naming as in README.md:136). That is the same path as the round 1 brief's diff, so one overwrites the other. Synthesis then reads the surviving `A/fixes/MEDIUM-1.diff` as round 1's (`synthesis.md:74` to `:75`). Now suppose it is `A/round-2`. Step 7.3 reads `A/round-2/context.md`, which no command writes, and halts (`:193` to `:194`). The reviewers are pointed at `A/round-2/fixes/*.diff` and never see the round 1 fix (`:210`).
Trigger: run the two `next:` lines status prints, then `/djinn:dispatch A/fixes/MEDIUM-1-<slug>-2.md A/round-2/fixes/MEDIUM-1-<slug>.md`.
Fix: dispatch Step 2 treats the original audit folder and its `round-<k>/` folders as one audit. Step 6 writes each brief's report and diff into that brief's own `fixes/`. Step 7 names `<original>` explicitly for context.md, the round folder, usage.md and the ledger. The reviewer prompt at `:209` to `:210` lists this dispatch's landed diffs by full path instead of a glob.

MEDIUM-3. `plugins/djinn/commands/dispatch.md:136` A second attempt at a NOT RESOLVED round 1 finding, the path status.md:84 to :85 now prescribes, overwrites round 1's fix report and diff.
Mechanism: dispatch writes `<audit-folder>/fixes/<id>-report.md` and `<id>.diff` without checking whether they exist (`:135` to `:147`). The id comes from the brief's frontmatter. When brief finds a landed brief under the same name it offers a suffix for the filename only (`brief.md:121` to `:123`) and leaves the frontmatter `id` as it was (`brief.md:81`, template `id: {{FIX_ID}}`).
Traced: round 1 dispatch writes `A/fixes/MEDIUM-1.diff` and `A/fixes/MEDIUM-1-report.md`. Round 2 synthesis cites that diff as evidence for NOT RESOLVED. Status prints `next: /djinn:brief A MEDIUM-1`, "a fresh brief is how a second attempt starts" (`status.md:84` to `:85`). The new brief carries the same `id`, and the round 3 dispatch writes the same two paths (`dispatch.md:136`, `:146`). The first attempt's diff and fixer report are gone. Round 2 synthesis's Evidence cell now describes a file whose contents have changed.
Trigger: in the scenario, run the status `next:` line for round 1's MEDIUM-1, choose the suffix, and dispatch it.
Fix: dispatch Step 6 refuses to overwrite an existing `fixes/<id>.diff` or `-report.md` and writes `<id>-r<n>.diff` / `<id>-r<n>-report.md` (n = the round this dispatch will create). synthesis.md:73 to :76 then keys a diff to the finding by folder plus id prefix.

### LOW
LOW-1. `plugins/djinn/agents/synthesis.md:72` If the prior round has no findings.json, the status table's rows come from "the prior synthesis's HIGH and MEDIUM", which drops a carried NOT RESOLVED finding that is only in that synthesis's status table.
Mechanism: CONTRACTS.md:334 to :336 rebuilds from "Fix List and status table". synthesis.md:72 to :73 (and :170 to :171) name only "the prior synthesis". Read as its HIGH and MEDIUM, that is the Fix List tiers.
Traced: round 2 marks R1 MEDIUM-1 NOT RESOLVED in its status table. round-2/findings.json is missing after the retry (`dispatch.md:227` to `:231`). Round 3 builds rows from round 2's Fix List HIGH and MEDIUM (`synthesis.md:72` to `:73`). R1 MEDIUM-1 gets no row. It leaves the rebuilt `open`, and verdict rule 2 (`:191` to `:193`) can come out SHIP.
Trigger: the round 2 findings.json retry fails, then a round 3 dispatch runs.
Fix: synthesis.md:72 to :73 reads "or, without one, the prior synthesis's Fix List HIGH and MEDIUM plus every status table row not marked RESOLVED", and the same at :170.

LOW-2. `plugins/djinn/agents/bugs-reviewer.md:105` Prior LOW-11's second clause is still open. The rewritten round section still says "in the Round 1 synthesis" and still uses STILL OPEN.
Mechanism: only the heading (`:94`), the trigger (`:96`) and the template heading (`:100`) were changed. `:102` and `:105` to `:106` keep the round 1 wording and the STILL OPEN vocabulary, while the relay uses NOT RESOLVED (`synthesis.md:77`, CONTRACTS.md:317).
Traced: bugs-reviewer.md:96 fires in round 3 and :105 then points it at round 1's synthesis.
Trigger: any round 3 bugs-reviewer run.
Fix: change `:105` to "in the prior round's synthesis" and replace STILL OPEN with NOT RESOLVED at `:102` and `:106`.

LOW-3. `plugins/djinn/agents/integration-reviewer.md:160` The fix for prior LOW-11 made four reviewer round sections fire every round. Each now tells the reviewer to re-verify prior findings, which dispatch forbids, from a path dispatch never passes (prior LOW-3's mechanism, now in four files).
Mechanism: dispatch's round prompt says "Do not re-verify round <n-1> findings; synthesis owns that" and passes no prior report or synthesis path (`dispatch.md:209` to `:213`). bugs-reviewer.md:96 ("the prior round's synthesis it names"), integration-reviewer.md:160 to :162 ("open the round `n-1` report at the path given"), security-reviewer.md:133 to :134 and known-bugchecker.md:114 to :117 each require a re-check section. security-reviewer's heading is `## Round <n-1> status`, the same heading as synthesis's authoritative table.
Traced: `dispatch.md:209` "This is round <n>" matches each new trigger, and the same prompt's `:211` to `:212` contradicts the section the trigger opens.
Trigger: any round 2 or round 3 run.
Fix: either drop the four re-check sections (synthesis owns the table), or have dispatch pass the prior report path and delete `:211` to `:212`. Pick one and state it in CONTRACTS.md.

LOW-4. `plugins/djinn/CONTRACTS.md:331` "FIX THEN SHIP exactly when `open` holds a HIGH or MEDIUM" rules out ESCALATE whenever open holds one, and CONTRACTS wins over synthesis.md.
Mechanism: synthesis.md:188 to :191 checks ESCALATE first, for a HIGH or MEDIUM in a fact dispute, and that finding is in `open`. CONTRACTS.md:3 to :4 says the contract wins a disagreement.
Traced: a round with a disputed MEDIUM puts that MEDIUM in `open`, so under `:331` to `:332` the verdict must be FIX THEN SHIP, and synthesis.md:188 says ESCALATE.
Trigger: an unresolved fact dispute on any HIGH or MEDIUM.
Fix: "Unless the verdict is ESCALATE, FIX THEN SHIP exactly when `open` holds a HIGH or MEDIUM."

LOW-5. `plugins/djinn/commands/status.md:19` Prior LOW-5's second clause is not closed: status has no instruction for a missing `audits/`, or for an `audits/` where no folder holds a `synthesis.md`.
Mechanism: `:19` to `:21` skip folders without a synthesis but say nothing when none is left. The explicit-folder message at `:23` to `:24` does not apply.
Traced: status.md:19 to :24 cover only three argument cases.
Trigger: `/djinn:status` in a project before its first review finishes.
Fix: add "No audit with a synthesis.md under audits/: say `no finished audit under audits/` and stop."

### DEBT
none

### REC
none

## Blast radius
- `plugins/djinn/commands/brief.md:121` The suffix offered for an existing landed brief renames the file but not the frontmatter `id` (`:81`). That is why MEDIUM-3's second attempt reuses round 1's diff and report names.
Mechanism: FIX_ID is set in Step 6 and the suffix is applied in Step 7.
Traced: brief.md:81 to templates/fix-brief.md:2 to brief.md:121 to :123 to dispatch.md:136, :146.
Trigger: re-brief any finding whose earlier brief landed. Fix: the suffix also goes on `id`, or dispatch handles it (MEDIUM-3 fix).

## Checked and Clean
- `plugins/djinn/agents/synthesis.md`: prior MEDIUM-1 closed. Verdict rule 2 (`:191` to `:194`) and the SHIP definition (`:197` to `:199`) now count carried HIGH and MEDIUM not marked RESOLVED, so SHIP agrees with status `blocking` (`status.md:79` to `:80`) and with dispatch's "Nothing blocks a merge" (`dispatch.md:284`).
- `plugins/djinn/agents/synthesis.md`: prior MEDIUM-2 closed on the findings.json path. Rows come from the prior `open` for any round (`:70` to `:73`), the Round column (`:103`, `:115`) carries `prior.round` (CONTRACTS.md:315), and `:89` to `:91` plus CONTRACTS.md:327 to :329 re-check every open HIGH and MEDIUM each round. In the scenario, round 3 gets rows `1 | MEDIUM-1` and `2 | MEDIUM-1`, which stay distinct in `prior` and `open`. The fallback gap is LOW-1.
- `plugins/djinn/commands/dispatch.md`: prior MEDIUM-3's round-number half is closed. `:178` to `:187` take 1 + the highest `round-<k>` under the original folder, so a round 3 brief against A gives round 3 and does not rewrite `round-2/`. The Next-step half is MEDIUM-1 above.
- `plugins/djinn/commands/status.md`: `next:` lines (`:81` to `:85`) map round 1 to the audit folder and round `k` to `round-<k>`, which matches where brief looks (`brief.md:19` to `:20`, `:31`). The Step 4 note (`:91` to `:96`) now fires only on a real inconsistency, since the verdict and `open` share one rule.
- `plugins/djinn/commands/status.md`: the no-findings.json message (`:36` to `:39`) now covers a 2.2.0 run whose retry failed (prior LOW-9).
- `plugins/djinn/commands/dispatch.md`: the findings.json retry (`:227` to `:231`) now passes the prior findings.json path (prior LOW-1). The diff-to-round rule (`:220` to `:221`) matches synthesis.md:73 to :76 (prior LOW-2) when each brief's diff lands in its own folder.
- `plugins/djinn/CONTRACTS.md`: `:327` to `:329` (every open HIGH and MEDIUM each round, LOWs the round after their fix) match synthesis.md:72 to :73. `:334` to `:340` state the pre-2.2.0 loss honestly (prior LOW-4).
- `plugins/djinn/agents/consolidator.md`: `:43` to `:45` read the round's synthesis status table and `prior`, both of which now exist every round.
- `plugins/djinn/agents/known-bugchecker.md`: the trigger at `:114` matches `dispatch.md:209` "This is round <n>". The contradiction is covered in LOW-3.
- `plugins/djinn/agents/security-reviewer.md`: the trigger at `:133` matches dispatch wording and uses NOT RESOLVED. The heading collision is covered in LOW-3.
- `plugins/djinn/README.md`: `:31` to `:33` list four commands (prior LOW-8), and `:152` to `:153` exempt status from the ledger, matching CONTRACTS.md:160 (prior LOW-10).
- `.djinn/config.yaml`: `:6` to `:8` tell the next run to pass `--base` against a `base_branch` that is the working branch (prior LOW-6).
- Prior LOW-7: synthesis.md:100 to :101 and :158 to :159 both name the round 1 status section as the one exception.

## Files read outside the fence
- `plugins/djinn/commands/brief.md` (consumes status next lines)
- `plugins/djinn/templates/fix-brief.md` (source of brief id)
