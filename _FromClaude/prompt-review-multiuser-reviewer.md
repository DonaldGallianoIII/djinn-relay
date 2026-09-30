---
title: Prompt review of multiuser-reviewer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/multiuser-reviewer.md` (58 lines).
Also read: `plugins/djinn/relay.md`, `plugins/djinn/commands/review.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`. Skimmed `synthesis.md`, `bugs-reviewer.md`, `integration-reviewer.md`, `security-reviewer.md` for overlap, and grepped the rest of `agents/` for multi-user terms.

Short version: this is one of the tighter prompts in the set. The role and the "only expensive things" filter are right and should stay. The problems are that its core verification step (grep the whole repo for dependents) is structurally a fence violation under decision 1 with no hook to declare it, its severity tiers are time estimates nobody can check, and its "No Issues" output gives synthesis nothing to verify coverage against.

**1. The dependency-depth grep is a fence read with no way to declare it** (line 10 to 12, line 52)
Current: "Grep for usages. A singleton used in 2 places is trivially fixable. A singleton woven into 40 files is not." and "**Dependency depth:** How many files/systems are affected (verified via Grep)"
Proposed: Add after line 12:
"The changed-file list in your dispatch is the fence. Counting dependents requires searching outside it. That is allowed for this agent, with two rules: (a) Grep hits outside the fence may be counted and their paths listed, but do not Read them beyond the matching line unless the finding turns on what that line does; (b) every file you opened outside the fence goes in the `## Fence reads` section at the end of your report, one path per line, with the finding number it served. Synthesis reports unlisted out-of-fence reads as scope creep."
And add `## Fence reads` to the output block (see item 4).
Why: Decision 1 says synthesis reports any file a reviewer read outside the fence. This agent cannot do its one job (measure coupling) without reading outside the fence, so it will be flagged on every run unless the prompt distinguishes a declared, justified read from creep. The declaration also makes the depth number auditable.

**2. Severity is defined as a time estimate nobody can verify** (line 38 to 41, line 27)
Current: "FUTURE-HIGH: Would require significant refactoring (weeks)" / "FUTURE-MEDIUM: Would require moderate refactoring (days)" / "FUTURE-LOW items: skip them entirely"
Proposed:
"# Severity (only these two)
- **FUTURE-HIGH:** the assumption is baked into a persisted or wire format (save file, network message, database row, file on disk), OR the single-actor assumption has 10 or more consumer files by Grep count. Migration of existing data or a coordinated multi-file rewrite is unavoidable.
- **FUTURE-MEDIUM:** in-memory only, 3 to 9 consumer files by Grep count, or a public interface that would change shape (not just gain a parameter).
- Below that threshold: not a finding. Do not mention it. There is no FUTURE-LOW tier.
The consumer count is the number you report under Dependency depth. Adjust the thresholds in the per-project config if the codebase is unusually small or large."
Why: "weeks" and "days" cannot be checked by synthesis or by a human reading the report a month later; a file count and a "persisted format" test can. Line 27 names a FUTURE-LOW tier that does not exist anywhere else in the relay (synthesis line 30 and relay.md line 82 know only HIGH and MEDIUM), which invites the agent to invent it. The thresholds belong in project config per decision 2; the prompt should name defaults so the agent never runs unanchored.

**3. The trigger and the "multiplayer" framing are project-specific; gate on config** (line 3, line 16, line 40 to 41)
Current: "Invoke on features that touch shared state, data structures, or ID generation." / "when multi-user lands" / "when multiplayer lands"
Proposed: Line 3 description: "Forward-looking review for multi-user or multi-process readiness. Runs only when the project config declares a multi-user target. Flags only architectural decisions that would be expensive to refactor when that target lands."
Add to Shared Context, after line 10: "Read the per-project relay config. If it declares no multi-user target (`multiuser_target` absent or `none`), write a report containing only `## Not applicable` and the config line you read, then stop. If it names a target (for example `realtime-collab`, `multi-tenant-server`, `multiplayer`), review against that target and use its name, not 'multiplayer', throughout your report."
Replace "multiplayer" with "the declared multi-user target" at line 16, 25, 40, 41.
Why: Decision 2 says prompts become project-agnostic. "Multiplayer" is a game word; the voice-call project at the owner's workplace has a multi-tenant problem, not a multiplayer one, and the same reviewer applies. Without a config gate, the agent will invent a multi-user future for projects that have none and produce debt entries nobody asked for. The `## Not applicable` output also gives synthesis a mechanical signal instead of an empty file.

**4. Replace "No Issues" with a coverage section synthesis can consume** (line 56 to 57)
Current: "## No Issues (if nothing meets the expense threshold)"
Proposed:
"## Checked and Clean
- <changed file>: <the single-actor assumption you looked for and why it is cheap to change, one line each>

## Fence reads
- <path outside the changed-file list>: finding N (or 'count only, not opened')

Both sections are mandatory. A report with no findings still lists every changed file under Checked and Clean."
Why: synthesis line 21 must "check if any changed file was missed by all agents." A bare "No Issues" cannot tell synthesis whether this agent read the file or skipped it. bugs-reviewer and integration-reviewer already use `## Checked and Clean`; matching them lets synthesis parse all three the same way. The Fence reads section is the hook for item 1.

**5. Give the verification clause teeth: a finding without a number is not a finding** (line 12, line 52)
Current: "Before flagging something as 'expensive to refactor,' verify the actual dependency depth. Grep for usages."
Proposed: Append to line 12: "State the pattern you grepped and the hit count in the finding. Distinguish files that read the state from files that write it; writers are what multi-user breaks. A finding with no pattern and no count is incomplete and synthesis will drop it."
Change line 52 to: "**Dependency depth:** `<grep pattern>`: N files (R readers, W writers). List the writer files."
Why: the current clause tells the agent to grep but does not require the evidence to appear in the report, so a lazy run can write "many consumers" and pass. Readers versus writers is the distinction that matters for the two-writers case at line 32 and it costs one extra grep.

**6. Draw the line against bugs-reviewer and integration-reviewer** (line 31 to 32, new section after line 36)
Current: "Synchronous state updates that would need conflict resolution with 2+ writers"
Proposed: Add a section:
"# NOT your job
- A race or stale-state bug that exists today with one user: bugs-reviewer.
- A consumer that is not notified after a state write today: integration-reviewer.
- Input validation, auth, secrets: security-reviewer.
If you notice one of these, write one line under Checked and Clean naming the agent that owns it. Do not write a finding. Your findings are about code that is correct today and becomes wrong only when a second actor appears."
Why: bugs-reviewer line 22 already covers race conditions and integration-reviewer line 20 already covers shared-state writes and consumer notification. In `full` scope all three run on the same files, and a synchronous write with two callers will be flagged three ways. security-reviewer line 36 already has a "NOT your job" section in this exact shape; mirroring it keeps the set consistent.

**7. Say plainly that this agent is reachable only from `full`** (line 3)
Current: "Invoke on features that touch shared state, data structures, or ID generation."
Proposed: Either delete that sentence (the config gate in item 3 replaces it) or, if the review command grows a trigger mechanism, phrase it as a rule the command can act on: "Auto-add to any scope when the diff touches a file matched by `multiuser_watch_globs` in the project config."
Why: `commands/review.md` line 15 to 19 lists this agent only under `full`. The description reads as if it fires on its own when shared state changes, which is not true, and a new developer will run `standard` on an ID-generation change and assume this check happened. Decision 4 is wiring in four other agents; this one has the same reachability problem in milder form and should get the same treatment.

**8. Make the ID-generation example language-neutral** (line 33)
Current: "ID generation that assumes no collisions across clients (crypto.randomUUID is fine; incrementing counters are not)"
Proposed: "ID generation that assumes no collisions across clients. Fine: a random 128-bit UUID (v4), or an ID that embeds a client or session prefix. Not fine: incrementing counters, array indices used as identity, `Date.now()` or any timestamp used as a key, hash of content alone when two clients can create identical content."
Why: `crypto.randomUUID` is a JavaScript API; the prompt is supposed to be project-agnostic (decision 2). Timestamps and array-index identity are the two collision sources a reviewer new to distributed state will miss, and neither is named.

**9. Gloss two terms for readers who have never used a PR** (line 31, line 35)
Current: "Global mutable state that assumes a single actor" / "Authority assumptions (who owns this data? what if two clients disagree?)"
Proposed: Line 31: "Global mutable state that assumes a single actor (one process, one user, one writer at a time) AND ..." Line 35: "Authority assumptions: which process is the source of truth for a value, and what happens when two processes hold different values for it. If the code has no answer, that is the finding."
Why: the two developers at the owner's workplace come from IT, not distributed systems. "Single actor" and "authority" are jargon they will read past. One parenthetical each, no added length to speak of.

**10. Name the Claude-only surfaces for the Codex adapter** (line 4 to 5, line 12, line 52)
Current: frontmatter `tools: Read, Grep, Glob` and `model: opus`; body says "Grep" as a proper noun.
Proposed: Add one line at the bottom of the frontmatter block or a comment under it: "Claude Code frontmatter. Adapter note: `tools` maps to read-only file search; `model: opus` is the code-review floor per AGENTS.md and must not be downgraded." In the body, write "search the repo (Grep)" at line 12 and "(by repo search)" at line 52.
Why: decision 6 says prompts that rely on a Claude-only mechanism should say so. The frontmatter is that mechanism, and the body's capitalized "Grep" is a tool name the Codex side will not have. Two word swaps and one note.

**11. Line 16's second sentence duplicates the Critical filter** (line 16)
Current: "You are NOT here to flag every global variable or local state assumption."
Proposed: delete. Keep the first and third sentences of line 16.
Why: line 24 to 27 says the same thing with more precision. Two statements of one rule invite the agent to reconcile them instead of following one.

**12. Em dashes throughout** (line 16, 27, 38, 40 to 41, 48 to 50)
Current: em dashes as separators in headers, bullets, and the `[SEVERITY] file:line — description` output header.
Proposed: replace with colons in prose (lines 16, 27, 38, 49, 50). Leave the output header separator alone until every agent's output header changes together, since synthesis pattern-matches on that shape.
Why: the owner's voice rule bans em dashes in all writing, and the prompt is writing the two new developers will read and copy. The output-header case is cross-agent and should be one edit across all sixteen files, not a one-off here.

**Keep: Role, first and third sentences** (line 14 to 16)
The "load-bearing walls" framing is the clearest one-line statement of the job in the whole agent set. Keep it. If the owner's analogy rule applies to prompts, add where it breaks: a wall is visible; the couplings this agent hunts are not, which is why the grep count is required.

**Keep: Critical filter** (line 18 to 27)
Correct filter, correct polarity. Only the FUTURE-LOW line changes (folded into item 2).

**Keep: Scope bullets 31, 34, 36** (line 31, 34, 36)
Specific and testable as written, apart from the glosses in item 9.

---

Keep 3 sections / change 10 / delete 1.
Most important change: item 1 plus item 4, the fence-read declaration and the mandatory Checked and Clean section. Without them this agent is flagged for scope creep on every `full` run and synthesis cannot tell a clean file from an unread one.
Second: item 2, replace "weeks" and "days" with a file-count and persisted-format test so severity can be checked.
