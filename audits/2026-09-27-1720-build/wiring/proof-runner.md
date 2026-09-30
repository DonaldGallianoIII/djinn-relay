---
title: wiring note for proof-runner (C4, gap-hunter REC-5)
author: Claude Opus 5.5 (phase 1 drafter, proof-runner)
date: 2026-09-27
status: pending
---

Redacted for the public repo: private course and work identifiers.

Agent file: `plugins/djinn/agents/proof-runner.md`. Everything below is for
the phase 2 writer. None of it is applied.

## 1. Scope membership

None. proof-runner joins no scope in `relay.md`'s table (`relay.md:127` to
`:133`) and no conditional list (`relay.md:135` to `:138`). It is never
spawned by `/djinn:review`, and never by `/djinn:dispatch` unless the owner
passed the flag. Add one line under the conditional paragraph in
`relay.md`:

> On request only, never by scope: **proof-runner**, when the owner passes
> `--prove` to `/djinn:dispatch` or asks for it by name. It is the one agent
> that runs project code, one test file at a time under `proof.heap_mb` and
> `proof.timeout_s`.

## 2. Trigger

Two, both explicit:

1. `/djinn:dispatch --prove <brief-path>...`. Parse `--prove` in
   `dispatch.md` Step 1 (`dispatch.md:15` to `:24`) as a flag, not a path.
   Spawn in Step 7, after landing lane item 2 and before item 3 (the round
   fence), because gap-hunter REC-5 puts it "in Step 7 before the round"
   and synthesis should read its table. With `--prove` and no `test_cmd`
   the landing lane still does not run; proof-runner is separate from it.
2. Direct request by name, in index mode or direct mode. Proposed command,
   optional: `/djinn:prove <audit-folder> [<finding-id>...]` and
   `/djinn:prove --index <known-bugs-index-path>`. Without a new command,
   the owner asks in chat and the orchestrator builds the same prompt.

No fence pattern or config key ever triggers it on its own. A config with
a `proof` block but no flag and no request runs nothing.

## 3. What the dispatch pastes into its prompt

```
INVOKED BY OWNER: <"dispatch --prove" | "direct request: <the owner's words>">
MODE: <dispatch | index | direct>
Config: proof.heap_mb=<value or missing>, proof.timeout_s=<value or missing>,
proof.runner=<value or default>, proof.test_globs=<value or default>,
proof.max_files=<value or default>, cost.limits=<value or absent>,
conventions_files=<list>, known_bugs_index=<path or none>,
project_notes=<text>
Input:
  dispatch mode: audit folder, and per landed id: fixes/<id>-report.md,
    the brief path, work_set.files, fixes/<id>.diff
  index mode: the index path
  direct mode: the audit folder and the finding ids
Write to: <report path>
```

Report paths: dispatch mode `<audit-folder>/round-<n>/proof.md`; direct
mode `<audit-folder>/proof-<YYYY-MM-DD-HHMM>.md`; index mode a new folder
`audits/<YYYY-MM-DD-HHMM>-proof/proof.md`. Dispatch passes the dispatch-mode
path to synthesis in Step 7.5 beside "the test output path if any", with
the line: "proof-runner's table is at <path>. It is an executed result,
not a status. Your status table still comes from reading the diff."

## 4. New config keys (CONTRACTS.md section 5)

Add under the `deps:` block (`CONTRACTS.md:155`), before `project_notes`:

```yaml
proof:                        # optional. proof-runner refuses without both caps.
  heap_mb: 4096               # heap cap in MB for every test process
  timeout_s: 120              # wall seconds per test file
  runner: none                # or a template with {heap_mb} and {file};
                              # none means node --max-old-space-size={heap_mb} --test --test-concurrency=1 {file}
  test_globs: [tests/**/*.test.*]
  max_files: 10               # most test files one invocation runs
```

Why a dedicated `proof` block and not `cost.limits`:

1. `cost.limits` records platform ceilings, facts with an `as_of` date that
   cost-complexity-reviewer measures demand against
   (`cost-complexity-reviewer.md`, Inputs from config). The proof cap is a
   policy the owner picks below a ceiling. A fact and a choice in one key
   means changing one silently changes the other.
2. `cost.limits` is free text ("a command's output and the date it was
   run"). The fence needs a whole number it can put in a flag. Parsing it
   out of prose is a guess, and this agent must never guess its cap.
3. A project with no `cost` block would lose proof-runner entirely. The two
   concerns are separable, so the keys should be.

cost-complexity-reviewer can cross-check `proof.heap_mb` against
`cost.limits` memory as a Ceilings row; see section 6.

For the game repo, the values the gap-hunter's first run names: `heap_mb: 4096`
(matches `package.json` `test` script), `timeout_s` for the owner to set.
Its config has no `proof` block today, so the first invocation there will
refuse and say so. That is intended.

## 5. CONTRACTS.md changes it depends on

Section 9 (`CONTRACTS.md:230` to `:247`). Add after the Fixer paragraph:

> proof-runner: `Read, Grep, Glob, Write, Bash`. It is the one agent besides
> fixer that executes project code, and only when the owner invokes it by
> name. Bash runs one test file per call through `proof.runner` with
> `proof.heap_mb` and `timeout <proof.timeout_s>`, in the foreground, never
> two at once, never the whole suite; `free -m`, `date`, and the read-only
> tree snapshot `git diff --stat`, `git status --porcelain`, `git diff |
> git hash-object --stdin`. It refuses to run without both caps in config.
> It runs alone, never beside another executing agent.

Section 6, ledger: `/djinn:prove`, if built, appends one line:

```
| <YYYY-MM-DD HH:MM> | prove | <audit folder or index path> | mode=<m> files=<n> | <COMPLETE | STOPPED <file>: <CAPPED|TIMEOUT|TREE CHANGED|MUTANT> | REFUSED: <keys>> | pass=<n> fail=<n> capped=<n> timeout=<n> notest=<n> notrun=<n> |
```

In dispatch mode, the dispatch ledger line's counts column gains
`proof=<pass>/<run>` or `proof=not run`.

Section 7: proof-runner's report uses `status: agent output, not yet
reviewed`, already in the list.

## 6. Neighbor lines to change

- `agents/fixer.md:95` to `:99`. Append: "Your narrowed run carries no heap
  cap of its own. When the dispatch prompt gives `proof.heap_mb`, prefix
  any test command with `NODE_OPTIONS=--max-old-space-size=<heap_mb>` and
  run one file at a time. Proof after landing belongs to proof-runner."
- `commands/dispatch.md` Step 7.2 (landing lane). Append: "If the owner
  passed `--prove`, spawn proof-runner after this step, alone, with
  `model: "opus"`, and wait for it before item 3."
- `agents/synthesis.md`, Round 2 and later. After "verified by reading the
  diff and the file, not the fixer's report", add: "When a proof-runner
  table is given, cite its result word in the evidence column. A FAIL on a
  cited test is evidence for NOT RESOLVED; a PASS is not by itself
  evidence for RESOLVED."
- `agents/consolidator.md`, gap-hunter REC-14 (its `:74` citation now sits
  near the Process list at `:74` to `:95`). Add a step: "List every index
  entry whose Status says `untested`, one line each with its Source id and
  sites, under `## Untested entries`, as input for proof-runner's index
  mode."
- `agents/test-strategist.md:43` ("The fixer and the human run things."):
  change to "The fixer, proof-runner and the human run things. A NO TEST
  line in a proof-runner report is a check you should design."
- `agents/cost-complexity-reviewer.md`, scope item 3 (node processes with no
  `--max-old-space-size`): add "When the config has `proof.heap_mb`, add a
  Ceilings row comparing it with the memory in `cost.limits`."

## 7. Known limits of the draft, for phase 3 to check

- `NODE_OPTIONS` carrying the cap into the `node --test` child is how the
  draft closes the gap where the parent flag alone may not reach the child.
  Not verified by a run (drafters run nothing).
- CAPPED is read from the output text (`Reached heap limit`, `JavaScript
  heap out of memory`) or exit 134. Those strings are V8's; not verified on
  Node 22 here.
- The tree snapshot misses an edit to a file that was already untracked,
  since `git diff` ignores untracked content. `--porcelain` catches a new
  one.
