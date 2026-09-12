---
title: Prompt review of breaker.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

Reviewed: `plugins/djinn/agents/breaker.md` (67 lines). Read alongside
`plugins/djinn/relay.md`, `~/Conventions/workflow/REVIEW.md`,
`~/Conventions/workflow/AGENTS.md`, and skimmed `bugs-reviewer.md`,
`perf-reviewer.md`, `integration-reviewer.md`, `security-reviewer.md`,
`synthesis.md`, and `commands/review.md` for overlap and consumption.

The prompt is short and mostly earns its length. The role framing is the
best in the agents folder. The problems are at the edges: it has no fence
hook, two of its three severity tiers have no realism test, it overlaps
three sibling agents on the same defect class, and its "Unbreakable" clause
pushes the model toward inventing findings.

**1. Line 10 invites reads outside the fence and gives synthesis nothing to check** (line 10)
Current: "Read the project's CLAUDE.md for architecture. Read every changed file in full, plus the systems they interact with."
Proposed: "Your dispatch contains the changed-file list and the project config. That list is the fence. Read every fenced file in full. You may open a file outside the fence only to follow a call path that starts in a fenced file, and every such file goes in the `## Files read` section of your report with the fenced line that led you there."
Why: "The systems they interact with" is unbounded and is exactly the read that decision 1 says synthesis must report. "Project's CLAUDE.md" is Claude-only wording (decision 6) and project-specific (decision 2); the config comes in the dispatch now. Without a `Files read` section synthesis cannot do its coverage check (synthesis.md line 21) or its out-of-fence report.

**2. CORRUPT and DEGRADE have no realism test, and the prompt never says DEGRADE blocks ship** (lines 40 to 44)
Current: "CRASH: Will throw an unhandled exception under realistic conditions / CORRUPT: Will silently corrupt state... / DEGRADE: Will cause performance degradation or resource leak under stress"
Proposed: Add above the tiers: "Every finding needs a `Reachable via:` line naming the user action, file input, network message, or public API call that produces the attack input without editing code. If no such path exists, it is not a finding; put it under Defended with the reason 'no caller can produce this input'. Synthesis maps CRASH and CORRUPT to HIGH and DEGRADE to MEDIUM; all three block ship."
Why: A fuzzer told to "try harder" (line 66) will pass NaN to a private method nobody calls with NaN. Only CRASH carries "under realistic conditions" today; CORRUPT and DEGRADE carry nothing. The breaker also has no LOW tier, so an unreachable attack has nowhere to go but a ship-blocking tier. The mapping lives only in synthesis.md lines 26 and 28; the breaker should know its DEGRADE is a MEDIUM, not a note.

**3. Three attack vectors duplicate bugs, perf, and integration; add a partition rule** (lines 25 to 30, new section after 30)
Current: Timing attacks (line 26), Resource exhaustion (line 28), Reentrancy (line 29) with no ownership boundary.
Proposed: New section "# Not your job": "A defect that fires on the happy path with ordinary input belongs to bugs-reviewer (leaks, races), perf-reviewer (unbounded growth in hot paths), or integration-reviewer (dispose chain). Yours is the defect that needs your attack input or sequence to appear. If you find a happy-path bug on the way, one line under `## Handed off`, no trace."
Why: In `full` scope all four agents run. "A Map that never gets cleared" (line 28) is also bugs-reviewer line 20 and perf-reviewer line 39; "dispose called twice" (line 29) is integration-reviewer line 24 and bugs-reviewer line 22. Synthesis dedupes, but the same defect arrives as HIGH from bugs and DEGRADE (MEDIUM) from breaker, which is a severity conflict synthesis then has to read the file to resolve. security-reviewer line 36 already has this pattern; copy it.

**4. Delete the "Unbreakable" clause; replace with a verifiable empty result** (lines 65 to 66)
Current: "## Unbreakable / (only if you genuinely exhausted all vectors, try harder first)"
Proposed: Replace with: "## No attacks found / List each of the six vectors and, for each, the entry points you tried it against (file:line). An empty Attacks section with a full Defended section is a valid result."
Why: "Try harder first" is pressure to produce a finding, which is the opposite of the skeptical clause on line 12. It also invites more reading (scope creep). A per-vector, per-entry-point list is something synthesis and a human can check; "genuinely exhausted" is not.

**5. Trace and Defended claims must cite line numbers or they are unverifiable** (lines 54, 63)
Current: "**Trace:** What happens step by step through the actual code" and "list attack vectors that were properly guarded, with WHY the guard works"
Proposed: "**Trace:** Each step cites file:line. Stop at the first line where the invariant breaks." and "Defended: one line per guard: vector, guard file:line, why it holds for this input."
Why: The skeptical clause on line 12 says trace the real path, but the output template does not force the evidence onto the page. A trace without line numbers cannot be checked by synthesis, by the fixer, or by the two developers reading the report who have never seen this codebase.

**6. Move engine-specific vectors and the description's system list into per-project config** (lines 3, 25 to 30)
Current: "two pointer events fire in the same frame", "typed arrays with mismatched lengths", "off-by-one on grid edges", "Toggle mode during save? Undo during restore?", "dispose() is called during an await", "HMR".
Proposed: Keep the six vector names with one generic example each (empty collection, null where a value is expected, interrupted async, repeated call during an in-progress operation, unbounded growth, first and last element). Add: "The project config may list additional vectors and named critical systems. Read them after these." Drop "HMR" from line 3.
Why: Decision 2. Pointer events, grid edges, undo/restore, HMR, and dispose() are GameEngine and Vite vocabulary. A Python service or a Discord bot has none of them and the model will either skip the vector or hallucinate one.

**7. The description says when to invoke; the scope table disagrees** (line 3)
Current: "Invoke on critical systems... save/load, auth, state management, IO, HMR."
Proposed: "Adversarial agent. Constructs worst-case inputs, interruption sequences, and state-corruption sequences against the changed code and reports only attacks it traced. Runs in `full` and `perf` scopes."
Why: relay.md line 98 and commands/review.md line 18 put the breaker in `perf` (hot-path changes), which line 3 does not mention, and `critical system` is reached only through `full` (relay.md line 112). In Claude Code the description drives automatic subagent selection, so a description that names systems the scope table does not route by is a second, silent routing rule. Codex may not read the description at all (decision 6), so the body, not the frontmatter, should carry anything load-bearing.

**8. Define "entry point" and say what to do with changed code that is not a method** (line 34)
Current: "For each public method or entry point in the changed code:"
Proposed: "For each function or method whose body changed in the diff, plus each exported function that calls one of them:"
Why: "Public" is undefined in Python and TypeScript modules, and "entry point" has no definition in the prompt. Tying the loop to the diff also keeps the method inside the fence from suggestion 1.

**9. The Result field and the CORRUPT tier both assume a crash; wrong output falls through** (lines 43, 55)
Current: "CORRUPT: Will silently corrupt state, leading to wrong behavior later" and "**Result:** The crash/error the user sees"
Proposed: "CORRUPT: Will silently produce wrong state or wrong output (NaN in a saved file, a stale value shown as current)" and "**Result:** What the user observes: exception text, wrong value, memory growth over N operations."
Why: Line 19 asks the breaker to produce "nonsensical output", but a NaN that reaches the screen without corrupting stored state matches none of the three tiers. Line 55 as written does not fit CORRUPT or DEGRADE findings at all.

**10. Small consistency items for mechanical consumption** (lines 49, 51)
Current: "## Attacks" and the heading separator "### [CRASH] file:line (em dash) title"
Proposed: Keep the `### [SEVERITY] file:line` heading shape; it matches every other agent and is what a parser should key on. Rename "## Attacks" to "## Findings" only if synthesis keys on section names; otherwise keep. The em dash separator appears in every agent's heading template and in the owner's banned list; whatever replaces it (": " is the obvious choice) should change in all agents in one commit, not here alone.
Why: Cross-agent consistency matters more than any single template. Flagging, not proposing a lone change.

**11. Frontmatter is a Claude Code mechanism** (lines 1 to 6)
Current: `tools: Read, Grep, Glob` / `model: opus`
Proposed: Keep. Note once, at plugin level, that the frontmatter (tool names, model field) is Claude Code subagent metadata and the Codex adapter maps it to read-only tools and its Opus-equivalent.
Why: Decision 6 asks for Claude-only mechanisms to be named. This is one, but it is shared by every agent, so it belongs in the adapter, not in eleven prompts. `model: opus` matches decision 3.

**12. Keep: Role section** (lines 14 to 21)
Current: "You are NOT a reviewer. You are an attacker..."
Proposed: Keep as is. Remove the trailing space on line 18 if touched.
Why: This is the sharpest role statement in the folder and REVIEW.md line 24 quotes it back ("an attacker, not a reviewer"). It is the reason a second agent with the same vectors as bugs-reviewer earns its cost.

**13. Keep: skeptical verification clause** (line 12)
Current: "Before claiming an attack works, trace the actual code path with the attack input..."
Proposed: Keep. The last sentence duplicates line 38; either is fine, one is enough.
Why: Matches REVIEW.md lines 21 to 22 almost verbatim. Suggestions 2 and 5 give it teeth; the clause itself is right.

**14. Keep: Attack, Why it works, Fix fields** (lines 52, 53, 56)
Current: as written.
Proposed: Keep.
Why: "Why it works" forces the invariant, which is what the fixer brief's WHY field (relay.md line 41) needs. "Fix" as a concrete defensive change is what `/djinn:brief` pre-fills from.

Keep 4 (role, skeptical clause, core finding fields, frontmatter), change 9, delete 1 (the "Unbreakable" clause, replaced).
Most important change: suggestion 1, the fence hook. Line 10 currently tells the breaker to read "the systems they interact with" and gives synthesis no `Files read` section, so the one agent told to roam is the one whose roaming cannot be reported.
Second: suggestion 2, `Reachable via:` on every finding, because without it the breaker's only tiers are ship-blocking and "try harder" fills them.
