---
title: Prompt review of dispatch.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

> Produced by an automated prompt review agent running Claude Fable 5.1.
> Read-only review of `plugins/djinn/commands/dispatch.md` (182 lines).
> Cross-read: `relay.md`, `agents/fixer.md`, `agents/synthesis.md`,
> `commands/review.md`, `commands/brief.md`, `templates/fix-brief.md`,
> `~/Conventions/workflow/REVIEW.md`, `~/Conventions/workflow/AGENTS.md`.
> Nothing was edited.

Context for the ranking: dispatch is the only command that changes code and
the only one that lands fixes, so decision 5 (ledger, fix summaries) and
decision 1 (git-derived fence) both have their hard landing here. The
biggest gaps are things the prompt does not say, not things it says wrong.

**1. No ledger append anywhere. Decision 5 has no hook in this file.** (line 150 to 173, and line 107 to 116)
Current: Step 8 prints a report to the user and stops. Nothing is written to `audits/LEDGER.md`. Halt paths (blocker, build failure, cycle) write nothing at all.
Proposed: Add a Step 9, "Append to the ledger", and reference it from every halt path:

```
## Step 9: Ledger line (always, including halts)

Append exactly one line to `audits/LEDGER.md` (create it with a header row
if missing). Write this line on every exit from dispatch: completed,
halted on blocker, halted on build failure, halted on cycle, aborted by
the user after the plan.

| <YYYY-MM-DD HH:MM> | dispatch | <audit-folder> | briefs: <ids> | landed <n> / blocked <n> / skipped <n> | <COMPLETE | HALTED batch <k>: <reason>> | round-2: <verdict or "not run"> | summaries: fixes/<id>-report.md, ... |

Every landed brief must have its `fixes/<id>-report.md` on disk before
the ledger line is written. If one is missing, write it first from the
fixer's return, then write the ledger line.
```
Why: Decision 5 says every command appends one line and every landed fix has a written summary. Dispatch is where fixes land, so an unlogged dispatch is the worst unlogged run. The halt-path requirement matters most: a dispatch that spawned two fixers and then halted has already modified code, and that run must not vanish.

**2. Round 2 changed-file computation is wrong on two counts.** (line 128)
Current: "Run `git diff --name-only` against the base commit the original audit ran on. If the base isn't recorded, use `git diff --name-only HEAD~N` where N = count of commits since audit"
Proposed:
```
1. **Determine the Round 2 fence.**
   - Read `base_commit` from `<audit-folder>/context.md` (review.md writes
     it). If the file is missing, halt and ask the user for the base ref.
     Do not guess from HEAD~N.
   - FENCE = union of `work_set.files` across all landed briefs.
   - Cross-check: run `git diff --name-only <base_commit> -- . ':!audits'`.
     Any file in that output that is not in FENCE and was not in the
     Round 1 changed-file list is a scope leak: name it in the final
     report and add it to FENCE so Round 2 reviews it.
```
Why: Fixers never commit and dispatch never commits (line 182), so "commits since audit" is zero and HEAD~N is either HEAD or reaches back into pre-audit history. Decision 1 says scope comes from a recorded base, not HEAD~1 style arithmetic. Separately, Step 6 writes `.diff`, `-report.md`, and edited brief frontmatter under `audits/`, all inside the repo, so an unfiltered `git diff --name-only` will list audit artifacts as changed files and feed them to reviewers.

**3. Round 2 agent prompt has no fence language, and the Round 2 synthesis prompt is empty.** (line 134 to 148)
Current: "Scope your review to the changed files only (listed below)" plus "Check blast radius — peek at callers/consumers" and, at line 148, "Spawn synthesis on Round 2 reports".
Proposed: Replace the agent prompt block and the synthesis line with:
```
   Round 2 fence (hard): the files listed below are the review scope.
   You may read outside the fence to follow a changed signature to its
   callers. Every file you read outside the fence goes in a section
   titled "## Read outside fence" at the end of your report, one path
   per line. An empty section is required if you read none.

   Look for: new issues introduced by the diffs in <audit-folder>/fixes/,
   and regressions in callers of any changed symbol. Do not re-verify
   Round 1 findings; synthesis owns that.

   Report format: identical to your Round 1 format.
   Write to <audit-folder>/round-2/agents/<your-name>.md.

   Fence: <list>
   ```

5. Spawn synthesis (model: opus) with:
   - Round 1 synthesis path, Round 2 agent report paths, the fence list,
     the paths of every fixes/<id>.diff
   - Instruction: produce a "## Round 1 resolution" table first, one row
     per Round 1 HIGH/MEDIUM/CRASH/CORRUPT finding, status RESOLVED,
     NOT RESOLVED, or REGRESSED, each verified by reading the diff and
     the file, not the fixer's report
   - Instruction: list every path any agent reported under
     "Read outside fence", deduplicated, in a "## Outside-fence reads"
     section
   - Then the normal fix list and ship verdict
   - Write to <audit-folder>/round-2/synthesis.md
```
Why: Decision 1 requires the fence pasted into every dispatch and synthesis reporting outside-fence reads; the current text invites "peek" with no reporting hook. Line 138 asks every reviewer (up to nine in `full`) to verify the same Round 1 findings, which produces the same "resolved" entry nine times and buries new issues. Moving resolution to synthesis removes that duplication and gives Step 8 a table it can count from.

**4. Model is never named on any Agent call. Decision 3 and AGENTS.md both require it.** (line 75, line 134, line 148)
Current: `use the Agent tool with subagent_type: "fixer"` and "Spawn the same agents as the original scope". No `model:` anywhere.
Proposed: On every Agent call in this file add `model: "opus"` and say so in the prompt text. Add to Rules: "Every Agent call passes `model: "opus"` explicitly. Do not rely on the agent file's frontmatter. If the scope includes `known-bugchecker`, it still runs on Opus; its file's `model: sonnet` is overridden here until the file is fixed." Also change the description line 3 from "at max effort" to "at max effort (set by the fixer's own prompt; there is no effort parameter on the Agent call)".
Why: AGENTS.md line 66 gives the failure mode: an unnamed model inherits the session's model. `known-bugchecker.md` still carries `model: sonnet`, and Round 2 re-spawns it under `quick`, `standard`, `perf`, and `full`. The "max effort" claim in the description has no mechanism behind it in this file, and a Codex adapter (decision 6) needs to know that.

**5. `npm run build` is project-specific and appears three times.** (line 84, line 119, line 178)
Current: "After edits, run npm run build" / "run `npm run build` globally" / "Never spawn a new batch if the previous batch's build failed."
Proposed: Add to Step 2: "Read `build_command` from the per-project config. If absent, print `WARN: no build_command configured; build gates are skipped` in the plan and in the final report." Replace each `npm run build` with `<build_command>`. In the fixer prompt: "After edits, run `<build_command>` and paste its full output in your report." Keep the Rules bullet as is.
Why: Decision 2 moves everything project-specific into config. A skipped gate must be loud, because the fixer's `BLOCKED_BUILD` status and the between-batch halt both depend on it. Note that `fixer.md` line 57 and `templates/fix-brief.md` line 30 and 44 have the same string; those are out of scope here but the config key name should match across all four files.

**6. Per-fix diffs are contaminated across batches, and new files never appear in them.** (line 101 to 103)
Current: "Run `git diff -- <space-separated work_set.files>` via Bash. Write the output to `<audit-folder>/fixes/<id>.diff`"
Proposed:
```
2. **Save diffs per fix.** Before spawning a batch, snapshot the working
   tree without touching refs: `PRE=$(git stash create)`; if empty, use
   `HEAD`. After the batch, for each COMPLETED brief:
   - `git diff $PRE -- <work_set.files>` for tracked files
   - for each file in work_set.files that `git status --porcelain`
     shows as untracked (`??`), append `git diff --no-index /dev/null <file>`
   - write the result to `<audit-folder>/fixes/<id>.diff` with a first
     line `# base: $PRE  batch: <k>  brief: <id>`
```
Why: A batch 2 brief depends on a batch 1 brief precisely because they share a file, so `git diff` against HEAD for that file includes batch 1's edits too, and the saved "per fix" diff is not per fix. `git diff` also omits untracked files entirely, so a brief that creates a file saves an empty diff and Round 2 never sees it. `git stash create` writes an object but moves no ref and no working-tree file, so it stays inside the line 182 rule.

**7. Add a pre-flight check for rename cascades that the fixer cannot reach.** (line 36 to 38)
Current: "A's `symbols_renamed` has `foo → bar`, and B's `work_set.files` contains a file that (by grep) references `foo` → edge A → B"
Proposed: Add a third bullet under Validation in Step 2: "For each entry in `symbols_renamed`, grep the repo for the old name (word boundary, excluding `audits/`). Every file that matches must be in that brief's `work_set.files` or in the `work_set.files` of a brief that depends on it. Otherwise WARN: `<id> renames <foo> but <file> references it and no brief owns that file; the fixer will return BLOCKED_SCOPE`. Ask the user to amend before building the plan."
Why: The grep in Step 3 is already being run; this reuses it. Without the check, the failure surfaces one fixer spawn later as a blocker, after tokens are spent and code is half-changed. This is the single most predictable BLOCKED_SCOPE and it is detectable before the human gate.

**8. "Fixer returned COMPLETED" is not defined mechanically, and COMPLETED with unmet criteria still lands.** (line 95 to 100)
Current: "Fixer returned COMPLETED → `landed`"
Proposed:
```
1. **Parse the Fix Report.** Status is the first non-blank line under
   `## Status`. If it is not exactly one of COMPLETED, BLOCKED_SCOPE,
   BLOCKED_BUILD, BLOCKED_OTHER, treat it as BLOCKED_OTHER.
   A COMPLETED report with any `- [ ]` line under `## Success Criteria`,
   or with `## Build Status` = FAILING, is treated as BLOCKED_OTHER with
   reason "completed with unmet criteria". Only a clean COMPLETED becomes
   `landed`.
```
Why: `fixer.md` line 111 allows `- [ ] criterion 3 — NOT MET` inside a COMPLETED report, and line 105 allows a FAILING build status. Dispatch currently promotes that to `landed`, runs the global build, and possibly ships. Two developers reading the ledger later will trust `landed`.

**9. Blocker handling contradicts the "never modify work_set" rule and does not cover dependents.** (line 107 to 115, line 179 to 180)
Current: "Options: amend & re-dispatch, skip & continue, abort" versus Rules: "Never modify briefs' WHAT / WHY / work_set fields" and "Never dispatch a brief with `status != pending`".
Proposed: Replace the Options bullet with:
```
  - Options, user picks one per blocked brief:
    - **amend**: on the user's explicit word, write the fixer's proposed
      `work_set` into the brief's frontmatter, set `status: pending`,
      and re-run Steps 3 to 5 for the remaining briefs (the plan is
      re-printed and re-confirmed). This is the only case where
      dispatch edits work_set, and only with text the user approved.
    - **skip**: mark the brief `skipped` in the plan. Every brief with an
      edge from it is skipped too; name them.
    - **abort**: stop. Landed briefs stay landed. Write the ledger line.
```
And in Rules, change the bullet to: "Never modify briefs' WHAT / WHY / work_set fields except when the user says `amend` on a BLOCKED_SCOPE report."
Why: As written, "amend & re-dispatch" cannot be done by this command without breaking two of its own rules, so the orchestrator will either break a rule silently or stall. Skipping a brief that others depend on and then running the dependents is the exact ordering bug the DAG exists to prevent.

**10. "Earlier brief-id" is undefined for ids like HIGH-1 and MEDIUM-3.** (line 38, line 41, line 49)
Current: "edge A → B by brief-id order (earlier wins unless user overrides)"
Proposed: "Brief order = the order the paths appear in $ARGUMENTS. Say this in the plan printout: `Tie-break order is your argument order.`"
Why: Alphabetical order puts HIGH before LOW before MEDIUM, which nobody intends, and numeric order across severities is meaningless. Argument order is deterministic, visible, and the user controls it without a flag.

**11. No round counter. Relay.md says max three rounds; nothing here enforces it.** (line 124 to 148, line 169)
Current: Step 8 suggests `/djinn:brief <audit-folder>/round-2 <finding-id>` and Step 7 always creates `<audit-folder>/round-2/`.
Proposed: In Step 7.3: "Round number = 1 + count of `round-` segments in the audit-folder path. If it would be 4 or more, do not spawn; report `Max 3 rounds reached (relay.md). Stop and deliberate with the user.` Name the folder `round-<n>/`, not nested `round-2/round-2/`." Change Step 8 line 169 accordingly.
Why: The current suggestion in Step 8 produces `round-2/round-2/` on the second cycle, and the third cycle runs with no stop. relay.md line 83 says stop after round 3 and ask.

**12. Claude-only mechanisms are used without being marked.** (line 4, line 13, line 75)
Current: `allowed-tools:` frontmatter, `$ARGUMENTS`, "use the Agent tool with `subagent_type`", "Send all fixer calls ... in a single message with multiple Agent tool-use blocks".
Proposed: Add a short "## Runtime notes" section after Rules:
```
This command assumes Claude Code: `$ARGUMENTS` substitution, the Agent
tool with `subagent_type` and `model`, parallel spawns as multiple tool
calls in one message, and agent definitions in `agents/*.md` frontmatter.
An adapter for another runtime must provide: spawn-with-prompt-and-model,
wait-for-all, and the fixer's return text as a string. Nothing else here
is runtime-specific.
```
Why: Decision 6. A one-paragraph list is enough for whoever writes the Codex adapter to know what to map, and it costs nothing at runtime.

**13. Files dispatch writes into the repo carry no attribution header.** (line 105, line 143, line 148)
Current: "Write each fixer's full report verbatim to `<audit-folder>/fixes/<id>-report.md`."
Proposed: "Write each fixer's report to `<audit-folder>/fixes/<id>-report.md`, prefixed with the attribution frontmatter from AGENTS.md: `title: Fix report <id>`, `author: Claude Opus (fixer agent, via /djinn:dispatch)`, `date`, `status: agent output, not yet reviewed`. Then the report verbatim." Apply the same to the Round 2 instruction so each agent's report starts with that header.
Why: AGENTS.md line 10: any file an agent writes into a repo carries an attribution header. The reports are the fix summaries decision 5 relies on, and six months on nobody can tell a fixer's claim from a human's note without the header.

**14. The plan printout does not say why a batch waits.** (line 57 to 65)
Current: `Batch 2 (waits for batch 1): [brief-id-4]`
Proposed:
```
  Batch 2 (waits for batch 1): [HIGH-2]
    because HIGH-2 edits src/ui/Toolbar.ts, which HIGH-1 also edits
  Batch 3 (waits for batch 2): [MEDIUM-1, MEDIUM-3]
    because MEDIUM-1 depends_on HIGH-2
Tie-break order is your argument order.
Build command: <build_command or "none configured, gates skipped">
Round 2 will spawn <n> reviewers (<names>) on Opus after all batches land.
```
Why: The two target readers have never used a pull request and will not know what "DAG" or "topo sort" means; the plan is the one thing they read before saying "go". Naming the file or the `depends_on` edge lets them catch a wrong edge. Naming the Round 2 agent count makes the token spend visible at the one human gate, which is what AGENTS.md line 103 asks for.

**15. Two unverifiable phrases in Steps 1 and 2.** (line 15, line 26)
Current: "List the pending briefs in the most recent audit folder if helpful." and "If WHY section still contains `TODO (deliberation context)` with empty body"
Proposed: Line 15: "List every brief with `status: pending` under the most recent `audits/*/fixes/` and ask which to dispatch." Line 26: "If the WHY section still contains the template placeholder text `_<fill in` → WARN and ask the user to confirm."
Why: "If helpful" has no test; the orchestrator will sometimes list and sometimes not. "Empty body" does not match the template, which ships with placeholder text, not an empty body (`templates/fix-brief.md` line 22).

**16. Step 8 severity counts do not match the synthesis tiers.** (line 165)
Current: `- HIGH: <n>, MEDIUM: <n>, LOW: <n>`
Proposed: `- Resolved: <n> of <m> Round 1 HIGH/MEDIUM/CRASH/CORRUPT` then `- New: HIGH <n>, CRASH/CORRUPT <n>, MEDIUM <n>, DEGRADE <n>, LOW <n>, FUTURE <n>` then `- Outside-fence reads: <n> files (see round-2/synthesis.md)`.
Why: `synthesis.md` line 23 to 30 defines six tiers and the ship verdict counts CRASH/CORRUPT as blocking. A report that only shows HIGH/MEDIUM/LOW can print "HIGH: 0" next to a FIX THEN SHIP verdict, which the new readers will read as a contradiction. The resolved line is what suggestion 3 makes countable.

**17. Em dashes throughout.** (line 34, 36, 37, 38, 41, 43, 67, 82, 122, 139, 169 and others)
Current: `**Explicit dependency** — B's ...`, `spending tokens and modifies code — it's there because`
Proposed: Replace each with a colon, period, or parentheses. Ranges as "batches 0 to N-1" (line 47).
Why: `~/.claude/CLAUDE.md` voice rule 1 applies to all writing. Low impact on behavior, but this file will be copied into two more prompts (Round 2, fixer) and the dashes propagate.

**Keep: Step 5 human gate.** (line 53 to 67) The single gate before spend is the right place and the reason is stated. Only the printout changes (suggestion 14).

**Keep: Step 4 batching rule and the sanity check.** (line 45 to 51) Clear, testable, and the "shouldn't happen" fallback is cheap.

**Keep: "Do NOT auto-fix Round 2 findings."** (line 173) Matches relay.md line 73 exactly.

**Keep: Rules bullet on git state-changing operations.** (line 182) Suggestion 6 stays inside it.

**Delete: line 181 unclean-git warning, once suggestion 6 lands.** With a `git stash create` snapshot per batch the saved diffs are exact regardless of prior uncommitted changes, so the warning no longer protects anything. Keep it if suggestion 6 is rejected.

---

Keep 4 / change 17 / delete 1.
Most important change: suggestion 1, add a Step 9 that appends one `audits/LEDGER.md` line on every exit path (complete or halted), after every landed brief's `fixes/<id>-report.md` exists; today dispatch logs nothing and a halted run leaves modified code with no record.
