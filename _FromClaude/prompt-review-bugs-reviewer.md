---
title: Prompt review of bugs-reviewer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/bugs-reviewer.md` (51 lines).
Read alongside: `relay.md`, `commands/review.md`, `commands/dispatch.md`,
`commands/brief.md`, `~/Conventions/workflow/REVIEW.md`,
`~/Conventions/workflow/AGENTS.md`, and the other agent prompts for overlap.

The prompt is short and the Role section is the best line in it. The problems
are structural: it reads beyond the fence with no way to report that, its
Scope list is the GameEngine known-bug index restated, and its output cannot
be tied back to a finding in Round 2.

**1. The read-beyond-changed-files instruction has no fence hook** (line 10)
Current: "Read every changed file in full, plus any files they directly interact with (imports, callers)."
Proposed: "The dispatch pastes the changed-file list. That list is the fence. Read every file on it in full. You may open a file off the list only to confirm a caller or an import you need for a trace, and every such file goes in the `Files read outside the fence` section of your report with the reason. No entry there means you read nothing else."
Why: Decision 1 says synthesis reports any file a reviewer read outside the fence, and this prompt gives the agent nothing to report with. REVIEW.md permits reading "the files it touches," so the read stays allowed; it just has to be declared. Without the declaration, synthesis cannot tell a covered file from a wandered-into one.

**2. Scope is the GameEngine bug index restated, and it collides with three other agents** (lines 18 to 26)
Current: seven bullets, including "Per-frame allocations", "guard flags not reset in finally blocks", "user input during restore", "event listeners not removed", "Any pattern listed in `bugs_to_avoid.md`".
Proposed: replace with:
"# Scope
Defects in the changed code itself:
- Wrong result: logic that returns or stores the wrong value on a path you traced
- Corruption: state left inconsistent after an error, an early return, or a partial write
- Leaks: references or handles that outlive the object that owned them; growth with no bound
- Races: an async completion that lands after the state it assumed has changed
- Desync: two structures that must agree and a path where only one is updated
- Missed error paths: a throw that skips cleanup, a rejected promise nobody awaits
Project-specific patterns come from the known-bugs index the dispatch names. Do not re-report anything known-bugchecker already flagged; cite the index entry name if you find a new instance.

# Not your job
- Cost of correct code (per-frame allocation, GPU, hot paths): perf-reviewer
- Ripple into other files (callers, UI sync, disposal chain, undo stack): integration-reviewer
- Secrets, injection, naming, dead code: security-reviewer
- Constructing hostile inputs: breaker. You trace the paths the code already has."
Why: Line 24 is perf-reviewer's first scope block word for word; in `standard` scope both run and synthesis gets the finding twice. Lines 22, 23, and the listener half of 20 are known-bugchecker's patterns 3, 5, and 7, and review.md line 66 already tells this agent to "focus on issues it did not catch." Decision 2 moves project specifics (splat maps, restore guards, render loops) to config; the bullets above are the same categories without the engine vocabulary. security-reviewer and format-reviewer each carry a "NOT your job" section pointing at "Bugs agent"; this prompt points back at nobody.

**3. Skeptical verification has no output field to land in** (line 12 and lines 39 to 43)
Current: "Before asserting a bug exists, trace the actual code path." and an output block with What / Why / How to trigger / How to fix.
Proposed: add to line 12: "A finding without a trace is not a LOW finding. It is dropped. If a guard stops the failure you were chasing, list the guard under Checked and Clean and move on." Add one field to the finding template, between Why and How to trigger: "**Trace:** the lines you followed, as `file:line` to `file:line`, ending at the line where the defect lands."
Why: breaker.md has a **Trace** field and its verification clause bites because of it. Here the clause is a wish. REVIEW.md phrases the rule as "if a guard stops your attack, say so and move on," and that half is missing entirely.

**4. LOW is defined as the thing line 12 forbids** (lines 30 to 32)
Current: "LOW: Theoretical issue, defensive gap, or edge case requiring unusual conditions" and "HIGH: Will cause crashes, data loss, or security issues under realistic conditions"
Proposed: "HIGH: crash, data loss, or silent corruption on a path a normal user reaches. MEDIUM: wrong behavior a user will see, no data lost. LOW: a confirmed defect that needs unusual timing or input to trigger, with the trigger named. No finding without a traced path at any tier."
Why: "Theoretical issue" at LOW contradicts "Do not flag theoretical issues" at line 12; an agent reading both will file the guesses as LOW. "Security issues" belongs to security-reviewer and pulls this agent into its lane. The three tiers otherwise match integration-reviewer and what synthesis merges.

**5. Findings carry no ID, so Round 2 cannot check them off** (lines 36 to 51)
Current: "### [HIGH] file:line (em dash) description"
Proposed: "### BUG-1 [HIGH] file:line: one-line description" with IDs numbered from 1 in the order written, HIGH first, then MEDIUM, then LOW. Replace the em dash in the header with a colon.
Why: dispatch.md line 138 asks every Round 2 agent to "verify each HIGH/MEDIUM finding from Round 1 synthesis is resolved," and brief.md quotes the agent's finding text into the fix brief. Neither can address a finding that only has a file:line, which moves after the fix lands. The owner's voice rule bans em dashes in all writing, and the header is the one line synthesis will pattern-match on.

**6. No explicit empty-report shape** (lines 36 to 51)
Current: output block starts at "## Findings" and has no clean case.
Proposed: add "If there are no findings, write `## Findings` followed by `None.` and still fill Checked and Clean. An empty Findings section with no `None.` reads as an agent that did not finish."
Why: security-reviewer and format-reviewer both have a "## No Issues" branch. review.md line 108 treats a missing agent as a coverage gap; synthesis needs to tell "found nothing" from "never returned."

**7. Round 2 mode is undocumented in the prompt** (whole file)
Current: no Round 2 section.
Proposed: add after Output format:
"# Round 2
When the dispatch says you are in Round 2, add a section before Findings:
`## Round 1 re-check`, one line per HIGH and MEDIUM from the Round 1 synthesis: `<id>: RESOLVED | STILL OPEN | REGRESSED`, each with the file:line you checked. New defects from the fixes go under Findings as usual."
Why: dispatch.md lines 136 to 145 hand every agent Round 2 instructions in the prompt body, but this file gives the agent no format for the answer, so synthesis gets the re-check in prose. Three fixed words make it mechanical.

**8. Known-bugs index path is project-specific and named two ways** (lines 10 and 26)
Current: "Check for a `bugs_to_avoid.md` in the project's Claude memory directory"
Proposed: "The dispatch names the project's known-bugs index path (from the per-project config). Read its index; open a detail entry only when a changed file plausibly matches it."
Why: Decision 2. REVIEW.md calls the index `code/KNOWN-BUGS.md`; the plugin calls it `bugs_to_avoid.md` in a Claude memory directory. The prompt should name neither and take the path from config so Codex and Claude read the same file.

**9. Reports need the attribution header** (lines 34 to 51)
Current: report body starts at "## Findings".
Proposed: "Start the report with:
---
title: bugs-reviewer report, <audit folder name>
author: Claude Opus (bugs-reviewer)
date: <YYYY-MM-DD>
status: unreviewed agent output
---"
Why: AGENTS.md: "Any file an agent writes into a repo carries an attribution header naming the model." Reports land in `audits/` inside the repo. Decision 5's ledger line will want the same author and date fields.

**10. Say which parts are Claude-only** (lines 1 to 6)
Current: frontmatter with `tools`, `model`, and `name`.
Proposed: add a comment under the frontmatter: "The frontmatter above is Claude Code agent metadata. The body assumes the dispatch prompt pastes: the changed-file list, the known-bugs index path, the report output path, and (Round 2) the Round 1 synthesis path. An adapter for another runner must supply those four."
Why: Decision 6. The body is portable; the four pasted inputs are the contract an adapter has to honor, and nothing in the file says so today.

**11. Description line duplicates known-bugchecker's job** (line 3)
Current: "Find bugs, memory leaks, data leaks, race conditions, and known bad patterns in code changes."
Proposed: "Find confirmed defects in changed code: wrong results, corruption, leaks, races, desync. Traces every finding to a line."
Why: "known bad patterns" is known-bugchecker's description. The description is what the orchestrator matches on when picking agents, so overlap here becomes overlap in dispatch.

**12. "How to trigger" should be reproducible by someone who did not write the code** (line 42)
Current: "**How to trigger:** The specific user action or code path"
Proposed: "**How to trigger:** the user action or call sequence, written so a developer who has not read the diff can reproduce it. Quote the line that fails."
Why: The two developers at the owner's workplace have never worked from a review finding. "Code path" is enough for the author and not enough for them.

**13. Keep: Role** (lines 14 to 16)
Verdict: keep as written. Three sentences, no ambiguity, and it is the line that stops this agent from drifting into security-reviewer's quality review.

**14. Keep: Checked and Clean** (lines 49 to 50)
Verdict: keep, with one addition from suggestion 3: each entry names the guard or invariant that holds, not just the file. "Verified dispose path in Foo.ts" is a claim; "Foo.dispose() removes the listener added at Foo.ts:41" is a check.

**15. Keep: tools and model** (lines 4 to 5)
Verdict: keep. Read, Grep, Glob only, Opus. Matches decision 3 and the REVIEW.md hardware budget rule for read-only parallel reviewers.

---

Keep 3 / change 11 / delete 1 (line 24, per-frame allocations, folded into the Not-your-job pointer to perf-reviewer).
Most important change: suggestion 1, make the pasted changed-file list the fence and add a `Files read outside the fence` section so synthesis can report on it.
Second: suggestion 2, replace the engine-specific Scope with project-agnostic categories and a Not-your-job section, which removes the double-reporting with perf-reviewer and known-bugchecker.
