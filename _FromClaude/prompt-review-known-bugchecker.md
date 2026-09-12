---
title: Prompt review of known-bugchecker.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/known-bugchecker.md` (50 lines).
Also read: `relay.md`, `commands/review.md` (steps 4 and 5), `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`. Skimmed for overlap: `bugs-reviewer.md`, `integration-reviewer.md`, `perf-reviewer.md`, `synthesis.md`, `consolidator.md`.

**1. `model: sonnet` violates the Opus rule** (line 5, plus line 3 and line 50)
Current: `model: sonnet` / "Fast first-pass agent ... Lightweight" / "Be fast. Be mechanical."
Proposed: `model: opus`. Line 3 description: "First-pass agent that checks each changed file against every entry in the project's known-bugs index. Runs before the other reviewers so they can skip what it already caught. Checks patterns only, no new analysis." Line 50: delete "Be fast." (see item 11 for the rest of that line).
Why: Decision 3 and AGENTS.md line 59 say Opus for all code review, no exceptions. REVIEW.md line 41 already names this file as one of the two that still say Sonnet. "Be fast" contradicts AGENTS.md line 69, "Correctness over cheap and fast." The word "mechanical" is fine; "fast" invites skipping detail files.
Hook needed elsewhere: `relay.md` line 101 says "fast Sonnet pass". That line goes stale once this changes.

**2. The agent is told to write a report but has no Write tool** (line 4, with `commands/review.md` line 53)
Current: `tools: Read, Grep, Glob`
Proposed: Keep the tool list. Add one line under Output format: "Return the full report as your final message. The orchestrator writes it to `<AUDIT_DIR>/agents/known-bugchecker.md`. Do not attempt to write files." And in `commands/review.md` step 4, change "write report to" to "orchestrator saves the returned report to".
Why: `review.md` line 53 instructs the agent to write its report to disk, but the frontmatter denies Write. On Claude Code the agent either fails or improvises. `consolidator.md` line 12 already uses the return-and-orchestrator-writes pattern; copy it. This mismatch exists in every review agent (all are `Read, Grep, Glob`), so fix it once in the command and once here, not by adding Write to fifteen frontmatters.

**3. Hardcoded GameEngine memory path** (line 10)
Current: "Read the bugs_to_avoid index at `/home/donaldgalliano/.claude/projects/-home-donaldgalliano-GameEngine/memory/bugs_to_avoid.md`."
Proposed: "Your dispatch names the known-bugs index path (from the project config). Read it. For each entry, read its linked detail file. If the dispatch gives no path, or the file does not exist, output `## Index: NOT FOUND at <path>` followed by `## Patterns Checked: 0/0` and stop. Do not search the filesystem for an index."
Why: Decision 2 moves every project-specific path into per-project config. The current line makes the agent useless on any other repo and, worse, on a fresh machine it will Glob around looking for the file, which is a fence violation (decision 1). `bugs-reviewer.md` line 10 already has "if it exists" handling; this prompt has none.

**4. Delete the inline pattern list; the index is the only source** (lines 19 to 25)
Current: seven bullets from "Per-frame allocations" through "Unmanaged observers", naming `onBeforeRenderObservable`, `splatData.set()`, `updateSplatMap()`, `syncFromState()`.
Proposed: delete all seven bullets. Replace step 3 with: "For each changed file, for each index entry: run the entry's search signature (the grep or the file-region rule written in its detail file). Do not check patterns that are not in the index. Do not skip patterns that are."
Why: The list is Babylon and GameEngine specific (decision 2). It also duplicates the index, and a copy drifts: an agent given both will check these seven and treat the index as background reading, so `Patterns Checked: N/N` on line 47 becomes meaningless because nobody knows which N. A new developer at Donald's workplace reading "recomposite" or "splatData" will not know whether it applies to their repo.
Hook needed elsewhere: each index entry needs a machine-usable search signature field. Flag for the per-project config and the consolidator's "New patterns to add" template (`consolidator.md` line 32 to 36 has What, Why, Prevention, Source, but no grep signature).

**5. `KNOWN-HIGH` tags do not exist in synthesis, and severity is defined on a different basis** (lines 28 to 32, 39, 42)
Current: "**KNOWN-HIGH:** Pattern previously caused a crash, data loss, or severe perf degradation" and tags `[KNOWN-HIGH]`, `[KNOWN-MEDIUM]`.
Proposed: replace the Severity section with: "Severity is copied from the index entry, not re-rated. Use the plain tags `[HIGH]`, `[MEDIUM]`, `[LOW]` so synthesis can merge them. If an index entry carries no severity, tag it `[MEDIUM]` and add `(index entry has no severity)` after the pattern id." Change the two tags in the Output format block to match.
Why: `synthesis.md` lines 23 to 30 enumerate HIGH, CRASH/CORRUPT, MEDIUM, DEGRADE, LOW, FUTURE. `KNOWN-*` is not among them and synthesis line 10 does not even list known-bugchecker among the reports it receives, so these findings may be dropped or mis-tiered. Also, every other agent defines HIGH as "will cause X under realistic conditions" (a prediction) while this file defines it as "previously caused X" (history). Two agents rating the same hit will disagree on tier for a reason that is not about the code. Taking severity from the index removes the judgment call from a pattern matcher entirely.
Hook needed elsewhere: index entries must carry a severity field. Add to the per-project config spec and to `consolidator.md` line 32 to 36.

**6. No fence language, and the index files need a declared exception** (line 10, "check every changed file")
Current: "Then check every changed file against every pattern."
Proposed: add after line 10: "The changed-file list in your dispatch is a hard fence. Read only those files, the index, and the index's linked detail files. Do not open callers, imports, or neighbors; if a pattern needs cross-file context (a listener added in one file and removed in another), report the hit as `[MEDIUM] UNCONFIRMED` and name the file you would have needed. Synthesis reports any other file you open."
Why: Decision 1 makes synthesis report reads outside the fence. This prompt tells the agent to read detail files outside the repo (the memory directory), which is correct but will show up as a fence violation unless the prompt and the synthesis rule both name it as the allowed exception. The `UNCONFIRMED` path stops the agent from doing integration-reviewer's cross-file work under the name of pattern checking.

**7. Missing skeptical verification clause** (line 12, line 50)
Current: "Your job is fast, mechanical checking" / "Be fast. Be mechanical. If a pattern doesn't match, say so and move on."
Proposed: add a paragraph after line 12: "**Skeptical verification:** A grep hit is not a finding. Open the file at the hit, read the surrounding lines, and confirm they match the trigger condition as the detail file states it. Quote the offending line in the finding. If the entry's stated guard is present (the reference is stored and removed on dispose, the flag is cleared in `finally`), that is Checked and Clean, not a finding. Hits inside comments, strings, or test fixtures are not findings."
Why: Every other review agent has this paragraph (`bugs-reviewer.md` line 12, `integration-reviewer.md` line 12, `perf-reviewer.md` line 12). REVIEW.md line 20 to 22 requires it for every reviewer. A pattern matcher with no verification clause is the agent most likely to produce false positives, and `review.md` line 67 then tells every downstream agent to trust those hits and "focus on issues it did not catch". A wrong hit here poisons the whole run.

**8. Output format is not mechanically consumable** (lines 34 to 48)
Current: `### [KNOWN-HIGH] file:line — pattern: [pattern name]` / `## All Clear` / `## Patterns Checked: N/N`
Proposed:
```
## Index
path: <index path>, entries: <N>

## Flagged
- <pattern-id> file:line
(one line per hit; "none" if empty. This block is pasted into the other agents' dispatch.)

## Findings

### [HIGH] file:line, pattern: <pattern-id>
Quoted line: `<the line>`
Match: <one sentence, why this is the trigger condition from the detail file>

## Checked and Clean
- <pattern-id>: checked in <files>, no hit

## Files Checked
- <every file from the dispatch list, one per line>

## Patterns Checked: <N>/<N entries in index>
```
Why: Synthesis line 21 checks whether any changed file was missed by all agents; it can only do that if each report lists the files it covered. Consolidator line 23 asks "was it triggered in this relay?"; that needs a stable `pattern-id` from the index, not a free-text name. `review.md` line 67 pastes "known-bugchecker flagged: <list>" into every other dispatch; the `## Flagged` block gives the orchestrator something to copy verbatim. "All Clear" becomes "Checked and Clean" to match the other five agents. `N/N` is now defined: entries in the index.

**9. Overlap: bugs-reviewer and perf-reviewer re-check the same index** (this file line 10, against `bugs-reviewer.md` line 26 and `perf-reviewer.md` line 10)
Current: (no text in this file addresses it)
Proposed: no edit to this file beyond item 8's `## Flagged` block. Flag for the other two prompts: `bugs-reviewer.md` line 26 "Any pattern listed in bugs_to_avoid.md" and `perf-reviewer.md` line 10 should say "except entries known-bugchecker already flagged for this file; see the Flagged list in your dispatch."
Why: `review.md` line 67 already tells later agents to skip what the checker caught, but `bugs-reviewer.md` line 26 tells them to check every index pattern anyway. Same hit, two reports, and synthesis has to dedupe by hand. Not proposing edits to those files here; naming the lines so their reviewers see it.

**10. No Round 2 behavior** (whole file, against `relay.md` line 69)
Current: (absent)
Proposed: add a short section: "# Round 2. If the dispatch says Round 2, first re-check every finding from the Round 1 known-bugchecker report at its file:line and report each as `RESOLVED` or `STILL PRESENT` with the current line. Then run the normal check on the Round 2 changed-file list."
Why: `relay.md` line 67 to 69 says Round 2 uses the same agents and must "verify each Round 1 HIGH/MEDIUM is resolved." This prompt has no instruction for that, so the Round 2 checker will produce a fresh report with no link to Round 1 and synthesis cannot close the loop.

**11. Lines 12 and 50 say the same thing; merge** (line 12, line 50)
Current: line 12 "This agent is a pattern matcher, not an analyzer ... Leave deep analysis to the bugs-reviewer and integration-reviewer." Line 50 "Be fast. Be mechanical. If a pattern doesn't match, say so and move on. Don't speculate about new bugs ..."
Proposed: keep line 12, reworded: "You are a pattern matcher, not an analyzer. You check the index and nothing else. Do not report bugs that are not in the index; bugs-reviewer and integration-reviewer own those. If a pattern does not match, list it under Checked and Clean and move on." Delete line 50.
Why: Same instruction twice, 38 lines apart. One statement at the top is enough, and it removes "Be fast" (item 1).

**12. Codex portability** (lines 1 to 6)
Current: frontmatter `name`, `description`, `tools`, `model`.
Proposed: add a comment line after the frontmatter: `<!-- Frontmatter is Claude Code agent format. Body is host-agnostic. Adapter maps tools and model. -->`
Why: Decision 6. The body of this prompt uses no Claude-only mechanism (no Agent tool, no memory-dir assumption once item 3 lands). Only the frontmatter is Claude-specific. Saying so in one line tells the adapter author where the boundary is.

**13. Em dashes in the prompt body** (lines 3, 12, 39, 50)
Current: four em dashes.
Proposed: replace with a period, colon, or comma.
Why: Voice rule applies to all writing. Low impact, but the agent copies the output-format template verbatim into its report, so line 39's dash propagates into every audit file.

## Keep verdicts

- Process steps 1, 2, and 4 (lines 16, 17, 26): keep. Read index, read detail files, report file and line and pattern. That is the whole job, stated plainly.
- The role sentence on line 12: keep the idea (see item 11 for the merge).
- `tools: Read, Grep, Glob` (line 4): keep. A pattern matcher does not need Bash or Write, provided item 2 lands.

## Summary

Keep 3 sections / change 10 / delete 2 (the seven-bullet pattern list at lines 19 to 25, and line 50).
Most important change: line 5, `model: sonnet` to `model: opus`, then delete the hardcoded pattern list and path so the index becomes the only source of patterns.
Second: the agent cannot write the report review.md tells it to write; adopt the consolidator's return-and-orchestrator-writes pattern.
