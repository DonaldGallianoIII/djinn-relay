# Djinn Review Relay

Multi-agent code review for Claude Code. You run one command, a team of
review agents reads your branch, and you get a folder of reports, one
verdict, and a ledger line saying it happened. Fixes are a second command,
one brief at a time, each inside a fence. Nothing is changed without a
written record.

If you have never used a pull request: a branch is a copy of the code you
work on. The base branch (usually `main`) is the copy everyone shares. This
tool reviews the difference between your branch and the base, and tells you
whether that difference is safe to merge back.

## Install

Once per machine:

```
/plugin marketplace add donaldgallianoiii/djinn-relay
/plugin install djinn@djinn-relay
```

Or, from a local checkout while developing the plugin itself:

```
/plugin marketplace add ~/djinn-relay
/plugin install djinn@djinn-relay
```

Restart Claude Code after installing. The commands `/djinn:review`,
`/djinn:brief`, and `/djinn:dispatch` now exist in every project.

## Set up a project

Once per repo:

1. Create `.djinn/` in the repo root.
2. Copy `templates/config.yaml` from the plugin into `.djinn/config.yaml`.
3. Fill in `base_branch`. Fill in `build_cmd` and `test_cmd` if the project
   has them. Leave the rest as `none` or empty until you need it.
4. Commit `.djinn/`.

The plugin refuses to run without `base_branch`. It never guesses.

## Daily use

**Review your branch.** On your branch, with your work committed or not:

```
/djinn:review
```

Read the last line first: `SHIP`, `FIX THEN SHIP`, or `ESCALATE`, followed
by which agents did not run. Then open the synthesis file it names.

**Fix something it found.** Pick a finding id from the synthesis (they look
like `HIGH-1`, `MEDIUM-3`):

```
/djinn:brief audits/<folder> HIGH-1
```

Open the brief it writes. Fill in the WHY section: what you and Claude
decided, and why this fix rather than another. Check the file list. Then:

```
/djinn:dispatch audits/<folder>/fixes/HIGH-1-<slug>.md
```

It prints a plan and waits for you to say `go`. Then it edits the code,
writes a report per fix, and reviews the result again. Read the new verdict.

**Check what has happened on a branch.** Open `audits/LEDGER.md`. One line
per run, newest at the bottom.

## What the verdicts mean

| Verdict       | Meaning |
|---------------|---------|
| SHIP          | Nothing blocks a merge to the base branch. |
| FIX THEN SHIP | At least one HIGH or MEDIUM finding. The ids are named. Fix them, or decide with a human not to. |
| ESCALATE      | Two agents disagree on a fact the code could not settle. A human reads the synthesis. |

Severity tiers, from `CONTRACTS.md`:

| Tier   | Means                                                       | Blocks merge |
|--------|-------------------------------------------------------------|--------------|
| HIGH   | Crash, data loss, security exposure, or does not do what it claims | Yes |
| MEDIUM | Wrong behavior a user will hit                              | Yes          |
| LOW    | A real defect that will not hurt anyone today               | No           |
| DEBT   | A decision that will be expensive to undo later             | No           |
| REC    | A recommendation, not a defect                              | No           |

## Scopes

```
/djinn:review quick      small fixes
/djinn:review            standard, the default
/djinn:review full       new features, critical systems, before release
/djinn:review perf       hot-path code
/djinn:review ideas      after a debugging session, to find what is missing
```

Flags: `--base <ref>` to review against a different base for one run,
`--goal "<text>"` to tell the deeper agents what the change is meant to
achieve, `+ux` to add the usability reviewer.

## What gets written where

```
audits/
  LEDGER.md                          one line per run, never edited by hand
  2026-09-12-1402-standard/
    context.md                       base, merge base, scope, agents run
    fence.txt                        the files that were reviewed
    input-diff.patch                 the diff that was reviewed
    agents/<name>.md                 one report per agent
    synthesis.md                     merged findings and the verdict
    fixes/
      HIGH-1-<slug>.md               the brief (the contract for one fix)
      HIGH-1.diff                    what the fixer changed
      HIGH-1-report.md               the fixer's own account
    round-2/                         the re-review after fixes landed
      agents/, synthesis.md, fence.txt
```

Every file an agent writes starts with a header naming the model that wrote
it and whether a human has reviewed it yet. Trust the `status` line.

## Rules the tool enforces

- Reviewers report only on the files in the fence. Files they open outside
  it are listed in the synthesis.
- Fixers edit only the files in the brief's work set. Anything else stops
  the fixer and asks you.
- A fix is not landed until its report is on disk.
- Every command writes a ledger line, even when it stops early.
- Everything runs on Opus. No exceptions.
- Three review rounds maximum, then a human decides.

## Rules the tool cannot enforce

- Fill in WHY. A brief without deliberation context gets a fixer that
  fixes the symptom.
- Read the synthesis, not just the verdict. LOW and DEBT do not block, and
  some of them matter.
- Apply the consolidator's index suggestions by hand. The tool proposes;
  you decide what becomes a rule.

## Files in this plugin

```
CONTRACTS.md        the interfaces every agent and command honor
relay.md            why the flow is shaped this way
commands/           review, brief, dispatch
agents/             one prompt per reviewer, plus synthesis, fixer, consolidator
templates/          fix-brief.md, config.yaml
```

## Other runtimes

The agent prompts are plain markdown and portable. The orchestration
(parallel spawning, `$ARGUMENTS`, `${CLAUDE_PLUGIN_ROOT}`, the `tools:` and
`model:` frontmatter) is Claude Code specific. Each file ends with a
Runtime notes section naming what an adapter must map. An adapter for
another runtime lives under `adapters/` in the repo, not in this plugin.
