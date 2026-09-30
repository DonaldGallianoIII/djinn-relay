---
title: Prompt review of commands/brief.md (with templates/fix-brief.md)
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

Files reviewed: `plugins/djinn/commands/brief.md` (103 lines) and the template it fills, `plugins/djinn/templates/fix-brief.md` (45 lines). Cross-checked against `commands/review.md`, `commands/dispatch.md`, `agents/synthesis.md`, `agents/pipe-connector.md`, `agents/fixer.md`, and `relay.md`. Line numbers below are for brief.md unless marked "template".

**1. The finding-id the command expects does not exist in the synthesis output** (line 3, 15, 22, 50, 85)
Current: "finding-id matches an entry in the synthesis (e.g. HIGH-1, MEDIUM-3)" and "or the synthesis list number"
Proposed: "finding-id is the list number from the synthesis Fix List (synthesis numbers findings 1, 2, 3 across all tiers; there is no HIGH-1 form). Locate the numbered entry, and take the tier from the `###` heading above it. If the number does not exist, stop and list the numbers that do. Hook for synthesis: if synthesis later stamps `<TIER>-<n>` IDs, accept either form." Change line 50's `{{FIX_ID}}` to `<tier>-<n>-<slug>` (e.g. `HIGH-3-rename-callers`) so the tier survives into the filename, and change line 85 to match.
Why: `agents/synthesis.md` lines 41 to 55 emit one running numbered list with no per-tier IDs. `/djinn:brief <folder> HIGH-1` matches nothing today, and the two devs will not know why. Three conventions are in play right now: `HIGH-1` here, `1.` in synthesis, `01-rename-madeup` in relay.md line 122. Pick one and say it.

**2. The template path is wrong and will fail at runtime** (line 44)
Current: "Read `ReviewRelay/templates/fix-brief.md`."
Proposed: "Read `${CLAUDE_PLUGIN_ROOT}/templates/fix-brief.md`. (Claude Code resolves this variable to the plugin's install directory; a Codex adapter must supply the equivalent path.) If the template cannot be read, stop and report. Do not reconstruct the template from memory."
Why: The file lives at `plugins/djinn/templates/fix-brief.md`, and `ReviewRelay/` is a path from the old the automation repo location (REVIEW.md line 40). Relative to a target project, neither path exists. Without the fallback rule the command will silently invent a template and dispatch.md's frontmatter parser (dispatch.md lines 20 to 26) may not find the fields it expects.

**3. Hardcoded `npm run build` violates the project-agnostic decision** (line 74; template lines 30 and 44)
Current: "`npm run build` passes"
Proposed: "`{{BUILD_COMMAND}}` passes with no new errors", where `{{BUILD_COMMAND}}` is read from the per-project config. Add to Step 5: "If the config names no build or typecheck command, write `NONE CONFIGURED` in that criterion and say so in the Step 7 report." Apply the same substitution at template lines 30 and 44.
Why: Decision 2. The same string is hardcoded in dispatch.md lines 85 and 119, fixer.md line 57, and relay.md line 61, so the config key needs one name that all four read. A Python or JAX project run through this relay today gets a criterion that cannot pass.

**4. No verification that the cited file:line is real** (line 21 to 24)
Current: "Extract: file:line reference, severity, one-line description, originating agent(s)"
Proposed: Add after line 24: "Open the cited file at the cited line. Confirm the symbol or construct the finding names is actually there. If it is not (file moved, line drifted, synthesis mis-merged two findings), write `# LINE MISMATCH: <what is actually at that line>` next to the reference in WHAT and say so in the Step 7 report. Do not silently correct the line number."
Why: The whole command takes the synthesis on faith. Synthesis itself dedups and re-attributes (synthesis.md line 18), so a wrong file:line is the most likely defect to reach the fixer. This is a one-Read check and it is the only skeptical-verification step the command would have.

**5. The command never reads `context.md`, and does not mark work_set entries that leave the audited scope** (line 19 to 40)
Current: Step 2 reads only `synthesis.md` and agent reports. Step 3 greps the whole repo for importers.
Proposed: In Step 2, add first: "Read `<audit-folder>/context.md` for `base_commit` and `changed_files`." In Step 3, add: "Any file placed in `work_set.files` that is not in `changed_files` gets a trailing `# OUTSIDE AUDIT SCOPE` comment. List those files in the Step 7 report. The grep for importers is allowed to look anywhere in the repo, but every file it adds to work_set is one the reviewers never read."
Why: Decision 1 makes the changed-file list a hard fence and has synthesis report crossings. `review.md` lines 37 to 43 already write `context.md` with exactly this list, and brief.md ignores it. Fixes that cascade into unreviewed files are the main way a brief widens a change past what was audited, and today the human cannot see that from the brief.

**6. No ledger line, no attribution header** (line 81 to 87; template lines 1 to 12)
Current: Step 6 writes the brief and stops.
Proposed: Add to Step 6: "Append one line to `audits/LEDGER.md`: `<ISO date> | brief | <audit-folder> | <finding-id> | <brief-path> | work_set: confident|inferred`." Add to the template frontmatter: `generated_by: <model running this command>` and `work_set_source: pipe-connector | inferred`.
Why: Decision 5 says every command appends a ledger line. `~/Conventions/workflow/AGENTS.md` lines 8 to 34 say any file an agent writes into a repo carries the model name and a status; the brief has `status: pending` but no author. `work_set_source` also gives dispatch.md a mechanical field to warn on instead of parsing `# UNCERTAIN` comments.

**7. `symbols_renamed` is filled from a section pipe-connector does not produce** (line 32)
Current: "Symbols declared / renamed → feeds `symbols_renamed` / `symbols_touched`"
Proposed: "Exports with their importer lists → feeds `work_set.files` and `symbols_touched`. Leave `symbols_renamed` empty unless the finding text itself proposes a rename (`old → new`). Never invent a target name; the new name is a deliberation decision."
Why: `agents/pipe-connector.md` output (lines 133 onward) maps exports, importers, observables, and state coupling. It has no rename section. As written, the command is told to extract something that is not there, and the plausible failure is that it invents `foo → bar` pairs that the fixer (fixer.md line 23) then treats as the only renames permitted.

**8. Severity list is incomplete and does not say what to do with non-blocking tiers** (line 52)
Current: "`{{SEVERITY}}` → from synthesis (HIGH / MEDIUM / LOW / CRASH / CORRUPT)"
Proposed: "`{{SEVERITY}}` → copied verbatim from the synthesis tier heading: HIGH, CRASH, CORRUPT, MEDIUM, DEGRADE, LOW, FUTURE-HIGH, FUTURE-MEDIUM. If the tier is LOW or FUTURE-*, say in the Step 7 report: this finding does not block ship; confirm the user wants a brief for it."
Why: synthesis.md lines 23 to 30 define eight tiers; brief.md lists five. DEGRADE (breaker's MEDIUM) would be dropped or mis-tiered. relay.md line 81 says LOW never blocks, so briefing one should be a conscious choice.

**9. NOTES FOR FIXER duplicates fixer.md and already disagrees with it** (line 79; template lines 40 to 45)
Current: template lines 42 to 45 restate the work-set guard, the build step, and a five-part report format.
Proposed: Delete template lines 43 to 45. Keep line 42 (the work-set sentence) and add one line: "Full protocol and report format: the fixer agent definition. This brief does not override it." Change brief.md line 79 to "keep the single line from the template."
Why: `agents/fixer.md` lines 89 to 118 define a six-section report (Status, Files Changed, Summary, Build Status, Success Criteria, Scope Notes). The template's list has five and omits Status, which is the field dispatch.md line 95 reads to set the brief's status. Two copies of the same protocol drift; this one already has.

**10. The WHY example and the slug example are project-specific** (line 50, 63 to 71)
Current: "HeightMap.madeup() shadows a Babylon built-in" ... "across Toolbar.ts and DebugOverlay.ts"
Proposed: Replace with a stack-neutral example: `From bugs-reviewer: "<module>.<fn>() shadows a library built-in of the same name."` and `Pipe-connector shows N external callers across <file A> and <file B>; the rename must reach all of them.` Change line 50's example to `HIGH-3-rename-shadowed-fn`.
Why: Decision 2. Examples are the part of a prompt a model copies most literally; a Babylon example in a Python project nudges the output toward TypeScript idioms.

**11. The "same fix under two findings" rule cannot be followed as written** (line 102)
Current: "If the same underlying fix shows up under two synthesis findings, flag it and suggest merging into one brief rather than generating two."
Proposed: "After locating the finding, scan the rest of the synthesis Fix List for entries citing the same file. Also list any existing brief under `<audit-folder>/fixes/` whose `work_set.files` shares a file with this one. Report both lists in Step 7 as 'possible overlap'; the human decides whether to merge."
Why: The command reads one finding, so it has no basis for "shows up under two" unless told what to compare. The concrete version costs one Grep and gives dispatch fewer file-overlap serializations (dispatch.md lines 40 to 41).

**12. Overwrite is offered even for a landed brief** (line 87)
Current: "ask whether to append a suffix, overwrite, or abort"
Proposed: "Read the existing brief's `status`. If it is anything other than `pending`, refuse to overwrite; offer suffix or abort only. If `pending`, offer suffix, overwrite, or abort."
Why: A `landed` brief is the forensic record relay.md line 178 promises. Overwriting it loses the link between a saved `.diff` and the brief that produced it.

**13. Say which mechanisms are Claude Code only** (line 1 to 5, 13)
Current: frontmatter `allowed-tools`, `$ARGUMENTS`, and (after item 2) `${CLAUDE_PLUGIN_ROOT}` with no note.
Proposed: Add one line under the title: "Claude Code specifics: `$ARGUMENTS`, `allowed-tools`, `${CLAUDE_PLUGIN_ROOT}`. An adapter for another runtime supplies the same three."
Why: Decision 6. Nothing else in the command is runtime-specific, so one line covers it.

**14. Bash is allowed with no stated limit** (line 4, 98 to 103)
Current: `allowed-tools: Read, Grep, Glob, Write, Bash` and Rules say only "Do NOT modify any code."
Proposed: Add to Rules: "Bash is for `date` and `mkdir -p` only. Do not run the build, tests, or any git command that changes state."
Why: The command has Write and Bash and a plausible reason to "just check the build." Naming the two permitted uses closes that.

**15. Dashes violate the owner's voice rule** (line 40, 61; template lines 16, 22)
Current: em dashes in "not run for this file — work_set is inferred" and "Be specific — name files".
Proposed: Replace each with a period or colon.
Why: `~/.claude/CLAUDE.md` voice rule 1 applies to all writing, and the template text is copied verbatim into every brief in the repo.

**16. Undefined jargon for the two new reviewers** (line 9, 50)
Current: "dispatched to a fixer", "slug ... kebab-case", "orchestrator" (line 3).
Proposed: One parenthetical each on first use: "fixer (the agent that edits code)", "slug (short lowercase words joined by hyphens)", "orchestrator (the main Claude session running this command)".
Why: The brief for this review names two developers who have never used a pull request. Three words, three parentheticals, no other cost.

**Keep, no edit:**
- Step 1 (line 11 to 17). Clear and it refuses to guess.
- The WHY rule (line 63, 101). "Do not speculate on deliberation context" is the load-bearing sentence of the command and relay.md line 41 agrees with it.
- Step 7 report (line 89 to 96). Consumable, tells the human what to fill.
- `{{FILE_PATHS}}` distinction between read-for-context and edit (line 59).
- `depends_on: []` left empty (template line 11). Dispatch computes implicit edges; a human adds explicit ones.
- Model: the command runs in the caller's session and writes no code, so decision 3 does not require a model line here.

Summary: keep 6 / change 15 / delete 1 (template NOTES FOR FIXER lines 43 to 45).
Most important change: item 1. The finding-id form the command documents (HIGH-1) is not what synthesis emits (a plain running number), so the command's first step fails on real input. Fix the ID contract in one place and make brief, synthesis, and relay.md agree.
Second: item 2, the template path points at a directory that does not exist in the installed plugin.
