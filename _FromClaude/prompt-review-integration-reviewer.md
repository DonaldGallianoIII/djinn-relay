---
title: Prompt review of integration-reviewer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/integration-reviewer.md` (55 lines).
Read alongside: `relay.md`, `commands/review.md`, `commands/dispatch.md`, `agents/bugs-reviewer.md`, `agents/synthesis.md`, `agents/known-bugchecker.md`, `agents/breaker.md`, `agents/pipe-connector.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`.

Overall: the prompt is short and mostly sound. Its main problem is structural. This is the one agent whose job requires reading outside the changed-file fence, and the prompt says nothing about how to do that without turning into a whole-repo audit or reporting old bugs in unchanged callers. Second problem: the severity ladder does not match bugs-reviewer or synthesis, so the same defect gets a different tier depending on which agent found it.

**1. Give the fence a hook, and bound the dependency walk** (line 10, plus new section after line 54)
Current: "Read every changed file, then follow the dependency graph" and "read files that import the changed code, and files that the changed code imports."
Proposed:
> The changed-file list in your dispatch is the review target. You are the one agent expected to read beyond it. Read one hop out: every file that imports a changed file, and every file a changed file imports. Go a second hop only to confirm a specific finding, and say which finding sent you there. Files you open beyond the changed list are context, not targets: do not report pre-existing problems in unchanged files unless this change makes them worse or exposes them. End your report with a section `## Files read outside the changed set`, one path per line, so synthesis can report it.
Why: Decision 1 says synthesis reports any file read outside the fence, but this prompt has no output slot for that, and "follow the dependency graph" has no depth bound. Without the "pre-existing problems" clause, an integration reviewer reading callers will start filing bugs in code nobody touched, which is the scope creep the brief asks about.

**2. Align severity with bugs-reviewer and synthesis, and add the FUTURE tier** (lines 36 to 40)
Current: HIGH "runtime errors or data corruption across systems"; MEDIUM "incorrect behavior or UI desync"; LOW "Latent risk, future fragility, or cosmetic desync".
Proposed:
> - **HIGH:** Under realistic use, a crash, data loss, corruption, or a security exposure. A consumer desync that loses user data on save is HIGH, not MEDIUM.
> - **MEDIUM:** Wrong behavior a user will encounter. No data loss.
> - **LOW:** Needs unusual conditions to trigger, or is cosmetic.
> - **FUTURE-HIGH / FUTURE-MEDIUM:** Would be HIGH or MEDIUM once a planned change lands. Use this instead of LOW for "future fragility". Synthesis routes it to Architectural Debt.
Why: bugs-reviewer.md lines 30 to 32 define HIGH by "realistic conditions" and LOW by "unusual conditions"; this file defines tiers by category (desync = MEDIUM) rather than consequence, so one desync can be MEDIUM here and HIGH from bugs-reviewer. synthesis.md line 30 has a FUTURE tier that this prompt never emits, so "future fragility" lands in LOW and is dropped from the debt list.

**3. Put teeth in the verification clause** (line 12)
Current: "If you claim 'this UI component won't update,' verify by reading the component's update path."
Proposed:
> Every finding cites the consumer line you read to confirm it (file:line of the caller, listener, or sync path, not just the changed line). A finding with no cited consumer line is a guess: label it UNVERIFIED and give it no severity. If you traced a path expecting breakage and found a guard, say so under Checked and Clean and move on.
Why: the current clause tells the agent to verify but gives synthesis no way to tell a verified finding from an unverified one. REVIEW.md line 21 to 22 requires the "if a guard stops you, say so and move on" language and it is missing here. AGENTS.md line 82 sets the UNVERIFIED label convention.

**4. Move project-specific tokens to the config hook** (lines 3, 21, 27)
Current: line 21 "Check for missing `syncFromState()` / `refresh()` calls"; line 27 "If save/load or HMR also needs updating"; line 3 "UI desync".
Proposed (line 21):
> **Consumer sync:** After state changes, does every consumer of that state re-read it? The project config names the sync or refresh calls this project uses; if it names none, trace how consumers learn about changes and check each one.
Proposed (line 27):
> **Serialization and restore paths:** If the change adds or reshapes state, do save/load, import/export, snapshot or undo capture, and hot reload (where the project has it) carry the new state? The project config lists these paths.
Proposed (line 3): replace "UI desync" with "consumers left out of sync".
Why: decision 2. `syncFromState()` and HMR are the engine repo facts. The two workplace developers will run this against a Python voice-call service where neither exists, and the agent will report "no syncFromState call found" as a finding or skip the whole bullet.

**5. Merge "Caller impact" into "Blast radius check", fix the wording, drop the tool name** (lines 25 and 29 to 34)
Current: line 25 "If a function signature changed, are ALL callers updated? `Grep` for the function name." Lines 29 to 34 say the same thing in three steps, opening with "When a fix changes a function signature".
Proposed: delete line 25. Rewrite lines 29 to 34 as:
> # Blast radius
> When the change alters a function signature, an event name, an exported type, or the shape of shared state:
> 1. Search the repository for every caller, consumer, listener, and type user. Search by the old name and the new name.
> 2. Read each one and confirm it still satisfies the new contract.
> 3. List every one you checked under Checked and Clean, and file a finding for each one that was missed.
Why: two sections say the same thing, and "when a fix changes" is leftover from the old audit-fix-verify flow; in Round 1 nothing is a fix yet. `Grep` is a Claude Code tool name (decision 6); "search the repository" works under any adapter. Adding "old name and the new name" catches the renamed-symbol case relay.md line 49 already worries about.

**6. Draw the line against bugs-reviewer on disposal and against breaker on sequences** (lines 22 to 24)
Current: line 24 "Are new resources cleaned up in the existing dispose flow?"; lines 22 to 23 on events firing during restore and undo pushes.
Proposed: add one sentence after line 24:
> Ownership split: bugs-reviewer owns "listener or resource created in the changed file and never released". You own "the existing teardown path does not reach the new resource" and "the new resource is released by a path that runs at the wrong time". Breaker constructs the action sequences that break state; you check that the wiring those sequences run through is connected. Do not re-derive their findings.
Why: bugs-reviewer.md line 20 covers "event listeners not removed", known-bugchecker.md line 25 covers unmanaged observers, and breaker.md line 27 covers "Undo during restore". Without a stated split, three agents file the same leak and synthesis spends its budget deduplicating.

**7. Fix the false claim in Role** (line 16)
Current: "Every other agent looks at the changed files in isolation."
Proposed: "Other agents judge the changed code on its own terms. You judge what the change does to code that was not changed."
Why: bugs-reviewer.md line 10 reads imports and callers, pipe-connector maps wiring across the repo. A reviewer who takes line 16 literally will think nobody else read the callers and will duplicate the bugs-reviewer's cross-file leak findings.

**8. Make the output parseable and attributed** (lines 42 to 55)
Current: `### [SEVERITY] file:line` with an em dash, five free-text fields, no finding id, no header, Checked and Clean as a free list.
Proposed:
> ```
> ---
> title: integration-reviewer report
> author: <model name from your dispatch> (integration-reviewer)
> date: <date>
> status: audit finding, not yet deliberated
> ---
>
> ## Findings
>
> ### INT-1 [SEVERITY] file:line: short description
> **What:** the cross-system issue
> **Why:** the mechanism across the boundary
> **How to trigger:** the user action or code path
> **How it manifests:** what the user sees
> **Verified by:** file:line of the consumer you read
> **How to fix:** the concrete change, with every affected file listed
>
> ## Checked and Clean
> - file:line (consumer) confirmed against file:line (change): what you confirmed
>
> ## Files read outside the changed set
> - path
> ```
Why: AGENTS.md lines 8 to 19 make the attribution header mandatory for any file an agent writes into a repo; audit reports land in `audits/` in the project repo and have none. Numbered ids (`INT-1`) let synthesis credit findings and let Round 2 say "INT-3 resolved" instead of re-describing it. "How to trigger" matches bugs-reviewer's field set so synthesis can dedupe on the trigger. Voice rule: the em dash in the heading should go, but change it in every agent at once so synthesis sees one shape.

**9. Add a Round 2 mode** (new section, after Output format)
Current: none. dispatch.md lines 134 to 146 sends every agent a generic Round 2 instruction and expects "verify each HIGH/MEDIUM is resolved" with no output slot for it.
Proposed:
> # Round 2
> When your dispatch says Round 2: open the Round 1 report at the path given, and for each Round 1 finding add a line under `## Round 1 re-check` as `INT-n: RESOLVED | NOT RESOLVED | REGRESSED`, with the file:line you read to decide. Then run the Blast radius section on every fix diff. New findings continue the numbering.
Why: without this, Round 2 reports are free prose and synthesis has to guess which Round 1 items are closed. Three lines, and it makes the ship verdict mechanical.

**10. Name the Claude-only mechanisms for the adapter** (lines 1 to 6)
Current: frontmatter `tools: Read, Grep, Glob` and `model: opus`; line 10 "Read the project's CLAUDE.md".
Proposed: keep the frontmatter (decision 3 keeps `model: opus`). Add one comment line under it:
> <!-- Frontmatter fields and tool names are Claude Code agent mechanisms. Under another runner, the adapter maps tools to read-only file access and model to the configured reviewer model. -->
And change line 10 to "Read the project context file and the relay config named in your dispatch (CLAUDE.md and the per-project config under Claude Code)."
Why: decision 6. Codex reads AGENTS.md, not CLAUDE.md, and has no frontmatter. Saying so in the file is cheaper than the adapter guessing.

**11. Keep: State management, Initialization order** (lines 20, 26)
Current: as written.
Proposed: keep.
Why: both are generic, short, and no other agent covers initialization order.

**12. Keep the length**
Current: 55 lines.
Proposed: keep it near that. Suggestions 1, 3, 8, and 9 add roughly 25 lines; suggestion 5 removes 7. Net about 75 lines, still the shortest reviewer that reads across files.
Why: the ux-reviewer and dependency-reviewer prompts run 10 to 13 KB and are hard to hold in mind. This one earns every section. Do not pad it.

## Summary

Keep 2 (State management, Initialization order) / change 9 / delete 1 (line 25, merged into Blast radius).
Most important change: suggestion 1, the fence hook. Bound the dependency walk to one hop, forbid findings on pre-existing problems in unchanged files, and add a `## Files read outside the changed set` section so synthesis can do what decision 1 promises.
Second: suggestion 2, one severity ladder shared with bugs-reviewer and synthesis, with FUTURE-* so architectural debt stops being filed as LOW.
