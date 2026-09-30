---
title: integration-reviewer report, audits/2026-09-27-1628-custom (round 2 of audits/2026-09-27-1559-custom)
author: Claude Opus 5.5 (integration-reviewer)
date: 2026-09-27
status: audit finding, not yet deliberated
---

## Round 1 status
- HIGH-1: RESOLVED. `plugins/djinn/agents/cost-complexity-reviewer.md:126` to 128 say a finding tiered on a missing bound needs no price and no limit; the HIGH reading at lines 204 to 209 and the template at lines 293 to 294 agree, and `CONTRACTS.md:27` to 29 says the same for every agent.
- MEDIUM-1: RESOLVED. `cost-complexity-reviewer.md:204` restricts HIGH to growth "at a fixed input size"; lines 212 to 215 send an uncapped input to MEDIUM only when a cited load reaches a cited limit, else LOW. A whole-file read is bounded at a fixed file size, so it can no longer read as HIGH. (A residual LOW against the contract is new LOW-2 below.)
- MEDIUM-2: RESOLVED. `cost-complexity-reviewer.md:49` to 51 take hosting from IaC when `cost.hosting` is absent, and lines 80 to 81 name where hosting came from.
- LOW-1: RESOLVED. `cost-complexity-reviewer.md:233` to 235 name all four own sections and place them before Findings.
- LOW-2: RESOLVED. `cost-complexity-reviewer.md:281` puts UNVERIFIED before `## Findings` at line 285.
- LOW-3: RESOLVED. `CONTRACTS.md:30` to 32 put a budget or limit breach under load at MEDIUM, and synthesis enforces section 1 including its rules (`plugins/djinn/agents/synthesis.md:18` to 20, 37 to 39), so a budget MEDIUM no longer meets a bar it fails.
- LOW-4: DEFERRED (REC-1 item 3). `cost-complexity-reviewer.md:4` still grants WebFetch and WebSearch and `CONTRACTS.md:237` still names only dependency-reviewer and ux-reviewer. The contract still wins this disagreement until the section 9 edit lands.
- LOW-5: RESOLVED. `cost-complexity-reviewer.md:228` to 229 match `plugins/djinn/commands/dispatch.md:209` to 212.
- LOW-6: RESOLVED (option A). `cost-complexity-reviewer.md:278` to 279 file each convention line also as a REC.
- LOW-7: RESOLVED. `cost-complexity-reviewer.md:71` to 75 say what each pasted input is for, drop `deps.platform` and `goal_doc`, and lines 77 to 81 send any missing listed input to Inputs missing. `plugins/djinn/commands/review.md:113` to 119 pastes every input the prompt now names.
- LOW-8: RESOLVED. `cost-complexity-reviewer.md:31` to 35 give perf-reviewer hot-path cost and in-session growth and file a shared OOM once with "also a perf cost, expect perf-reviewer". perf-reviewer's own side is LOW-9.
- LOW-9: DEFERRED (REC-1 item 9). `plugins/djinn/agents/perf-reviewer.md:14` to 19 still never name cost-complexity-reviewer. The other half of LOW-9 is gone: the prompt no longer reads `@alloc` or `@complexity` (only line 32 names them, to defer to perf-reviewer), so `perf-reviewer.md:96` is true again.
- LOW-10: DEFERRED (REC-1 item 9). `plugins/djinn/agents/breaker.md:72` still hands normal-load growth only to perf-reviewer.
- LOW-11: RESOLVED. `cost-complexity-reviewer.md:103` to 105.
- LOW-12: RESOLVED (option A). `cost-complexity-reviewer.md:130` to 133.
- LOW-13: RESOLVED. `cost-complexity-reviewer.md:133` to 136.
- LOW-14: RESOLVED. `cost-complexity-reviewer.md:40` to 41 read "a key with no spend cap or quota behind it".
- LOW-15: RESOLVED. `cost-complexity-reviewer.md:93` to 97 give the precedence: read only when named or needed for hosting, baseline rows only, a finding only when the diff changes what it bills, under Blast radius.
- LOW-16: RESOLVED. `cost-complexity-reviewer.md:122` to 124 and 211: demand is the smaller of `cost.load` and the code's cap, with a REC to reconcile.
- LOW-17: RESOLVED. `cost-complexity-reviewer.md:26` to 27, 94 to 95 and 258 to 260 carry baseline rows marked `baseline` or `delta`.
- LOW-18: RESOLVED. `cost-complexity-reviewer.md:120` to 121.
- LOW-19: RESOLVED. `cost-complexity-reviewer.md:66` to 68 (`as_of` on paid APIs), 111 (config as a source, with its date where it has one), 121 to 122 (the page wins, both shown, a REC).
- LOW-20: RESOLVED. `cost-complexity-reviewer.md:47` to 51 limit the ban to config values and point prices at the fetch section.
- LOW-21: RESOLVED. `cost-complexity-reviewer.md:315` to 317.
- LOW-22: RESOLVED as asked (reading order at lines 85 to 88, unchanged IaC gated at 93 to 94). The skipped-file line it added creates new LOW-3 below.
- LOW-23: RESOLVED within the prompt. One rule at `cost-complexity-reviewer.md:118` to 128, and the Severity readings at 204 to 215 point at it. See new LOW-2 for the one place the LOW reading still disagrees with the contract.
- LOW-24: RESOLVED. `cost-complexity-reviewer.md:255` to 260: a cited row, a variable row, and the rule that an uncited driver stays.
- LOW-25: RESOLVED. `cost-complexity-reviewer.md:245` to 250 show the filled and the empty state; the Round status instruction is gone.
- LOW-26: RESOLVED. `cost-complexity-reviewer.md:276` to 278 check the conventions and the index first; the heap-flag example is gone from the Conventions template.
- DEBT-1: NOT RESOLVED, not taken (context.md lists it neither as taken nor deferred). No ownership table in `CONTRACTS.md`; ownership still lives per prompt, one direction at a time, as LOW-9 and LOW-10 show. DEBT, never blocks.
- REC-1 item 1: RESOLVED. `CONTRACTS.md:27` to 35.
- REC-1 items 2 to 9: DEFERRED. `CONTRACTS.md:139` to 160 has no `cost` block, `CONTRACTS.md:237` is unchanged, and `commands/review.md:113` to 119 pastes no `cost` block.
- REC-4: RESOLVED. `cost-complexity-reviewer.md:63` to 65 and the source line at 272.
- REC-6: RESOLVED. `cost-complexity-reviewer.md:21` to 24.
- REC-15: RESOLVED. `cost-complexity-reviewer.md:267`.
- REC-17: RESOLVED. `cost-complexity-reviewer.md:77` to 78 and the template at 246.
- REC-2, REC-3, REC-7 to REC-13, REC-16, REC-18: DEFERRED. REC-5, REC-14 and REC-19 are also listed as deferred in context.md but are in the text; see REC-2 below.

## Findings

### HIGH
none

### MEDIUM
none

### LOW
LOW-1. `plugins/djinn/CONTRACTS.md:32` The contract lets a limit come only from the project config or a cited official page, while the prompt accepts a limit from "a bound in the code" and reads hosting from IaC, so a timeout set in `host.json` or a code constant is a cited figure to the agent and an uncited variable to the contract.
Mechanism: `CONTRACTS.md:32` to 35 name two sources for "a price or limit" and call anything else a variable whose claim "is not a finding"; `cost-complexity-reviewer.md:109` to 116 add a third source for a limit, and lines 49 to 51 steer the agent to IaC files, which hold exactly these limits (function timeout, plan memory). The contract wins a disagreement (`CONTRACTS.md:3` to 4), so a correct MEDIUM timeout breach cited to `host.json:line` can be moved down. perf-reviewer's HIGH for "work ... timed out under normal load" (`plugins/djinn/agents/perf-reviewer.md:108` to 109), which reads its figures "from the source" (line 65 to 66) and has no web tool, hits the same rule. LOW because the cost agent is not dispatched until the wiring lands.
Traced: `CONTRACTS.md:32` to 35, then `plugins/djinn/agents/synthesis.md:18` to 20 (enforces section 1) and 37 to 39 (moves a finding that misses its bar down one tier), against `cost-complexity-reviewer.md:116` and 49 to 51. Fix: add "or a bound in the code or IaC, cited by file:line" to the contract sentence.

LOW-2. `plugins/djinn/agents/cost-complexity-reviewer.md:215` The LOW reading ("an uncapped input that no cited load reaches") files a finding whose tier depends on an uncited load, which the contract and the prompt's own rule both say is not a finding.
Mechanism: with no `cost.load` and no code cap, whether an uncapped whole-file read is MEDIUM or LOW depends on the load, an uncited variable. `CONTRACTS.md:34` to 35 say such a claim "is not a finding" and `cost-complexity-reviewer.md:119` to 120 send it to UNVERIFIED; line 215 files it as LOW. Two runs over one diff can file it or drop it to UNVERIFIED. Neither outcome blocks, so this is the round 1 MEDIUM-1 shape one tier down.
Traced: `cost-complexity-reviewer.md:212` to 215 against 118 to 120 and `CONTRACTS.md:34` to 35; consumer `synthesis.md:37` to 39, which enforces the contract's version. Fix: say the missing cap itself is the defect (LOW, cite the input and the missing cap), and only the MEDIUM claim needs a cited load.

LOW-3. `plugins/djinn/agents/cost-complexity-reviewer.md:87` Files skipped for size are listed under Checked and Clean, and synthesis counts any fenced file found there as covered, so an unread file reads as covered.
Mechanism: line 87 to 88 put skipped files in Checked and Clean; `synthesis.md:59` to 61 mark a file covered when it is present in Findings or Checked and Clean and do not read what the line says. The Coverage section then says the file was covered by cost-complexity-reviewer when it was never opened.
Traced: `cost-complexity-reviewer.md:87` to 88, then `synthesis.md:59` to 62. Fix: list skipped files under Inputs missing ("not read: path") and leave them out of Checked and Clean, so synthesis reports them "not covered".

LOW-4. `plugins/djinn/agents/cost-complexity-reviewer.md:265` The Ceilings example's arithmetic is wrong: 4 files x 4 GB is 16 GB against 31 GB, which leaves 15 GB, and the row says "ok, 11 GB spare".
Mechanism: the one worked ceiling in the prompt of an agent whose job is shown arithmetic teaches a headroom figure that does not follow from its own demand and limit.
Traced: `cost-complexity-reviewer.md:265`, against the multiplication rule at lines 140 to 143.

### DEBT
none

### REC
REC-1. `plugins/djinn/CONTRACTS.md:15` The HIGH row of the table still reads "Crash, data loss or corruption, security exposure, or the change does not do what it claims", and an unbounded bill is none of those. The cost rule at line 27 carries it, and synthesis reads the rules (`synthesis.md:18` to 20), but a reader who checks only the table demotes it. Add "or a cost rule below" to the HIGH and MEDIUM rows.
REC-2. context.md says every REC but REC-4, REC-6, REC-15 and REC-17 is deferred, yet the prompt carries REC-5 (one finding per meter and row ids, `cost-complexity-reviewer.md:154`, 253 to 265), REC-14 (footnoted Sources, lines 269 to 272) and REC-19 (the Azure Retail Prices API, lines 113 to 115). None is a defect. Either the decision record or the text is out of step; Donald should confirm he wants them in.

## Blast radius
- LOW `plugins/djinn/agents/breaker.md:104` breaker tiers "a resource leak under a reachable sequence" MEDIUM (DEGRADE), and the new contract rule makes a ceiling that grows with no bound at a fixed input size HIGH. Where they overlap, the contract wins and breaker's text is wrong about the tier. Both tiers block, so the merge gate does not move. Traced from `CONTRACTS.md:27` to 29.

## Checked and Clean
- `plugins/djinn/CONTRACTS.md` (lines 27 to 35): checked against every agent's tier rules (grep over `agents/` for unbounded, leak, OOM, timeout, budget, price, quota, cost). perf-reviewer's HIGH "memory that climbs with no ceiling" and MEDIUM "breaches the budget `project_notes` names ... does not get worse without bound" (`perf-reviewer.md:107` to 115) agree with the new rule; the project_notes budget counts as project config. The four-agent default rule at `CONTRACTS.md:36` to 39 limits who may file HIGH, while the cost rule defines what reaches HIGH, so the specific rule holds and nothing contradicts. Findings above: LOW-1, REC-1, and breaker in Blast radius.
- `plugins/djinn/agents/cost-complexity-reviewer.md`: the section order in the template matches `CONTRACTS.md:97` to 104 (own sections before Findings, Blast radius between Findings and Checked and Clean). The Round 2 rule matches `commands/dispatch.md:209` to 212. Every input named at lines 71 to 75 arrives from `commands/review.md:113` to 119. The division-of-labor claims match `perf-reviewer.md:14` to 19 and 96 and `breaker.md:72`, with the reverse edges deferred (LOW-9, LOW-10). Neither fenced file has an em dash or en dash. Findings above: LOW-2 to LOW-4.
- Description line 3 ("Runs in full and cost scopes, and whenever the config carries a cost block") is not true yet: `commands/review.md` has no cost scope. This is REC-1 item 4, deferred, so it is not filed.

## Files read outside the fence
- `plugins/djinn/agents/perf-reviewer.md` (division and tier rules)
- `plugins/djinn/agents/breaker.md` (division and tier rules)
- `plugins/djinn/agents/synthesis.md` (re-tier and coverage consumer)
- `plugins/djinn/commands/dispatch.md` (round prompt wording)
- `plugins/djinn/commands/review.md` (inputs pasted to agents)
- `plugins/djinn/agents/*.md` via grep (tier conflicts with cost rule)

## Counts
HIGH 0, MEDIUM 0, LOW 5 (4 in Findings, 1 in Blast radius), DEBT 0, REC 2
