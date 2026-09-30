---
title: integration-reviewer report, audits/2026-09-25-1912-custom
author: Claude Opus 5.5 (integration-reviewer)
date: 2026-09-25
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Prior review re-check (audits/2026-09-25-1902-custom synthesis ids)
- MEDIUM-1: RESOLVED. `plugins/djinn/agents/synthesis.md:191` to `:194` now counts carried HIGH and MEDIUM, `CONTRACTS.md:331` to `:332` ties the verdict to `open`, and `commands/status.md:79` to `:80` and `:91` to `:95` now agree with it. `commands/dispatch.md:284` ("Nothing blocks a merge") is now true when it prints.
- MEDIUM-2: RESOLVED. `plugins/djinn/agents/synthesis.md:70` to `:73` takes a row for every HIGH and MEDIUM in the prior `open`, whatever round raised it, with a Round cell (`:102` to `:103`, `:115`), and `CONTRACTS.md:327` to `:329` requires every open HIGH and MEDIUM be checked every round. One residue on the prose fallback path, filed as LOW-2.
- MEDIUM-3: NOT RESOLVED. Status now prints the right folder per finding (`commands/status.md:81` to `:85`) and dispatch derives the round from existing folders (`commands/dispatch.md:178` to `:187`), but dispatch's own Next step still routes every blocking id to `round-<n>` (`commands/dispatch.md:285`), and the two-folder brief set status now produces has no dispatch path. See MEDIUM-1 and MEDIUM-2.
- LOW-1: RESOLVED. `plugins/djinn/commands/dispatch.md:227` to `:231` has its own retry prompt naming the prior round's findings.json.
- LOW-2: RESOLVED. `plugins/djinn/agents/synthesis.md:73` to `:76` and `commands/dispatch.md:220` to `:221` key a diff to its folder. `synthesis.md:68` still says "every `fixes/<id>.diff`", which the later lines override.
- LOW-3: NOT RESOLVED. `plugins/djinn/agents/perf-reviewer.md:134` to `:136` is unchanged and outside this fence.
- LOW-4: NOT RESOLVED. `plugins/djinn/CONTRACTS.md:337` to `:341` documents the loss instead of preventing it; acceptable as a stated limit.
- LOW-5: RESOLVED. `plugins/djinn/commands/status.md:19` to `:21` skips folders with no `synthesis.md`.
- LOW-6: RESOLVED. `.djinn/config.yaml:9` to `:11` tells the next run to pass `--base`.
- LOW-7: RESOLVED. `plugins/djinn/agents/synthesis.md:100` to `:101` and `:158` to `:159` name the round 1 exception.
- LOW-8: RESOLVED. `plugins/djinn/README.md:30` to `:31` lists `/djinn:status`.
- LOW-9: RESOLVED. `plugins/djinn/commands/status.md:36` to `:39` names both causes.
- LOW-10: RESOLVED in README (`plugins/djinn/README.md:152` to `:153`). The same false claim survives in `relay.md`; see Blast radius.
- LOW-11: NOT RESOLVED. Triggers now fire in every round, but `plugins/djinn/agents/bugs-reviewer.md:102` and `:105` to `:106` still say STILL OPEN and "the Round 1 synthesis", and the sections now contradict the dispatch prompt in every round. See LOW-1.
- DEBT-1: RESOLVED. Round column added. No schemaVersion bump needed: `CONTRACTS.md:314` to `:316` already said `prior.round` names the round a finding was raised in, and `commands/status.md:76` to `:78` already applies the prefix rule to `prior`.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/dispatch.md:285` Dispatch's FIX THEN SHIP next step still sends every blocking id to `/djinn:brief <audit-folder>/round-<n> <id>`, but the verdict now blocks on carried findings raised in earlier rounds.
Mechanism: The verdict line now names carried ids (`agents/synthesis.md:191` to `:194`): in round 3, a round 1 MEDIUM-3 left NOT RESOLVED prints bare as `MEDIUM-3`, round 2's as `R2 MEDIUM-1`. Dispatch tells the user to brief each against `round-3`. Brief takes a bare `<TIER>-<n>` and looks it up in that one folder's `synthesis.md` (`commands/brief.md:21` to `:22`, `:31` to `:32`). Round 3's Fix List does not hold the round 1 finding, so the lookup stops as not found, or matches round 3's own MEDIUM-3 and briefs the wrong defect. `R2 MEDIUM-1` does not parse as an id at all. A round whose only blockers are carried now ends FIX THEN SHIP, so this path is hit exactly when the change works as designed. `/djinn:status` prints the correct lines (`commands/status.md:81` to `:85`); dispatch's Step 9 contradicts it.
Traced: `agents/synthesis.md:191` to `:194` (verdict names carried ids) to `commands/dispatch.md:276`, `:285` to `:286` (next step fixed to `round-<n>`) to consumer `commands/brief.md:17` to `:22`, `:31` to `:32` (bare id, one folder's Fix List).

MEDIUM-2. `plugins/djinn/commands/dispatch.md:52` The `next:` lines status now prints put briefs for one audit in two folders, and dispatch has no rule for that: "All briefs should share one audit folder. If not, flag it and ask."
Mechanism: After round 2, `open` holding a carried round 1 MEDIUM-3 and a new round 2 HIGH-1 makes status print `next: /djinn:brief <audit> MEDIUM-3` and `next: /djinn:brief <audit>/round-2 HIGH-1` (`commands/status.md:61` to `:62`, `:81` to `:85`). Brief writes each under its own folder's `fixes/` (`commands/brief.md:118` to `:119`). Dispatching both together hits the flag-and-ask with no defined answer. If the user proceeds, Step 6 writes every report and diff to one `<audit-folder>/fixes/` (`commands/dispatch.md:136`, `:146`), the reviewer prompt and consolidator name one `fixes/` folder (`:210`, `:234`), and synthesis attributes a diff by the folder it sits in (`agents/synthesis.md:74` to `:76`), so one of the two fixes is credited to the other round's same-numbered finding or not seen. If the user dispatches the two sets separately, the first takes round 3 and the second computes round 4 (`commands/dispatch.md:180` to `:185`), so its fixes land and then no review runs ("Max 3 rounds reached").
Traced: `commands/status.md:81` to `:85` (two folders) to `commands/brief.md:118` to `:119` (brief per folder) to consumer `commands/dispatch.md:52` (flag and ask), `:136`, `:146` (single fixes folder), `:180` to `:185` (round cap), and `agents/synthesis.md:74` to `:76` (attribution by folder).

### LOW
LOW-1. `plugins/djinn/agents/bugs-reviewer.md:96`, `plugins/djinn/agents/integration-reviewer.md:160`, `plugins/djinn/agents/known-bugchecker.md:115`, `plugins/djinn/agents/security-reviewer.md:133` The round sections now fire in every round, and every round's dispatch prompt forbids what they instruct and omits the path they need.
Mechanism: `commands/dispatch.md:209` to `:213` says "Do not re-verify round <n-1> findings; synthesis owns that" and passes no prior synthesis or prior report path. bugs-reviewer (`:17`, `:19` to `:20`) and known-bugchecker (`:24` to `:25`) are told never to guess a path; integration-reviewer opens "the round `n-1` report at the path given". Each agent either skips the section or goes looking for a file it was told not to hunt for. security-reviewer's heading `## Round <n-1> status` (`:134`) is the same heading synthesis uses for its authoritative table (`agents/synthesis.md:114`). bugs-reviewer still says STILL OPEN and "the Round 1 synthesis" (`:102`, `:105` to `:106`). Before this change the conflict existed only in round 2; now it is in every round.

LOW-2. `plugins/djinn/agents/synthesis.md:71` to `:73` The prose fallback for the status table takes "the prior synthesis's HIGH and MEDIUM", which misses carried HIGH and MEDIUM that appear only as NOT RESOLVED or REGRESSED rows in the prior status table.
Mechanism: In round 3 with no `round-2/findings.json`, a round 1 MEDIUM left NOT RESOLVED in round 2 is not in round 2's Fix List, only in its table. `CONTRACTS.md:335` to `:336` says the rebuild reads "Fix List and status table"; `synthesis.md:72` names only the HIGH and MEDIUM. The carried MEDIUM gets no row, cannot be marked RESOLVED, and drops out of `open` or sticks, depending on how synthesis reads the conflict. Needs a missing round 2 `findings.json`.

LOW-3. `plugins/djinn/commands/dispatch.md:256` The dispatch ledger line can now read `round-3=FIX THEN SHIP H0 M0 ...`.
Mechanism: The counts are this round's Fix List (same five-field shape as `review.md:220`), and the verdict now also counts carried findings (`agents/synthesis.md:191` to `:194`). The Step 9 report has an "Open across rounds" line (`:279`) that explains it; the ledger, which relay.md calls enough to answer "what got fixed" alone (`relay.md:114` to `:116`), does not.

LOW-4. `plugins/djinn/commands/status.md:84` to `:85` "A NOT RESOLVED entry gets the same line: a fresh brief is how a second attempt starts" leads dispatch to overwrite the first attempt's report and diff.
Mechanism: The second brief gets a suffixed filename (`commands/brief.md:121` to `:123`) but keeps the same `id`, and dispatch writes `<audit-folder>/fixes/<id>-report.md` and `<id>.diff` by id (`commands/dispatch.md:136`, `:146`). The first attempt's diff, which the prior round's status table cites as evidence, is replaced. Code is unaffected; the audit trail is not.

LOW-5. `plugins/djinn/agents/consolidator.md:74` to `:76` "The last one wins on whether a finding is resolved" matches findings by id, but status tables now span rounds and ids repeat across rounds.
Mechanism: The round 3 table can hold a round 1 MEDIUM-1 and a round 2 MEDIUM-1 (`agents/synthesis.md:102` to `:103`), and the dispositions dispatch pastes are bare `<id: landed>` (`commands/dispatch.md:235`). Consolidator has no `(round, id)` rule (`CONTRACTS.md:343` to `:345`), so it can credit one finding's RESOLVED to the other when proposing index entries. Proposal only; a human applies it.

LOW-6. `plugins/djinn/commands/dispatch.md:185` to `:186` "Original audit folder" is defined for Step 7.1 only; Steps 7.2 to 7.6 still say `<audit-folder>`, which for a round-k brief is the round folder.
Mechanism: Step 6 must use the brief's own folder so synthesis's attribution rule holds (`agents/synthesis.md:74` to `:76`). Step 7.3 reads `<audit-folder>/context.md` (`:193`), which exists only in the original folder (`commands/review.md:80`); dispatch never writes one under `round-<n>/`. A literal reading halts and asks for the base ref after the fixes landed, and `:190`, `:200`, `:213` would nest `round-2/round-3/`, which `:186` forbids. An orchestrator that carries 7.1's term forward gets it right; nothing says to.

### DEBT
none

### REC
REC-1. integration-reviewer: let `/djinn:brief` accept `R<k> <id>` (or a `(round, id)` pair) and resolve the folder itself, then have dispatch's Step 9 and status print the same form. One parser in brief removes MEDIUM-1 and half of MEDIUM-2.
REC-2. integration-reviewer: add a worked three-round example to CONTRACTS.md section 12 covering a two-folder dispatch and a second attempt on a NOT RESOLVED finding. MEDIUM-2 and LOW-4 both sit on that path.

## Blast radius
- LOW `plugins/djinn/relay.md:100` to `:102` Verdicts still say SHIP is "zero HIGH and zero MEDIUM after normalization" and FIX THEN SHIP is "a HIGH or MEDIUM remains", the per-round shape. A carried NOT RESOLVED MEDIUM with no new findings now gives FIX THEN SHIP. Traced from `plugins/djinn/agents/synthesis.md:191`.
- LOW `plugins/djinn/relay.md:6` and `:112` to `:113` "Every command leaves a folder of artifacts and one line in a ledger" and "one line per command run" are false for `/djinn:status`, the same line README.md:152 was just corrected for. Traced from `plugins/djinn/README.md:152` and `plugins/djinn/CONTRACTS.md:160`.
- LOW `plugins/djinn/commands/brief.md:29` to `:30` Reads `<audit-folder>/context.md`, which a `round-<k>` folder never has, and says nothing about a missing file. Pre-existing, but status's new `next:` lines (`plugins/djinn/commands/status.md:83`) now route users there by default. Traced from `plugins/djinn/commands/status.md:81`.
- LOW `plugins/djinn/agents/perf-reviewer.md:134` to `:136` Prior LOW-3 unchanged: writes a `## Round <n-1> status` table of findings "assigned to you" against `plugins/djinn/commands/dispatch.md:212`. Traced from `plugins/djinn/commands/dispatch.md:209`.

## Checked and Clean
- `plugins/djinn/commands/status.md:79` to `:80`, `:91` to `:95`: "blocking means FIX THEN SHIP" and the disagreement note now match `agents/synthesis.md:191` to `:194` and `CONTRACTS.md:331` to `:332`. A clean round no longer trips the note.
- `plugins/djinn/commands/status.md:76` to `:78`: `resolved this round` reads `prior` with the prefix rule, so rows for older rounds print as `R2 ...` or bare correctly.
- `plugins/djinn/commands/dispatch.md:277`: "Resolved: n of m prior HIGH and MEDIUM" still counts from the status table; the Round column does not change the Status cell it reads.
- `plugins/djinn/commands/dispatch.md:217` to `:219`: the prior round's synthesis and findings.json paths stay right under the new round number: round 3 reads `round-2/`, whatever folder the briefs came from.
- `plugins/djinn/commands/dispatch.md:227` to `:231`: the retry names the prior findings.json, so synthesis can carry `open` forward.
- `plugins/djinn/agents/consolidator.md:44` to `:45`: heading `## Round <n-1> status` still matches `agents/synthesis.md:114` and the dispatch prompt at `commands/dispatch.md:236`.
- `plugins/djinn/commands/review.md:188` to `:191`, `:237` to `:239`: round 1 only; the retry and next step are unaffected by the verdict or round-number changes.
- `plugins/djinn/README.md:94` to `:95`: "At least one HIGH or MEDIUM finding" reads correctly under the cross-round verdict.
- `plugins/djinn/agents/fixer.md`: no reference to rounds, the status table, or the verdict.
- `plugins/djinn/CONTRACTS.md:288`: no schemaVersion bump needed; the `prior.round` meaning was already "as it was raised".
- `plugins/djinn/agents/synthesis.md:209` to `:210`: "An entry leaves `open` only because this round's status table marks it RESOLVED" is now reachable for any round's finding, since every open HIGH and MEDIUM gets a row.

## Files read outside the fence
- `plugins/djinn/commands/brief.md` (consumes status next lines)
- `plugins/djinn/commands/review.md` (context.md writer, retry)
- `plugins/djinn/relay.md` (verdict and ledger claims)
- `plugins/djinn/agents/fixer.md` (grep for round assumptions)
- `plugins/djinn/agents/perf-reviewer.md` (prior LOW-3 re-check)
- `the arena repo/fixtures/audit-three-rounds/` (glob for round context.md)

## Counts
HIGH 0, MEDIUM 2, LOW 6, DEBT 0, REC 2, Blast radius 4 (LOW)
