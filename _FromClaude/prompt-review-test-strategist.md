---
title: Prompt review of test-strategist.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/test-strategist.md` (166 lines).
Read alongside: `relay.md`, `commands/review.md`, `Conventions/workflow/REVIEW.md`, `AGENTS.md`, `FEATURE-WORKFLOW.md`, and the other agent prompts for overlap.

The prompt is a good checklist wrapped in a report shape synthesis cannot consume and a read scope the fence does not allow. Those two are the real problems. The rest is trimming and moving project history out.

**1. Its HIGH means "missing test", synthesis reads HIGH as "blocks ship"** (line 86 to 143)
Current: `- **Priority** (HIGH / MEDIUM / LOW — HIGH = would have caught a shipped bug)` and the free-form `## Test Strategy Recommendations` template.
Proposed: Tag every gap with a distinct token so synthesis can route it, the way breaker's CRASH/DEGRADE are routed. Each gap becomes a heading synthesis can parse:

```
### [TEST-HIGH] <path where the test would live> — <test name>
**Asserts:** one line
**Catches:** defect class, with the known-bugs entry ID or commit SHA
**Effort:** minutes or hours
```

Add under the severity section: "TEST-HIGH, TEST-MEDIUM, TEST-LOW never block a ship verdict. Synthesis lists them under a `### Test backlog` section, not in the fix list." Keep the `### Summary` counts (line 130 to 134) as the last block, they are the only part synthesis can already count.
Why: `synthesis.md` line 35 says SHIP means zero HIGH/MEDIUM. Every real codebase has missing tests, so an unrouted HIGH from this agent turns every full-scope run into FIX THEN SHIP. The `file:line` slot synthesis expects (line 45) also has no equivalent here; a proposed path fills it. This is the hook decision 4 needs before wiring.

**2. The read list ignores the changed-file fence** (line 10 to 15, 69 to 77, 79 to 84)
Current: `start with ls on test directories, then skim naming conventions` / `For each existing test file, ask:` / `commit messages mentioning "regression"`.
Proposed: Replace lines 10 to 15 with an explicit allowlist: "You may read: (a) the changed files in the dispatch, (b) test files that reference a changed module by import or name, found by Grep, (c) the CI config files named in the project config, (d) the known-bugs index at the path in the project config, (e) the goal document if the dispatch names one. List every file you opened outside (a) under `## Files read outside the fence` at the end of your report. Do not walk the whole test tree." Change line 71 to "For each test file that references a changed module". Drop the commit-message search or say "only if the dispatch pastes the log."
Why: Decision 1 makes the changed-file list a hard fence and has synthesis report out-of-fence reads. This agent must read outside it to do its job, so it needs a declared allowlist or every run gets flagged. Narrowing to referencing tests also matches the iteration-lane selector in `REVIEW.md` line 57 to 60.

**3. Drop Bash from the tool list** (line 4, line 13)
Current: `tools: Read, Grep, Glob, Bash` and `start with ls on test directories`.
Proposed: `tools: Read, Grep, Glob`. Replace `ls` with Glob. Add one sentence to Role: "You never run the test suite, a benchmark, or a build. You specify; humans and fixers run."
Why: `REVIEW.md` line 68 to 70: parallel reviewers use read-only tools, anything that executes runs serially. Nothing in this prompt needs a shell once `ls` is Glob. Devils-advocate has the same problem; not reviewed here, but the wiring should assume both are read-only.

**4. Move the djinn harness story and every JAX or pytest specific into project config** (line 3, 14, 29 to 37, 53, 63, 65, 75, 100, 111, 137)
Current: `The djinn harness's H-1..H-6 disaster: the training loop ran 1000× slower ... no @jax.jit` and the examples `test_iter_step_compiles_exactly_once_per_config`, `"H-7 performance sniff-test"`, `capsys/caplog/monkeypatch`, `Ctrl+C mid-training, restart from ckpt`, `WSL2 bugs`, `phase_*_bugs_found.md`, `pytest` in the description.
Proposed: Replace lines 29 to 37 with three lines: "Tests that pass on a toy config, assert shape instead of value, or never run in CI give false confidence. The project config's incident history lists the bugs that shipped this way. Every entry there is one a test should have caught; name that test." Keep line 53 and line 137 as the quality bar but rewrite them without JAX: "if the docstring claims a property, a test asserts that property" and a generic example of the same density. Move the H-1..H-6 paragraph, the `bugs_to_avoid.md` filename, and the file globs on line 14 to the per-project config as `incident_history` and `known_bugs_index` fields. Line 3: replace `pytest, property tests, benchmarks, contract tests` with `unit, property, benchmark, contract`.
Why: Decision 2. The prompt is about half project-specific by line count. A reviewer on a TypeScript repo reads "jit" and "ckpt" and either ignores the section or invents a JAX analogy. Note also that `Conventions/CLAUDE.md` names the index `docs/known-bugs/INDEX.md`, not `bugs_to_avoid.md`; every relay prompt uses the old name, so the path belongs in config, not in any prompt.

**5. Add a skeptical verification clause and make HIGH cite evidence** (line 17, 105, 141)
Current: `Always ask yourself for each defect the project has shipped: "What specific, concrete test ... would have caught this"` and `HIGH = would have caught a shipped bug`.
Proposed: Add after line 15, matching the other agents: "**Skeptical verification:** Before claiming a test is missing, Grep for it by function name and by behavior keyword. Before calling an existing test toothless, quote its assertion line. Before saying a test never runs, quote the CI line or marker that skips it." Then at line 141: "TEST-HIGH requires a citation: a known-bugs index entry ID, a commit SHA, or an incident file line. No citation, MEDIUM at most."
Why: Every other reviewer prompt carries a verification clause; this one has a rhetorical question. "Would have caught a shipped bug" is unverifiable unless the bug is named, and an uncited HIGH is the kind of confident padding the brief asks reviewers to catch.

**6. Overlap with devils-advocate and gap-hunter, and the "fires last" dependency has no wiring** (line 69 to 77, 124 to 128, 152 to 159)
Current: `Tests that give false confidence (pass on broken code)` / `You tend to fire LAST in a review relay because you need the other agents' findings as input`.
Proposed: Add to NOT your job: "Do not re-file a toothless test or a wrong-thing benchmark as a finding. Devils-advocate files that (its Category 2 and 7, and its `What would catch it` field). Gap-hunter files missing instrumentation. You cite their finding ID and write only the test spec." Then replace line 159 with a wiring statement for `review.md`: "Dispatch this agent in a second wave, after the other reviewers return and before synthesis, with their report paths in the prompt. Dispatched in the parallel wave, it has no findings to work from and duplicates devils-advocate."
Why: Devils-advocate lines 45 to 50, 88 to 93, and 149 to 150 already produce "what check would catch this" per finding and a list of checks to add. Run in parallel, the two prompts file the same toothless-test finding twice. `review.md` Step 5 spawns everything in one message, so the "fires last" line is a wish, not a mechanism. Decision 4 needs this hook.

**7. Make the manual QA output match the owner's `qa/human` shape** (line 25, 107 to 115)
Current: `Each as a numbered step the user can actually execute` and the six-field protocol block.
Proposed: Keep the six fields. Add three required lines to each protocol: "Greyscale pass (for anything with a palette): yes / not applicable", "Keyboard-only pass (for anything interactive): yes / not applicable", "Known gaps: what this protocol does not exercise". Add one line to the section: "State whether a bot replay (`qa/bot`) is possible. If not, say why, so the skip is recorded rather than silent." Put the `qa/human/<feature>.md` and `qa/bot/` paths in project config.
Why: `FEATURE-WORKFLOW.md` steps 3 and 4 define the manual QA artifact this agent is effectively drafting, including the greyscale and keyboard passes (accessibility hard rule) and the explicit skip statement. Matching the shape lets the orchestrator paste the protocol straight into `qa/human/`.

**8. Two manual checks have no pass/fail criteria, breaking the prompt's own rule** (line 62, line 67)
Current: `Exploratory session: 30-60 min of unconstrained use. Whatever breaks, file it.` / `Performance sniff-test: run the tool, time it, compare to expectation.`
Proposed: Line 62: "Exploratory session: list the entry points, spend equal time on each, log every deviation from the docs with the step that produced it." Line 67: "Performance sniff-test: state the expected number and where it comes from (spec, prior run, back-of-envelope), then measure. A protocol with no expected number is not a protocol." Delete `The djinn 1000× gap lived for months because nobody did this` (moves to config per suggestion 4).
Why: Line 114 requires "Pass/fail criteria (concrete observable)" for every manual protocol. These two examples violate it inside the same prompt.

**9. "Every public function" and "every meaningful behavior" produce a wall, not a backlog** (line 23, line 45)
Current: `For every meaningful behavior in the target code` / `Unit tests: every public function and protocol method.`
Proposed: "For every public function the diff adds or changes" in both places. Add: "Tests that assert existence, type, or shape without a value do not count as coverage."
Why: The fence is the diff. "Every public function" in a mature repo is hundreds of items and the report becomes unreadable. The second sentence is `REVIEW.md` line 52 ("tests assert behavior, not existence") stated where the agent will see it.

**10. Invocation tips belong in the dispatcher, not in the agent's own prompt** (line 161 to 166)
Current: `# Invocation tips (for orchestrators spawning this agent)`.
Proposed: Move to `commands/review.md` next to the second-wave wiring from suggestion 6. Convert "Don't spawn this agent on trivial diffs" into a mechanical rule the command can apply: "skip when the diff touches no source file with logic, or when total changed lines are under the threshold in project config."
Why: The agent never reads these lines usefully; the orchestrator does, and it reads `review.md`. "Trivial" has no definition, so the wiring cannot act on it.

**11. Jargon a first-time reviewer will misread** (line 15, 95, 155)
Current: `coverage theater` / `load-bearing vs performative` / `would have caught the cosplay`.
Proposed: "a test that exists but never runs" / "which existing tests would fail on a wrong implementation, and which would pass anyway" / "would have caught the gap devils-advocate found between what the code claims and what it does".
Why: "Cosplay" is defined in devils-advocate.md, not here. Two developers who have never used a pull request will not have read that file. Plain words cost nothing.

**12. Em dashes throughout** (lines 3, 13, 14, 23, 25, 31, 32, 37, 46, 47, 49, 51, 53, 84, 105, 114, 137, 142, 148, 149, 155, 159, 163, 165, 166)
Current: `Half 1 — Code-based QA.` and 30-odd more.
Proposed: Replace each with a period, colon, or parentheses. `Half 1, code-based QA.` / `HIGH: would have caught a shipped bug`.
Why: Voice hard rule in `~/.claude/CLAUDE.md` and `Conventions/CLAUDE.md`, "all writing". A prompt in the owner's repo is writing. Every other agent prompt has the same problem; flagged here for this file only.

**13. Claude-only mechanisms, for the Codex adapter** (line 1 to 6, line 27)
Current: `tools: Read, Grep, Glob, Bash` / `model: opus` / `The orchestrator (main Claude + user)`.
Proposed: Add one comment line under the frontmatter: "Frontmatter `tools` and `model` are Claude Code agent fields; an adapter maps them." Line 27: "The orchestrator (the main session plus the user)".
Why: Decision 6. The body is otherwise portable. The frontmatter and the one named reference are the only Claude-specific parts.

**14. Wrong hand-off for test style** (line 149)
Current: `Style / formatting critique of existing tests — that's format-reviewer.`
Proposed: "Style of existing tests. Out of scope for this relay; the linter owns it."
Why: `format-reviewer.md` line 18 to 24 lists what it checks and test style is not on it. Pointing at an agent that will not act on it is a silent drop.

**15. Keep** (line 41 to 56, 58 to 67 after suggestions 4 and 8, 71 to 77, 79 to 84)
The category checklists and the six questions per test file are the useful core. Line 74 ("what if this function was a no-op, does the test still pass") is the best line in the file. The CI gaps section maps cleanly onto the two test lanes in `REVIEW.md` without edits. Keep line 137's quality bar once the example is made generic.

Summary
Keep 4 sections / change 13 items / delete 2 (the harness paragraph at 29 to 37 and the invocation tips at 161 to 166, both relocated not lost).
Most important change: suggestion 1. Route this agent's output through a TEST-* tag that never blocks ship, or every full-scope run with any missing test comes back FIX THEN SHIP.
