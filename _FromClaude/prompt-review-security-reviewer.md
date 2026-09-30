---
title: Prompt review of security-reviewer.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

> Produced by an automated prompt review agent running Claude Fable 5.1.
> Read-only review of `plugins/djinn/agents/security-reviewer.md` (64 lines).
> Cross-checked against relay.md, REVIEW.md, AGENTS.md, and the other agent
> prompts for overlap. No edits applied.

File under review: `~/djinn-relay/plugins/djinn/agents/security-reviewer.md`

**1. HIGH is defined so loosely that a naming nit can block ship** (line 43)
Current: `**HIGH:** Exposed secrets, security vulnerability, or code that would fail a formal review`
Proposed:
```
- **HIGH:** A secret in a tracked file, or a vulnerability with a traced path from an untrusted source to a sink. Security only.
- **MEDIUM:** A defense gap with no traced exploit (missing validation at a boundary, sensitive data in a log or error message), or a quality problem a maintainer will pay for within the next few changes (misleading name on a public method, dead export, unprofessional comment).
- **LOW:** Hygiene. Clarity suggestions, polish.
Code quality findings never rate HIGH.
```
Why: synthesis.md line 25 and relay.md line 77 make every HIGH a ship blocker. "Would fail a formal review" is a taste judgment with no test, so an Opus reviewer in a strict mood turns a rename into FIX THEN SHIP. bugs-reviewer line 30 and integration-reviewer line 38 both tie HIGH to a concrete outcome (crash, data loss, corruption); this prompt should too.

**2. Line 10 invites reads outside the fence with no accounting** (line 10)
Current: `For security checks, also scan config files, .env patterns, and any file the changed code writes to.`
Proposed:
```
Read every file in the changed-file list in full. You may open a file outside that list only when a changed line names it (an import, a path literal, a write target, a config key it reads). List every such file under "## Read outside fence" in your report, one line each with the changed line that led you there. Do not sweep the repo for config or .env files.
```
Why: Decision 1 makes the changed-file list a hard fence and has synthesis report out-of-fence reads. "Scan config files" and ".env patterns" as written are a repo-wide sweep with no trail, so synthesis cannot tell a justified read from wandering. Keeping the "file the code writes to" case is right; it just needs to be logged.

**3. Skeptical verification covers secrets and dead code only; vulnerabilities get none** (line 12)
Current: `Before flagging a "hardcoded secret," verify it's actually a secret and not a default/placeholder. Before flagging "dead code," verify nothing imports or references it. Grep before asserting.`
Proposed: keep the two existing sentences and add:
```
Before flagging a vulnerability, name the untrusted source, the sink, and every line between them. If a guard, encoding step, or type boundary stops the path, do not flag it; record it under "## Checked and Clean" with the line of the guard. A pattern match ("this looks like SQL built from a string") is not a finding until the input origin is shown.
Before flagging a secret, read .gitignore. A value in an untracked or ignored file is not exposed; say so and rate it LOW at most.
```
Why: breaker.md line 12 already has the "if a guard stops your attack, acknowledge it and move on" clause that REVIEW.md line 20 to 22 requires of every reviewer. This prompt lacks it for exactly the findings most likely to be false positives (injection, XSS, traversal flagged from surface patterns). The .gitignore check is the single most common false HIGH in secret scans.

**4. Delete the CVE bullet; the agent has no tool to verify it** (line 24)
Current: `Dependency vulnerabilities (known CVEs, outdated packages with security patches)`
Proposed: delete, and add to "NOT your job":
```
- Package CVEs, version pins, package licenses: dependency-reviewer. If a changed file adds or bumps a dependency, emit one line: "HANDOFF dependency-reviewer: <package> <version> added in <file:line>".
```
Why: this agent's frontmatter gives it Read, Grep, Glob (line 4). It cannot search advisories, so any CVE claim comes from training memory, which is the unverifiable assertion the relay is built to prevent. dependency-reviewer.md lines 112 to 116 own CVEs with WebSearch, and line 175 already names security-reviewer as "non-CVE stuff". Two agents claiming the same CVE is a duplicate; one agent guessing is worse.

**5. Output format leaves the half-clean case undefined and drops the trace** (line 47 to 64)
Current: two `## ... Findings` sections, then `## No Issues (if clean on both fronts)`
Proposed:
```
## Security Findings
### [SEVERITY] file:line: description
**What:** The vulnerability
**Path:** untrusted source -> sink, with line numbers (or "secret at file:line, tracked: yes/no")
**Why:** The attack or the exposure
**How to fix:** The concrete change
(write "None." if clean)

## Code Quality Findings
### [SEVERITY] file:line: description
**What:** The quality concern
**Why:** What a maintainer or a new contributor pays for
**How to fix:** The concrete change
(write "None." if clean)

## Checked and Clean
- [each source-to-sink path or secret candidate you traced and cleared, with the guard line]

## Read outside fence
- [file: reason, or "None."]
```
Why: as written, a report with security clean and three quality findings has no defined shape, so synthesis has to guess. bugs-reviewer (line 49) and integration-reviewer (line 53) both end with "Checked and Clean"; this agent should match so synthesis can tell "not looked at" from "looked at and cleared". The "Path" field is what makes finding 3 above checkable. The `### [SEVERITY] file:line` header stays so synthesis parses it the same as every other agent.

**6. "Patent meeting or investor demo" and "public repo" are project-specific framing** (line 16, line 32)
Current: `You are the agent that ensures this code is ready for a public repo and won't embarrass anyone in a patent meeting or investor demo.`
Proposed:
```
You are the agent that ensures this code is ready for the audience named in the project config (public repo, client delivery, or internal team). Where the config names no audience, assume internal.
```
And on line 32 replace `that shouldn't be in a public repo` with `that the project's audience should not see`.
Why: Decision 2 moves project-specific content to config. The workplace project is an internal voice agent, not a public repo, and a reviewer new to the plugin will not know what "patent meeting" is supposed to mean. The audience setting changes what an "unprofessional comment" costs.

**7. Delete the Consistency bullet; format-reviewer already owns it** (line 34)
Current: `Consistency (does this code match the patterns established elsewhere in the codebase?)`
Proposed: delete. Line 29 (naming clarity) stays. Add to "NOT your job": `Naming consistency with neighbors: Format agent. You judge whether a name is understandable, not whether it matches.`
Why: format-reviewer.md line 22 is "Naming consistency (matches existing codebase conventions)" and its line 28 hands "naming clarity" to this agent. With line 34 in place, both agents flag the same rename and synthesis dedups it every run. The split is clarity here, consistency there; say it in both files.

**8. Input validation overlaps breaker; draw the line** (line 23, line 36 to 39)
Current: `Input validation at system boundaries (user input, file I/O, network requests)` with a NOT-your-job list naming only Format and Bugs.
Proposed: reword line 23 to `Untrusted input reaching a sink without validation or encoding (user input, file contents, network payloads). Your question is "who controls this value"; the breaker asks "what value crashes this".` Add to NOT your job:
```
- Malformed inputs that crash or corrupt without an attacker (NaN, empty array, double dispose): Breaker agent
- Callers, state sync, disposal chain: Integration agent
```
Why: breaker.md lines 25 to 30 already attack edge-case inputs at every entry point. Without the origin test, this agent flags the same missing null check as MEDIUM while breaker flags it as CRASH, and synthesis has to reconcile two severities for one line.

**9. Narrow license/attribution to copied code** (line 25)
Current: `License/attribution issues`
Proposed: `Copied or vendored code without its license header or attribution (a function pasted from a library, a snippet from a blog or an answer site). Package licenses belong to dependency-reviewer.`
Why: dependency-reviewer.md line 74 owns package licenses. The case only this agent will see is a copied snippet inside a changed file, and the current wording does not tell it to look for that specifically.

**10. CLAUDE.md is a Claude-only mechanism; take the conventions file from the dispatch** (line 10)
Current: `Read the project's CLAUDE.md for conventions and stack.`
Proposed: `Read the project conventions file named in your dispatch (CLAUDE.md under Claude Code; the adapter names the equivalent elsewhere) and the project config for stack, audience, and sensitive data classes.`
Why: Decision 6 (Codex) and Decision 2 (per-project config). Every other agent has the same line, so this is a relay-wide edit, but this prompt is the one that also needs the audience and sensitive-data hooks from finding 6 and 11.

**11. "Sensitive data" needs a definition from the project config** (line 21)
Current: `Sensitive data in logs, comments, or error messages`
Proposed: `Sensitive data in logs, comments, error messages, or test fixtures. Use the sensitive data classes from the project config (for example PII, PHI, call recordings, credentials, customer names). If the config lists none, use credentials and personal identifiers.`
Why: for the workplace project (outbound voice calls now, patient care later) this bullet is the one most likely to find a real HIGH, and "sensitive" without a list means the reviewer decides per run. Test fixtures are the usual leak path and are not named.

**12. Secret scan must stay inside the fence** (line 20)
Current: `Hardcoded secrets, API keys, credentials, tokens (scan for patterns: API_KEY, SECRET, TOKEN, password, Bearer, private_key)`
Proposed: `Hardcoded secrets in the changed files (grep the changed files, not the repo, for: API_KEY, SECRET, TOKEN, password, Bearer, private_key, BEGIN PRIVATE KEY, and any string over 32 characters of mixed case and digits).`
Why: "scan for patterns" with no target reads as a repo-wide grep, which is a fence violation under Decision 1. The pattern list is fine; it needs a boundary and the two patterns that catch keys the keyword list misses.

**13. Add a Round 2 mode** (new section after Role)
Current: none.
Proposed:
```
# Round 2
If the dispatch says this is Round 2, begin with a "## Round 1 status" section: one line per prior HIGH or MEDIUM finding, marked RESOLVED, NOT RESOLVED, or REGRESSED, with the line that proves it. Then review the fix diff as normal.
```
Why: relay.md line 69 says Round 2 agents "verify each Round 1 HIGH/MEDIUM is resolved", but nothing in this prompt tells the agent to do that, so it depends on the dispatch text. A fixed section shape lets synthesis read it mechanically. Likely relay-wide; flagged here because security findings are the ones whose "resolved" needs proof, not a diff glance.

**14. Trim the invocation advice from the description** (line 3)
Current: `Invoke on all changes touching auth, data, IO, or before public release.`
Proposed: `Runs in standard and full scope.`
Why: commands/review.md line 16 puts this agent in the default scope, so the "invoke on" guidance is dead text. A new reader may think the agent is opt-in.

**15. Dash characters in the output template** (lines 51, 53, 57, 59, and headings on 18, 27, 38, 39)
Current: em dashes in headings and in `file:line — description`.
Proposed: colons.
Why: the owner's voice rule bans em and en dashes in all writing. Every agent prompt has the same character, so this is a relay-wide sweep, not a special case here. Low impact on behavior; noted for completeness.

**16. Keep: frontmatter** (line 1 to 6)
Keep. `model: opus` matches Decision 3. `tools`, `model`, and `name` are Claude Code agent frontmatter, which is a Claude-only mechanism under Decision 6; an adapter will need to map them, but the prompt does not need to change.

**17. Keep: code quality bullets 29 to 33 and the two-mandate design**
Keep. REVIEW.md line 23 names "security and senior review" as one role, so the pairing is the owner's decision. The dead-code bullet (line 31) already requires Grep; one addition worth a clause: check barrel re-exports and dynamic imports before calling an export orphaned (pipe-connector.md line 123 has the same warning).

**18. Keep: length**
Keep. At 64 lines this is one of the shorter agents. Findings 3, 5, 8, and 13 add roughly 25 lines; findings 4 and 7 remove two. Net length stays under 100, which is fine.

Keep 3 / change 13 / delete 2.
Most important change: finding 1, redefine HIGH so only a tracked secret or a traced exploit blocks ship, and cap code quality at MEDIUM.
Second: finding 2 plus 12, put the fence on every read and grep, with an out-of-fence log synthesis can consume.
