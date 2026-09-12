---
name: dispatch
description: Dispatch one or more fix briefs to fixer agents. Usage - /djinn:dispatch <brief-path> [<brief-path>...]. Builds a dependency order from depends_on plus work-set overlap, batches fixes (parallel where disjoint, sequential where dependent), spawns a fresh Opus fixer per brief, saves a diff and a report per fix, appends a ledger line on every exit path, and runs the next audit round on the combined change.
allowed-tools: Read, Grep, Glob, Write, Edit, Agent, Bash
---

# Djinn Dispatch

You are orchestrating the execution phase. Briefs in, diffs and a fresh
audit round out. This is the only command that changes code, so it is the
only command where an unlogged run is unacceptable.

Read `${CLAUDE_PLUGIN_ROOT}/CONTRACTS.md` first.

## Step 1: Parse arguments

`$ARGUMENTS` is one or more space-separated brief paths, for example
`audits/2026-09-12-1402-standard/fixes/HIGH-1-rename-shadowed-fn.md`.

If none are given: list every brief with `status: pending` under the most
recent `audits/*/fixes/`, and ask which to dispatch.

Brief order is the order the paths appear in `$ARGUMENTS`. That order
breaks every tie below.

## Step 2: Load config and briefs, validate

Read `.djinn/config.yaml` for `build_cmd` and `test_cmd`. If `build_cmd` is
`none`, print `WARN: no build_cmd configured; build gates are skipped` in
the plan and in the final report.

For each brief path, read the file and parse the YAML frontmatter: `id`,
`status`, `severity`, `work_set.files`, `work_set.symbols_renamed`,
`work_set.symbols_touched`, `depends_on`, `work_set_source`.

Validation, per brief:

- `status` is not `pending`: skip with a note.
- `work_set.files` is empty: REJECT, the brief needs a work set.
- A file in `work_set.files` does not exist: REJECT, report which.
- The WHY section still contains the template placeholder `_<fill in`:
  WARN and ask the user to confirm dispatch without a filled-in WHY.
- `work_set_source: inferred`: WARN that reviewers did not verify the
  work set.
- For each `old -> new` in `symbols_renamed`: grep the repo for `old`
  (word boundary, excluding `audits/`). Every matching file must be in
  this brief's `work_set.files` or in the `work_set.files` of a brief that
  depends on it. Otherwise WARN: `<id> renames <old> but <file> references
  it and no brief owns that file; the fixer will return BLOCKED_SCOPE`.
  Ask the user to amend before building the plan.

All briefs should share one audit folder. If not, flag it and ask.

## Step 3: Build the dependency order

For each pair of briefs (A, B):

- **Explicit**: B's `depends_on` names A's `id`: A runs before B.
- **Rename collision**: A renames `foo -> bar` and a file in B's work set
  references `foo`: A runs before B, so B sees the post-rename state.
- **Symbol collision**: both touch the same symbol: argument order decides.
- **File collision**: any shared file in `work_set.files`: they cannot run
  in the same batch. Argument order decides.

If there is a cycle, halt, name the briefs in it, ask the user to resolve.

## Step 4: Batch

Batch N holds every brief whose dependencies all landed in earlier batches
and whose work sets are pairwise disjoint within the batch. At most 4
fixers per batch; split larger batches in argument order.

## Step 5: Print the plan and wait

```
Dispatch plan:
  Batch 1 (parallel): [HIGH-1, MEDIUM-2]
  Batch 2 (waits for batch 1): [HIGH-2]
    because HIGH-2 edits src/ui/toolbar.ts, which HIGH-1 also edits
  Batch 3 (waits for batch 2): [MEDIUM-1]
    because MEDIUM-1 depends_on HIGH-2
Tie-break order is your argument order.
Build command: <build_cmd or "none configured, gates skipped">
Test command: <test_cmd or "none configured">
After all batches land, round <n> review spawns <k> reviewers (<names>)
on Opus.
Proceed? Say "go" or specify changes.
```

Wait for the user. This is the one human gate in dispatch. It exists
because spawning fixers spends tokens and modifies code.

## Step 6: Execute batches

For each batch, in order:

### Snapshot

Before spawning, snapshot the working tree without touching refs:
`PRE=$(git stash create)`. If it prints nothing (clean tree), `PRE=HEAD`.

### Spawn fixers in parallel

For each brief in the batch, use the Agent tool with
`subagent_type: "fixer"` and `model: "opus"`. Send all fixer calls for the
batch in one message. Each prompt:

```
Execute the fix described in <brief-absolute-path>.

You are running under /djinn:dispatch. Follow the fixer protocol in your
agent definition:
- Confirm the defect exists at the cited location before editing.
- Run <build_cmd> before your first edit and record the baseline.
- work_set.files is a hard boundary. If the fix needs a file outside it,
  STOP and return BLOCKED_SCOPE with a proposed amended work set.
- After edits, run <build_cmd> and paste its full output in your report.
- Return a Fix Report in the documented format. The first non-blank line
  under "## Status" is exactly one of COMPLETED, BLOCKED_SCOPE,
  BLOCKED_BUILD, BLOCKED_OTHER.

The brief's frontmatter is the contract.
```

### Collect

When every fixer in the batch has returned:

1. **Parse each Fix Report.** Status is the first non-blank line under
   `## Status`. Anything else is BLOCKED_OTHER. A COMPLETED report with any
   unchecked `- [ ]` line under Success Criteria, or with Build Status
   FAILING, is BLOCKED_OTHER with reason "completed with unmet criteria".
   Only a clean COMPLETED becomes `landed`.

2. **Write the fix report.** For every brief, write
   `<audit-folder>/fixes/<id>-report.md`: the attribution header
   (`author: Claude Opus (fixer agent, via /djinn:dispatch)`,
   `status: agent output, not yet reviewed`), then the fixer's report
   verbatim. This file is the fix summary. A brief is not landed until it
   exists.

3. **Save the diff.** For each landed brief:
   - `git diff $PRE -- <work_set.files>` for tracked files.
   - For each work-set file that `git status --porcelain` shows as
     untracked (`??`): append `git diff --no-index /dev/null <file>`.
   - Write to `<audit-folder>/fixes/<id>.diff` with a first line
     `# base: $PRE  batch: <k>  brief: <id>`.

4. **Update brief status.** Edit only the `status:` line: `landed`,
   `blocked-scope`, `blocked-build`, or `blocked-other`.

### Handle blockers

If any brief in the batch is blocked: HALT further batches. Report each
blocked brief, its status, and the fixer's proposed amended work set if it
gave one. Options, the user picks one per blocked brief:

- **amend**: on the user's explicit word, write the fixer's proposed
  `work_set` into the brief's frontmatter, set `status: pending`, and
  re-run Steps 3 to 5 for the remaining briefs. The plan is re-printed and
  re-confirmed. This is the only case where dispatch edits a work set, and
  only with text the user approved.
- **skip**: mark the brief `skipped` in the plan. Every brief that depends
  on it is skipped too; name them.
- **abort**: stop. Landed briefs stay landed. Go to Step 8.

### Build gate between batches

After a batch lands with no blockers, run `<build_cmd>` at the repo root.
If it fails: HALT, report the errors, go to Step 8. Do not spawn the next
batch until the user resolves it. If `build_cmd` is `none`, print the WARN
line again and continue.

## Step 7: Next audit round (automatic, no gate)

After all batches land:

1. **Round number.** Round = 1 + the count of `round-` segments in the
   audit-folder path. If it would be 4 or more, do not spawn. Report
   `Max 3 rounds reached. Stop and deliberate.` and go to Step 8.
   Create `<audit-folder>/round-<n>/agents/`. Never nest
   `round-2/round-2/`; the round folder always sits directly under the
   original audit folder.

2. **Landing lane.** If `test_cmd` is configured, run it once, at the repo
   root, and save the output to `<audit-folder>/round-<n>/test-output.txt`.
   A failing test run does not halt; it goes to synthesis as input.

3. **Fence.** Read `merge_base` from `<audit-folder>/context.md`. If the
   file is missing, halt and ask for the base ref. Do not guess.
   FENCE = union of `work_set.files` across all landed briefs.
   Cross-check with `git diff --name-only <merge_base> -- . ':!audits'`.
   Any file in that output that is neither in FENCE nor in the original
   `fence.txt` is a scope leak: name it in the final report and add it to
   FENCE so this round reviews it. Write FENCE to
   `<audit-folder>/round-<n>/fence.txt`.

4. **Agents.** Read `agents_run` from `context.md`. Spawn the same agents
   with the same wave structure as `/djinn:review` (known-bugchecker
   alone, read-only agents in parallel, executing agents serially), every
   call with `model: "opus"`. Each prompt is the fence block from
   `/djinn:review` with the round fence, plus:

   ```
   This is round <n>. The fixes applied since round <n-1> are in
   <audit-folder>/fixes/*.diff. Look for new issues introduced by those
   diffs and for regressions in callers of any changed symbol. Do not
   re-verify round <n-1> findings; synthesis owns that.
   Write to <audit-folder>/round-<n>/agents/<your-name>.md.
   ```

5. **Synthesis.** Spawn synthesis with `model: "opus"`. Prompt: the report
   paths, the round fence, the prior round's synthesis path, every
   `fixes/<id>.diff`, the test output path if any, and: "Produce the Round
   1 status table first, verified by reading each diff and the file, not
   the fixer's report. Write to `<audit-folder>/round-<n>/synthesis.md`."

6. **Consolidator.** Spawn consolidator with `model: "opus"`. Prompt:
   "MODE: post-dispatch. The fixes in `<audit-folder>/fixes/` landed.
   Dispositions: <id: landed | blocked | skipped, one per brief>. The
   round <n> synthesis with its Round 1 status table is at
   `<audit-folder>/round-<n>/synthesis.md`. The known-bugs index is at
   `<known_bugs_index>`. Write to `<audit-folder>/round-<n>/consolidator.md`."
   If it replied but the file is missing, write its returned text there
   yourself with the attribution header. Do not apply it to the index.

## Step 8: Usage table and ledger line (always, including halts)

**Usage.** Append to `<audit-folder>/usage.md` (create it with the
attribution header if missing) a section `## dispatch <YYYY-MM-DD HH:MM>`
holding the table from CONTRACTS.md section 6: one row per fixer (wave =
batch number) and one per round-<n> reviewer (wave = `round-<n>`), plus a
total row. `?` where a completion carried no usage block.

**Ledger.** Append exactly one line to `audits/LEDGER.md` (create with the
header row from CONTRACTS.md section 6 if missing). Write it on every
exit: complete, halted on blocker, halted on build failure, halted on
cycle, aborted after the plan, max rounds reached.

```
| <YYYY-MM-DD HH:MM> | dispatch | <audit-folder> | briefs=<ids> | landed <n> / blocked <n> / skipped <n> <COMPLETE or HALTED batch <k>: <reason>> | round-<n>=<verdict or not run> H<n> M<n> L<n> D<n> R<n> tokens=<total or ?> |
```

Every landed brief has its `fixes/<id>-report.md` on disk before this
line is written. If one is missing, write it first from the fixer's
return, then write the ledger line.

## Step 9: Final report

```
Dispatch complete | halted.

Landed: <n>
  - <id>: <one-line summary from its report>
Blocked: <n>
  - <id>: <status and reason>
Skipped: <n>
Scope leaks: <files, or none>

Round <n> folder: <audit-folder>/round-<n>/
Round <n> verdict: <SHIP | FIX THEN SHIP | ESCALATE>
  - Resolved: <n> of <m> prior HIGH and MEDIUM
  - New: HIGH <n>, MEDIUM <n>, LOW <n>, DEBT <n>, REC <n>
  - Outside-fence reads: <n> (see round-<n>/synthesis.md)
  - Landing lane: <passed | failed | not configured>

Next step:
  - SHIP: done. Nothing blocks a merge to <base_branch>.
  - FIX THEN SHIP: /djinn:brief <audit-folder>/round-<n> <id> for each
    finding, then dispatch.
  - ESCALATE: open round-<n>/synthesis.md, section Conflicts Resolved.
```

Do NOT auto-fix findings from the new round. The user decides.

## Rules

- Max 4 fixers per batch.
- Every Agent call passes `model: "opus"` explicitly.
- Never spawn a new batch after a failed build gate.
- Never dispatch a brief whose status is not `pending`.
- Never modify a brief's WHAT, WHY, or work_set, except the amend case
  above, with text the user approved.
- Do NOT commit, push, stash (beyond `git stash create`, which moves no
  ref and no file), or run any git command that changes state, unless the
  user explicitly asks.

## Runtime notes

Claude Code specific: `$ARGUMENTS`, `allowed-tools`,
`${CLAUDE_PLUGIN_ROOT}`, the Agent tool with `subagent_type` and `model`,
parallel spawns as several Agent calls in one message, and agent
definitions in `agents/*.md` frontmatter. An adapter for another runtime
must provide spawn-with-prompt-and-model, wait-for-all, and the fixer's
return text as a string. "Max effort" is set by the fixer's own prompt;
there is no effort parameter on the Agent call.
