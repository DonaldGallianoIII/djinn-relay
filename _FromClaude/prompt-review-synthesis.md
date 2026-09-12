---
title: Prompt review of synthesis.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File under review: `~/djinn-relay/plugins/djinn/agents/synthesis.md` (64 lines).
Also read, per the brief: `relay.md`, `~/Conventions/workflow/REVIEW.md`,
`~/Conventions/workflow/AGENTS.md`, and the other files in `agents/`. I also
read `commands/review.md`, `commands/brief.md`, `commands/dispatch.md` and
`templates/fix-brief.md` because they are the producers and consumers of the
synthesis report; a mechanical-consumption check is impossible without them.
Nothing outside `~/djinn-relay` and `~/Conventions` was opened.

Quoting note: the prompt uses dashes in many lines. In "Current:" quotes below
they are replaced by a colon or omitted, so this report obeys the voice rule.

**1. Severity is taken at face value from agents that define it differently, so non-defects can block ship** (lines 10, 23 to 30, 35)
Current: "Each report contains findings with severity ratings." and a six-item tier list that only names HIGH, CRASH/CORRUPT, MEDIUM, DEGRADE, LOW, FUTURE.
Proposed: replace the tier list with a normalization table and one bar:

```
# Severity normalization

Agents rate on their own scales. Re-rate every finding onto this one scale before ranking.

| Agent label                                                        | Tier           |
|--------------------------------------------------------------------|----------------|
| HIGH, CRASH, CORRUPT, KNOWN-HIGH                                    | HIGH           |
| MEDIUM, DEGRADE, KNOWN-MEDIUM                                       | MEDIUM         |
| LOW, KNOWN-LOW, pipe-connector Anomalies                            | LOW            |
| FUTURE-HIGH, FUTURE-MEDIUM                                          | DEBT           |
| gap-hunter tiers, test-strategist priority, ux-reviewer friction    | RECOMMENDATION |

The bar for the blocking tiers, whatever the source agent said:
- HIGH: crash, data loss, security exposure, or the change does not do what it claims.
- MEDIUM: incorrect behavior a user will hit.
- LOW: any other real defect.
A finding labeled HIGH or MEDIUM whose text does not meet that bar moves down one tier.
List every move under "Re-tiered" with the original label and one reason.
Never move a finding up without reading the cited code.
DEBT and RECOMMENDATION never block.
```
Why: security-reviewer line 44 defines MEDIUM as "code smell, unprofessional comment"; bugs-reviewer line 31 defines MEDIUM as "incorrect behavior users will encounter". Under line 36 both trigger FIX THEN SHIP. Worse, in `full` scope gap-hunter runs alongside synthesis and its line 64 maps Tier 1 ideas to HIGH, so a good idea would read as a ship blocker. Decision 4 wires in four more agents with four more scales (test-strategist "priority", ux "friction"), so the mapping has to exist before they land.

**2. Finding IDs do not match what `/djinn:brief` expects** (lines 44 to 54)
Current: one running number across tiers: "1. [file:line]" under HIGH, "2." under MEDIUM, "3." under LOW.
Proposed: number per tier with the tier as prefix, and carry the source label and report path on the line:
```
### HIGH
HIGH-1. [file:line] one-line description. Source: bugs-reviewer (HIGH), confirmed by breaker (CRASH). Report: agents/bugs-reviewer.md
### MEDIUM
MEDIUM-1. [file:line] ... Source: perf-reviewer (MEDIUM). Report: agents/perf-reviewer.md
### LOW
LOW-1. ...
### Architectural Debt
DEBT-1. [file:line] ... Source: multiuser-reviewer (FUTURE-HIGH)
### Recommendations (never block)
REC-1. test-strategist: ...
```
Why: `commands/brief.md` line 15 takes a finding id "e.g. HIGH-1, MEDIUM-3" and line 52 fills `{{SEVERITY}}` with "HIGH / MEDIUM / LOW / CRASH / CORRUPT". The current format produces neither a `HIGH-1` id nor a preserved CRASH label. The two new developers will type `HIGH-1` because the docs say so, and brief will fail to locate it.

**3. DEGRADE blocks ship on line 28 and does not on line 35** (lines 28 and 35)
Current: line 28 "DEGRADE: from breaker agent, equivalent to MEDIUM"; line 35 "SHIP: Zero HIGH/MEDIUM/CRASH/CORRUPT findings".
Proposed: after suggestion 1 the verdict reads on normalized tiers only: "SHIP: zero HIGH and zero MEDIUM after normalization." Delete the raw label list from line 35.
Why: as written a DEGRADE finding is both a MEDIUM and not a blocker. `relay.md` line 77 has the same omission and should be fixed in the same commit.

**4. The output has no home for what decisions 1, 5 and Round 2 need, and no attribution header** (lines 39 to 64)
Current: sections Fix List, Conflicts Resolved, Coverage Gaps, Ship Verdict.
Proposed: add a header block and five sections. Header, first thing in the file:
```
---
title: Synthesis, round <N>, <audit folder>
author: Claude Opus (synthesis agent)
date: <YYYY-MM-DD>
status: agent output, not yet deliberated
---
scope: <scope>
agents expected: <list>   agents received: <list>   agents missing: <list or none>
changed files in fence: <N>
```
New sections, after Conflicts Resolved:
```
## Round 1 status (round 2 and later only)
| Round 1 id | resolved / not resolved / regressed | evidence file:line |

## Re-tiered
- <id> was <agent> <label>: now <tier> because <one reason>

## Dismissed by synthesis
- <agent> [<label>] file:line: <what the cited code actually shows>

## Fence
- Files synthesis read: <list>
- Reviewer reads outside the changed-file list: <agent: file> or "none reported" or "agent reports carry no read list"

## Counts
HIGH <n>, MEDIUM <n>, LOW <n>, DEBT <n>, REC <n>

## Ship Verdict: SHIP | FIX THEN SHIP | ESCALATE
<one line>
Ledger: <date> <audit folder> round <N> synthesis <verdict> H<n> M<n> L<n>
```
Why: `AGENTS.md` lines 10 to 24 make the attribution header a hard rule for any file an agent writes into a repo; synthesis.md has none. `dispatch.md` line 130 reads the agent list "from synthesis.md if it recorded the agent list"; it never does. `dispatch.md` line 139 asks Round 2 agents to verify Round 1 HIGH/MEDIUM are resolved, and the Round 2 synthesis has nowhere to tabulate that. Decision 1 makes synthesis the fence reporter; decision 5 wants one ledger line per command, and emitting it here means the orchestrator copies instead of composing. `review.md` line 111 says a failed agent is noted "in the synthesis step" and the prompt has no line for it. The Counts block lets `review.md` step 8 copy rather than recount.

**5. Verification only fires on a contradiction, so an unopposed wrong HIGH goes straight to the fix list** (line 12)
Current: "If two agents contradict each other about the same code, read the actual file to determine who is correct."
Proposed:
```
**Skeptical verification:** For every finding that lands in HIGH or MEDIUM, open the cited file:line
and confirm the line contains what the finding describes. Trace the path the agent claims, not the
one you expect. If the citation is wrong or the mechanism is not there, move the finding to
"Dismissed by synthesis" with what the code actually shows. Do not fix the citation silently.
When two agents contradict each other, the file decides, not the higher severity. If both are wrong,
dismiss both.
Fence: you may read the changed files and any file a reviewer cites by path. Nothing else. List
every file you opened under "Fence".
```
Why: `REVIEW.md` line 28 says synthesis "resolves conflicts by reading the file", and the current text does that, but a single agent's unverified HIGH has no check at all and becomes a brief. The dismissal section keeps the drop visible; a silent drop is worse than a duplicate. The fence sentence is the hook decision 1 needs.

**6. "Pick the better fix" puts a Phase 2 decision inside Phase 1** (line 19)
Current: "Agent A says 'rename this' and Agent B says 'delete it': read the code, pick the better fix, state why in one sentence"
Proposed: "Two kinds of disagreement. Fact: is the defect real, which line, what mechanism. Read the code and settle it; record under Conflicts Resolved. Fix: rename vs delete, guard vs restructure. Do not settle it. List both options with one line each and a recommendation; the human decides in deliberation. Escalate a fact dispute only when reading the code cannot settle it (intent or design question)."
Why: `relay.md` lines 29 to 42 put the cause-vs-symptom decision in the human deliberation pause on purpose. A synthesis that already chose "delete" biases the brief before the human reads it. This also gives ESCALATE a definition, which line 37 lacks (see 7).

**7. ESCALATE has no trigger a reader can apply** (lines 34 to 37)
Current: "ESCALATE: Findings are ambiguous or agents fundamentally disagree: needs human judgment"
Proposed:
```
Decide mechanically, in this order:
1. ESCALATE if any HIGH or MEDIUM finding is in an unresolved fact dispute, or a HIGH citation
   failed verification and you cannot tell whether the defect exists elsewhere.
2. FIX THEN SHIP if any HIGH or MEDIUM remains. Name the ids that block.
3. SHIP otherwise.
```
Why: "ambiguous" is not checkable and two developers new to review will read it differently. Ordering the rules removes the case where both ESCALATE and FIX THEN SHIP apply.

**8. Coverage check names no method and cannot be done with the inputs synthesis receives** (line 21, lines 59 to 60)
Current: "Check if any changed file was missed by all agents: flag the gap" and "[file] was not reviewed by any agent (if applicable)".
Proposed:
```
4. **Coverage:** For every file in the pasted changed-file list, look for it in each report's findings
   and in its Checked and Clean list. Present in neither: "not covered". Present only in a report that
   has no Checked and Clean section: "coverage unknown". Say which, per file. Also list agents that
   were expected for the scope and returned no report.
```
Why: `review.md` step 6 passes synthesis only the report paths, so today it has no changed-file list to check against; decision 1 pastes one, and the prompt should say what to do with it. format-reviewer and security-reviewer end with "No Issues" and no Checked list, so "not flagged" and "not read" are indistinguishable for them. Silent under-coverage is the one unacceptable direction (`REVIEW.md` line 62 makes the same point for test selection).

**9. Frontmatter denies Write but review.md tells synthesis to write the file** (lines 4 to 5)
Current: "tools: Read, Grep, Glob"
Proposed: either add `Write` and state "Write exactly one file, `<AUDIT_DIR>/synthesis.md`, nothing else", or keep read-only and add a line "You return the report as your final message. The orchestrator writes it to `<AUDIT_DIR>/synthesis.md`." Add one line under the frontmatter: "Claude Code mechanism: `tools:` and `model:` are read by the Claude Code plugin loader. On another runtime the adapter must grant read-only file access and Opus-class reasoning."
Why: `review.md` line 80 says "Instruction: write to <AUDIT_DIR>/synthesis.md" while the tool list forbids it. consolidator.md line 12 resolves the same tension explicitly ("the orchestrator writes to disk"); synthesis should pick one. The runtime note is the hook decision 6 asks for.

**10. Hardcoded agent list will be wrong after decision 4** (line 10)
Current: "reports from multiple review agents (format, bugs, integration, security, multiuser, breaker)"
Proposed: "You receive every report in `<AUDIT_DIR>/agents/` for this round. Which agents ran depends on scope; do not assume a fixed set. Reports with no severity labels (pipe-connector maps, known-bugchecker's Patterns Checked count) contribute to Coverage and LOW only."
Why: the list already omits known-bugchecker and perf-reviewer, both of which run in `standard`. Decision 4 adds four more. A reader who trusts the list will not know what to do with a KNOWN-HIGH or a pipe-connector Anomalies section.

**11. Define what counts as a duplicate** (line 18)
Current: "Same issue flagged by two agents: one entry, credit the more specific description"
Proposed: "Duplicate means same file, overlapping lines, same mechanism. Same line for a different mechanism (perf: allocation; bugs: leak) is two findings. Keep the most specific text, list every agent that flagged it, and keep the highest normalized tier among them only if the code supports it."
Why: without a rule the agent will either merge unrelated findings on a hot line or keep near-identical ones. Confirmed-by-two is a real signal for the human and should not be lost in the merge.

**12. Dashes throughout violate the owner's voice rule** (lines 1, 12, 19, 25 to 30, 37, 45, 48, 51, 54)
Current: em dashes in the prompt body and inside the output template.
Proposed: replace each with a colon or period. In the template, "from Agent X" becomes "Source: Agent X".
Why: `~/.claude/CLAUDE.md` bans em and en dashes in all writing. The template is copied verbatim into every synthesis.md, so the ban is violated on every run, not once.

**13. Numbered "tiers" 1 to 6 where 2 equals 1 and 4 equals 3** (lines 23 to 30)
Current: "1. HIGH ... 2. CRASH/CORRUPT ... equivalent to HIGH ... 3. MEDIUM ... 4. DEGRADE ... equivalent to MEDIUM"
Proposed: delete; suggestion 1's table replaces it.
Why: a numbered list reads as a ranking. Six numbers for four ranks is the kind of thing a new reader spends a minute decoding.

**14. Say what "shipping" means** (lines 25, 34)
Current: "Must fix before shipping"
Proposed: "Must fix before merge to the base branch."
Why: the two intended readers have never used a pull request. "Ship" is jargon; "merge to base" is the concrete gate decision 1 sets up.

**Keep** (line 3): the description. Accurate, short, says when to run.

**Keep** (lines 14 to 21): the four-verb role list. The structure is right; suggestions 5, 6, 8 and 11 sharpen the verbs, they do not replace the list.

**Keep** (lines 32 to 37): the three verdict names and one-line verdict shape. They match `relay.md` and `REVIEW.md` and are what the commands parse.

**Overlap**: none found. No reviewer prompt produces a fix list or verdict. `brief.md` line 102 re-checks for two findings sharing one fix, which is a backstop for synthesis dedup, not a duplicate of it.

**Length**: 64 lines is not the problem. The file needs about 40 more lines (table, sections, verification clause), not fewer.

Keep 3 / change 12 / delete 1 (the tier list, folded into the table).
Most important change: suggestion 1, one normalized severity scale with a table for every agent label, so a security "unprofessional comment" MEDIUM or a gap-hunter Tier 1 idea can no longer trigger FIX THEN SHIP.
Second: suggestion 2, per-tier ids (HIGH-1) so `/djinn:brief` can find the finding it is told to open.
