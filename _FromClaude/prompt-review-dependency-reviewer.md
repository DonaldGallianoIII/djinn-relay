---
title: Prompt review of dependency-reviewer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/dependency-reviewer.md` (189 lines, 13 KB, second longest reviewer prompt after pipe-connector).

Files read for context: `plugins/djinn/relay.md`, `plugins/djinn/commands/review.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`, and for overlap only: `synthesis.md`, `bugs-reviewer.md`, `security-reviewer.md`, `perf-reviewer.md`, `known-bugchecker.md`, `ux-reviewer.md` (lines 100 to 195), `devils-advocate.md` (lines 8 to 30), `fixer.md` (lines 1 to 40).

Quoted text below elides the file's em dashes with "..." so this report stays inside the voice rules.

---

**1. The prompt is Python-and-JAX specific from top to bottom. Move every ecosystem fact into the per-project config and give the prompt a hook.** (lines 12, 15, 18, 34, 42, 43, 51, 58, 60 to 68, 76, 87, 108, 116, 153, 167, 186, 187)
Current: `pyproject.toml / requirements*.txt / setup.py / uv.lock`, `pip list`, `pip install -e .`, `pip check`, `flax and optax`, `harness venv has JAX 0.10; workspace venv has JAX 0.9`, `JAX + jaxlib + jax-cuda{12,11}-plugin`, `pip-compile / uv lock`, `the djinn .pth shim`, `pip-audit / safety / osv-scanner`, `WSL2 + CUDA 12.9 + Python 3.12`.
Proposed: Add a section after the frontmatter:

```
# Inputs (supplied by the orchestrator from the project config)

- `deps.manifests`: the files that declare dependencies (e.g. package.json, pyproject.toml).
- `deps.lockfiles`: the lockfiles (package-lock.json, uv.lock, ...).
- `deps.list_cmd` and `deps.check_cmd`: read-only commands that print the installed set and check it for conflicts (npm ls, pip list, pip check).
- `deps.platform`: one line naming OS, runtime version, and accelerator if any.
- `deps.coupled_sets`: package groups that must move together in this project.
- `deps.landmines`: path to the project's list of known dependency interactions.
- The changed-file list (the fence) and the diff.

If any of these is missing, say so in the report under "Inputs missing" and continue with what you have. Never guess a manifest name; never guess the platform.
```
Then rewrite Categories 1 to 4, 6, 8 and 9 to reference "the manifest", "the lockfile", "the coupled sets", and drop the JAX, PyTorch, flax, CUDA, WSL2 and venv examples. Keep at most one example per category, and make it ecosystem-neutral (`X>=1.0` in the manifest, `0.9` in the lockfile).
Why: Decision 2 says prompts become project-agnostic. The workplace project this will run on next is a Node and TypeScript codebase (the engine repo, npm), and the two developers there will read `pip install -e .` and `jax-cuda12-plugin` as instructions that do not apply and skip the whole agent. A prompt that names the wrong ecosystem is worse than a short one.

**2. The prompt has no fence. Dependency review needs a declared exception to the fence, and it needs to list what it read outside it.** (lines 12, 14, 15, 94)
Current: `Grep for every place deps are pinned or constrained.` / `if there's a jax_cuda_preload_shim.md, project_*_shim.md, or bugs_to_avoid.md entry ... read it` / `How many sites in the codebase call X's API?`
Proposed: Add under Inputs:

```
# Fence

The changed-file list is the fence. Two standing exceptions: `deps.manifests` and `deps.lockfiles` are always in scope, even when unchanged, because a version conflict only shows up against the whole declared set. Everything else you open (a caller of a replaced library, a config file, a landmine note) goes in the report under "Files read outside the fence", one path per line, with the reason. Synthesis reports that list. Do not grep the whole repo for call sites; if migration cost needs a count, grep for the import line only and report the count, not the files.
```
Why: Decision 1 makes the changed-file list a hard fence and has synthesis report any reviewer that stepped outside it. Line 12 and line 94 tell the agent to sweep the repo. Without a declared exception the agent will either break the fence on every run or miss the one manifest conflict it exists to find.

**3. The agent may execute commands. Say which ones, and forbid installs, venv creation and lockfile regeneration.** (lines 4, 15, 18, 42, 87, 116)
Current: `tools: Read, Grep, Glob, Bash, WebFetch, WebSearch` / `run pip list or pip freeze in it` / `If I run pip install -e . in a fresh venv on the target platform, does the install succeed` / `does a fresh pip-compile / uv lock produce something clean or a mess?`
Proposed: Replace the core question at line 18 with: `Core question: if a fresh install were run from the manifest on the target platform, would it resolve, and would the project run? Answer by reading the manifest, the lockfile, the installed list, and the upstream release notes. Do not run an install to find out.` Add under Fence: `Bash is for deps.list_cmd and deps.check_cmd only. Never install, never create an environment, never regenerate a lockfile, never run the project. If a question can only be answered by installing, mark it UNVERIFIED and say what command would answer it.` Reword line 87 to: `If a lockfile exists and the diff touches it, read the lockfile diff. Do not regenerate it.`
Why: REVIEW.md "Hardware budget" scopes parallel reviewers to read-only tools and says anything that executes code runs serially. This agent runs in the parallel batch. An install or a lock regen is network-bound, mutates the working tree, and can pull the wrong wheel on the reviewer's own machine. Line 18 as written reads as an instruction to do exactly that.

**4. Output format cannot be consumed mechanically. Match the `[SEVERITY] file:line` header that every other reviewer uses.** (lines 118 to 149)
Current: seven prose sections (`### Summary`, `### Declared-state audit`, `### Proposed-change audit`, `### Platform-specific findings`, `### Library-replacement evaluations`, `### Known-issue lookups`, `### Recommended actions (ranked)`), then a bullet list of what each finding "includes".
Proposed:

```
## Dependency Review

### Summary
<one paragraph: overall verdict, blocking issues, biggest surprise>

## Findings

### [HIGH] <manifest>:<line> ... <package> <declared range>: <one-line claim>
**What:** the conflict, gap, or platform failure
**Evidence:** lockfile line, installed version, release-note quote, or URL. One per claim.
**Impact:** install failure | runtime crash | silent degradation
**Fix:** ranked options, first one is the recommendation (pin, bound, substitute, patch, wait)

### [MEDIUM] ...
### [LOW] ...
### [FUTURE-MEDIUM] ...

## Replacement verdicts
- <X for Y>: INSTALLS AND RUNS | CONFLICTS (which dep) | UNVERIFIED (why)

## UNVERIFIED
- <claim>: what would settle it

## Checked and Clean
- <what you verified and found compatible>

## Files read outside the fence
- <path>: <reason>

## Inputs missing
- <which config keys were absent>
```
Why: synthesis.md groups by severity tier then by file within the tier, and expects `[file:line]` on every entry. The current format has no severity tag on any section and no file:line anchor, so synthesis has to re-read prose to place each finding. `<manifest>:<line>` is the natural anchor: `package.json:23` or `pyproject.toml:41`. "Checked and Clean" is what synthesis uses for its coverage check; this prompt is the only reviewer without it.

**5. Severity puts "missing upper bound" and "abandoned dep" at MEDIUM, which blocks ship under the relay's rules.** (lines 151 to 155)
Current: `MEDIUM ... works today but fragile. Upper bound missing, dep abandoned, CVE unpatched but not currently exploitable in this use.`
Proposed:
```
- HIGH: install fails, runtime fails, or silently degrades on the target platform, and the goal cannot be met. Requires evidence (a lockfile line, an installed version, a release note, an issue URL). No HIGH from memory.
- MEDIUM: a real conflict that will fire on a code path the diff introduces or on a platform the config names. Also: an unpatched CVE in a dep the diff adds or bumps.
- LOW: missing upper bound, tighter pin possible, a more maintained alternative exists.
- FUTURE-MEDIUM: an abandoned dep or an ecosystem drift that will cost real work later. Tracked as debt, never blocks.
```
Why: relay.md "Ship Criteria" says any MEDIUM means FIX THEN SHIP. A missing `<3.0` cap should not stop a bug fix from landing. Synthesis already has a FUTURE tier for this; the prompt should feed it. The "no HIGH from memory" line gives the severity definition the evidence requirement that line 147 states but nothing enforces.

**6. CVE and license overlap with security-reviewer. Pick an owner in this prompt.** (lines 74, 112 to 116)
Current: `License. MIT / Apache / BSD (safe) vs GPL / AGPL / commercial / ambiguous (review).` / `Known CVEs. Search <package> CVE for each declared dep.` / `pip-audit / safety / osv-scanner output is relevant even if you can't run them directly ... reference the patterns.`
Proposed: Replace Category 10 with: `Category 10: CVE and license, for deps the diff adds or bumps only. Search "<package> <version> CVE" and read the license field on the package index page. Do not sweep the whole manifest; that is a separate audit the orchestrator asks for by name. security-reviewer also lists dependency CVEs in its scope; when both agents are in the same run, synthesis dedupes and credits the one with a URL.` Delete the `pip-audit / safety / osv-scanner ... reference the patterns` bullet.
Why: security-reviewer.md scope already lists `Dependency vulnerabilities (known CVEs, outdated packages with security patches)` and `License/attribution issues`. Two agents will file the same CVE. "Search CVE for each declared dep" on an 80-dep manifest is 80 web searches per run. "Reference the patterns" of a scanner you did not run invites a CVE finding with no evidence, which is the exact failure line 147 forbids.

**7. Overlap with ux-reviewer on "better alternative". Delete the alternatives bullet; it contradicts NOT your job.** (lines 78, 95, 174)
Current: `Alternatives. Is this the "obvious choice" or is there a better-maintained alternative the plan didn't consider?` / `Maturity comparison. Is Y more or less maintained than X?` / `Whether the project SHOULD adopt a new dep (that's UX / devils-advocate / user decision).`
Proposed: Delete line 78. Keep line 95 but narrow: `Maturity comparison, only if Y fails the maintenance-health check in Category 5. Otherwise leave preference to ux-reviewer.`
Why: ux-reviewer.md Category 9 owns wheel-reinvention and "alternatives to X". Line 78 asks this agent to do the same, and line 174 then tells it not to. A reviewer new to the plugin will follow line 78 and produce a duplicate finding with a different verdict, which is the ESCALATE trigger in synthesis.

**8. Three modes, no rule for which one applies in a relay run. Default to the diff.** (lines 13, 22 to 28)
Current: `The proposed change ... the plan, diff, or PR that triggered this review.` / `Mode 1 ... Verify current state. Are the already-declared deps actually compatible with each other?`
Proposed: Replace lines 22 to 28 with:
```
You have three modes. In a relay run the diff is the proposal, and Mode 2 is the default.
- Mode 2 (default): audit every dep the diff adds, removes, or re-pins. Categories 5, 6, 8, 9, 10.
- Mode 1 (only when a manifest or lockfile is in the changed set, or the orchestrator asks): audit the whole declared set. Categories 1 to 4.
- Mode 3 (only when the orchestrator pastes a replacement suggestion): Category 7.
State which mode you ran at the top of the report.
```
Why: Mode 1 as written is unbounded and runs on every invocation. On a diff that changes no manifest, a whole-set audit is scope creep and a waste of Opus time. "The plan" does not exist in a relay run; review.md hands the agent a changed-file list and a patch.

**9. "Interaction with other agents" describes a sequence that never happens. The relay runs reviewers in parallel.** (lines 177 to 182)
Current: `After UX-reviewer proposes a replacement: you're the verifier.` / `Before devils-advocate reviews a plan: your compatibility findings may become ...`
Proposed: Replace the section with two lines: `You run in the same parallel batch as the other reviewers and will not see their reports. If the orchestrator pastes a replacement suggestion from a prior round or from a plan document, evaluate it under Mode 3.`
Why: relay.md line 7 and review.md step 5 spawn every reviewer in one message. There is no "after ux-reviewer". A new reader will wait for input that never arrives, or worse, open `audits/.../agents/ux-reviewer.md` mid-run, which is a read outside the fence.

**10. "Invocation tips" is written for the orchestrator but lives in the agent's system prompt. Fold it into the Inputs section and delete it.** (lines 184 to 189)
Current: `Tell this agent the target platform explicitly. "WSL2 + CUDA 12.9 + Python 3.12" ...` / `If the project has a workspace venv pattern ... say so`
Proposed: delete. The four tips become the config keys in suggestion 1 (`deps.platform`, per-environment manifests, replacement list, web search expected).
Why: The body of an agent file is the agent's own instructions. Advice to the person spawning it belongs in `commands/review.md` or the project config. Leaving it here costs six lines on every dispatch and the agent cannot act on them.

**11. "Why this agent exists" is a project war story. Replace with one sentence and a landmine hook.** (lines 32 to 36)
Current: `The djinn harness has a .pth CUDA shim that LD_PRELOADs libnvJitLink.so.12 because JAX 0.10's jax-cuda12-plugin wheel has a loading-order bug ...` (five lines)
Proposed:
```
# Why this agent exists

A dependency that installs but silently degrades costs more than one that fails loudly. Every "use Y instead of X" suggestion from another reviewer is a compatibility claim, and you verify it before the project acts on it. Read `deps.landmines` first: it lists the dependency interactions this project has already paid for.
```
Why: Decision 2. The JAX story teaches the right lesson but belongs in that project's landmine file, where the agent will read it when it matters. In a Node project the paragraph is noise and the shim reference at line 108 becomes a dangling pointer.

**12. Two web-search sections say the same thing. Merge into one.** (lines 30, 157 to 168, 189)
Current: line 30 lists the search templates; lines 157 to 168 list when to search and when not to; line 189 says "encourage liberal use of WebSearch".
Proposed: Keep line 30. Append to it: `Do not search for what the manifest, lockfile, or list_cmd output already answers.` Delete lines 157 to 168.
Why: Lines 159 to 164 restate the Category 5, 6 and 7 triggers. Lines 166 to 168 are the only new content and fit in one sentence.

**13. Web tools and memory paths are Claude-only mechanisms. Say so for the Codex adapter.** (lines 4, 14, 30)
Current: `tools: Read, Grep, Glob, Bash, WebFetch, WebSearch` / `The project's dependency-related memory ... jax_cuda_preload_shim.md`
Proposed: Add after line 30: `This agent depends on web access. If the runtime has no web search or fetch, every claim that needs a release note or an issue thread is UNVERIFIED, and the report says so at the top. Do not answer those from memory.` Replace the memory-directory reference at line 14 with `deps.landmines` from the config (see suggestion 1).
Why: Decision 6. The prompt's main value is current-world lookup. An adapter that strips WebSearch without the agent noticing produces confident, stale compat verdicts, which is the worst output this agent can give. Claude memory directories do not exist in Codex.

**14. Add a skeptical-verification clause matching the other reviewers, and require the UNVERIFIED label.** (lines 8 to 18, 147)
Current: `Don't assert ... cite.` (line 147, inside the report section only)
Proposed: Add to Shared Context, after the Inputs section:
```
**Skeptical verification.** A version range in a manifest is a claim, not a fact. Before filing a conflict, show the two lines that disagree (manifest vs lockfile, lockfile vs installed, declared vs upstream release note). Before filing a platform failure, cite the issue or release note that names the platform. Anything you cannot cite is UNVERIFIED, listed in its own section, never promoted to a finding.
```
Why: every other reviewer (bugs, security, perf, synthesis, devils-advocate) carries a Skeptical verification paragraph in Shared Context. This one buries the evidence rule in the output section, after 130 lines of checklist. AGENTS.md requires UNVERIFIED labeling for research output; this agent is the relay's research agent.

**15. Dead references and unverifiable bullets in Category 8.** (lines 102, 104)
Current: `document in the scaffold's expected-duration` / `Internet firewalls / corporate proxies ... does pip install actually succeed on typical corporate dev machines?`
Proposed: Line 102: `Slow installs. Source builds that take minutes: name the package and the reason.` Line 104: `Non-index sources. A dep pulled from a git URL, a private index, or a direct download is a finding; name the URL.`
Why: There is no "scaffold" in this plugin. A reviewer cannot test a corporate proxy from a review seat, but it can see a git URL in the manifest, which is the testable version of the same concern.

**16. Line 3 description is four sentences with an em dash. Cut to two.** (line 3)
Current: `Audits package / framework compatibility ... verifies declared dependencies, proposed new deps, and any version bumps will actually work together in practice. Searches the internet ...`
Proposed: `description: Verifies that declared, added, and bumped dependencies resolve and run together on the target platform, using web search for release notes and known issues. Invoke on any diff that touches a manifest or lockfile, and on any "replace X with Y" proposal.`
Why: The description is what the orchestrator matches on. The "mysteriously broke" clause in the current text is a debugging use case the relay does not dispatch.

**17. Em dashes throughout. Strip them.** (lines 3, 13, 16, 22 to 28, 30, 43, 45, 56, 63, 104, 116, 147, 153 to 155, 172, 179, 186, 189 and others)
Current: em dashes used as separators in roughly 40 places.
Proposed: replace each with a colon, period, or parentheses per the voice rules. Ranges like `2-3` at line 149 become `2 to 3`.
Why: `~/Conventions/voice/VOICE.md` rule 1 applies to all writing, and this file will be read by two developers who will copy its register into their own reports.

**18. Keep: Categories 1 to 4, 6, 8, 9 as a checklist; the search-template line 30; the evidence bullets at 145 to 149; the NOT your job section at 170 to 175.**
These earn their lines once the ecosystem examples are replaced per suggestion 1. The category structure is the best part of the file: each bullet is a concrete question with a yes or no answer. NOT your job is correct as written except for the line 174 conflict noted in suggestion 7.

**19. Length after edits.** Deleting suggestions 9, 10, 11, 12 and the duplicate web section removes about 45 lines. Suggestions 1, 2, 3, 4 and 14 add about 40. Net length stays near 180 lines, but the checklist-to-ceremony ratio improves: every remaining line is either an input, a fence rule, a checklist question, or an output slot.

---

Keep 4 / change 13 / delete 3 (sections 157 to 168, 177 to 182, 184 to 189).
Most important change: suggestion 1, replace every Python, pip, JAX, CUDA and venv reference with config keys (`deps.manifests`, `deps.lockfiles`, `deps.list_cmd`, `deps.check_cmd`, `deps.platform`, `deps.coupled_sets`, `deps.landmines`) so the prompt works on the npm project it will run on next.
Runner-up: suggestion 3, forbid installs and lockfile regeneration; the core question at line 18 currently reads as an instruction to run `pip install -e .` in a fresh venv from inside a parallel reviewer batch.
