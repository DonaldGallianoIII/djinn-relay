---
title: Prompt review of format-reviewer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/agents/format-reviewer.md` (47 lines).
Also read: `relay.md`, `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`, and for overlap only: `security-reviewer.md`, `bugs-reviewer.md`, `known-bugchecker.md`, `synthesis.md`, plus a severity grep across the rest of `agents/`.

**1. Severity is used but never defined** (line 37)
Current: `### [SEVERITY] file:line`
Proposed: Add a `# Severity` section before `# Output format`:
```
# Severity

- **HIGH:** Will fail the project's build or type check as written (an import path that does not resolve, a type error under the project's strict settings). Nothing else a linter finds is HIGH.
- **MEDIUM:** Violates a rule written in the project config or CLAUDE.md. Cite the rule.
- **LOW:** Inconsistent with neighboring files but no written rule covers it. Cite the neighbor.
```
Why: Every other reviewer defines its tiers (bugs-reviewer lines 28 to 32, security-reviewer 41 to 45, integration 36 to 40, perf 55 to 59). Synthesis line 35 blocks SHIP on any HIGH or MEDIUM. With no definition, a formatting nit rated HIGH by an over-eager pass blocks a ship, and synthesis has no basis to argue it down.

**2. No instruction to flag only diff lines, so old violations in a touched file flood the report** (missing; belongs after line 10)
Current: `Read every changed file in full.`
Proposed: Append: `Report only on lines the diff added or changed. Pre-existing violations in a changed file get one LOW entry per file ("N older instances of X, not introduced by this change"), never one entry per instance.`
Why: Decision 1 makes the git diff the scope. A linter over a whole file will flag every old line, and the two developers at the owner's workplace who have never seen a pull request will read forty nits on code they did not write as a rejection of their change. One roll-up line keeps the signal.

**3. Neighboring-file reads have no fence hook** (lines 10 and 22)
Current: `Naming consistency (matches existing codebase conventions — verify by reading neighboring files)`
Proposed: Keep the verification, add the hook. After line 10: `The changed-file list in your dispatch is the fence. You may open other files only to confirm that a convention exists. List every such file under a "## Files read outside the fence" heading at the end of your report, with the one convention each one proved.`
Why: Decision 1 says synthesis reports any file read outside the fence. This prompt legitimately needs reads outside it (you cannot verify a naming convention from one file), so it must declare them or every format run will show up as a fence violation.

**4. The 300-line threshold contradicts the owner's rule and is project-specific** (line 20)
Current: `file size — flag files over 300 lines`
Proposed: `file size (threshold and split rule come from the project config; if the config sets none, use 500 lines and flag only when the file also mixes unrelated concerns)`
Why: `~/Conventions/workflow/REVIEW.md`, section "File size", says up to about 500 lines is fine and to split for mixed concerns, "not to hit a smaller number". The 300 figure silently diverges from that, and decision 2 moves numbers like this into per-project config anyway.

**5. Naming consistency is claimed by both this agent and security-reviewer** (line 22 here; line 36 in security-reviewer.md)
Current: line 22 `Naming consistency (matches existing codebase conventions...)`; line 28 `naming clarity — Security agent handles that`
Proposed: Sharpen line 22 to `Naming consistency: mechanical only (case style, prefix/suffix pattern, file naming, matches neighbors). Whether a name is understandable is not yours.` And flag for the security-reviewer's review: its line 36 "Consistency (does this code match the patterns established elsewhere)" should drop naming, since it duplicates this bullet word for word.
Why: Two prompts will produce the same "rename `fooBar` to match `foo_bar` neighbors" finding. The consistency/clarity split is the right one, but the current wording leaves both agents able to claim both halves.

**6. Three of five scope bullets are TypeScript and CSS specific** (lines 21, 23, 24)
Current: `Import style (path aliases used correctly per CLAUDE.md, type-only imports where applicable)`, `TypeScript strictness (no as any casts, no missing types, no implicit any)`, `CSS organization (...)`
Proposed: Prefix the list with `Language-specific bullets apply only when the project config names that language.` Rewrite line 23 as `Type strictness (no escape-hatch casts, no untyped parameters or return types on exported functions; the exact rules come from the project config)`. Keep line 24 but source the "split by concern" rule from config, not "project conventions".
Why: Decision 2 makes prompts project-agnostic. On a Python or Java project the agent either skips these bullets silently or invents equivalents. Say which.

**7. "No implicit any" cannot be verified with Read, Grep, and Glob** (line 23)
Current: `no implicit any`
Proposed: Replace with `no untyped parameters or return types on exported functions` (folded into suggestion 6).
Why: Implicit any is a compiler inference; only `tsc` sees it. The agent has read-only tools (frontmatter line 4), so the instruction invites it to guess. The replacement is checkable by eye.

**8. Verification clause accepts one example as proof of a convention** (line 12)
Current: `If you believe a naming convention exists, find an example in the codebase first.`
Proposed: `A convention needs either a written rule (cite the config or CLAUDE.md line) or at least two existing files that follow it (cite one file:line in the finding). If the codebase itself is split, report LOW, say it is split, and do not pick a side. Every finding's Why field carries that citation.`
Why: One file is an instance, not a convention. Requiring the citation in the output makes the verification visible to synthesis and to the developer reading it, instead of being a promise the agent made to itself.

**9. The `as any` check duplicates known-bugchecker** (line 23 here; known-bugchecker.md line 24)
Current: `no as any casts`
Proposed: Keep it here. Note for the owner: known-bugchecker's `as any` entry is project-specific and moves to config under decision 2; this prompt is the project-agnostic home for it. Until that lands, synthesis dedupes.
Why: relay.md says heavier agents skip what known-bugchecker already flagged, but this prompt never receives that report. Two agents, one finding, until one of them owns it.

**10. The clean-report section gives synthesis nothing to check coverage against** (lines 42 to 43)
Current: `## No Issues (if clean)`
Proposed: Replace with `## Checked and Clean` followed by one line per changed file read, always emitted, even when there are findings.
Why: synthesis.md line 21 verifies whether any changed file was missed by all agents. bugs-reviewer already emits a "Checked and Clean" list (line 49 to 50). A bare "No Issues" leaves synthesis unable to tell "clean" from "not opened".

**11. "Security agent handles that" will confuse a newcomer** (lines 28 and 30)
Current: `Code quality, architecture, naming clarity — Security agent handles that` and `Whether comments are professional — Security agent handles that`
Proposed: Merge into one line: `Code quality, architecture, naming clarity, comment tone: the security-reviewer, which also carries the senior code-quality review.`
Why: Someone who has never used the relay will read "Security handles naming" as a typo. Naming the dual mandate once removes the puzzle and drops a redundant line.

**12. Conventions source should be the project config, not CLAUDE.md alone** (line 10 and line 21)
Current: `Read the project's CLAUDE.md for conventions`
Proposed: `Read the project config named in your dispatch, then the project's CLAUDE.md.`
Why: Decision 2 moves project specifics into a config file. Every sibling prompt has the same line, so this is a relay-wide edit; flagging it here so the format prompt is not the one left behind.

**13. Em dashes throughout** (lines 3, 18, 28, 29, 30, 37)
Current: em dashes in the description, the Scope heading, all three NOT-your-job lines, and the output template.
Proposed: Replace with a colon or a period. The template line becomes `### [SEVERITY] file:line: description` or `### [SEVERITY] file:line. description`.
Why: The owner's voice rule bans them in all writing. Every sibling prompt has the same issue, so this is cosmetic here but should be done across `agents/` in one pass. LOW.

**14. Keep: the Role section** (lines 14 to 16)
"You are a linter, not a code quality judge." Two sentences, does its job. Keep.

**15. Keep: the closing line** (line 46)
"Be concise. No preamble. No praise." Keep.

**16. Keep, with a Codex note: the frontmatter** (lines 1 to 6)
`tools:` and `model:` are Claude Code agent-file fields. The prompt body uses no Claude-only mechanism, so an adapter only needs to translate the frontmatter. Say so in a comment or in the adapter's map, not in the body. Decision 5 (ledger) needs no hook here; the command writes the ledger line, not the agent.

---

Keep 3 / change 12 / delete 0.
Most important change: add a Severity section (suggestion 1). Without it a linter nit can block SHIP.
Second: report only diff lines, roll up pre-existing violations (suggestion 2).
