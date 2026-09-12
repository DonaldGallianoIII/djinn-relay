---
title: Prompt review of gap-hunter.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/gap-hunter.md` (90 lines).
Read alongside: `plugins/djinn/relay.md`, `plugins/djinn/commands/review.md`,
`~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`, and a
skim of the other 16 agent prompts for overlap.

Context that shapes several findings: gap-hunter runs in two scopes.
In `ideas` it is standalone and synthesis is skipped (review.md line 19, 84).
In `full` it runs beside the critic agents and its report lands in
`agents/`, where synthesis reads "all agent reports" (review.md line 15, 78).
The prompt was written for the first case and breaks in the second.

**1. Tier-to-HIGH mapping turns an idea into a ship blocker** (line 62 to 66, and 70 to 90)
Current: "Tier 1 ideas map to HIGH (would have caught the bug). Tier 2 ideas map to MEDIUM"
Proposed: Replace the Severity section with:
"Ideas are not defects. Tag every Tier 1 item `[GAP-HIGH]`, Tier 2 `[GAP-MEDIUM]`, Tier 3 `[GAP-LOW]`. Synthesis lists GAP items under Architectural Debt; they never block SHIP." Put the tag in the heading of the output format: `### [GAP-HIGH] idea name`.
Why: relay.md line 77 and synthesis.md line 35 define SHIP as zero HIGH/MEDIUM. In `full` scope a missing metric becomes FIX THEN SHIP, and Round 2 (relay.md line 69) then tries to "verify each Round 1 HIGH is resolved" against an idea. The current output format also carries no severity token at all, so synthesis cannot pick up the mapping mechanically; it lives only in prose. synthesis.md line 10 does not list gap-hunter as an input, so this needs a hook there too.

**2. No verification clause; nothing stops the agent proposing what already exists** (line 8 to 12, 44 to 47, 56)
Current: "Restate what's already there with approving language" (as a prohibition only)
Proposed: Add under Shared Context:
"**Skeptical verification:** Before proposing X, grep for X. If it exists, drop the idea or cite the file:line and say in one sentence why the existing one is insufficient. Every Tier 1 and Tier 2 **How** names the file and function where the addition goes."
Add an output section after Tier 3: `## Already present` listing ideas you considered and found in the code, with file:line.
Why: every other reviewer prompt carries a verification clause (bugs-reviewer line 12, integration-reviewer line 12, synthesis line 12); REVIEW.md line 20 to 22 makes it a rule. The gap-hunter failure mode is the mirror image of a false positive: a confident "add a teardown log" when one is already at `dispose():112`. Without a file anchor the two workplace developers cannot check the claim.

**3. Tier 1 is undefined when the project has no bug index** (line 10, 26, 36)
Current: "The bugs_to_avoid index is your ground truth."
Proposed: Replace line 10's index sentence and line 26 with:
"Your ground truth is the **anchor**: the bug, incident, or pain point that triggered this run, pasted into your dispatch. If the project has a known-bugs index (path from project config; REVIEW.md calls it `code/KNOWN-BUGS.md`), read it as a second source. If neither exists, say so in the first line of the report and use commit messages and audit history as the retrospective. Every Tier 1 item names the anchor or the index entry it would have caught."
Also open the report with a one-line header: `Anchor: <bug or 'none supplied'>`.
Why: line 3 and relay.md line 116 say the trigger is "after a debugging session", but the dispatch prompt in review.md line 63 to 69 never passes the debugging session in; the agent only gets a diff. Decision 2 moves index paths to config and the workplace project has no index yet, so "would have caught the actual bug" has nothing to bind to. The header line also gives decision 5's ledger something to lift.

**4. "One layer below, one layer above" reads outside the fence with no accounting** (line 10, 24)
Current: "Most code gets stuck at its own layer. The gaps live at the adjacent layers."
Proposed: Keep the thinking step. Add to Shared Context: "The changed-file list in your dispatch is the fence. You may read files the changed files import or that import them, to see the adjacent layers. List every file you read outside the changed set under `## Files read outside the fence` at the end of the report."
Why: decision 1 makes the changed-file list a hard fence and has synthesis report out-of-fence reads. Gap-hunter cannot find what is missing from the diff alone, so it needs the same one-hop allowance bugs-reviewer line 10 already has, stated out loud, plus a section synthesis can read mechanically. Silent divergence is the thing to avoid.

**5. Three overlaps with agents that will now be wired in** (line 3, 28, 58)
Current: line 3 "gaps in instrumentation, error handling, user feedback, and system design"; line 58 "suggest things: fields, columns, metrics, hooks, tests"; line 28 "instrumented, handled, and tested"
Proposed: line 3 becomes "gaps in instrumentation, lifecycle handling (cold start, teardown), and recorded data". Drop "tests" from line 58 and "and tested" from line 28. Add to What You Do Not Do:
"- Propose tests (test-strategist) or error-message wording and progress output (ux-reviewer). If a gap is one of those, one line naming the other agent, no more."
Why: test-strategist line 141 defines HIGH as "would have caught a shipped bug", the same test as gap-hunter Tier 1, and its Half 2 covers manual checks; ux-reviewer Category 3 and 4 own error ergonomics and observability ergonomics; bugs-reviewer line 23 owns "error handling gaps" as defects. Decision 4 wires those agents into scopes, so in `full` the same finding will land twice under different labels.

**6. Tier 2 minimum forces padding** (line 38)
Current: "3-6 items."
Proposed: "0 to 6 items. An empty tier is a valid result; say 'none' rather than fill it."
Why: line 59 forbids padding Tier 1 but the Tier 2 floor demands it. A hard minimum on a quality-gated list produces decoration, the thing line 26 says to cut.

**7. "Forget what's in front of you" will be read as "skip the code"** (line 22)
Current: "Forget what's in front of you. What problem is this actually solving?"
Proposed: "After reading the changed code, set it aside. State the problem it solves in one sentence, then list what you would want in hand if solving it from scratch. Anything on your list that is not in the code is a candidate gap."
Why: a reviewer new to the relay will take the sentence literally, and it sits twelve lines under "Read every changed file." The rewrite keeps the technique and removes the contradiction.

**8. Heading does not match its body** (line 28)
Current: "**4. Entry cost vs steady state.** Any system has three phases: cold start, active, teardown."
Proposed: "**4. Three phases.** Cold start, active, teardown. Check which of the three is instrumented and handled. One of them usually isn't."
Why: "entry cost" and "steady state" name two things; the body names three and neither term. A newcomer will hunt for the missing concept.

**9. "Exactly one metric" lists three, and one of them invites feature ideation** (line 18)
Current: "would this idea have caught a real bug, shipped a real feature, or unblocked a real debugging session"
Proposed: "would this have shortened a real debugging session, past or next? If not, cut it."
Why: "shipped a real feature" points the agent at product scope, which is not review work and has no ground truth in a diff. One test, stated once, matches the retrospective test at line 26.

**10. Claude-only naming for the Codex run** (line 1 to 6, line 10)
Current: "Read the project's CLAUDE.md for architecture context."
Proposed: "Read the project's architecture notes (the file named in the project config; CLAUDE.md under Claude Code)." Leave the frontmatter alone but note in the review brief that `name / description / tools / model` is Claude Code agent frontmatter and is the adapter's job, per decision 6.
Why: decision 6 asks prompts to say when they lean on a Claude-only mechanism. This prompt has only these two, both cheap to name.

**11. Em dashes in the output template propagate into every audit report** (line 22 to 30, 36 to 40, 45 to 47, 51, 71, 78, 84)
Current: the tier headings and the What/Why/How labels use the em dash character as a separator
Proposed: colons. `## Tier 1: Would have caught the bug`, `**What:** ...` (the bold labels already use colons at line 73 to 75; make line 45 to 47 match).
Why: the owner's voice rule bans em dashes in all writing. Lines 71, 78 and 84 are a template the agent copies verbatim into `audits/`, so the violation is reproduced on every run.

**12. Keep** (line 14 to 18 Role, line 24 and 30 thinking steps 2 and 5, line 51 The One Question, line 53 to 60 What You Do Not Do, line 4 to 5 tools and model)
Verdict: keep. Role states the question in one line. Steps 2 and 5 are the two techniques the critic agents do not have. The One Question is the best section in the file: one runnable check, tools already present. Tools are read-only, which satisfies REVIEW.md's hardware budget; `model: opus` satisfies decision 3.

Length: 90 lines is right. Nothing to delete outright; item 5 removes three words and item 9 removes a clause. The file stays project-agnostic already (no Babylon, no hardcoded paths), which is better than most of its siblings.

---

Keep 5 sections / change 11 items / delete 0 sections.
Most important change: item 1, retag tiers as GAP-HIGH/MEDIUM/LOW in the headings and route them to the non-blocking bucket, so an idea in `full` scope cannot flip the ship verdict.
Second: item 2, add grep-before-propose with file:line anchors and an "Already present" section.
