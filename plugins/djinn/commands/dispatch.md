---
name: dispatch
description: Dispatch one or more fix briefs to fixer agents. Usage - /djinn:dispatch <brief-path> [<brief-path>...]. Computes dependency DAG from depends_on + work-set overlap, batches fixes (parallel where disjoint, sequential where dependent), spawns fresh Opus fixer agents per brief at max effort, saves diffs, and auto-runs Round 2 audit on the combined change.
allowed-tools: Read, Grep, Glob, Write, Edit, Agent, Bash
---

# Djinn Dispatch

You are orchestrating the execution phase of the relay. Briefs in, diffs + audit out.

## Step 1: Parse arguments

$ARGUMENTS contains one or more space-separated paths to brief files (e.g. `audits/2026-04-20-1530-standard/fixes/HIGH-1-rename.md`).

If no briefs specified, ask the user which briefs to dispatch. List the pending briefs in the most recent audit folder if helpful.

## Step 2: Load briefs + validate

For each brief path:
- Read the full file, parse the YAML frontmatter
- Extract: `id`, `status`, `severity`, `work_set.files`, `work_set.symbols_renamed`, `work_set.symbols_touched`, `depends_on`
- Validation:
  - If `status != pending` → skip with a note (already `landed`, `blocked-*`, or `in-progress`)
  - If `work_set.files` is empty → REJECT, tell user the brief needs work_set filled in before dispatch
  - If any file in `work_set.files` doesn't exist → REJECT, report
  - If WHY section still contains `TODO (deliberation context)` with empty body → WARN, ask user to confirm they want to dispatch without filled-in WHY (the fixer benefits from it)

Collect the valid briefs. Note all audit-folder paths (they should all share the same audit run — if not, flag and ask the user to confirm).

## Step 3: Build dependency DAG

For each pair of briefs (A, B):

**Explicit dependency** — B's `depends_on` contains A's `id` → edge A → B.

**Implicit dependency** — symbol-level collision:
- A's `symbols_renamed` has `foo → bar`, and B's `work_set.files` contains a file that (by grep) references `foo` → edge A → B (B must see post-rename state)
- A's `symbols_touched` includes a symbol B also touches → edge A → B by brief-id order (earlier wins unless user overrides)

**Implicit dependency** — file-level collision:
- A's `work_set.files` and B's `work_set.files` share any file → they CANNOT run in the same batch. Earlier brief-id wins, later depends on it.

Check for cycles. If cycle detected → halt, report which briefs form the cycle, ask user to resolve.

## Step 4: Topologically sort into batches

Use standard topo sort with batching: each batch N = all briefs whose dependencies are all in batches 0..N-1, AND whose work-sets within the batch are pairwise disjoint.

If two briefs at the same DAG level still have overlapping work-sets (shouldn't happen after step 3, but sanity check), split into separate batches — earlier brief-id first.

**Max parallelism per batch: 4 fixers.** If a batch has more than 4 disjoint briefs, split into sub-batches of 4.

## Step 5: Report the plan to the user

Before spawning anything, print:

```
Dispatch plan:
  Batch 1 (parallel): [brief-id-1, brief-id-2, brief-id-3]
  Batch 2 (waits for batch 1): [brief-id-4]
  Batch 3 (waits for batch 2): [brief-id-5, brief-id-6]

Round 2 audit will run automatically after all briefs land.
Proceed? (Say "go" or specify changes.)
```

Wait for user confirmation before spawning. This is the one human gate in dispatch — it's there because spawning fixers spends tokens and modifies code.

## Step 6: Execute batches

For each batch, in order:

### Spawn fixers in parallel

For each brief in the batch, use the Agent tool with `subagent_type: "fixer"`. Send all fixer calls for a given batch in a single message with multiple Agent tool-use blocks.

Each fixer's prompt:

```
Execute the fix described in <brief-absolute-path>.

You are running under the /djinn:dispatch orchestrator. Follow the fixer protocol in your system prompt:
- Enforce work_set as a hard boundary
- If scope drifts, STOP and report BLOCKED_SCOPE (do not silently expand)
- After edits, run npm run build and include output in your report
- Return a Fix Report in the documented format

The brief's frontmatter is the contract. Honor it.
```

### Wait and collect

When all fixers in the batch return:

1. **Update brief status.** For each brief, edit its frontmatter `status` field:
   - Fixer returned COMPLETED → `landed`
   - Fixer returned BLOCKED_SCOPE → `blocked-scope`
   - Fixer returned BLOCKED_BUILD → `blocked-build`
   - Fixer returned BLOCKED_OTHER → `blocked-other`

2. **Save diffs per fix.** For each COMPLETED brief:
   - Run `git diff -- <space-separated work_set.files>` via Bash
   - Write the output to `<audit-folder>/fixes/<id>.diff`

3. **Save fixer reports.** Write each fixer's full report verbatim to `<audit-folder>/fixes/<id>-report.md`.

### Handle blockers

If any brief in the batch is `blocked-*`:
- HALT further batches
- Report all blockers to the user with:
  - Brief IDs blocked, status of each
  - The fixer's proposed amended brief (if provided)
  - Options: amend & re-dispatch, skip & continue, abort
- Wait for user decision

### Build check between batches

After the batch lands (all successful), run `npm run build` globally. If it fails:
- HALT
- Report the failure with errors
- Do not spawn next batch until user resolves (typically by amending a brief or spawning a new fix)

## Step 7: Round 2 audit (automatic, no gate)

After ALL batches land successfully:

1. **Determine changed files.** Run `git diff --name-only` against the base commit the original audit ran on. If the base isn't recorded, use `git diff --name-only HEAD~N` where N = count of commits since audit (or accept the cumulative diff of all fix .diff files).

2. **Read the scope used in the original audit** from the audit folder name (e.g. `2026-04-20-1530-standard` → scope was `standard`) or from `<audit-folder>/synthesis.md` if it recorded the agent list.

3. **Create round-2 folder.** `mkdir -p <audit-folder>/round-2/agents`.

4. **Spawn the same agents** as the original scope, but with Round 2 instructions:
   ```
   You are running Round 2 verification. The original Round 1 reports are in <audit-folder>/agents/. The synthesis is <audit-folder>/synthesis.md. The fixes applied are in <audit-folder>/fixes/*.diff.

   Scope your review to the changed files only (listed below). Specifically:
   - Verify each HIGH/MEDIUM finding from Round 1 synthesis is resolved
   - Catch new issues introduced by the fixes
   - Check blast radius — peek at callers/consumers of any changed signatures

   Write your report to <audit-folder>/round-2/agents/<your-name>.md.

   Changed files: <list>
   ```

5. Spawn synthesis on Round 2 reports → writes `<audit-folder>/round-2/synthesis.md`.

## Step 8: Final report

Tell the user:

```
Dispatch complete.

Landed: <count> briefs
  - <id>: <one-line summary>
  ...
Blocked: <count> briefs (if any)
  - <id>: <blocker reason>

Round 2 audit folder: <audit-folder>/round-2/
Round 2 ship verdict: <SHIP | FIX THEN SHIP | ESCALATE>
  - HIGH: <n>, MEDIUM: <n>, LOW: <n>

Next step: <suggestion>
  - SHIP → done
  - FIX THEN SHIP → /djinn:brief <audit-folder>/round-2 <finding-id> for each new finding, then dispatch
  - ESCALATE → open <audit-folder>/round-2/synthesis.md and deliberate
```

Do NOT auto-fix Round 2 findings. The user decides next step.

## Rules

- Max parallelism per batch: 4 fixers.
- Never spawn a new batch if the previous batch's build failed.
- Never dispatch a brief with `status != pending`.
- Never modify briefs' WHAT / WHY / work_set fields — only the `status` frontmatter line.
- If git is in an unclean state before dispatch, warn the user (uncommitted changes may contaminate the diffs saved per fix).
- Do NOT commit, push, or run git state-changing operations unless the user explicitly asks.
