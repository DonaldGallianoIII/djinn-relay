---
title: integration-reviewer report, audits/2026-09-27-1559-custom
author: Claude Opus 5.5 (integration-reviewer)
date: 2026-09-27
status: audit finding, not yet deliberated
---

## Findings

### HIGH
none

### MEDIUM
none

### LOW
LOW-1. `plugins/djinn/agents/cost-complexity-reviewer.md:4` The agent carries `WebFetch, WebSearch`, and CONTRACTS.md section 9 grants web tools only to dependency-reviewer and ux-reviewer.
Mechanism: CONTRACTS.md:217-218 says review agents get `Read, Grep, Glob, Write`, and CONTRACTS.md:228-229 names the two agents allowed web access. CONTRACTS.md:4-5 says the contract wins a disagreement, so read literally this agent's whole citation rule (lines 91-107) runs on tools the contract does not allow. Web access is what makes the no-dollar-figures-from-memory rule workable, so the fix is in the contract, not here (REC-2).
Traced: agent line 4 against CONTRACTS.md:217-229. Precedent checked at `agents/ux-reviewer.md:4` (web tools, read-only wave) and `agents/dependency-reviewer.md:4`.

LOW-2. `plugins/djinn/agents/cost-complexity-reviewer.md:267` The `## UNVERIFIED` section sits between Findings and Blast radius, and CONTRACTS.md section 3 allows an agent's own sections only before Findings.
Mechanism: CONTRACTS.md:88-95 puts Blast radius directly between Findings and Checked and Clean, and puts agent-specific output "before Findings". dependency-reviewer puts its UNVERIFIED before Findings (`agents/dependency-reviewer.md:146`, `:162`). A reader or tool that looks for Blast radius right after REC finds UNVERIFIED instead. Fix: move `## UNVERIFIED` up, after `## Conventions proposed`, and name it in the sentence at line 214.
Traced: agent lines 264-271 against CONTRACTS.md:88-95 and dependency-reviewer.md:146.

LOW-3. `plugins/djinn/agents/cost-complexity-reviewer.md:214` "The two sections before Findings" is wrong: the template has three (Inputs missing, Cost model, Conventions proposed), four once LOW-2 is applied.
Mechanism: a wrong count in the one sentence that claims contract cover for the extra sections. Fix: "The sections before Findings (Inputs missing, Cost model, Conventions proposed, UNVERIFIED) are this agent's own output, allowed by CONTRACTS.md section 3."
Traced: agent lines 214-243.

LOW-4. `plugins/djinn/agents/cost-complexity-reviewer.md:177` The HIGH and MEDIUM bars add categories CONTRACTS.md section 1 does not have, so synthesis will re-tier this agent's findings unpredictably.
Mechanism: the contract's HIGH is crash, data loss, security exposure, or does not do what it claims (CONTRACTS.md:15); the agent adds "money or a ceiling with no bound". The contract's MEDIUM is incorrect behavior a user hits (CONTRACTS.md:16); the agent's is "realistic use breaches the stated budget" (line 182). synthesis.md:37-41 moves any HIGH or MEDIUM whose text misses the contract bar down one tier. An OOM kill reads as a crash and a 429 as incorrect behavior, so those survive; an uncapped re-buying retry loop or a budget breach with no user-visible failure does not clearly meet either bar and can be moved down to a non-blocking tier. Compare perf-reviewer, which anchors its HIGH to the contract wording (`agents/perf-reviewer.md:107-111`). Fix: amend CONTRACTS.md section 1 (REC-3), or reword lines 177-184 to map each cost case onto the contract bar.
Traced: agent lines 177-184 to CONTRACTS.md:13-16 to the consumer `agents/synthesis.md:37-41`.

LOW-5. `plugins/djinn/agents/cost-complexity-reviewer.md:205` The Round 2 instruction tells the agent to re-verify prior findings, and the round dispatch tells every reviewer not to.
Mechanism: `commands/dispatch.md:209-212` pastes "Do not re-verify round <n-1> findings; synthesis owns that" into every round prompt, and `agents/synthesis.md:81-82` repeats that the status table is synthesis's. The agent file says to open with `## Round <n-1> status` and mark each finding. The agent gets two opposite instructions in one dispatch, and its section heading matches the one synthesis writes (synthesis.md:69-70). This is copied from perf-reviewer.md:132-139, where it is pre-existing and not reported. Fix: replace lines 205-209 with "In round `n`, review the fix diffs and their callers for new cost defects. Do not re-verify round `n-1` findings; synthesis owns that."
Traced: agent lines 203-209 against dispatch.md:209-212 and synthesis.md:65-82.

LOW-6. `plugins/djinn/agents/cost-complexity-reviewer.md:228` The Cost model, Conventions proposed and UNVERIFIED sections reach no consumer after the agent report.
Mechanism: synthesis builds its Fix List from tiered findings only (`agents/synthesis.md:117-128`), has no rule for agent sections outside the tiers (synthesis.md:14-16 covers only pipe-connector maps and known-bugchecker hits), and findings.json holds one record per Fix List line (CONTRACTS.md:293). consolidator reads syntheses and the known-bugchecker report, not other agent reports (`agents/consolidator.md:74-79`), and ignores REC (consolidator.md:68). So the conventions Donald asked for (rate limits, heap caps) and the uncited claims stop in `agents/cost-complexity-reviewer.md` and never show up in synthesis.md, findings.json or `/djinn:status`. The file is still on disk, so nothing is lost, only unseen. Fix: in this file, "Each line under Conventions proposed is also filed as a REC with the same text", plus the synthesis line in REC-8.
Traced: agent lines 228-269 to synthesis.md:14-16 and 117-128 to CONTRACTS.md:293 to consolidator.md:68 and 74-79.

LOW-7. `plugins/djinn/agents/cost-complexity-reviewer.md:63` The input list names `deps.platform` and `goal_doc`, which the dispatch this agent would receive never pastes.
Mechanism: the fence block's Project config lines paste only conventions_files, known_bugs_index, hot_paths, build_cmd, test_cmd and project_notes (`commands/review.md:113-119`). `goal_doc` goes only to wave 2 (review.md:162-166) and `deps` only to dependency-reviewer (review.md:160-161). Line 44 says "never go looking for one", so the agent works without them and does not say they are missing, because line 66 sends only `cost` keys to Inputs missing. perf-reviewer.md:37 makes the same claim (pre-existing). Fix: add both to the Step 6 paste for this agent (REC-4), or send any listed input that did not arrive to Inputs missing.
Traced: agent lines 44 and 63-66 to review.md:113-119, 147-152 and 160-166.

LOW-8. `plugins/djinn/agents/cost-complexity-reviewer.md:29` The division of labor with perf-reviewer understates perf-reviewer's own scope, so both agents claim OOM, timeouts and `@complexity` tags.
Mechanism: this file gives perf-reviewer only "per-frame and per-call CPU and allocation cost" and keeps "growth past the session", ceilings and timeouts for itself. perf-reviewer's prompt claims "grows without a ceiling" (perf-reviewer.md:11-12), HIGH for "memory that climbs with no ceiling until the process dies" and "work ... timed out under normal load" (perf-reviewer.md:107-111), and says "No other agent reads these tags" about `@alloc` and `@complexity` (perf-reviewer.md:90-98), while this file's LOW tier (line 187) reads them too. perf-reviewer's prompt does not mention this agent, so the handoff runs one way only. In a full or cost scope both agents will file the same OOM line. synthesis will usually merge it (synthesis.md:43-48 dedupes same file, lines and mechanism), but a HIGH (OOM) from perf and a MEDIUM (OOM KILL) from this agent on one line is a fact dispute synthesis has to settle. Fix: reword lines 29-32 to what perf-reviewer actually claims, and add the reverse line to perf-reviewer (Blast radius below, REC-9).
Traced: agent lines 27-40 and 187 against perf-reviewer.md:10-19, 90-98, 107-111, to the consumer synthesis.md:43-48.

### DEBT
DEBT-1. `plugins/djinn/agents/cost-complexity-reviewer.md:27` Ownership between agents lives only inside each agent's prompt, one direction at a time, so every new agent means editing four or five other prompts or leaving the split one-sided (LOW-8, Blast radius). A short ownership table in CONTRACTS.md (who owns bill, ceiling, hot-path cost, attacker growth, secrets, dependency resolution) would give every prompt one line to point at, and make the next agent a one-row edit.

### REC
REC-1. CONTRACTS.md section 5 (after the `deps` block, CONTRACTS.md:140-147), add:
```yaml
cost:                        # optional. cost-complexity-reviewer reads it; absent means every key is none.
  hosting: none              # one line per tier, e.g. "Azure Functions Flex Consumption"
  load: none                 # requests a day, users, rows, file sizes, batch sizes, seeds per run
  budget: none               # per month or per run, and any hard cap
  limits: []                 # known ceilings: memory per process or plan, heap cap, request timeout, payload size
  paid_apis: []              # one per service: name, billing unit, price if known, rate limit, quota, where the key is read
  pricing_refs: []           # official pricing or limits URLs the owner trusts
```
and one sentence under it: "A price or limit an agent states comes from `cost.limits`, `cost.pricing_refs`, or an official page it fetched and cites with the URL and date. Never from memory."

REC-2. CONTRACTS.md:228-229 becomes: "Agents that check the outside world (dependency-reviewer, ux-reviewer, cost-complexity-reviewer): add `WebFetch, WebSearch`. Every claim from the web carries its URL." Closes LOW-1. No Bash, so it stays in the Step 6 read-only wave.

REC-3. CONTRACTS.md section 1, one rule after line 30: "cost-complexity-reviewer maps cost onto this ladder: a paid call or memory growth with no bound is HIGH; a breach of a documented limit, a timeout, or `cost.budget` under the configured load is MEDIUM. Each needs cited figures, or it is UNVERIFIED and not a finding." Closes LOW-4 without changing synthesis.

REC-4. `commands/review.md` wiring:
- Line 3 description: the scope list becomes `"standard" (default), "quick", "full", "perf", "cost", "ideas"`.
- Step 1, line 18-20: add `cost` to the keys taken.
- Step 2 scopes, after line 41: `- **cost**: known-bugchecker, cost-complexity-reviewer, perf-reviewer, synthesis`
- Step 2 full scope, line 38: insert `cost-complexity-reviewer` after `perf-reviewer`.
- Conditional agents, after line 49: `- **cost-complexity-reviewer** runs whenever the config carries a `cost` block with at least one key that is not `none` or empty.`
- Step 6, after line 152: "For cost-complexity-reviewer, also paste the config's `cost` block verbatim, `deps.platform`, and the goal statement (`--goal`, else `goal_doc`, else none). With no `cost` block, paste `cost: none`."
- Step 10 line 228 example stays; a narrow scope names cost-complexity-reviewer when it did not run.

REC-5. `commands/dispatch.md:205-206` becomes "Each prompt is the fence block from `/djinn:review` with the round fence, plus any per-agent block `/djinn:review` Step 6 and Step 7 add for that agent (the `cost` block for cost-complexity-reviewer, the `deps` block for dependency-reviewer), plus:". Without it, round 2 of a cost scope sends this agent no cost block, and every round 2 report says every cost input is missing.

REC-6. `templates/config.yaml`, after the `deps` block (line 42):
```yaml
# Cost facts for cost-complexity-reviewer. Optional; a block with any key
# set turns the agent on in every scope but ideas. Prices and limits here
# are the owner's; the agent cites them or a page it fetched, never memory.
cost:
  hosting: none          # e.g. "Azure App Service P1v3, Linux, 2 instances, East US"
  load: none             # e.g. "2000 requests a day, 40 users, 4 million rows"
  budget: none           # e.g. "60 a month, hard cap 100"
  limits: []             # e.g. "Functions timeout 10 min", "node heap 4 GB"
  paid_apis: []          # e.g. "Meshy: per task, key in .env MESHY_API_KEY"
  pricing_refs: []       # official pricing or limits URLs
```

REC-7. `README.md:114`, add `/djinn:review cost       paid APIs, hosting, rate limits, heap and timeouts`. `relay.md`: scopes table (after line 134) add `| `cost` | known-bugchecker, cost-complexity, perf, synthesis | Paid APIs, hosting, IaC, CI, anything with a bill or a platform ceiling |`; the full row (line 133) adds `cost-complexity` after `gap-hunter`; the conditional paragraph (lines 137-140) adds "**cost-complexity-reviewer** when the config carries a `cost` block"; the change-type table (after line 153) adds `| Paid API, hosting, IaC or CI change | cost |`.

REC-8. `agents/synthesis.md:14-16` add: "cost-complexity-reviewer's Conventions proposed lines appear in the Fix List as REC. Its UNVERIFIED and Inputs missing lines go under Coverage as one line each, so a reader sees what the cost review could not check." Pairs with the in-file fix for LOW-6.

REC-9. `agents/perf-reviewer.md:14-19` add "- cost-complexity-reviewer owns the bill and platform ceilings (plan memory, timeouts, rate limits). If a growth bug ends in a platform kill or a bill, report the hot-path cost and add 'also a ceiling, expect cost-complexity-reviewer'." and `agents/breaker.md:71-73` add "cost-complexity-reviewer (a bill or ceiling under normal load)" to the handoff list.

## Blast radius
- LOW `plugins/djinn/agents/perf-reviewer.md:14` The division of labor names bugs-reviewer, known-bugchecker and breaker and never cost-complexity-reviewer, and line 96-98 says no other agent reads `@alloc` or `@complexity`, which the new agent now does (its line 187). One-sided split. Traced from `plugins/djinn/agents/cost-complexity-reviewer.md:29`.
- LOW `plugins/djinn/agents/breaker.md:71` The handoff list sends happy-path unbounded growth to perf-reviewer only; the new agent claims "growth normal load brings" (its line 33), so a breaker handoff to the right owner is impossible. Traced from `plugins/djinn/agents/cost-complexity-reviewer.md:33`.

## Checked and Clean
- `agents/security-reviewer.md`: its HIGH is a secret in a tracked file (security-reviewer.md:109-110) and it does not claim metered or unmetered call cost, so "a leaked paid key is theirs; a key that makes unmetered calls is yours" (cost line 37-38) matches both prompts.
- `agents/dependency-reviewer.md`: it cedes "the quality of the code that uses the dependency" (dependency-reviewer.md:136), consistent with cost line 35-36. Overlap noted and harmless: its Category 8 "slow installs" (line 109) against cost scope item 7 CI minutes; synthesis dedupes on same line and mechanism.
- `agents/breaker.md`: "breaker owns growth an attacker can force" (cost line 33) matches breaker.md:71-74, which gives breaker only defects that need an attack input. The missing reverse handoff is under Blast radius.
- `agents/known-bugchecker.md`: "cite its finding id, do not re-derive it" (cost line 39-40) is consistent with the Step 6 paste (review.md:149-152). Small wording note: the Flagged block pasted is `<pattern-id> path:line` (known-bugchecker.md:138-139, 170-171), so the agent will cite a pattern id, not a HIGH-n id. perf-reviewer.md:23 says the same thing; harmless.
- CONTRACTS.md section 4, fence: the standing exceptions (cost lines 78-83) go past one hop, but dependency-reviewer sets the precedent (dependency-reviewer.md:25), and cost line 85-89 routes their files to Files read outside the fence and their findings to Blast radius.
- CONTRACTS.md section 3, sections before Findings: Inputs missing, Cost model, Conventions proposed are allowed by CONTRACTS.md:92-95. Only UNVERIFIED is misplaced (LOW-2).
- CONTRACTS.md section 7 header and section 8 model: template header (cost lines 218-223) matches; `model: opus` at line 5.
- CONTRACTS.md section 10: `## Runtime notes` present at line 287 and names the frontmatter keys and the paste.
- CONTRACTS.md section 11 voice: grep for em dash, en dash and digit-hyphen-digit ranges in the file, no match.
- CONTRACTS.md section 12 findings.json: every finding template line opens with a backticked `path:line` (cost line 246), so synthesis's `file` and `line` extraction (CONTRACTS.md:295-302) works. Sub-labels such as `MEDIUM (429)` sit after the tier word as CONTRACTS.md:9-11 allows. Nothing in findings.json needs a new field.
- `commands/review.md` Step 6 wave: the agent has no Bash, so it belongs in the parallel read-only wave (review.md:141-145), same as ux-reviewer with web tools.
- `commands/review.md` custom list, today: review.md:51-54 accepts any name with a file in `agents/`, so `/djinn:review cost-complexity-reviewer` runs now. It gets no `cost` block, and cost lines 66-71 handle that path (every key under Inputs missing, local and CI review only). Consistent with context.md's note that the wiring is deliberately not done.
- `commands/status.md` via README.md:80-83: reads findings.json only; the agent adds no field it would need.

## Files read outside the fence
- `plugins/djinn/agents/perf-reviewer.md` (division of labor claim)
- `plugins/djinn/agents/breaker.md` (division of labor claim)
- `plugins/djinn/agents/security-reviewer.md` (division of labor claim)
- `plugins/djinn/agents/dependency-reviewer.md` (division, web tools precedent)
- `plugins/djinn/agents/known-bugchecker.md` (flagged block shape)
- `plugins/djinn/agents/synthesis.md` (consumer of report sections)
- `plugins/djinn/agents/consolidator.md` (consumer of report sections)
- `plugins/djinn/commands/review.md` (dispatch that pastes inputs)
- `plugins/djinn/commands/dispatch.md` (round 2 prompt)
- `plugins/djinn/templates/config.yaml` (wiring target)
- `plugins/djinn/README.md` (wiring target)
- `plugins/djinn/relay.md` (wiring target)
