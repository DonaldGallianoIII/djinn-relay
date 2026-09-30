---
title: bugs-reviewer report, audits/2026-09-25-1902-custom
author: Claude Opus 5.5 (bugs-reviewer)
date: 2026-09-25
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/status.md:75` The status command says `blocking` "matches the verdict", but the synthesis verdict is computed from this round's Fix List only. Prior HIGH and MEDIUM findings that stay NOT RESOLVED sit in `open` and are not in the Fix List, so a normal partial dispatch gives verdict SHIP beside a non-empty `blocking` list.
Mechanism: `open` carries every unresolved HIGH and MEDIUM across rounds (CONTRACTS.md:317 to 327), while the verdict rule (synthesis.md:179 to 181) looks at "any HIGH or MEDIUM [that] remains after normalization", and normalization runs on this round's reports. Reviewers are told not to re-report prior findings (dispatch.md:207 to 208), so a NOT RESOLVED prior MEDIUM never reaches the Fix List or the verdict. No line in synthesis.md ties the verdict to the status table or to `open`.
Traced: dispatch.md:207 to 208 (reviewers skip prior findings) to synthesis.md:70 to 75 (NOT RESOLVED lives only in the status table) to CONTRACTS.md:323 to 327 (entry kept in `open` as `not-resolved`) to synthesis.md:179 to 181 (verdict from Fix List) to status.md:75 to 76 (`blocking` = open HIGH and MEDIUM, "This matches the verdict") to status.md:82 to 87 (note fires) to dispatch.md:275 ("SHIP: done. Nothing blocks a merge").
Trigger: round 1 has MEDIUM-1 to MEDIUM-4. The user briefs and dispatches only MEDIUM-1. Round 2 reviewers find nothing new. Round 2 synthesis marks MEDIUM-2 to MEDIUM-4 NOT RESOLVED, writes an empty Fix List, and the verdict rule gives SHIP. Dispatch prints "SHIP: done. Nothing blocks a merge to <base_branch>." `/djinn:status` then prints `blocking: MEDIUM-2, MEDIUM-3, MEDIUM-4` and the line "note: findings.json verdict SHIP disagrees with its open list; trust synthesis.md and re-run the round's synthesis." Re-running synthesis applies the same rule and gives SHIP again, and "trust synthesis.md" points the user at the answer that hides three open MEDIUMs.
Fix: in synthesis.md "# Verdict" step 2, change the rule to "FIX THEN SHIP if any HIGH or MEDIUM remains in this round's Fix List or in `open` (NOT RESOLVED or REGRESSED prior findings count). Name the ids that block, with the `R<round>` prefix for rounds above 1." Change status.md:82 to 87 so the note says the verdict ignores prior findings and does not tell the user to trust synthesis.md.

MEDIUM-2. `plugins/djinn/agents/synthesis.md:70` A finding raised two or more rounds back can never leave `open`. The only exit is a RESOLVED row in this round's status table, the table takes rows only for the prior round's findings, and its Prior id cell holds a bare id that cannot name an older round.
Mechanism: synthesis.md:194 to 195 says "An entry leaves `open` only because this round's status table marks it RESOLVED." synthesis.md:70 to 72 limits rows to "prior-round HIGH and MEDIUM, plus one per prior-round LOW whose fix landed", and synthesis.md:93 fixes the cell to the bare id. In round 3, a round 1 entry still in `open` gets no row, so CONTRACTS.md:325 to 326 ("an entry this round did not check keeps its status") keeps it forever. If a synthesis agent does add a row for it, the bare id collides with the round 2 finding of the same id, which CONTRACTS.md:334 to 336 says is a different finding.
Traced: CONTRACTS.md:314 to 316 (`prior` is one record per status table row) to synthesis.md:70 to 72 (rows are prior-round only) to synthesis.md:93 (bare id) to CONTRACTS.md:323 to 327 (only a RESOLVED row removes an entry) to synthesis.md:194 to 195. Fixture: `the arena repo/fixtures/audit-three-rounds/round-3/synthesis.md:21` shows round 2 LOW-1's fix making `settleFolder` swallow ENOTEMPTY, which is the throw in round 1 LOW-2's text. `round-3/findings.json:207` to `:217` still carries round 1 LOW-2 as `open`, and there was no rule-conformant row for synthesis to record what that fix did to it. Round 3 also held two open ids `LOW-2` (round 1 and round 2), and the table row `LOW-2` at `round-3/synthesis.md:22` identifies its round only because the rules allow nothing but round 2 there. The same fixture's DEBT-1 (`round-3/synthesis.md:45`) names this exact gap: "djinn rows carry no round".
Trigger: round 2 marks round 1 MEDIUM-3 NOT RESOLVED. A round 2 fix to shared code closes it. Round 3 synthesis has no row for round 1 MEDIUM-3, so `round-3/findings.json` keeps it as `not-resolved`, and `/djinn:status` lists `MEDIUM-3 ... [not resolved]` under `blocking` with no way left to clear it. Round 3 is the last round (dispatch.md:178 to 180).
Fix: in synthesis.md:70 to 72, make the table cover every HIGH and MEDIUM in the prior round's `open` (any round), plus LOWs whose fix landed. Add a Round column to the table (`| Prior id | Round | Status | Evidence |`) and relax synthesis.md:93 to allow it. Match CONTRACTS.md:314 to 316 so `prior.round` is read from that column.

MEDIUM-3. `.djinn/config.yaml:12` `base_branch` is the branch that is checked out, so `/djinn:review` with no `--base` reviews only uncommitted edits, and on a clean tree it stops with NO-CHANGES.
Mechanism: review.md:62 computes `git merge-base <base_branch> HEAD`. With HEAD on `Claude-Development-djinn-relay` (`.git/HEAD:1`) and `base_branch` set to that same branch, the merge base is HEAD. The diff at review.md:63 then lists only working-tree changes. Committed 2.2.0 work is invisible. The file's own header (config.yaml:7) says it exists "so the plugin can review its own changes", and CONTRACTS.md:131 defines `base_branch` as "the branch this work merges into", which per Donald's git rules is `main`.
Traced: `.djinn/config.yaml:12` to review.md:62 to 63 (merge base equals HEAD) to review.md:66 to 67 (empty fence gives NO-CHANGES). This audit's own `context.md:8` records the workaround: "--base override ... config base_branch is the dev branch itself".
Trigger: commit the work, then run `/djinn:review` with no flags. The fence is empty and the ledger gets a `NO-CHANGES` line.
Fix: set `base_branch: main` (the branch the dev branch merges into). If `main` is deliberately not the comparison point, say so in a comment and document the `--base <sha>` requirement in `project_notes`.

### LOW
LOW-1. `plugins/djinn/commands/dispatch.md:221` The `findings.json`-only retry in round `n` does not pass the prior round's `findings.json` or `synthesis.md`, and it forbids the Coverage note the rebuild rule requires.
Mechanism: dispatch.md:221 to 222 reuses review.md step 8's retry, whose prompt (review.md:189 to 190) names only this round's `synthesis.md`. Building `open` needs the prior round's `open` (synthesis.md:155 to 157). A fresh synthesis spawn without that path either builds `open` from this round alone, dropping every carried entry, or rebuilds from prose (synthesis.md:158 to 160). The rebuild must add `open list rebuilt from prose` to `synthesis.md` Coverage, but the retry forbids editing `synthesis.md` (synthesis.md:169 to 170, CONTRACTS.md:345 to 347).
Traced: dispatch.md:221 to 222 to review.md:188 to 191 (prompt text) to synthesis.md:155 to 160 (needs the prior `open`) to synthesis.md:169 to 170 (no edit allowed).
Trigger: needs the first round `n` synthesis spawn to return without writing `findings.json`. The retry then writes a `findings.json` whose `open` holds only round `n` findings, and `/djinn:status` reports the carried round 1 LOWs as gone.
Fix: in dispatch.md step 7.5, spell out the retry prompt: "`round-<n>/synthesis.md` exists. Write only `round-<n>/findings.json` from it. Prior round findings.json: <path or none>. Prior synthesis: <path>." In synthesis.md and CONTRACTS.md, say that in the retry the `rebuilt from prose` note goes in the agent's reply, not in `synthesis.md`.

LOW-2. `plugins/djinn/agents/synthesis.md:71` The rule "a prior-round LOW whose fix landed (it has a `fixes/<id>.diff`)" keys on a bare id, and every round's briefs write diffs of the same ids into a different `fixes/` folder.
Mechanism: brief.md:118 to 119 writes to `<audit-folder>/fixes/`. Round 1 briefs land in `audits/X/fixes/`, round 2 briefs in `audits/X/round-2/fixes/`, and ids like `LOW-1` repeat across rounds. dispatch.md:216 hands synthesis "every `fixes/<id>.diff`" without naming which folder. A round 3 synthesis that is handed or globs `audits/X/fixes/LOW-3.diff` (round 1's LOW-3 fix) takes round 2 LOW-3 as fixed, adds a row, and records it NOT RESOLVED, and its `open` status changes from `open` to `not-resolved` for a finding nobody briefed.
Traced: brief.md:118 to 119 to dispatch.md:216 to synthesis.md:71 to 72 to CONTRACTS.md:324 (NOT RESOLVED sets `status: "not-resolved"`). Fixture: `round-2/synthesis.md:21` to `:24` and `round-3/synthesis.md:21` to `:25` both have LOW rows, and both `fixes/` folders exist in that audit.
Trigger: needs the orchestrator to pass round 1's diffs into round 3. The fixture run passed only `round-2/fixes/`, so this is an ambiguity that has not fired yet.
Fix: at dispatch.md:216 write "every `<brief-folder>/fixes/<id>.diff` from this dispatch", and at synthesis.md:71 write "has a `.diff` among the diffs this dispatch passed you".

LOW-3. `plugins/djinn/agents/perf-reviewer.md:134` The round `n` section tells perf-reviewer to open with a `## Round <n-1> status` table of findings "assigned to you". The dispatch prompt tells every round `n` reviewer "Do not re-verify round <n-1> findings; synthesis owns that."
Mechanism: The diff rewrote this section to cover round `n` but kept the contradiction. dispatch.md:207 to 208 and synthesis.md:76 to 77 say the table belongs to synthesis alone, and nothing in dispatch assigns prior findings to a reviewer. So perf-reviewer either spends its run re-verifying against orders or writes an empty section. The empty section also reuses synthesis's exact heading text.
Traced: perf-reviewer.md:134 to 139 to dispatch.md:204 to 208 to synthesis.md:76 to 77.
Trigger: any round 2 or round 3 run whose scope includes perf-reviewer (standard, full, perf).
Fix: replace perf-reviewer.md:134 to 139 with "In round `n` (2 or more), review the fix diffs and their callers as a normal run. Do not re-verify prior findings; synthesis owns that table."

### DEBT
none

### REC
none

## Blast radius
none

## Checked and Clean
- `plugins/djinn/CONTRACTS.md`: section 12 `open` arithmetic, keyed by `(round, id)`, reproduces the fixture exactly. Round 1 `open` is 23 entries (4 MEDIUM plus 19 LOW, `findings.json:392` to `:646`). Round 2 drops the 8 RESOLVED `prior` rows (`round-2/findings.json:165` to `:205`) and adds 13. Round 3 drops 7 round 2 ids and keeps round 1 LOW-2 while removing round 2 LOW-2 (`round-3/findings.json:185` to `:189`, `:207`). Section 6 now exempts `/djinn:status` from the ledger, matching status.md:93 to 94. Section 9's two-file exception matches synthesis.md:86 to 87 and :202 to 203.
- `plugins/djinn/CONTRACTS.md`: `file`, `line`, `title`, `source` rules hold against the round 2 and round 3 fixtures. For example, round 3 REC-1's `file` is the first file token `tests/extract.test.mjs` after skipping a function name and a heading, and REC-2's `line` is null. Round 1's REC titles keep the `<agent>: ` prefix (`findings.json:259`) against CONTRACTS.md:304 to 305. Round 2 and round 3 strip it, and round 1's `synthesis.md:14` uses the pre-change heading, so I read that file as older-prompt output, not as a defect in the current text.
- `plugins/djinn/agents/synthesis.md`: round 1 leaves out the status section (synthesis.md:91) and says so explicitly, which overrides the "every section present" line at :147. The Counts and Open across rounds check (:166 to :170) is consistent with CONTRACTS.md:343 to 348.
- `plugins/djinn/commands/status.md`: `allowed-tools: Read, Glob` covers every step. Step 1 resolves a `round-<n>` argument to its parent before the no-synthesis check. Step 2 compares round numbers numerically and falls back to the latest round that has a file. The prefix rule (`R<round>` above 1) matches CONTRACTS.md:334 to 336. The empty-`open` case prints `blocking: none`.
- `plugins/djinn/commands/review.md`: step 8 names both output paths, and the retry is bounded to once with no orchestrator write, consistent with CONTRACTS.md:343 to 347 for round 1 (where no prior `open` is needed).
- `plugins/djinn/commands/dispatch.md`: step 7.5 names the prior `findings.json` as the audit folder's own for round 2 and `round-<n-1>/` after, with "none" when absent, matching synthesis.md:155 to 160. Step 6's consolidator prompt heading text matches synthesis.md:69 to 70.
- `plugins/djinn/agents/consolidator.md`: the post-dispatch paragraph now names `## Round <n-1> status` and `prior`, both of which synthesis writes. The consolidator's reading fence covers everything under `AUDIT_DIR`, so `findings.json` is readable without a prompt change.
- `plugins/djinn/.claude-plugin/plugin.json`: version 2.2.0 matches README.md:83 and status.md:35.
- `plugins/djinn/README.md`: the folder tree lists `findings.json` at the round 1 and `round-2/` levels, matching CONTRACTS.md:255 to 256, and the command list includes status.
- `plugins/djinn/relay.md`: the new table row matches status.md's usage and read-only claim.
- known-bugchecker flagged nothing, and no KNOWN-BUGS.md entry applies to markdown prompts. The closest, "Duplicate type definitions", is the two status-table shapes, and synthesis.md:79 to 82 now forbids a second table.

## Files read outside the fence
- `plugins/djinn/commands/brief.md` (where briefs and diffs land)
- `.git/HEAD` (which branch is checked out)
