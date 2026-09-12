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
(the list of files changed on this branch since it left `base_branch`), and
spawns review agents. Every agent receives the fence verbatim and reports
only on files inside it. Files it opens outside the fence are listed, not
forbidden; synthesis reports them.

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
landed work sets, plus any file git shows changed that no brief owned
(a scope leak, named in the report). Synthesis for that round starts with a
table: each prior HIGH and MEDIUM, RESOLVED, NOT RESOLVED, or REGRESSED,
verified by reading the diff and the file, not the fixer's word.

Reports land in `<audit-folder>/round-<n>/`. Three rounds maximum, then the
command stops and hands the decision to a human. The round never auto-fixes.

## Verdicts

- **SHIP**: zero HIGH and zero MEDIUM after normalization. Nothing blocks a
  merge to the base branch.
- **FIX THEN SHIP**: a HIGH or MEDIUM remains. The ids that block are named.
- **ESCALATE**: a HIGH or MEDIUM is in a fact dispute the code could not
  settle. A human reads the Conflicts Resolved section.

LOW, DEBT, and REC never block. They are logged, counted, and left for the
human. A narrow scope's SHIP names the agents it did not run, so a `quick`
pass is never mistaken for a full clearance.

## The ledger

`audits/LEDGER.md` gets one line per command run, on every exit path,
including runs that abort at step one. Review, brief, and dispatch each
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
| `full`     | standard plus multiuser, breaker, pipe-connector, gap-hunter, then devils-advocate and test-strategist serially, then synthesis and consolidator | New features, critical systems, pre-release |
| `perf`     | known-bugchecker, perf, breaker, synthesis                                              | Hot-path changes |
| `ideas`    | gap-hunter alone, no synthesis                                                          | After a debugging session, a new design |

Conditional, in every scope but `ideas`: **dependency-reviewer** when the
fence touches a manifest or lockfile named in the config; **ux-reviewer**
on `+ux` or when the fence touches a CLI entry point, a config schema, or a
README.

A custom comma-separated agent list is also accepted; unknown names stop
the run.

| Change type                              | Scope |
|------------------------------------------|-------|
| New feature                              | standard or full |
| Bug fix                                  | quick |
| Refactor or file split                   | full (pipe-connector maps the blast radius first) |
| Critical system (save/load, auth, state) | full |
| UI-only change                           | quick |
| Pre-release                              | full |
| Hot-path code                            | perf |
| Post-debugging retrospective             | ideas |

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

## Commands

| Command                                     | Phase | Purpose |
|---------------------------------------------|-------|---------|
| `/djinn:review [scope] [--base <ref>] [--goal "<text>"] [+ux]` | 1 | Compute the fence, run the audit, write the folder and the ledger line, stop |
| `/djinn:brief <audit-folder> <id>`          | 2 | Generate a fix brief from a synthesis finding, verify the citation, write the ledger line |
| `/djinn:dispatch <brief> [<brief>...]`      | 3 | Execute briefs in batches, save diffs and reports, run the next round, write the ledger line |
