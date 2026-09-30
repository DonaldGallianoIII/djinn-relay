# Djinn Review Relay: Methodology

Three phases: **audit, deliberate, dispatch**. Audit agents find issues and
write reports. The human and the main Claude session deliberate what to fix.
Fixer agents execute one brief each, inside a fence. The next audit round
runs automatically after fixes land. Every command leaves a folder of
artifacts and one line in a ledger, so nothing runs off the books.

The interfaces every agent and command honor are in `CONTRACTS.md`. This
file explains why the flow is shaped the way it is.

## Phase 1: Audit (`/djinn:review [scope]`)

The command reads the project's `.djinn/config.yaml`, computes the fence
(the list of files changed on this branch since it left `base_branch`,
plus untracked files git does not ignore), and spawns review agents. Every
agent receives the fence verbatim and reports only on files inside it.
Files it opens outside the fence are listed, not forbidden; synthesis
reports them.

Beside the fence the command writes `tree-facts.md`: untracked files, files
git tracks and ignores, hand mutants left in source, large files, tracked
files that import an untracked one, and fenced files with secret-shaped
names. Reviewers have no shell, so the
orchestrator gathers these git facts once and hands every agent the path.

Agents run in waves: the pattern checker alone first, the read-only agents
in parallel, any agent that executes commands one at a time, then
synthesis. Everything runs on Opus.

Synthesis merges the reports, re-rates every finding onto one severity
ladder, verifies every HIGH and MEDIUM against the code, deduplicates,
reports coverage, and gives one verdict.

**Output:** `audits/YYYY-MM-DD-HHmm-<scope>/`:

```
audits/
  LEDGER.md
  2026-09-12-1402-standard/
    context.md
    fence.txt
    input-diff.patch
    tree-facts.md
    agents/
      known-bugchecker.md
      bugs-reviewer.md
      ...
    synthesis.md
```

**The audit phase ends here.** No code is modified. No fixes are spawned.
You get reports and a ledger line.

## Phase 2: Deliberate (human plus orchestrator)

Open the synthesis. For each finding, decide:

- **fix**: worth doing now. Run `/djinn:brief <audit-folder> <id>`.
- **defer**: real, not now. It stays in the synthesis as a note.
- **dismiss**: not a problem. Say why in the conversation, and if it will
  recur, add it to the known-bugs index so future audits do not re-flag it.

`/djinn:brief` writes a skeleton brief at `<audit-folder>/fixes/<id>-<slug>.md`,
pre-filled from the finding, with the cited line verified. You and the
orchestrator fill in:

- **WHY**: the deliberation context, the root-cause insight, why this fix
  and not a variant. This is the field that stops the fixer from fixing
  the symptom and missing the cause.
- **work_set**: exact files, exact symbols. This is the fence the fixer
  cannot cross. Files outside the audited fence are marked, because no
  reviewer read them.

## Phase 3: Dispatch (`/djinn:dispatch <brief>...`)

Dispatch orders the briefs (explicit `depends_on`, rename cascades, shared
files), batches the ones that can run together, prints the plan with the
reason for every wait, and asks once. Then, per batch: snapshot the tree,
spawn one fresh Opus fixer per brief, collect a Fix Report from each, write
the report and the diff to `fixes/`, run the build gate, next batch.

**Fresh fixer per fix.** Each fixer starts with no conversation history. It
gets the brief, the current file state, and the config's build command.

**Work-set guard.** If the fixer needs a file outside `work_set.files`, it
stops and returns BLOCKED_SCOPE with a proposed amended work set. The human
decides: amend, skip, or abort. The fixer never widens its own scope.

**A fix is not landed until its report exists.** `fixes/<id>-report.md`
holds the fixer's own account: files changed, what was done, build output,
success criteria checked, scope notes. Dispatch writes it before it marks
the brief landed and before it writes the ledger line.

## The next round, automatically

After all briefs land, the same agents run again on the union of the
landed work sets, plus any file git shows changed or untracked that no
brief owned (a scope leak, named in the report). A `live` audit's round
also reads every tracked file under `live.systems[].code`, because the
blind review reads the whole tool in every round. A conditional agent whose
trigger the round fence now fires joins that round. With `--prove`,
proof-runner first runs the narrowest test for each landed fix, and
synthesis reads its table beside the diffs. Synthesis for that round starts with a
table: each prior HIGH and MEDIUM, RESOLVED, NOT RESOLVED, or REGRESSED,
verified by reading the diff and the file, not the fixer's word.

Reports land in `<audit-folder>/round-<n>/`. Three rounds maximum, then the
command stops and hands the decision to a human. The round never auto-fixes.

## Verdicts

- **SHIP**: zero HIGH and zero MEDIUM open after normalization, counting
  any carried from an earlier round and not yet RESOLVED. Nothing blocks a
  merge to the base branch.
- **FIX THEN SHIP**: a HIGH or MEDIUM is open, new or carried. The ids that block are named.
- **ESCALATE**: a HIGH or MEDIUM is in a fact dispute the code could not
  settle. A human reads the Conflicts Resolved section.

LOW, DEBT, and REC never block. They are logged, counted, and left for the
human. A narrow scope's SHIP names the agents it did not run, so a `quick`
pass is never mistaken for a full clearance.

## The ledger

`audits/LEDGER.md` gets one line per review, brief, dispatch or prove run,
on every exit path, including runs that abort at step one. `/djinn:learn`
writes its line to `<out_dir>/LEDGER.md` instead, and `/djinn:status`
writes none. Review, brief, and dispatch each
have a fixed line shape (CONTRACTS.md section 6). A reader can answer
"what ran on this branch, what did it find, what got fixed" from the ledger
alone, and open the folder for the detail.

## Learning loop

The consolidator runs twice: after a full-scope audit (findings unfixed,
candidates only) and after every dispatch (findings fixed, confirmed). It
proposes entries for the known-bugs index. The human applies them. The
first-pass checker reads that index on the next run, so a pattern that
escaped once is caught mechanically the second time.

## Scopes

| Scope      | Agents                                                                                  | When |
|------------|-----------------------------------------------------------------------------------------|------|
| `quick`    | known-bugchecker, bugs, integration, synthesis                                          | Small fixes, low risk |
| `standard` | known-bugchecker, format, bugs, integration, security, perf, synthesis                   | Default |
| `full`     | standard plus data-contract, cost-complexity, multiuser (when a second actor is named), breaker, pipe-connector, gap-hunter, then gate-auditor, devils-advocate and test-strategist serially, then synthesis and consolidator | New features, critical systems, pre-release |
| `perf`     | known-bugchecker, perf, breaker, synthesis                                              | Hot-path changes |
| `cost`     | known-bugchecker, cost-complexity, perf, synthesis                                      | Paid APIs, hosting, IaC, CI, memory ceilings |
| `live`     | known-bugchecker, live-system-reviewer, synthesis; the fence is the whole tool          | The blind review before a first live run |
| `ideas`    | gap-hunter alone, no synthesis                                                          | After a debugging session, a new design |
| `map`      | legibility-reviewer, then synthesis; the fence is the whole tree                        | End of a phase, before onboarding a new agent or person |

Conditional, in every scope but `ideas`, `live` and `map`, each triggered by what
the fence touches (the exact patterns are in `commands/review.md` Step 2):
**dependency-reviewer** on a manifest or lockfile named in the config;
**ux-reviewer** on `+ux`, a CLI entry point, a config schema, or a README;
**accessibility-reviewer** on `+a11y`, a stylesheet, markup, SVG, a
component file, a file that builds DOM or draws to a canvas or WebGL scene,
or a path under `ui_paths`; **data-contract-reviewer** on a schema,
validator, model, migration, SQL, fixture, a `data.paths` or
`data.generated` file, or a data folder `project_notes` names;
**cost-complexity-reviewer** on any `cost` key set, IaC, CI, a manifest, or
a file naming a paid API; **gate-auditor** on tests, QA, check or bench
tools, a manifest, test runner config, CI, or a file a `gates` entry names;
**live-system-reviewer** on a content script, a browser driver outside
`qa/` and `tests/`, a file naming a paid API, or a `live.systems` path or
match string; **legibility-reviewer**, in diff mode, when the change adds,
deletes, renames or copies a file, or touches a file on the default map
list, quoted from CONTRACTS.md section 5 where it is kept (every
`CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md` and `README*`, the
conventions files that list files, and any `.md` whose name contains
`index`, `map`, `layout` or `contents`), or a `maps` entry.

multiuser-reviewer runs in `full` only when `project_notes` or `goal_doc`
names a second actor (more users, processes, tenants, concurrent clients,
collaborative editing, a shared worker pool). A single-player project skips
it and the verdict line says so.

The `live` scope is one fresh reader on purpose: no conditional agents, no
goal document, no statement of intent. breaker could join it later.

On request only, never by scope or trigger: **proof-runner**, when the
owner passes `--prove` to `/djinn:dispatch` or asks for it by name. It is
the one agent that runs project code, one test file at a time under
`proof.heap_mb`, `proof.memory_wrapper` and `proof.timeout_s`, and it
refuses without all three, or when a probe shows the wrapper does not
start or does not cap.

A custom comma-separated agent list is also accepted; unknown names stop
the run, and so do proof-runner and fixer.

| Change type                              | Scope |
|------------------------------------------|-------|
| New feature                              | standard or full |
| Bug fix                                  | quick |
| Refactor or file split                   | full (pipe-connector maps the blast radius first) |
| Critical system (save/load, auth, state) | full |
| Schema, migration or persisted format    | full (data-contract-reviewer joins any scope on these) |
| UI-only change                           | quick (accessibility-reviewer joins on UI files) |
| Pre-release                              | full |
| Hot-path code                            | perf |
| Paid API, hosting, IaC or CI change      | cost |
| Tests, QA bots, benches, check scripts   | quick or standard (gate-auditor joins on these) |
| Before a tool first touches a live system | live |
| Landed fixes nobody has run              | `/djinn:dispatch --prove`, or ask for proof-runner |
| Post-debugging retrospective             | ideas |
| End of a phase, or the repo is hard to find your way around | map |

## Why the flow is split

An earlier version ran audit, fix, and verify in one shot. That blurred two
kinds of work. Audit is cartographic: many agents, each with a narrow
question, best run fresh with no commitments. Fix is focused: one agent, one scope, a
strict boundary, a clean report. Mixing them meant the main session carried
audit context into fix work and either slowed down or crept out of scope.

Splitting them gives each phase a fresh context, puts a human pause between
find and fix (where the cause-versus-symptom decision belongs), makes scope
enforcement a structural property of the fixer rather than a plea in the
prompt, and leaves every phase's artifacts on disk for someone to re-read
weeks later.

The cost is ceremony. For a typo, it is overhead. For anything else, the
structure pays for itself.

## Learn, a separate pipeline

`/djinn:learn` borrows the relay's habits (Opus only, a timestamped folder,
a ledger line on every exit path, the section 7 header on every file, the
section 9 search rules) and nothing else. There is no fence, no severity
ladder and no verdict, because nothing is being judged: one question is
being looked at from four sides. The waves mirror a review round: four
angle agents in parallel per question, a fact checker per question, one
synthesis, a blind reader that never sees a key, then a mechanical check
of the training files. CONTRACTS.md
section 13 is its contract.

## Commands

| Command                                     | Phase | Purpose |
|---------------------------------------------|-------|---------|
| `/djinn:review [scope] [--base <ref>] [--untracked none \| <path-list-file>] [--goal "<text>"] [+ux] [+a11y]` | 1 | Compute the fence, run the audit, write the folder and the ledger line, stop |
| `/djinn:brief <audit-folder> <id>`          | 2 | Generate a fix brief from a synthesis finding, verify the citation, write the ledger line |
| `/djinn:dispatch [--prove] [--no-tests] <brief> [<brief>...]` | 3 | Execute briefs in batches, save diffs and reports, prove them if asked, run the next round, write the ledger line |
| `/djinn:status [<audit-folder>]`            | any | Print what is still open across every round, from the latest `findings.json`. Read only, no ledger line |
| `/djinn:learn "<question>" [--id <name>] \| <quiz file> [<id>...] \| --topic "<topic>" [--sources <paths>] [--secure]` | none | Not a review. Four angle agents per question, a fact checker, synthesis, a blind reader: draft items, SFT, DPO and GRPO rows, a study sheet, a run folder under `learn/` (git ignored by the first run) and a line in `learn/LEDGER.md` |
