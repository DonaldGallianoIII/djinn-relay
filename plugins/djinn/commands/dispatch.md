---
name: dispatch
description: Dispatch one or more fix briefs to fixer agents, or a selection of findings (all highs, all blocking, all, with recs) that one fixer per 20 findings works through. Usage - /djinn:dispatch [--prove] [--no-tests] <brief-path> [<brief-path>...], or /djinn:dispatch [--prove] [--no-tests] <audit-folder> <selection> [one each] [--max <n>]. Builds a dependency order from depends_on plus work-set overlap, batches fixes (parallel where disjoint, sequential where dependent), spawns a fresh Opus fixer per brief, saves a diff and a report per fix, appends a ledger line on every exit path, and runs the next audit round on the combined change. With --prove, and only then, proof-runner runs the narrowest covering test per landed fix under the config's heap cap and timeout before that round.
allowed-tools: Read, Grep, Glob, Write, Edit, Agent, Bash
---

# Djinn Dispatch

You are orchestrating the execution phase. Briefs in, diffs and a fresh
audit round out. This is the only command that changes code, so it is the
only command where an unlogged run is unacceptable.

Read `${CLAUDE_PLUGIN_ROOT}/CONTRACTS.md` first.

## Step 1: Parse arguments

`$ARGUMENTS` is one or more space-separated brief paths, for example
`audits/2026-09-12-1402-standard/fixes/HIGH-1-rename-shadowed-fn.md`, or
an audit folder followed by a selection, for example
`audits/2026-09-12-1402-standard all blocking with recs`.

**A selection** is everything `/djinn:brief`'s Selection mode understands
(`brief.md`, Selection mode): `all highs`, `all blocking`, `all`,
`with recs`, `with debt`, a list of ids, `one each`, `--max <n>`. Run that
mode first, as written there, to write the group briefs (or, with
`one each`, one brief per finding), then dispatch the briefs it wrote, in
order. The default is one fixer per group of up to 20 findings, the
groups in series; `one each` gives every finding its own fixer, as before.
Group briefs written this way carry the TODO in WHY unfilled: say so in the
plan as one line, not one warning per brief.

If none are given: list every brief with `status: pending` under the most
recent `audits/*/fixes/`, and ask which to dispatch.

Brief order is the order the paths appear in `$ARGUMENTS`. That order
breaks every tie below.

`--prove` is a flag, not a path. It asks for proof-runner after the
batches land (Step 7). It is the only way this command ever spawns
proof-runner; without it, proof-runner never runs.

`--no-tests` is a flag, not a path. It skips the landing lane (Step 7) for
this dispatch, and the plan and the ledger line say so.

## Step 2: Load config and briefs, validate

Read `.djinn/config.yaml` for `build_cmd` and `test_cmd`. If `build_cmd` is
`none`, print `WARN: no build_cmd configured; build gates are skipped` in
the plan and in the final report.

Also take every key `/djinn:review` Step 1 takes (`known_bugs_index`,
`conventions_files`, `hot_paths`, `ui_paths`, `goal_doc`, `maps`,
`large_file_kb`, `deps`, `gates`, `cost`, `data`, `live`, `project_notes`),
for the round prompts in Step 7, and run the same `cost.paid_apis[].key`
check as `/djinn:review` Step 1. Always take `proof` too: `proof.heap_mb`
and `proof.timeout_s` cap the fixer's own test run (Step 6), and
`proof.heap_mb` and the lane timeout cap the landing lane (Step 7), with or
without `--prove`. The lane timeout is `proof.lane_timeout_s` when set,
because the lane runs the whole suite and `timeout_s` is a budget for one
test file; when it is absent, the lane uses `timeout_s` and the plan says
so. A `none` or an empty list reads as absent (CONTRACTS.md section 5).

Named constants this command uses: `KILL_MARGIN_S` and `PROBE_MARGIN_MB`
take proof-runner's values (`agents/proof-runner.md`, Inputs from config),
so the two never drift apart; `LANE_TOOL_SLACK_S` takes proof-runner's
`TOOL_SLACK_S`.

**Checks before the plan** (CONTRACTS.md section 9 and section 5). Each
failure is a line in the plan, never a silent default:

- `proof.heap_mb`, `proof.timeout_s`, `proof.lane_timeout_s` and
  `proof.lane_mem_mb`, when set, are positive whole numbers. One that is
  not is treated as absent, and the plan names it under `Refused keys:`.
- `proof.memory_wrapper`, when set, passes proof-runner's character
  allowlist and holds `{mem_mb}`. One that does not is treated as absent
  for the lane and the fixer's runs, named under `Refused keys:`.
- The lane timeout, when `proof.harness_timeout_max_s` is set: the lane
  timeout plus `KILL_MARGIN_S` plus `LANE_TOOL_SLACK_S` must not pass it.
  If it does, the Bash tool would cut the lane before its exit line, so
  the plan reads `Landing lane: refused, lane timeout passes
  harness_timeout_max_s` and the lane does not run.
- **Resident cap for the lane and the fixer's runs.** When
  `proof.memory_wrapper` and `proof.lane_mem_mb` are both set: read total
  memory once with `free -m`. If `lane_mem_mb` is more than half of it,
  the plan reads `resident cap refused: lane_mem_mb <n> MB is over half of
  <total> MB` and the lane and the fixer's runs are `heap cap only`. Else
  run proof-runner's wrapper probe once (`agents/proof-runner.md`, Bash
  item 1b) with `lane_mem_mb` as the figure. Killed by the wrapper: the
  resident cap is proven, and the lane and the fixer's runs carry it. Ran
  to the end: `memory wrapper did not cap`. Any other exit: `memory wrapper
  did not start`. On either failure the plan names the reason and the lane
  and the fixer's runs are `heap cap only, resident memory unbounded`;
  nothing reads `capped`. With no wrapper or no `lane_mem_mb`, the same
  words, and no probe runs.

Only proof-runner's refusal is tied to `--prove`. With `--prove`, if
`proof.heap_mb` or `proof.timeout_s` is missing or not a positive whole
number, or `proof.memory_wrapper` is missing, proof-runner is refused: say
`proof-runner refused: set <keys> in .djinn/config.yaml` in the plan, and
ask whether to dispatch without proof. Never pick a cap yourself.

For each brief path, read the file and parse the YAML frontmatter: `id`,
`status`, `severity`, `work_set.files`, `work_set.symbols_renamed`,
`work_set.symbols_touched`, `depends_on`, `work_set_source`, and for a
group brief `findings` (each entry's `id`, `severity` and `status`). A
group brief is one brief to everything below: one work set, one fixer, one
report, one diff.

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
Landing lane: <"capped heap <heap_mb> MB, resident <lane_mem_mb> MB, <t> s" |
"heap cap only, resident memory unbounded, <heap_mb> MB, <t> s" |
"uncapped memory, <t> s" | "uncapped, test_cmd as configured" |
"skipped (--no-tests)" | "refused, lane timeout passes harness_timeout_max_s" |
"not configured">, where <t> names its source: "(lane_timeout_s)" or "(no
lane_timeout_s set, so the per file timeout_s caps the whole suite)".
test_cmd runs whole under these caps, through bash -c from a file.
Fixer test runs: <"capped heap <heap_mb> MB, resident <lane_mem_mb> MB,
<timeout_s> s a file" | "heap cap only, resident memory unbounded,
<heap_mb> MB, <timeout_s> s a file" | "none, no heap cap set">
Resident cap: <"probed, the wrapper killed a <lane_mem_mb> MB plus
PROBE_MARGIN_MB allocation" | "not set: no memory_wrapper or no lane_mem_mb" |
"refused: <reason>">
Refused keys: <each key and its check, or none>
Proof: <"proof-runner after landing, heap <heap_mb> MB, resident cap by
memory_wrapper, <timeout_s> s a file, at most <max_files> files. Each file
runs as your user, with your environment, files and network" | "not
requested" | "refused: <keys>">
After all batches land, round <n> review spawns <k> reviewers (<names>)
on Opus, plus any the round fence triggers (legibility-reviewer among
them when a fix adds, moves, renames or deletes a file).
Proceed? Say "go" or specify changes.
```

For a selection, the plan opens with:

```
Selected <n> findings (<selection>): <ids, compressed as HIGH-1 to HIGH-4>
Planned: <g> fixer(s) in series, <sizes, e.g. 20 then 5>, one per group brief.
Change it with: one each (a fixer per finding), --max <n> (group size), or drop <ids>.
```

and each group brief in the batch lines lists its finding ids.

Wait for the user. This is the one human gate in dispatch. It exists
because spawning fixers spends tokens and modifies code.

## Step 6: Execute batches

For each batch, in order:

### Snapshot

Before spawning, snapshot the working tree without touching refs:
`PRE=$(git stash create)`. If it prints nothing (clean tree), `PRE=HEAD`.

Before the first batch only, make this dispatch's temp folder with
`mktemp -d` and note the path as `RUN_TMP` (CONTRACTS.md section 9: every
temp file lives there, the literal path is written in each later call, and
the folder is removed at Step 8 on every exit path). `<learn skip>` in
every listing below is the review command's (review.md Step 3, "The learn
skip"): `':!learn'` when `learn/.gitignore` exists at the root, holds the
one line `*`, and git does not track it, else nothing. Save the untracked
listing `git ls-files -z -o --exclude-standard -- . ':!audits' <learn skip>`, as one
path per line, to `$RUN_TMP/untracked-before.txt`. Step 7 item 3 compares
against it. Also keep the first batch's `PRE` as `PRE_DISPATCH`: Step 7
item 3 reads the dispatch's added, deleted and renamed files against it.

Before each batch, copy every work-set file of the batch that git shows as
untracked into `$RUN_TMP/pre/<batch>/<same path>`, with the paths fed from
a file through `xargs -0 -r cp --parents -t "$RUN_TMP/pre/<batch>" --`
(the folder made first with `mkdir -p`). `git stash create`
never holds an untracked file, so this copy is the only record of what
the file held before the fixer. Collect item 3 diffs against it.

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
- proof.heap_mb: <value or none>. proof.timeout_s: <value or none>. With
  heap_mb none, run no test of your own (TESTS: NOT-RUN, reason no heap
  cap). With a number, any test command you run carries it (see your
  agent definition, Step 5).
- Resident cap: <"proof.memory_wrapper=<value>, {mem_mb}=<lane_mem_mb>,
  probed by dispatch" | "none: heap cap only, resident memory unbounded">.
  Put the wrapper, filled, in front of every test run when one is given;
  otherwise say `heap cap only` in your report.
- cost.paid_apis=<each entry's name and key env var name only, or none>.
  Set every key env var named here empty for every test run.
- proof.runner=<value or default>, proof.setup_files=<list or none>,
  proof.test_globs=<value or default>. Screen each test file as your
  agent definition's Step 5 says before you run it.
- Tree facts: <audit-folder>/tree-facts.md (or the round's, when the brief
  came from a round folder). Facts from git, not findings.

The brief's frontmatter is the contract.
<For a group brief, one more line:> This is a group brief of <n> findings:
follow your agent definition's Group mode, and report every finding on its
own line under ## Findings.
```

### Collect

When every fixer in the batch has returned:

1. **Parse each Fix Report.** Status is the first non-blank line under
   `## Status`. Anything else is BLOCKED_OTHER. A COMPLETED report with any
   unchecked `- [ ]` line under Success Criteria, or with Build Status
   FAILING, is BLOCKED_OTHER with reason "completed with unmet criteria".
   Only a clean COMPLETED becomes `landed`.
   For a group brief, also read `## Findings`, one line per finding id. A
   COMPLETED group whose Findings lines are not all FIXED is PARTIAL. A
   PARTIAL report with Build Status PASSING or FAILING-PRE-EXISTING
   becomes `partial`: its FIXED findings count as landed, the rest as
   blocked with the reason on their line. A finding id missing from
   `## Findings` is BLOCKED_OTHER, "not reported".

2. **Write the fix report.** For every brief, write
   `<audit-folder>/fixes/<id>-report.md`: the attribution header
   (`author: Claude Opus (fixer agent, via /djinn:dispatch)`,
   `status: agent output, not yet reviewed`), then the fixer's report
   verbatim. This file is the fix summary. A brief is not landed until it
   exists.

3. **Save the diff.** For each landed brief, with the work set's paths
   written to a file in `$RUN_TMP` and fed through `xargs -0 -r`
   (CONTRACTS.md section 9; no path is typed into a command line):
   - `git diff --no-ext-diff --no-textconv $PRE --` over the work-set
     files, for tracked files.
   - For each work-set file that
     `git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false status --porcelain`
     shows as untracked (`??`): append
     one diff per file, the untracked paths fed from a file through
     `xargs -0 -r -I{} git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false diff --no-ext-diff --no-textconv --no-index -- "$RUN_TMP/pre/<batch>/{}" {}`.
     `-I{}` runs one call per path; `--no-index` takes exactly two paths,
     so a single call over several files is git's usage error, not a
     diff. These
     files existed before the fixer: Step 2 rejects a work-set file that
     does not exist, and Snapshot copied each one into `$RUN_TMP/pre/`
     before the batch, so the diff is the fixer's change and not the whole
     file. A `git diff --no-index` exit of 1 means the files differ and is
     not an error. An untracked file outside the work set never enters a
     diff.
   - Write to `<audit-folder>/fixes/<id>.diff` with a first line
     `# base: $PRE  batch: <k>  brief: <id>`.

4. **Update brief status.** Edit only the `status:` line: `landed`,
   `partial`, `blocked-scope`, `blocked-build`, or `blocked-other`. In a
   group brief, also set each `findings` entry's `status:` to `fixed`,
   `not-present`, `blocked-scope` or `blocked-other` from its line. A
   `partial` brief is landed for everything below: its diff is saved and
   its work set is in the next round's fence, since its edits are real.

### Handle blockers

A group brief that ended `partial` is not a blocker: its blocked findings
stay open, are listed in the final report, and the next round reviews
them again. The next group runs.

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

1. **Round number.** Find the original audit folder: the brief's audit
   folder, or the folder above it when that is a `round-<k>` folder. Round
   = 1 + the highest `<k>` among the `round-<k>/` folders directly under
   it, or 2 when there are none. This holds wherever the briefs live: a
   brief written against `round-1`'s or `round-2`'s findings still leads
   to the next round, never an existing one. If the round would be 4 or
   more, do not spawn. Report `Max 3 rounds reached. Stop and deliberate.`
   and go to Step 8. Create `<audit-folder>/round-<n>/agents/` under the
   original audit folder. Never nest `round-2/round-2/`, and never write
   into a round folder that already exists.

2. **Landing lane.** First read `merge_base` from `context.md` and check it
   matches `^[0-9a-f]{40}$` (64 hex characters in a SHA-256 repo); on a
   mismatch, halt and ask, as item 3 does for a missing one. Then save the
   untracked listing again, as one path per line from `-z` output, to
   `$RUN_TMP/untracked-landed.txt`, and
   `git diff --no-ext-diff --no-textconv --name-only -z <merge_base> -- . ':!audits' <learn skip>`
   to `$RUN_TMP/changed-landed.txt`: this is the tree the fixers left,
   before any test run writes to it (item 3 reads both).

   Then, if `test_cmd` is configured, `--no-tests` was not passed and Step
   2 did not refuse the lane, run it once, at the repo root, and save the
   output to `<audit-folder>/round-<n>/test-output.txt`. Write `test_cmd`
   to `$RUN_TMP/test-cmd` with Write, as the config holds it, so it is
   never typed into a command line and a chained `test_cmd` (`npm run build
   && npm test`, or `cd x && ...`) runs whole under every cap below. The
   lane runs as:

   ```
   <memory_wrapper filled with lane_mem_mb, when Step 2 proved it> env NODE_OPTIONS=--max-old-space-size=<heap_mb> timeout --kill-after=<KILL_MARGIN_S>s <lane timeout>s bash -c "$(cat "$RUN_TMP/test-cmd")"
   ```

   Leave out each part whose key is unset: no wrapper unless Step 2's
   probe passed, no `NODE_OPTIONS` without `heap_mb`, no `timeout` without
   a lane timeout. The lane timeout is `proof.lane_timeout_s` when set,
   else `proof.timeout_s` (Step 2), and it applies whenever it is set,
   with or without `heap_mb`. Set the Bash tool's own timeout on this call
   to the lane timeout plus `KILL_MARGIN_S` plus `LANE_TOOL_SLACK_S`, which
   Step 2 checked against `harness_timeout_max_s`. With nothing set, run
   `bash -c` from the file uncapped, as the plan said. A failing or timed
   out run does not halt; it goes to synthesis as input, with the exit
   code on the first line of `test-output.txt`. With `--no-tests`, write
   `skipped (--no-tests)` as that file's only line.

   **Proof (only with `--prove`, and only when Step 2 did not refuse it).**
   After the landing lane, spawn proof-runner alone with
   `subagent_type: "proof-runner"` and `model: "opus"`, and wait for it
   before item 3. Nothing else runs while it runs. It is separate from the
   landing lane: with `--prove` and no `test_cmd`, the landing lane still
   does not run. Prompt:

   ```
   INVOKED BY OWNER: dispatch --prove
   MODE: dispatch
   Config: proof.heap_mb=<value>, proof.timeout_s=<value>,
   proof.memory_wrapper=<value>,
   proof.harness_timeout_max_s=<value or absent>,
   proof.runner=<value or default>, proof.setup_files=<list or none>,
   proof.test_globs=<value or default>,
   proof.max_files=<value or default>, cost.limits=<value or absent>,
   cost.paid_apis=<each entry's name and key env var name only, or none>,
   conventions_files=<list>, known_bugs_index=<path or none>,
   project_notes=<text>
   Tree facts: <audit-folder>/tree-facts.md
   Input: the audit folder, and per landed id: fixes/<id>-report.md, the
   brief path, work_set.files, fixes/<id>.diff
   Write to: <audit-folder>/round-<n>/proof.md
   ```

   If it replied but the file is missing, write its returned text there
   with the attribution header.

   Read its `Stopped:` line. When it names `TREE CHANGED`, halt the round:
   spawn no reviewer, report the line to the user as `the tree changed
   during <file>'s run (any writer)`, with the saved file paths it gives,
   and go to Step 8 with outcome `HALTED proof: TREE CHANGED`. The change
   may come from the test or from any other writer in the repo during that
   run (an editor swap file, another session); the owner reads the saved
   files to tell which. Any other
   `Stopped:` reason (CAPPED, TIMEOUT, MUTANT) does not halt; it goes into
   the ledger line's `proof=` field and the Step 9 report, and synthesis
   merges proof-runner's Findings like any report.

3. **Fence.** Read `merge_base` from `<audit-folder>/context.md`. If the
   file is missing, halt and ask for the base ref. Do not guess.
   FENCE = union of `work_set.files` across all landed briefs. In a `live`
   scope audit, FENCE also holds every tracked file under
   `live.systems[].code`, as the original fence did (CONTRACTS.md section
   4), because the blind review reads the whole tool in every round.
   Cross-check with `changed-landed.txt`, and with the untracked listings:
   a file in `untracked-landed.txt` and not in `untracked-before.txt` is
   new since the fixers started. Any file from either check that is
   neither in FENCE nor in the original `fence.txt` is a scope leak: name
   it in the final report and add it to FENCE so this round reviews it.
   Take both listings a third time now, into `$RUN_TMP`: a file, tracked
   or untracked, that appears only here, after the landing lane or
   proof-runner, goes on its own report line, `written by test runs`, and
   never into FENCE. Apply `/djinn:review` Step 3's `MAX_UNTRACKED` and
   segment stop to exactly one list: the files in `untracked-landed.txt`
   and not in `untracked-before.txt`, the files the fixers added. Files on
   `written by test runs` (a `coverage/` or `build/` tree the lane wrote)
   never count toward the stop. On a stop, halt the round and report it,
   as review does. Write FENCE to
   `<audit-folder>/round-<n>/fence.txt`, and write
   `<audit-folder>/round-<n>/tree-facts.md` over the round fence exactly as
   `/djinn:review`'s "Tree facts" says, reading paths from that file
   through `xargs -0 -r`.
   Then build the round's two tree lists, as `/djinn:review` Step 4 builds
   them, in `$RUN_TMP`: `tree.txt` from `git ls-files -z -- . ':!audits' <learn skip>`
   plus `untracked-landed.txt`, and `tree-changes.txt` from
   `git diff --no-ext-diff --no-textconv --name-status -z -M -C --diff-filter=ADRC $PRE_DISPATCH --`
   over the round fence (the paths fed from `round-<n>/fence.txt` through
   `xargs -0 -r`), then one line `A<TAB><path>` per untracked file in the
   round fence that is in `untracked-landed.txt` and not in
   `untracked-before.txt`, written with Write. An untracked file that
   existed before the dispatch was not added by it, and listing it would
   fire legibility-reviewer's first trigger every round. Paths only, never
   content, and never typed into a command line. Keep both as `round-<n>/tree.txt` and
   `round-<n>/tree-changes.txt` when legibility-reviewer runs this round.
   A `map` scope audit's rounds are diff mode too: the round fence is the
   landed work sets as above, never the whole tree.

4. **Agents.** Read `agents_run` from `context.md`. Spawn the same agents
   with the same wave structure as `/djinn:review` (known-bugchecker
   alone, read-only agents in parallel, executing agents serially in
   `/djinn:review` Step 7's order), every call with `model: "opus"`. Then
   check `/djinn:review` Step 2's conditional triggers against the round
   fence, and add any triggered agent `agents_run` does not already hold
   (skip this for a `live` scope audit). A fixer's work set that touches a
   test, a UI file or a schema brings gate-auditor, accessibility-reviewer
   or data-contract-reviewer in this way. legibility-reviewer joins, in
   diff mode, when its trigger fires on the round fence and the round's
   `tree-changes.txt`, whatever the first round's scope was; a `map` scope
   audit already holds it in `agents_run`, and there it always runs, in
   diff mode. A `map` scope audit's rounds check the other triggers like
   any round's, since a rename or move can touch code. Never add
   proof-runner, and never add multiuser-reviewer if `context.md` says it
   was skipped. A `map` scope audit's rounds skip known-bugchecker, as its
   first round did.

   Each prompt is the fence block from `/djinn:review` with the round fence
   and the round's `tree-facts.md` path, the agent's per-agent block from
   `/djinn:review` ("Per-agent blocks", and Step 7 for the executing
   agents), so round `n` still carries the `cost`, `data`, `live`, `gates`
   and `ui_paths` blocks and the web rule.
   legibility-reviewer's block reads `Mode: diff` in every round, even in
   a `map` scope audit, with the paths of `round-<n>/tree.txt` and
   `round-<n>/tree-changes.txt`, `maps`, `data.generated`, and whether
   integration-reviewer runs this round. The `SCOPE: map` line is not
   pasted in a round. Every prompt then ends with:

   ```
   This is round <n>. The fixes applied since round <n-1> are in
   <audit-folder>/fixes/*.diff. Review those diffs: file new issues they
   introduced and regressions in callers of any changed symbol. Do not
   write a Round <n-1> status section and do not mark any prior finding
   RESOLVED; synthesis alone owns prior-finding status (CONTRACTS.md
   section 3).
   Write to <audit-folder>/round-<n>/agents/<your-name>.md.
   ```

   Before spawning, write `<audit-folder>/round-<n>/round-patch.patch`: the
   landed `fixes/<id>.diff` files of this dispatch, concatenated in batch
   order. devils-advocate gets the goal statement (`/djinn:review` Step 7's
   wording) and that path as its patch, so its hunk walk reads this
   round's changes, not round 1's. In a `live` scope audit the fence block
   keeps `SCOPE: live` and withholds the goal, as in round 1.

5. **Synthesis.** Spawn synthesis with `model: "opus"`. Prompt: the report
   paths, the round fence, the round's tree-facts path, `Scope: <scope
   from context.md>`, `Agents expected: <list>`, `Agents that failed after
   retry: <list or none>`, `Agents not run in this round: <list, each with
   its reason>`, the prior round's synthesis path and its
   `findings.json` path (the audit folder's own for round 2,
   `round-<n-1>/` after that; say "none" if that file does not exist),
   every landed diff by its full path (`fixes/LOW-1.diff` in the audit
   folder is round 1's, `round-2/fixes/LOW-1.diff` round 2's), the test
   output path if any, with `--prove` the line "proof-runner's report is
   at `<audit-folder>/round-<n>/proof.md`. Merge its Findings like any
   report. Its table is an executed result, not a status: your status
   table still comes from reading the diff.", and:
   "This is
   round <n>. Produce the `## Round <n-1> status` table first, verified by
   reading each diff and the file, not the fixer's report. Write
   `<audit-folder>/round-<n>/synthesis.md` and
   `<audit-folder>/round-<n>/findings.json` (CONTRACTS.md section 12)."
   If it returned but `findings.json` is missing, ask it once more for only
   that file: "`round-<n>/synthesis.md` exists. Write only
   `round-<n>/findings.json` from it, per CONTRACTS.md section 12. The
   prior round's findings.json is `<path>` (or none)." If it is still
   missing, say so in the Step 9 report.

6. **Consolidator.** Spawn consolidator with `model: "opus"`. Prompt:
   "MODE: post-dispatch. The fixes in `<audit-folder>/fixes/` landed.
   Dispositions: <id: landed | partial | blocked | skipped, one per brief>. The
   round <n> synthesis with its Round <n-1> status table is at
   `<audit-folder>/round-<n>/synthesis.md`. The known-bugs index is at
   `<known_bugs_index>`. Tree facts: `<audit-folder>/round-<n>/tree-facts.md`.
   Write to `<audit-folder>/round-<n>/consolidator.md`."
   If it replied but the file is missing, write its returned text there
   yourself with the attribution header. Do not apply it to the index.

## Step 8: Usage table and ledger line (always, including halts)

**Usage.** Append to `<audit-folder>/usage.md` (create it with the
attribution header if missing) a section `## dispatch <YYYY-MM-DD HH:MM>`
holding the table from CONTRACTS.md section 6: one row per fixer (wave =
batch number), one for proof-runner when it ran (wave = `proof`), and one
per round-<n> reviewer (wave = `round-<n>`), plus a total row. `?` where a completion carried no usage block.

**Ledger.** Append exactly one line to `audits/LEDGER.md` (create with the
header row from CONTRACTS.md section 6 if missing). Write it on every
exit: complete, halted on blocker, halted on build failure, halted on
cycle, halted on a proof tree change, halted on the untracked stop,
aborted after the plan, max rounds reached.

```
| <YYYY-MM-DD HH:MM> | dispatch | <audit-folder> | briefs=<ids> | landed <n> / blocked <n> / skipped <n> <for group briefs: findings fixed <n> / open <n>> <COMPLETE or HALTED batch <k>: <reason> or HALTED proof: TREE CHANGED> | round-<n>=<verdict or not run> H<n> M<n> L<n> D<n> R<n> tokens=<total or ?> lane=<capped, heap only, uncapped, skipped or not run> proof=<pass/run, STOPPED <file>: <reason>, or not run> |
```

`lane=capped` only when the heap cap and Step 2's probed resident cap
both held the lane; `heap only` when the heap cap ran without a proven
resident cap; `uncapped` when no memory cap ran. Never write `capped` for
a lane the plan called `heap cap only`.

Every landed brief has its `fixes/<id>-report.md` on disk before this
line is written. If one is missing, write it first from the fixer's
return, then write the ledger line. Then remove `$RUN_TMP` (the literal
path Step 6 noted), on every exit path.

## Step 9: Final report

```
Dispatch complete | halted.

Landed: <n>
  - <id>: <one-line summary from its report>
Blocked: <n>
  - <id>: <status and reason>
Skipped: <n>
<For group briefs, count findings, not briefs, and add:>
Findings: fixed <n>, not present <n>, blocked <n>
  - <id>: <NOT-PRESENT or BLOCKED line from the report>
Scope leaks: <files, or none>
Written by test runs: <files, or none>

Round <n> folder: <audit-folder>/round-<n>/
Round <n> verdict: <SHIP | FIX THEN SHIP | ESCALATE>
  - Resolved: <n> of <m> prior HIGH and MEDIUM
  - New: HIGH <n>, MEDIUM <n>, LOW <n>, DEBT <n>, REC <n>
  - Open across rounds: HIGH <n>, MEDIUM <n>, LOW <n> (from round-<n>/findings.json)
  - Outside-fence reads: <n> (see round-<n>/synthesis.md)
  - Landing lane: <passed | failed | timed out | not configured>, <capped heap <heap_mb> MB, resident <lane_mem_mb> MB, <lane timeout> s | heap cap only, resident memory unbounded, <heap_mb> MB, <lane timeout> s | uncapped memory, <lane timeout> s | uncapped | skipped (--no-tests) | refused: <reason>>, the lane timeout named as lane_timeout_s, or timeout_s when unset
  - Proof: <pass>/<run> files PASS, see round-<n>/proof.md | STOPPED <file>: <reason>, see round-<n>/proof.md | not requested | refused: <keys>

Next step:
  - SHIP: done. Nothing blocks a merge to <base_branch>.
  - FIX THEN SHIP: /djinn:dispatch <audit-folder>/round-<n> all blocking
    for the blocking findings this round raised (one fixer for the lot),
    or /djinn:brief <audit-folder>/round-<n> <id> for one. A blocking
    finding carried from an earlier round (shown as `R<k>` in
    `/djinn:status`) was raised in another folder; fixing it through the
    relay is not supported end to end yet (docs/carried-findings.md in the
    repo), so name it to the user and let them decide.
  - ESCALATE: open round-<n>/synthesis.md, section Conflicts Resolved.
```

Do NOT auto-fix findings from the new round. The user decides.

## Rules

- Max 4 fixers per batch.
- Every Agent call passes `model: "opus"` explicitly.
- Never spawn a new batch after a failed build gate.
- Never spawn proof-runner without `--prove`, never without both proof caps
  and `memory_wrapper`, and never beside another agent.
- Never type a file name or a config value into a command line; feed paths
  from a file with `xargs -0 -r` and patterns with `-f` (CONTRACTS.md
  section 9). The checked values of section 9 (`merge_base`, the whole
  number keys) are the only config values typed, and only after their
  check; `test_cmd` runs from a file through `bash -c`. Every git read
  carries that section's prefix, and every temp file lives in `$RUN_TMP`.
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
