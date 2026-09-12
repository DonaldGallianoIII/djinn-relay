---
title: Prompt review of pipe-connector.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/pipe-connector.md` (286 lines).
Also read: `relay.md`, `commands/review.md`, `commands/brief.md`, `agents/fixer.md`, `agents/integration-reviewer.md`, `agents/bugs-reviewer.md`, `agents/synthesis.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`.

Context that shapes the ranking: this prompt is consumed by three things. `commands/brief.md` step 3 mines it for `work_set.files` and symbol lists. `agents/fixer.md` step 2 reads its "blast-radius section" (a section name that does not exist in the template). `agents/synthesis.md` reads every report under `agents/` and ranks by `[SEVERITY]`. The prompt as written serves none of those three cleanly.

**1. The whole Shared Context block is GameEngine, not a plugin prompt** (line 3, lines 8 to 27, also 93, 96 to 99, 114, 280)
Current: "Read `docs/ARCHITECTURE.md` for the full spec, and `src/core/EditorState.ts` + `src/core/types.ts` + `src/core/constants.ts`..." and the alias list `@terrain/`, `@objects/`, `@camera/`...
Proposed: Replace lines 8 to 27 with:
"Read the project config's `wiring` section. It names, for this project: the module system and import syntax; path aliases; the shared-state object(s), if any; the event or observer mechanism(s); the string-keyed lookups that cross files (element ids, resource names, registry keys); the asset imports that cross files (shaders, templates, data files); the style directory; and the file-size threshold (default 500). If the config has no `wiring` section, say so at the top of your report and trace the generic edge kinds below using whatever import syntax the target file uses."
Then keep lines 20 to 27 as the generic list of edge kinds, with each bullet reworded without the Babylon and EditorState names (Exports, Imports, Events, Shared state, Resource lifecycle, String-keyed lookups, Asset imports). Rewrite line 3 to match: "Maps incoming and outgoing connections for a file: exports and importers, imports, event edges, shared-state coupling, resource create/dispose pairs, string-keyed lookups. Invoke before splitting a file past the project's size threshold."
Why: Decision 2. As written, every named file and alias is a hard read instruction that fails on any project other than GameEngine, and the agent will spend its first minutes grepping for `EditorState` in a Python repo. Sections 4, 5, 6, 7 of Scope then have to be re-labelled the same way (state coupling, resource coupling, string-key coupling, asset coupling) or they read as GameEngine-only.

**2. No fence, and no way for synthesis to tell this agent's reads from drift** (lines 35 to 40, line 50, whole prompt)
Current: no mention of a file list, a fence, or which files are in scope. "For the target file" is used throughout without saying where the target comes from.
Proposed: Add a section after Role:
"# Your fence
Your dispatch names the changed files. Those are the files you map. Mapping means reading files outside the fence: importers, listeners, style rules, dispose sites. That is your job, not drift. List every file you opened outside the fence under `## Files read outside the fence` at the end of your report, one per line, with the reason (importer of X, listener for event Y). Synthesis reports outside-fence reads for every agent; this list is how it tells yours apart."
Why: Decision 1 says synthesis reports any file a reviewer read outside the fence. pipe-connector cannot do its job without reading outside the fence, so without a declared list every run of it looks like scope drift in the synthesis, or synthesis learns to ignore the report. Naming the reads makes the check work instead of neutering it.

**3. Risk labels collide with synthesis severity tiers** (line 119, lines 258 to 261, lines 284 to 286)
Current: "Risks per split candidate (rank: SAFE / MEDIUM RISK / HIGH RISK)" and the template rows "MEDIUM — closure over `this`", "SAFE — pure functions".
Proposed: Rename the scale to `SPLIT-SAFE / SPLIT-CAUTION / SPLIT-HAZARD` in both line 119 and the template table, and add one sentence under Severity note: "Never write the tokens HIGH, MEDIUM, or LOW anywhere in your report. Synthesis matches on those words."
Why: `synthesis.md` ranks by grepping for HIGH and MEDIUM. A split-plan row that says "HIGH RISK" gets picked up as a blocking finding on code that has not changed. The template is also inconsistent with itself (line 119 says "MEDIUM RISK", line 259 says "MEDIUM"), so the agent has to guess.

**4. The Anomalies section is required but has no slot in the template and no format** (lines 284 to 286, template lines 135 to 282)
Current: "mention it under an 'Anomalies' section at the end, but don't gate ship decisions."
Proposed: Add to the template after `## 10. Summary`:
```
## 11. Anomalies (facts, not findings)
- file:line — <what is missing or orphaned> — hand-off: integration-reviewer | bugs-reviewer
```
And in the Severity note: "Each anomaly is a fact you observed while mapping (no dispose site found, emitter with no listener, listener with no emitter, export with zero importers after the checks in Skeptical verification). Write it as `file:line`, the fact, and which reviewer owns it. No severity, no fix. Synthesis dedupes it against that reviewer's findings and does not rank it on its own."
Why: The instruction at line 285 points at a section the template never shows, so the agent invents a shape each run and `brief.md` cannot rely on it. Also see item 5: naming the owning reviewer is what lets synthesis dedupe instead of double-counting.

**5. Overlap with integration-reviewer and bugs-reviewer on dispose and dead listeners** (line 68, line 87, line 208, line 285)
Current: "Flag any Observable with no subscribers (dead signal) or subscriber with no emitter (dead handler)." and "⚠️ no dispose found".
Proposed: Keep the facts in the map (a missing dispose site is part of the wiring). Move the judgement out: "You report that no dispose site was found. You do not report a leak. `integration-reviewer` (Disposal chain, Event system) and `bugs-reviewer` (listeners not removed) rate those. In `full` scope they run beside you; your anomaly and their finding will name the same line, and synthesis keeps theirs."
Why: In `full` scope (review.md line 15) all three run on the same files. Without this sentence the same missing `dispose()` shows up three times with two different severities and one with none, and synthesis has to guess whether pipe-connector's unrated entry confirms or contradicts.

**6. The prompt assumes one target file; the relay hands it a changed-file list** (lines 35 to 46, line 54, line 103, review.md line 63 to 69)
Current: "For the target file, find:" (line 46, 54). Four invocation modes at lines 37 to 40 with no way to know which one applies.
Proposed: Add under the new fence section:
"Your dispatch says which mode you are in and which file(s) to trace. If it names one file, trace that file. If it hands you a changed-file list with no target, trace every changed file that is over the size threshold; if none is, trace every changed file and say at the top that no file is over the threshold. If the mode is not stated, assume Refactor prep. Never pick a target on your own."
Why: In `full` scope review.md spawns pipe-connector with the same prompt as every other agent: a file list and a diff. The prompt has no branch for that input, so the agent either traces the first file it sees or asks a question nobody is there to answer.

**7. Section 9 runs in every mode, including the three where it makes no sense** (lines 110 to 119, lines 38 to 40)
Current: "Based on the above, propose: A candidate set of output files, each ≤ 500 lines (the Djinn cap)".
Proposed: "Section 9 only in Refactor prep mode. Skip it in Audit orientation, Post-split verification, and Alias migration, and write `## 9. Split plan: not applicable (<mode>)`. When you do write it, split by concern, not by line count: a file that is over the threshold but has one concern gets a note saying so, not a plan. Each output file must have one named purpose."
Why: REVIEW.md line 91 to 92: "Split when a file passes that or genuinely mixes unrelated concerns, not to hit a smaller number." Line 113's "each ≤ 500 lines" tells the agent to chop to a number. And a plan produced during Post-split verification or Alias migration is noise that `brief.md` step 3 will still try to mine.

**8. Post-split verification has no defined output** (line 39)
Current: "Post-split verification: re-run to confirm all pre-split edges still exist after the split"
Proposed: "Post-split verification: your dispatch names the pre-split report path. Re-map the new files, then write `## Edge diff` with three lists: edges present before and after, edges present before and missing after (file:line of the old site, and what you grepped for), edges new after. If no pre-split report path is given, say so and produce the map only."
Why: "Confirm all pre-split edges still exist" is unverifiable as written: no input, no output shape, no way for a human to check the confirmation. An edge diff is what a fixer report or Round 2 can actually consume.

**9. fixer.md asks for a "blast-radius section" that this template does not have** (fixer.md line 41, template lines 254 to 270)
Current: template has "## 9. Suggested split plan" with a "Do not break" list inside it.
Proposed: Add a top-level `## Blast radius` section directly after `## 10. Summary` (or rename the "Do not break" list to it) containing: every file outside the target that holds an importer, listener, style rule, or resource lookup, one line each. Same list `brief.md` step 3 needs for `work_set.files`.
Why: Two consumers (`fixer.md` step 2, `brief.md` step 3) want a flat list of touched files. Today that list is scattered across sections 1, 3, 5, 6 and the fixer's instruction names a heading that does not exist, so the fixer either reads the whole report or reads nothing.

**10. Skeptical verification needs teeth on the zero-importer claim** (lines 121 to 131, line 154)
Current: "If you find an export that seems unused (zero importers), double-check: ..." with four bullets, then "Flag the uncertainty rather than calling it dead."
Proposed: Add: "Every importer claim carries a `file:line` from a grep hit. Every zero-importer claim lists the grep patterns you ran (alias form, relative form, barrel, bare symbol as a string) so a reader can re-run them. Also grep for dynamic imports (`import(`, `require(`, lazy loaders) since static tracing misses them. Do not derive edges from the diff patch; read the current file."
Why: The section says the right things but a claim of "0 importers found" is only checkable if the reader knows what was searched. Listing the patterns turns "trust me" into "re-run this."

**11. The worked example is half the file** (lines 135 to 282, 148 of 286 lines)
Current: a full GameEngine `TerrainSculptingTool` report with invented line numbers, aliases, and shader names.
Proposed: Cut the template to a skeleton of section headings with one placeholder line each (about 50 lines). Keep the three shapes that matter for consumers: an export entry with importer `file:line` list, the region table (line 240 to 247), and the split-candidate table (line 256 to 261). Move the worked example into `templates/pipe-connector-example.md` if the owner wants to keep it, or into the per-project config.
Why: The example teaches the agent GameEngine vocabulary it is supposed to forget (decision 2), and every section of it duplicates the Scope list at lines 42 to 119. Prompt length costs cache and attention on every dispatch.

**12. Em dashes in the template get copied into audit files** (lines 31, 42, 64 to 67, 159 to 161, 182, 185, 188, 193 to 201, 206 to 208, 216 to 217, 224 to 225, 229 to 231, 264, 274 to 281)
Current: the output template uses an em dash as the separator on nearly every line, e.g. "`state.activeBrush` — lines 145, 298, 412".
Proposed: Use a colon or a comma as the separator in the template. Rewrite the prose lines the same way.
Why: The owner's voice rule bans em dashes in all writing. The agent copies the template shape verbatim, so the ban is broken in every `audits/<run>/agents/pipe-connector.md` the plugin writes into a repo.

**13. Define "elevation" once** (lines 104, 116, 237, 263)
Current: "Elevation required if split: these become constructor-injected deps or move to a shared context object"
Proposed: At first use (line 104): "Elevation means moving state that two halves of a split both need into a place both can reach: a shared module, a parameter, or an object passed to each."
Why: The two developers at the owner's workplace will read these reports. "Elevate" is not a standard term and the prompt uses it four times as if it were.

**14. Frontmatter is a Claude Code mechanism** (lines 1 to 6)
Current: `tools: Read, Grep, Glob` / `model: opus`
Proposed: Add a comment line in the frontmatter or a one-liner at the top of the body: "Frontmatter `tools` and `model` are Claude Code agent fields. The body has no Claude-only mechanism; an adapter maps these two fields."
Why: Decision 6. The body is portable; the header is not. Saying so saves the Codex adapter author a read.

**15. Standalone spawn has no output path and no ledger line** (line 103 of relay.md, this prompt has no output-path instruction)
Current: nothing in the prompt about where to write.
Proposed: "Write your report to the path in your dispatch. If no path is given, write to `audits/<run>/agents/pipe-connector.md` for the current run and say so in your final message." And flag to the owner: relay.md line 103 invites "spawn standalone", which bypasses the command layer and therefore decision 5's ledger line. A small `/djinn:pipes <file>` command would close that.
Why: Decision 5 says no run goes unlogged. A standalone spawn is a run.

**16. Keep: Role (lines 29 to 33), Scope sections 1, 2, 8 (lines 44 to 59, 101 to 108), Skeptical verification core (lines 121 to 131)**
The Role statement is sharp. Sections 1, 2 and 8 are the right categories and need only the vocabulary fix from item 1. Section 8's "module-scoped state as do-not-break anchors" and the call-graph adjacency list are the parts that make this agent worth running. Skeptical verification's "Don't trust naming... Always grep" is correct; item 10 only adds the receipts.

---

Summary
Keep 4 sections, change 12, delete 0 (item 11 shrinks the template rather than deleting it).
Most important change: item 1, rewrite Shared Context and the description as project-agnostic with a config hook; every other item is moot until the prompt runs on a project that is not GameEngine.
Second: items 3 and 4 together, so synthesis can consume the report without mistaking "HIGH RISK" for a HIGH finding.
