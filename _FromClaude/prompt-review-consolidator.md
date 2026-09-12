---
title: Prompt review of consolidator.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

> Produced by an automated review agent running Claude Fable 5.1. Read-only pass over `plugins/djinn/agents/consolidator.md` (46 lines), `relay.md`, `commands/review.md`, `commands/dispatch.md`, `agents/synthesis.md`, `agents/known-bugchecker.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`, and `~/Conventions/code/KNOWN-BUGS.md`. No file other than this report was written. Where a quoted line contains an em dash or arrow, it is written out as `(em dash)` or `(arrow)` here.

Files read outside the assigned prompt, for the fence check: all inside `~/djinn-relay/plugins/djinn/` and `~/Conventions/`. No other directory opened.

**1. The prompt filters on "fixed" findings, but review.md spawns it before any fix exists** (line 10, line 18)
Current: line 10 "After a review relay completes (fixes shipped)"; line 18 "For each HIGH or MEDIUM finding that was fixed:"
Proposed: Replace lines 14 to 18 with an explicit input contract and a disposition rule:

```
# Inputs (pasted by the orchestrator)

- AUDIT_DIR, the run folder.
- INDEX_PATH, the known-bugs index (from per-project config). Its detail files sit beside it.
- A disposition per synthesis finding: fix, landed, deferred, dismissed, or unknown.
- The changed-file list for the run. Do not open any file outside AUDIT_DIR, INDEX_PATH and its detail files, and the project's CLAUDE.md. If you open one anyway, list it under "Files read" at the end.

If no disposition list was pasted, you are running at the end of an audit-only pass. Say so on the first line of your output and treat every HIGH and MEDIUM finding as a candidate, labeled "disposition unknown".

# Process

1. Read every synthesis in the run: `<AUDIT_DIR>/synthesis.md` and each `<AUDIT_DIR>/round-N/synthesis.md`. The last one wins on whether a finding is resolved.
2. Read `<AUDIT_DIR>/agents/known-bugchecker.md` (and each round's copy). Every KNOWN-* hit there is a re-triggered index entry.
3. Read the index at INDEX_PATH and every detail file it links.
4. For each finding at HIGH, MEDIUM, CRASH, CORRUPT, or DEGRADE whose disposition is fix, landed, or unknown: run the New test and the Recurs test below. Pass both, and it becomes a proposed entry.
5. For each dismissed finding that was a KNOWN-* hit: propose an update to that entry (the entry produced a false positive; say what the entry should say instead).
6. Deferred findings: skip. They are not patterns yet.
```
Why: `commands/review.md` step 7 runs the consolidator right after synthesis in `full` scope, when nothing has been fixed, so line 18 matches zero findings and the agent either returns "No changes needed" every time or silently drops the filter. `relay.md` line 87 says post-relay, `relay.md` line 35 says dismissals may also go into the index, and neither is expressible with the current "was fixed" gate. Naming the inputs also gives decision 1 (fence) and decision 5 (ledger) something to hook onto.

**2. "Project memory" is the wrong home for the index, and the name is a hardcoded project detail** (line 17, line 3)
Current: "Read the current `bugs_to_avoid.md` index from project memory"
Proposed: "Read the index at INDEX_PATH (pasted into your dispatch from per-project config; the convention default is `docs/known-bugs/INDEX.md` in the repo) and every detail file it links."
Why: `~/Conventions/code/KNOWN-BUGS.md` lines 19 to 22: the index lives in the repo, "never solely in the Claude memory directory," because memory does not travel between machines and nobody but Claude reads it. Decision 2 moves every hardcoded memory path into per-project config. A new developer at the workplace has no idea what "project memory" refers to.

**3. The entry template is missing Detection and Severity, so the bugchecker cannot use what the consolidator produces** (lines 32 to 36)
Current: four fields: What, Why it's bad, Prevention, Source
Proposed:
```
### <slug>            (kebab-case; this becomes docs/known-bugs/<slug>.md)
- **Severity:** HIGH | MEDIUM   (the tier synthesis assigned; drives KNOWN-HIGH / KNOWN-MEDIUM in the first-pass checker)
- **What:** the pattern in one or two sentences, described as a code shape, not a file name
- **Why it's bad:** the failure a user sees
- **Prevention:** the rule that stops it
- **Detection:** what to grep for, concrete enough that a checker with no context can run it
- **Source:** <AUDIT_DIR>/synthesis.md finding <id>, file:line, caught by <agent>
- **Index line:** the single line to append to INDEX_PATH, linking the slug
```
Why: `KNOWN-BUGS.md` lines 13 to 17 require five parts and the missing one, Detection, is the one `known-bugchecker.md` line 12 depends on ("a pattern matcher, not an analyzer"). `known-bugchecker.md` lines 30 to 32 assign KNOWN-HIGH vs KNOWN-MEDIUM by what the pattern "previously caused," which the consolidator is the only agent positioned to record. The index-plus-detail split (`KNOWN-BUGS.md` line 9) needs the consolidator to emit both the index line and the detail body, or the human has to invent the index line by hand.

**4. "Is this NEW" and "is it generalizable" are asked, never tested** (lines 19 to 21)
Current: "Is this a NEW pattern not already in the index? Is it generalizable (would it apply to future code, not just this one instance)? If yes to both (arrow) produce a new entry"
Proposed:
```
**New test.** Grep the index and its detail files for the finding's mechanism (the API, the construct, the failure word: "finally", "splice", "observer", "restore"). Name the terms you searched in the entry. A match under a different name is not new; propose it under "Existing patterns confirmed" or "Patterns to update" instead.

**Recurs test.** Write the What as a code shape. If the sentence only works by naming this project's file or symbol, rewrite it; if it cannot be rewritten, it is a one-off, not a pattern, and does not go in. Tag each entry `scope: project` or `scope: general`. General means it would apply in a project using a different engine or framework; those are candidates for promotion to the shared catalog, which is the human's call.

Every claim cites `<AUDIT_DIR>/synthesis.md` finding id and file:line. An entry with no citation is discarded by the orchestrator.
```
Why: `REVIEW.md` lines 20 to 22 ask every relay agent for a skeptical verification clause; this prompt has none. Without the grep, the consolidator will re-propose an existing entry under a new name after the index passes a dozen entries, which is exactly the drift `KNOWN-BUGS.md` line 34 warns about. The scope tag closes a gap in `KNOWN-BUGS.md` lines 35 to 37 (engine-specific entries stay in the project index, generalizable ones move up) that the current prompt conflates into one yes/no.

**5. "Was it triggered in this relay" has no defined source and "strengthens confidence" has no defined effect** (lines 22 to 24)
Current: "Was it triggered in this relay? (agent flagged it from the known patterns list). If so, note it as a recurring pattern (strengthens confidence)"
Proposed: "An entry was triggered when `<AUDIT_DIR>/agents/known-bugchecker.md` reports a KNOWN-* hit naming it, or when a synthesis finding names it. For each, output the entry slug, the file:line, and the agent that flagged it. Propose the index line gain or increment a `recurring: N` count with this run's date. Do not propose severity changes on a single recurrence."
Why: Line 16 only tells the agent to read the synthesis, and `synthesis.md` lines 41 to 64 give no slot for the pattern name, so the trace to the index entry is lost unless the consolidator reads the bugchecker report directly. `KNOWN-BUGS.md` line 29 says "marked recurring"; the prompt needs to say what that mark is so the human can apply it without guessing.

**6. relay.md says FUTURE-* debt is tracked in the index, and no agent does it** (line 18, conflict with relay.md line 82)
Current: no handling of FUTURE-HIGH or FUTURE-MEDIUM anywhere in the prompt
Proposed: Add a fifth output section:
```
## Debt carried
- <finding id> file:line: one-line restatement, from <agent>. Not a pattern; listed so it is not lost.
```
And a process line: "FUTURE-HIGH and FUTURE-MEDIUM findings are not patterns. List them verbatim under Debt carried. Do not turn them into index entries."
Why: `relay.md` line 82: "FUTURE-HIGH/MEDIUM: reported, never block shipping. Tracked as architectural debt in `bugs_to_avoid.md`." The consolidator is the only agent that writes toward the index and it currently skips these, so the tracking promise is empty. Keeping them in a separate section stops debt from being mistaken for a bug pattern by the first-pass checker. If the owner would rather track debt somewhere else, that is a relay.md change, and the conflict should be resolved on one side or the other.

**7. Step 5 "check for contradictions" is undefined** (line 25)
Current: "Check for contradictions: did this relay's findings conflict with any existing entry? Flag for update."
Proposed: "An entry needs an update when: (a) a KNOWN-* hit on it was dismissed by the human (the Detection rule over-matches; say what to narrow); (b) a landed fix does the opposite of the entry's Prevention and the brief's WHY explains why (the Prevention has an exception; record it); (c) two entries now describe the same mechanism (propose the merge). Cite the finding id or the brief path for each."
Why: "Conflict" with no definition produces either nothing or an essay. Three named triggers, each with a citation, are checkable by the human in a minute. Case (b) is the one that matters most: `relay.md` line 41 says the brief's WHY holds the cause-vs-symptom reasoning, and that is where a deliberate exception to an index rule would be recorded.

**8. Output sections are optional, which makes the report unparseable** (lines 29 to 46)
Current: four headings, with "## No changes needed" as an alternative to the others
Proposed: Every section is always present, in fixed order, with the literal word `none` when empty: New patterns to add, Existing patterns confirmed, Patterns to update or remove, Debt carried, Files read. Delete "## No changes needed". End with one fixed line the orchestrator appends to `audits/LEDGER.md` unchanged:
`consolidator | <AUDIT_DIR> | new: N | confirmed: N | update: N | debt: N | files-outside-fence: N`
Why: An orchestrator that has to detect whether "No changes needed" replaced the other headings is doing parsing by inference. Decision 5 wants one ledger line per command; giving the consolidator a fixed final line means the orchestrator copies rather than composes. "Files read" is the hook for decision 1, since the consolidator runs after synthesis and nobody else reports on what it opened.

**9. No guard on the 50-entry cap** (new step, after line 25)
Current: none
Proposed: "Count the index lines. If adding your proposals would take it past 50, do not propose the additions alone; propose the merges that keep it under 50, naming which existing entries fold together and why."
Why: `KNOWN-BUGS.md` line 9 and lines 34 to 35 set the cap and say an index over 50 gets consolidated. The consolidator is the natural place to enforce it, and the name suggests it already does.

**10. "Read-only in spirit" is fuzzy, and the description claims the agent writes** (line 3, line 12)
Current: line 3 "updates the bugs_to_avoid index"; line 12 "You are read-only in spirit. You produce a structured output that the orchestrator writes to disk."
Proposed: line 3: "Post-relay agent that proposes additions and updates to the project's known-bugs index from a completed relay. Proposal only; a human applies it." Line 12: "You have no Write tool. Your entire output is a proposal. The orchestrator saves it verbatim to `<AUDIT_DIR>/consolidator.md`. Nothing you propose is applied to the index until a human reads it (review.md step 7)."
Why: The description is what the orchestrator and any Codex adapter use to pick and explain the agent, and "updates the index" is false. "In spirit" invites an Opus agent to reason about whether a small write is in the spirit. The tools line already enforces it; the prose should match.

**11. The output template teaches em dashes and arrows into a repo file** (line 21, line 39, line 42)
Current: line 39 "- [pattern-name] (em dash) triggered by [agent], still relevant"; line 42 same shape; line 21 "If yes to both (arrow) produce a new entry"
Proposed: colons. "- <slug>: triggered by <agent> at file:line, still relevant". "- <slug>: <reason>". "If yes to both, produce a new entry."
Why: The owner's voice rule bans em and en dashes in all writing, and the consolidator's output is destined for `docs/known-bugs/` in the repo. A template that models the banned character guarantees it lands there.

**12. Say what is Claude-specific** (frontmatter, lines 1 to 6, and line 12)
Current: `tools: Read, Grep, Glob`, `model: opus`, and the assumption that the orchestrator captures the agent's return value
Proposed: Add one line under Role: "Runtime note: the frontmatter is Claude Code agent format. The only mechanism this prompt relies on is that the parent captures the agent's full return text and writes it to `<AUDIT_DIR>/consolidator.md`. An adapter for another runtime needs to do the same."
Why: Decision 6. The prompt body is runtime-neutral; the capture-and-save step is the one thing an adapter must replicate, and saying so saves the adapter author a read of review.md.

**13. Keep: model and tools** (lines 4 to 5)
Current: `tools: Read, Grep, Glob`, `model: opus`
Proposed: keep
Why: Decision 3 is Opus everywhere; `AGENTS.md` line 60 says all code review on Opus. The tool set is the correct fence for a proposal-only agent.

**14. Keep: overall length** (whole file)
Current: 46 lines
Proposed: keep the shape; the edits above roughly double it, and every added line is a definition the current version lacks
Why: Nothing in the file is padding. The problem is thinness, not bloat: three of the five process steps have no test attached and the output has no contract.

**15. Overlap check: none found**
`gap-hunter.md` reads the index to ask what instrumentation would have caught past bugs and emits ideas, not index entries. `synthesis.md` ranks and verdicts. `known-bugchecker.md` consumes the index. No other agent proposes entries, so there is no double-finding risk. The one seam is issue 6: `relay.md` line 82 promises debt tracking in the index and no agent delivers it.

## Summary

Keep 2 / change 12 / delete 1 (the "No changes needed" section, folded into always-present sections).
Most important change: issue 1. Define the consolidator's inputs and disposition rule so it can run where review.md actually spawns it, instead of filtering on "fixed" findings that do not exist yet.
Second: issue 3. Add Detection and Severity to the entry template, or the first-pass checker cannot use anything the consolidator writes.
