---
title: Prompt review of ux-reviewer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/ux-reviewer.md` (195 lines).
Read alongside: `relay.md`, `commands/review.md`, `agents/synthesis.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`, `~/Conventions/code/ACCESSIBILITY.md`. Skimmed the other agent prompts for overlap only.

Short version: the prompt is a good essay on developer ergonomics and a poor relay agent. Its severity scale will block ship verdicts on "you could have used typer", its output header cannot be parsed by synthesis, its Shared Context sends the agent outside the fence by design, and about a third of it is djinn-harness and JAX specific. The fixes below keep the useful core (the anchor question, the two modes, the finding fields) and cut it to something synthesis can consume.

Quotes marked "(dash elided)" had an em dash in the original; I replaced it to keep this report inside the voice rules.

---

**1. HIGH here means something different from HIGH everywhere else, and it will block shipping** (lines 168 to 174)
Current: "HIGH: common task is painful: the 80%-path workflow has avoidable friction" and "A finding is also HIGH if it sets up future spaghetti"
Proposed:
```
# Severity

Synthesis treats HIGH and MEDIUM as blocking (relay.md, Ship Criteria). Use them only for friction the diff itself introduced or made worse:

- HIGH: a documented common task now fails, silently does the wrong thing, or takes a materially worse path than before this change. Name the task and the doc that documents it.
- MEDIUM: a documented task still works but the change added an avoidable step, a magic string, or an error the user cannot act on.
- LOW: polish on something the diff touched.
- FUTURE-HIGH / FUTURE-MEDIUM: wheel-reinvention, leaky abstractions, coupling knots, and any "would be nicer with library X". These never block. Synthesis files them under Architectural Debt.

If you cannot say which of these four lines a finding sits on, it is LOW.
```
Why: synthesis.md lines 25 to 36 and relay.md line 77 define SHIP as zero HIGH/MEDIUM. Under the current text a hand-rolled config loader that works is HIGH ("future spaghetti", line 174), so a diff with no bug would get FIX THEN SHIP. The FUTURE tier already exists (synthesis.md line 30, multiuser-reviewer) and is exactly the right home for most of what this agent produces.

**2. The finding header cannot be parsed by synthesis** (lines 141 to 147, and 149, 151)
Current: `#### [HIGH: common task is painful] (dash elided) <category>` followed by `**Where:** <file:line or doc section>` on its own line
Proposed:
```
### [HIGH] file:line, description
**Category:** <one of the category names below>
**Current behavior:** ...
**Friction:** ...
**Proposed alternative:** ...
**Effort to adopt (estimate):** ...
**Downside:** ...
```
Why: every other agent (bugs, format, integration, security, breaker, known-bugchecker) puts `[SEVERITY] file:line` in a level-3 header, and synthesis dedups and groups by that. A level-4 header with a category word and the location one line down means UX findings either get missed in dedup or cited without a location. The extra fields underneath are fine; synthesis ignores what it does not need.

**3. Shared Context sends the agent outside the fence, and item 3 needs a tool it does not have** (lines 10 to 15)
Current: "Recent commits and audit history for user-facing pain points" and "Workspace CLAUDE.md, READMEs, example configs, the quickstart: skim these as an outsider"
Proposed:
```
Before you recommend anything, read:

1. Every changed file in the dispatch list, in full. This list is the fence.
2. The docs entry points named in the per-project config (README, quickstart, config reference). These are the only files outside the fence you read without listing them.
3. Any file a changed file cites in a comment or docstring as "see X", if you need it to judge a claim.

List every other file you opened under a final heading "Files read outside the fence" with one line each saying why. Synthesis reports these.

You have no shell. Do not try to read git history; if the dispatch summary mentions a prior pain point, cite the summary.
```
Why: decision 1 makes the changed-file list a hard fence and has synthesis report out-of-fence reads, so the prompt must tell the agent the fence exists and how to declare a legitimate exception. Line 14 asks for "recent commits" but line 4 gives no Bash, so that instruction can only be satisfied by guessing. Docs are the one out-of-fence read a UX reviewer genuinely needs; making the per-project config name them keeps the read bounded.

**4. Project-specific content, roughly 40 lines, has to move to the per-project config** (lines 15, 33, 53, 56, 73, 74, 81, 82, 103, 107 to 121, 195)
Current: "The YAML config loader in the djinn harness (phase H-4)", "`djinn-go --show-config`", "`DJINN_N_ENVS=64`", "`djinn-status`", "current iter, current loss, current SPS", "remember to call `.freeze()` before passing to jit", "`TrainerConfig.for_smoke_test()`", "Checkpoint visibility", the whole Category 9 library table, "flax.serialization (already in use)", "review the djinn-go onboarding flow"
Proposed: replace each with a neutral form ("the tool's own config-dump command, if one exists", "an environment-variable override such as `<PREFIX>_FIELD=value`", "the hot-loop status line, whatever it reports"). Replace Category 9's table with:
```
## Category 9: wheel-reinvention

For every custom piece the diff adds, ask whether a mature library covers it. The per-project config lists the ecosystem this project lives in (its `ux.ecosystem` block: CLI, config, logging, testing, and so on). Use that list first. If it is empty, name the candidate and say you are guessing the ecosystem.
```
Why: decision 2. Every library in lines 107 to 121 is Python; the rest of the relay is written against a TypeScript and Babylon project, and the two workplace devs are on a Python voice-agent stack. A TypeScript diff reviewed against "hydra, typer, tqdm" produces nothing useful and looks like a broken tool. Line 33's H-4 story is a good story but it is a djinn harness story; a two-sentence generic version stays (see item 14).

**5. No skeptical verification clause, and "every friction point is a finding" invites padding** (lines 12 to 19, 27)
Current: "If the answer is the second one, that's friction. Every friction point is a finding." and "You've seen more tools than the author has."
Proposed: insert after the anchor question:
```
**Skeptical verification.** Before a finding exists:
- "Common task" needs evidence: the README quickstart, a script in the repo, or a test that exercises it. Quote it. A task you assume is common is not.
- "Docs say X, tool does Y" needs both lines quoted: the doc line and the code line.
- "Library X does this for you" needs three checks: grep the repo for X (already used? already rejected in a decision record or bugs_to_avoid?), confirm X actually covers the specific need, and state the version you are assuming. dependency-reviewer will verify install and compatibility; give it those three facts.
- Trace the user's path through the changed code before saying it is awkward. If a helper, default, or alias already removes the friction, say so under Checked and Clean and move on.

A friction point you cannot support with one of these is not a finding.
```
Delete "You've seen more tools than the author has."
Why: REVIEW.md line 21 requires a skeptical verification clause on every relay reviewer, and every other agent prompt has one. This prompt's only verification language is "If the docs claim a workflow, trace it" (line 13), which is one bullet among four and has no consequence attached. Line 27's superiority framing pushes the model toward recommending libraries it has not checked against the repo.

**6. The ten categories license findings about features the diff never touched** (lines 37 to 129)
Current: 93 lines of checklists including "No shell completion", "Screenshots / asciinema of the happy path", "Makefile / justfile", "Does CHANGELOG / release notes exist?"
Proposed: add one rule at the top of "What to look for":
```
Apply a category only where a changed file touches that surface. The absence of a feature this diff did not touch (shell completion, screenshots, a changelog) is not a finding for this run. If it matters, one line under "Debt noted", no severity.
```
Then merge: Categories 3 and 4 into "What the user sees when it runs or fails"; Categories 6, 7, and 10 into "Docs and first run"; fold Category 8 (recovery) into the merged 3 and 4, dropping the checkpoint bullets. Target: six categories, about 45 lines.
Why: the relay reviews diffs (review.md step 3). A checklist that asks "does a CHANGELOG exist" on a diff that changed one function will produce findings synthesis has to throw away, and the fence rule in item 3 forbids the reads needed to answer half of them anyway. The merges remove bullets that repeat each other ("fresh clone, what's the first command" appears at 87, 88, and 125).

**7. Category 5 overlaps security-reviewer and integration-reviewer; Category 10 overlaps devils-advocate and test-strategist** (lines 76 to 83, 123 to 129, 176 to 181)
Current: "Implicit coupling: does module A import from module B which imports from A?", "Docstrings that explain the code, not the use case", "Are runtime flags documented (`--help`) the same as written docs (README)? Drift is a finding."
Proposed: in Category 5, delete the circular-import bullet (integration-reviewer, "callers and state sync") and the docstring bullet (security-reviewer's Code Quality mandate covers comment quality; devils-advocate's LOW CLAIM ROT covers docstrings that lie). Keep signatures, side effects, leaky abstractions, missing factories. In the merged docs category keep doc-vs-flag drift but add: "If the drift is a false claim about behavior, that is devils-advocate's CLAIM ROT; cite it as theirs, do not re-file it." Add to "NOT your job":
```
- Whether a doc claim is true. devils-advocate owns that. You own whether a true doc is usable.
- Writing the manual QA protocol. test-strategist owns that. You may say a documented walkthrough is 40 steps; they decide how to test it.
- Naming, architecture fit, and API surface minimality. security-reviewer's senior-review mandate owns that.
```
Why: security-reviewer lines 24 to 31 already review naming, architecture, and API surface; format-reviewer line 29 routes architecture there too. Without a stated boundary, `full` scope will produce the same "this signature takes six positionals" finding twice, and synthesis has to decide who owns it by reading the file.

**8. The interaction section describes a sequence that never happens** (lines 183 to 188)
Current: "After devils-advocate files a finding ... you might add", "After test-strategist proposes ... you review whether", "Before format-reviewer"
Proposed: replace the section with the ownership boundaries from item 7, plus one line: "All reviewers run in parallel and you will not see their reports. If a finding is arguably theirs, file it once under 'For <agent>' with file:line and no severity."
Why: review.md step 5 spawns every agent in one message. The agent cannot react to devils-advocate's findings because they do not exist yet. Text that assumes it can will make the model invent what the other agents "probably said".

**9. Meaning encoded in color alone is the one UX rule the owner cannot waive, and the prompt recommends `rich` and `colorama` without it** (lines 68 to 74, 112)
Current: "Output: rich, tqdm, colorama."
Proposed: add a category (or a bullet in the merged "What the user sees" category):
```
## Output legibility

Any output the diff adds or changes that carries meaning by color (status, pass/fail, severity, category, diff markers) must also carry it by a label, glyph, position, or weight. A green check and a red cross without the check and cross characters is a HIGH. This is a hard rule from the owner's conventions (code/ACCESSIBILITY.md); it is not style.
```
Why: `~/Conventions/code/ACCESSIBILITY.md` lines 5 to 11 make this a hard rule and name Claude as the color QA. A UX reviewer is where that check belongs, and today no relay agent performs it. Recommending `rich`, whose defaults are hue-heavy, without the caveat actively works against the rule.

**10. WebSearch and WebFetch: mark as optional, Claude-tool-shaped, and source-required** (line 4, line 193)
Current: `tools: Read, Grep, Glob, WebFetch, WebSearch` and "Encourage the agent to WebSearch for 'alternatives to X'"
Proposed: after the tools line add a note in the body:
```
Web tools are optional and may be absent (other runtimes). Any claim that rests on a web result carries the URL; a claim you could not confirm is marked UNVERIFIED, not asserted. Never let a web result widen the file fence.
```
Why: decision 6 asks prompts to name Claude-only mechanisms so an adapter can handle them. AGENTS.md lines 79 to 81 require a URL per claim and UNVERIFIED for the rest, and this is the one review agent that pulls facts from the internet.

**11. "Delegate" and "the orchestrator implements" describe mechanisms the relay does not have** (lines 178, 181)
Current: "You propose; the orchestrator decides and implements." and "If you find a bug while reviewing, delegate: note it and move on, or flag it for the bugs-reviewer." (dash elided)
Proposed: "You propose. The user and orchestrator deliberate (relay.md Phase 2) and a fixer executes a brief." and "If you spot a bug, list it under a final heading 'For bugs-reviewer' with file:line and one sentence, no severity. Do not analyze it."
Why: there is no delegation call available to a review agent; "delegate" will read as an instruction to spawn something, which AGENTS.md line 103 forbids without being asked. The "For <agent>" heading gives synthesis a mechanical place to look.

**12. Invocation tips are addressed to a reader who never sees this file** (lines 190 to 195)
Current: "# Invocation tips (for orchestrators spawning this agent)"
Proposed: delete the section. Move its one durable point to the agent's own voice in Shared Context: "If the dispatch did not name a docs entry point and the per-project config has none, say so in the Summary and review only the changed files' own help text and comments." Move "invoke early on big refactors" to relay.md's Agent Selection Guide if wanted.
Why: review.md builds the dispatch prompt; it does not read agent files. The only reader of this section is the agent itself, which cannot act on advice about how to invoke it. Ten lines that earn nothing.

**13. The prompt assumes a plan doc as input; the relay gives it a diff** (lines 3, 12)
Current: "Reviews code, plans, CLIs, configs, and APIs" and "plan doc, diff, or the current state of the API/CLI/config it touches"
Proposed: line 12 becomes "The dispatch gives you a changed-file list and a diff. If a plan or design document is inside the fence, review it as a design; otherwise review the diff as shipped behavior." Keep line 3's description as is.
Why: the relay's only entry point is `/djinn:review` on a git diff (review.md step 3). A reviewer new to the plugin will otherwise wonder where the plan doc is supposed to come from.

**14. "Why this agent exists" shrinks to two sentences** (lines 31 to 35)
Current: nine lines, six of them the djinn H-4 YAML loader story
Proposed:
```
# Why this agent exists

Projects calcify around decisions made before the author knew an alternative existed. A hand-rolled config loader that works is still a decision worth making on purpose. The other agents catch bugs, cost, and structure. You catch "this works but it is awkward to use", and you make sure every custom piece was chosen knowingly.
```
Why: the H-4 story is project-specific (decision 2) and the sentence at line 35 already carries the point. Keep the sentiment, drop the anecdote.

**15. Em dashes throughout** (lines 3, 12, 25, 27, 29, 33, 35, 39 through 129 headings, 141, 166, 170 to 174, 185 to 188)
Current: roughly 60 em dashes, including in every category heading ("Category 1: CLI friction", dash elided)
Proposed: replace with a colon in headings, a period or comma in prose, in one pass when the other edits land.
Why: `~/Conventions/voice/VOICE.md` rule 1 applies to all writing, and the two workplace devs will read this file as documentation of what the tool does. Low effort, one pass, no reason to leave it.

**16. Keep: the anchor question** (lines 17 to 19)
Keep lines 17 and 18 as written. Line 19 changes per item 5.

**17. Keep: Role and the two modes** (lines 21 to 29)
Keep. Delete only the first sentence of line 27 (item 5). "The author may decide the custom approach is right" (line 29) is the right frame and should stay.

**18. Keep: the Style paragraph** (line 166)
Keep. "Consider X beats X is wrong" and "name the library, show the three-line alternative" are both concrete and both survive item 5's evidence rule.

**19. Keep with a cap: "What's already good"** (lines 157 to 159)
Keep, add "at most three lines". Synthesis ignores it; the user reads it; three lines is enough to prove the agent read the code rather than a checklist.

**20. Keep: "Effort to adopt" and "Downside" fields** (lines 146, 147)
Keep, relabel "Effort to adopt (estimate)". It is a guess, but a labelled guess is what a deliberation needs, and no other agent gives one.

---

Hooks needed in files that are not mine to edit, noted so they are not lost:
- `synthesis.md` line 10 lists the agents it receives and omits ux-reviewer, dependency-reviewer, devils-advocate, test-strategist. When decision 4 wires them in, that list and the FUTURE tier routing need updating.
- `relay.md` line 97 says `full` includes "all 9 review agents" while decision 4 says four of them are unreachable. One of those two statements is wrong today.
- The per-project config (decision 2) needs two blocks this prompt now depends on: `ux.docs_entry_points` (item 3) and `ux.ecosystem` (item 4).

---

Keep 5 (items 16 to 20) / change 13 (items 1 to 11, 13, 14) / delete 2 (item 12, and the interaction sequencing in item 8; item 15 is a mechanical pass).
Most important change: item 1. Rewrite the severity scale so HIGH and MEDIUM mean "this diff made a documented task worse" and everything else goes to the FUTURE tier, or this agent will block ship verdicts on library suggestions.
Second: item 2, the finding header, or synthesis cannot locate a single UX finding.
