---
title: Prompt review of devils-advocate.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File under review: `~/djinn-relay/plugins/djinn/agents/devils-advocate.md` (160 lines).
Read alongside: `plugins/djinn/relay.md`, `plugins/djinn/commands/review.md`, `plugins/djinn/agents/synthesis.md`, `test-strategist.md`, `bugs-reviewer.md`, `breaker.md`, `integration-reviewer.md`, `perf-reviewer.md`, `gap-hunter.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`.

**1. Project-specific anecdotes and examples must move to per-project config** (lines 13, 15, 29, 37 to 40, 90 to 93, 120 to 122)
Current: `harness/src/djinn_harness/trainer/train.py:22` claimed "collect_rollout and update are jitted"; "the djinn harness H-1..H-6 phases"; "JAX that isn't JITed"; "does the benchmark `jax.block_until_ready`"; "mypy --strict"; "Verified on CPU when the target platform is GPU"; severity examples citing `block_until_ready`, `jax_log_compiles`, `train.py:22`.
Proposed: Replace every djinn, JAX, and mypy reference with a generic form plus one config hook. Line 13 becomes: "CLAUDE.md, docstrings, and commit messages are claims, not facts. The project config lists past cases where a claim survived review while being false; read that list first." Line 29 becomes: "The project config carries the incident that justifies this agent. Read it. Your job is to be the agent that would have checked." Category 1 bullets become framework-neutral: "Accelerator or compiler decorator claimed but absent on the hot path"; "Parallel primitive called but the inner function serializes"; "Async signature whose awaits block"; "Type hints present but `Any` at every boundary and the checker never run." Severity examples at 120 to 122 become: HIGH "benchmark never waits for completion, so the throughput gate passes on a broken refactor"; MEDIUM "test captures the wrong stream, so the event count is always zero"; LOW "docstring claims an optimization the code does not have."
Why: Decision 2 says prompts become project-agnostic. Six of the seven concrete examples in this file are JAX or djinn-harness specific and will read as noise, or as false leads, on a TypeScript or voice-bot repo. The severity tier definitions themselves are good and should stay; only the examples change.

**2. Finding header is not in the shape synthesis consumes** (lines 135, 142, 144)
Current: `### [HIGH — SABOTAGES THE GOAL] <file:line or plan section>`
Proposed: `### [HIGH] file:line - one-line description` (plain hyphen separator; same for `[MEDIUM]`, `[LOW]`). Keep the tier names "sabotages the goal / false confidence / claim rot" in the Severity section only. Replace "or plan section" with: "A plan document is a file; cite it as `docs/plan.md:41`, never as a section name."
Why: synthesis.md line 45 expects `[file:line] Description` and dedupes across agents on that shape. Every other reviewer (bugs, perf, integration, security, known-bugchecker) uses the shape `[SEVERITY] file:line <separator> description`. Those templates separate with an em dash, which breaks the owner's voice rule; whichever separator the directory settles on (I propose a plain hyphen), this agent should use the same one so synthesis parses all reports with one rule. A bracketed label with a suffix and a header with no description forces synthesis to parse this one agent differently, and "plan section" gives it nothing to dedupe on.

**3. Report lacks the mandatory attribution header and the fence-read list** (lines 132 to 151)
Current: output starts at `## Devils-advocate findings`; no frontmatter; no list of files read.
Proposed: Prepend the AGENTS.md header (`title`, `author: Claude Opus (devils-advocate)`, `date`, `status: audit finding, not yet deliberated`). Add a required section after findings: `## Files read outside the changed-file list` with one line per file and a one-clause reason ("goal document", "hot path shared with changed file X"). State: "Empty is a valid entry. Omitting the section is not."
Why: AGENTS.md line 10 makes the attribution header a hard rule for any file an agent writes into a repo, and this report lands at `audits/<run>/agents/devils-advocate.md`. Decision 1 has synthesis report every file a reviewer read outside the fence; this agent reads outside the fence by design (goal doc, adjacent hot paths), so without a self-reported list synthesis can only guess.

**4. Drop Bash from the tool list** (line 4)
Current: `tools: Read, Grep, Glob, Bash`
Proposed: `tools: Read, Grep, Glob`
Why: REVIEW.md line 70: "scope parallel reviewers to read-only tools and run anything that executes code serially." This agent runs in the parallel batch (review.md step 5). Nothing in the prompt needs Bash: line 15 says "find the measurement and check whether it's honest" (reading), line 17 says grep, line 116 says "grep harder." If the agent wants a benchmark re-run, that belongs in "What would catch it," not in its own tool use. Bash here is also how a paranoid agent quietly runs the test suite in parallel with five other agents on Donald's GPU box.

**5. Line 116 licenses false positives; give hunches their own bin instead** (lines 105, 116)
Current: "the cost of a false positive from you is only a bit of the user's time; the cost of a false negative is why this agent exists." and "What other agents would call 'paranoid,' you call 'Tuesday.'"
Proposed: "File a finding only after you have traced the gap to a file:line pair. If you suspect a gap but cannot trace it, put it under `## Unverified suspicions` with the exact check that would settle it. Synthesis does not rank that section; the user reads it." Delete the "Tuesday" line.
Why: REVIEW.md line 21 to 22 requires tracing the real code path before asserting. As written, line 116 tells the agent a wrong finding is cheap, which contradicts line 17 and every other agent's verification clause, and lands untraced claims in the ranked fix list where they cost a brief and a dispatch. A separate section keeps the paranoia (which is the point of the agent) out of the mechanical ranking.

**6. The goal document is required but never supplied; add the fallback to the agent itself** (lines 10 to 15, 155 to 160)
Current: "Always hand this agent the goal document (plan, scope contract, RFC) explicitly. Without it, it degrades into a generic bugs-reviewer." (addressed to orchestrators, inside the agent prompt)
Proposed: Replace the "Invocation tips" section with an "Inputs" block addressed to the agent: "You should receive: the changed-file list, the goal document path, the success criterion, and the list of findings other reviewers already filed. If no goal document was supplied, derive the goal from the commit messages in the reviewed range and the diff itself, write it at the top of your report under `## Goal (inferred)`, and review against that. Do not fall back to generic bug review." Move the orchestrator-facing tips into `commands/review.md` (dispatch template) or the per-project config.
Why: review.md step 5 passes changed files, a summary, and the diff path; no goal document, no success criterion, no other-agent findings (it runs in parallel with them). So the prompt's own precondition is unmet on every dispatch today. Tips addressed to orchestrators inside a file only the agent reads are dead text; the fallback rule is what the agent needs.

**7. Categories 2 and 7 and the "Checks the project should add" section duplicate test-strategist** (lines 43 to 50, 86 to 93, 149 to 150)
Current: "Tests that pass because they're toothless: assert result is not None"; "Tests pass on a n_iters=2 config"; "Benchmark uses a trivial workload"; "## Checks the project should add".
Proposed: Keep Categories 2 and 7 but fence them with one sentence at the top of each: "Only when the weak check is the success signal for THIS change's stated goal. General test-suite weakness belongs to test-strategist." Delete the "Checks the project should add" section; the per-finding "What would catch it" field already carries that content and test-strategist consumes it (test-strategist.md line 155).
Why: test-strategist.md lines 69 to 77 and 124 to 128 ask the identical questions (assertion checks shape not value, 2-iter fixture, benchmark measures queue time, misleading tests). In `full` scope both fire and synthesis gets the same finding twice with different severities (test-strategist MEDIUM "false confidence" vs devils-advocate MEDIUM "false confidence").

**8. Category 8 overlaps integration-reviewer and perf-reviewer; narrow or delete** (lines 95 to 101)
Current: "New feature is correct; existing feature is now slower because they share a hot path." "Test added for new behavior; existing test for old behavior isn't run anymore."
Proposed: Narrow to one bullet: "The change's own success criterion is written so that a regression in adjacent code cannot fail it (for example, the new benchmark only exercises the new path). Blast radius itself belongs to integration-reviewer; hot-path cost belongs to perf-reviewer." Keep the removed-test bullet; drop the other two.
Why: integration-reviewer.md line 10 follows callers and importers; perf-reviewer owns shared hot-path cost. The only piece unique to this agent is the success-criterion blind spot.

**9. Merge overlapping categories: 5 with 6, and Category 4 with Category 1's docstring bullet** (lines 41, 61 to 84)
Current: Category 5 "Fence-post omission" and Category 6 "Instruction over-compliance" both describe "the boundary was drawn so the real fix is excluded." Category 1 bullet 5, all of Category 4, and the LOW tier definition all describe "a claim that does not match the code."
Proposed: One category "The boundary excludes the real fix" (merge 5 and 6, keep the four strongest bullets). One category "Claims that do not match the code" (merge Category 1 bullet 5 and Category 4). Result: five categories instead of eight.
Why: Eight categories with overlapping bullets encourage the agent to file the same gap under two headings. Fewer, sharper categories also help the two new reviewers learn the vocabulary.

**10. Line 10 grants unlimited scope** (line 10)
Current: "Every agent has a narrow technical scope. You don't."
Proposed: "Your dimension is narrow: goal versus execution. Your file scope is the changed-file list, the goal document, and any file you list under `## Files read outside the changed-file list`."
Why: As written it reads as permission to read the whole repository. Decision 1 makes the changed-file list a hard fence with self-reported exceptions; the sentence should say that.

**11. Jargon will be misread by reviewers new to pull requests** (lines 3, 21, 29, 33, 43, 70, 105)
Current: "cosplay", "proxy-hacking", "fence-post omission", "patron saint case", "Tuesday", "H-1..H-6".
Proposed: Rename category headings to plain claims: "Looks right, does nothing", "The check is too weak to fail", "Optimized the proxy, not the goal", "Claims that do not match the code", "The boundary excludes the real fix". Keep "cosplay" once, in Role, with a one-clause gloss: "code that wears the costume of the solution."
Why: The two developers who will read these audit reports have never used a pull request. Category names appear verbatim in findings and in synthesis. Plain names cost nothing and remove a translation step.

**12. Delete lines 23 to 29 after the anecdote moves to config** (lines 23 to 29)
Current: "You exist because: Other reviewers check narrow technical dimensions... The patron saint case of this role: the djinn harness H-1..H-6 phases..."
Proposed: delete. Line 21 already states the role in one sentence; item 1 moves the incident to config.
Why: Seven lines restating line 21. The one load-bearing sentence ("the code implements the spec perfectly and the spec is subtly wrong") already appears at line 14.

**13. Checked and Clean needs evidence per line; zero findings needs to be named as valid** (lines 146 to 147, 160)
Current: "## Checked and Clean - <claims you verified are actually honored by the code>" and (to orchestrators only) "Expect fewer findings than other agents... Don't pad."
Proposed: "## Checked and Clean: one line per claim, as `claim (file:line) holds; evidence (file:line)`." Add to How to report: "Zero findings is a valid report. Do not pad. Fill Checked and Clean instead."
Why: The verification clause at line 17 has no field that records what was grepped, so a padded Checked and Clean is indistinguishable from a verified one. "Don't pad" is currently said only to orchestrators, who never read this file.

**14. Voice: em dashes throughout** (lines 3, 13, 14, 29, 33 to 122 headings, 116, 120 to 122, 153, 160)
Current: roughly 30 em dashes, including in the output template the agent will copy.
Proposed: Replace with periods, colons, or parentheses. Category headings `## Category 1 — Cosplay code` become `## 1. Looks right, does nothing`.
Why: Owner's hard voice rule (CLAUDE.md, Voice section) applies to all writing. The output template is copied verbatim into audit reports, so the dashes propagate into every run.

**15. Claude-only wording and frontmatter** (lines 1 to 6, 126)
Current: `name / description / tools / model` frontmatter; "the orchestrator (main Claude + user)".
Proposed: Line 126 becomes "the orchestrator (the main session plus the user)". Add one comment line under the frontmatter: "Frontmatter is Claude Code agent metadata; the Codex adapter maps `tools` and `model`." No other change.
Why: Decision 6. The prompt body is otherwise runtime-neutral; only the frontmatter and one phrase need the adapter's attention.

**16. Description line is long and its trigger is unverifiable** (line 3)
Current: "...Always invoke on large refactors, performance-critical work, or any diff touching infrastructure the project has never successfully used end-to-end."
Proposed: "Finds the gap between what the change claims to achieve and what the code does: passes every check, still misses the goal. Runs in `full` and `perf` scopes, and whenever the diff touches a file the project config lists as unproven." 
Why: Decision 4 wires this agent into scopes; "infrastructure the project has never successfully used end-to-end" is something only the per-project config can know. A shorter description also serves the Codex adapter.

**Keep** (no edit proposed): line 14 (the core question, word for word); line 17 minus the em dash; Category 3 "Goal drift" (unique to this agent, no overlap found); "How to report" fields at lines 109 to 114 (the five fields are the best structured finding shape in the agents directory; bugs-reviewer could borrow "Why other reviewers miss it"); Severity tier names and definitions at lines 120 to 122 (examples change per item 1, definitions stay); "NOT your job" at lines 124 to 128 (add the test-strategist line from item 7); line 153.

Keep 6 sections, change 13 items, delete 3 (lines 23 to 29, "Checks the project should add", "Tuesday" line).
Most important change: item 2 plus item 3 together, so synthesis can consume the report mechanically (`[HIGH] file:line - description`, attribution header, fence-read list).
Second: item 1, strip djinn and JAX specifics into config, or the agent is useless outside one repo.
