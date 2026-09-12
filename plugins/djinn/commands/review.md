---
name: review
description: Run the Djinn review relay audit phase. Computes the fence from git against the configured base branch, spawns review agents on Opus, synthesizes findings, writes a timestamped audit folder and a ledger line, and STOPS. Does NOT fix. Usage - /djinn:review [scope] [--base <ref>] [--goal "<text>"] [+ux] where scope is "standard" (default), "quick", "full", "perf", "ideas", or a comma-separated agent list.
allowed-tools: Read, Grep, Glob, Agent, Bash, Write
---

# Djinn Review Relay: Audit Phase

You are orchestrating the audit phase. Your output is a folder of markdown
reports and one ledger line. No code is modified. No fixers are spawned.
Stop at synthesis.

Read `${CLAUDE_PLUGIN_ROOT}/CONTRACTS.md` first. Every prompt you send and
every file you write follows it.

## Step 1: Read the project config

Read `.djinn/config.yaml` in the project root. Take `base_branch`,
`build_cmd`, `test_cmd`, `known_bugs_index`, `conventions_files`,
`hot_paths`, `goal_doc`, `deps`, and `project_notes`.

If the file or `base_branch` is missing: append the ledger line (Step 9)
with outcome `ABORTED step 1: no config`, tell the user to copy
`${CLAUDE_PLUGIN_ROOT}/templates/config.yaml` to `.djinn/config.yaml` and
fill in `base_branch`, and stop. Do not guess. Do not fall back to HEAD~1.

## Step 2: Parse arguments

`$ARGUMENTS` is a scope word, or a comma-separated list of agent names, plus
optional flags.

Scopes:

- **quick**: known-bugchecker, bugs-reviewer, integration-reviewer, synthesis
- **standard** (default): known-bugchecker, format-reviewer, bugs-reviewer,
  integration-reviewer, security-reviewer, perf-reviewer, synthesis
- **full**: known-bugchecker, format-reviewer, bugs-reviewer,
  integration-reviewer, security-reviewer, perf-reviewer,
  multiuser-reviewer, breaker, pipe-connector, gap-hunter, then wave 2
  (devils-advocate, test-strategist), then synthesis, then consolidator
- **perf**: known-bugchecker, perf-reviewer, breaker, synthesis
- **ideas**: gap-hunter only, no synthesis

Conditional agents, added to every scope except ideas:

- **dependency-reviewer** runs whenever the fence contains any file listed
  in the config's `deps.manifests` or `deps.lockfiles`.
- **ux-reviewer** runs when the user passes `+ux`, or when the fence
  contains a CLI entry point, a config schema, or a README.

Custom list: each name must match a file in `${CLAUDE_PLUGIN_ROOT}/agents/`.
On any unknown name, stop and list the valid names. known-bugchecker is
prepended and synthesis appended unless the list is exactly `gap-hunter`.
The folder suffix is `custom`.

Flags: `--base <ref>` overrides `base_branch` for this run only, and
context.md says so. `--goal "<text>"` is passed to wave 2 agents in place
of `goal_doc`.

## Step 3: Identify changes (this is the fence)

1. Compute the merge base: `git merge-base <base_branch> HEAD`.
2. Changed files: `git diff --name-only <merge-base> -- . ':!audits'`.
   No second ref, so uncommitted work in the working tree is included. This
   list is the FENCE.
3. If the fence is empty: append the ledger line with outcome
   `NO-CHANGES`, do not create an audit folder, tell the user, stop.
4. Full patch: `git diff <merge-base> -- . ':!audits'`.

## Step 4: Create the audit folder

Compute the timestamp with `date +%Y-%m-%d-%H%M`. Create
`audits/<timestamp>-<scope>/agents/`. Record this as `AUDIT_DIR`. If the
folder already exists, append `-2`, `-3`, and so on. Never overwrite.

Write:

- `<AUDIT_DIR>/fence.txt`: the fence, one path per line, nothing else.
- `<AUDIT_DIR>/input-diff.patch`: the full patch.
- `<AUDIT_DIR>/context.md`, with the attribution header and:

```
base_branch: <name, or the --base override>
merge_base: <full sha>
head: <full sha at run time>
scope: <scope>
agents_run: <comma list, in the order spawned>
model: opus
fence_file: fence.txt
build_cmd: <value or none>
test_cmd: <value or none>
date: <iso>
```

## The fence block

Paste this into every agent prompt in Steps 5, 6, 7, and 8, unchanged
except for the fence contents and config values:

```
FENCE. The files under review are exactly:
<contents of fence.txt>

Report findings only on these files. You may open other files to trace a
caller, an import, a subscriber, or a config the changed code reads. Every
such file goes under "## Files read outside the fence" with a reason in
five words or fewer. A finding on a file outside the fence goes under
"## Blast radius". Do not report pre-existing problems in unchanged files
as findings.

Project config:
  conventions_files: <list>. Read these before reviewing.
  known_bugs_index: <path or none>
  hot_paths: <list or none>
  build_cmd: <value or none>
  test_cmd: <value or none>
  project_notes: <text or none>

Full patch: <AUDIT_DIR>/input-diff.patch

Start your report with the attribution header from CONTRACTS.md section 7,
status "audit finding, not yet deliberated". Use the report format from
CONTRACTS.md section 3. Write exactly one file:
<AUDIT_DIR>/agents/<your-name>.md. Reply with only the header line and
your Counts.
```

## Step 5: Spawn known-bugchecker (always first, alone)

Use the Agent tool with `subagent_type: "known-bugchecker"` and
`model: "opus"`. Prompt: the fence block, plus "Read the index at
`<known_bugs_index>` and every file it links." If `known_bugs_index` is
`none`, still spawn it; it reports that no index is configured.

Wait for it. Note the patterns it flagged.

## Step 6: Spawn the read-only wave in parallel

For every agent in the scope except known-bugchecker, synthesis,
consolidator, devils-advocate, test-strategist, and dependency-reviewer:
use the Agent tool with the agent's name as `subagent_type` and
`model: "opus"`. Send them all in a single message with multiple Agent
tool calls.

Each prompt: the fence block, plus:

"known-bugchecker (a pattern matcher, unverified) flagged: <list or none>.
Do not re-report these as your own findings. If you read the code and one
is a false positive, say so under Checked and Clean with the line that
disproves it."

Wait for all to return.

## Step 7: Executing agents, one at a time

These agents carry Bash and never run in parallel with anything.

- **dependency-reviewer** (if triggered): the fence block plus the config's
  `deps` block verbatim.
- **devils-advocate** then **test-strategist** (full scope, or a custom
  list naming them): the fence block plus the goal statement (from
  `--goal`, else the contents of `goal_doc`, else "no goal document; review
  the diff's own stated intent") and the wave 1 findings list (agent name
  plus one line per finding).

Spawn each with `model: "opus"`, wait for it to return, then spawn the
next.

## Step 8: Synthesis (skip for ideas scope)

If any agent returned nothing or errored, retry it once. If it fails again,
write `<AUDIT_DIR>/agents/<name>.md` containing the attribution header and
the single line `FAILED TO RETURN (2 attempts)`.

If any agent replied but its file is missing, write its returned text to
the path yourself.

Spawn synthesis with `subagent_type: "synthesis"` and `model: "opus"`.
Prompt:

"Reports: <list of paths>. Fence: `<AUDIT_DIR>/fence.txt`. Scope: <scope>.
Agents expected: <list>. Agents that failed after retry: <list or none>.
Agents not run in this scope: <list>. Write to `<AUDIT_DIR>/synthesis.md`."

Wait for it.

## Step 8b: Consolidator (full scope only)

Spawn consolidator with `model: "opus"`. Prompt: "MODE: audit. No fixes
have landed; treat every HIGH and MEDIUM in `<AUDIT_DIR>/synthesis.md` as a
candidate entry, not a confirmed one. The known-bugs index is at
`<known_bugs_index>`. Write to `<AUDIT_DIR>/consolidator.md`."

If it replied but the file is missing, write its returned text there
yourself with the attribution header. Do not apply its suggestions to the
index; the user reviews and decides.

## Step 9: Ledger (always, even on early stop)

Append exactly one line to `audits/LEDGER.md`. Create the file with the
header row from CONTRACTS.md section 6 if it is missing. Format:

```
| <YYYY-MM-DD HH:MM> | review <scope> | <AUDIT_DIR or none> | base=<base_branch>@<merge-base short sha> files=<n> | <verdict> (<scope> scope; <agents not run> not run) | H<n> M<n> L<n> D<n> R<n> failed=<list or none> outside-fence=<n> |
```

Verdict is one of SHIP, FIX THEN SHIP, ESCALATE, IDEAS, NO-CHANGES, or
`ABORTED step <k>: <reason>`. Counts come from the synthesis Counts block.
For ideas scope, counts are R<n> only. If the run aborted before
synthesis, write the counts as `?`.

## Step 10: Report to the user

- `AUDIT_DIR`
- Verdict, followed on the same line by the agents this scope did not run,
  for example `SHIP (quick scope; format, security, perf, multiuser,
  breaker not run)`. For full write `(full scope)`.
- Counts: HIGH, MEDIUM, LOW, DEBT, REC.
- Outside-fence reads: <n>, see synthesis Fence section.
- Next step:
  - **SHIP**: "Nothing blocks a merge to <base_branch>. Audit archived at
    `<AUDIT_DIR>`."
  - **FIX THEN SHIP**: "Open `<AUDIT_DIR>/synthesis.md`. For each finding
    you want to fix: `/djinn:brief <AUDIT_DIR> <id>`, then
    `/djinn:dispatch <brief-path>`."
  - **ESCALATE**: "Agents disagreed on a fact the code could not settle.
    Open `<AUDIT_DIR>/synthesis.md`, section Conflicts Resolved."
  - **ideas**: "gap-hunter output at `<AUDIT_DIR>/agents/gap-hunter.md`."

## Rules

- Do NOT spawn fixers. Do NOT modify code. This command is audit-only.
- Every Agent call passes `model: "opus"` explicitly. Never rely on the
  agent file's frontmatter.
- All agent reports go to `<AUDIT_DIR>/agents/<name>.md`, never anywhere
  else.
- Parallel agents are read-only. Anything that executes code runs alone.
- Bash is for git queries, `date`, and `mkdir -p`. No build, no test, no
  git command that changes state.

## Runtime notes

Claude Code specific: `allowed-tools`, `$ARGUMENTS`,
`${CLAUDE_PLUGIN_ROOT}`, the Agent tool with `subagent_type` and `model`,
and parallel spawning by putting several Agent calls in one message. An
adapter for another runtime must map each of these. The wave structure
(Step 5 alone, Step 6 parallel and read-only, Step 7 serial, Step 8 after)
is the contract, not the mechanism.
