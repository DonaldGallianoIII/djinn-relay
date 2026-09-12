# Djinn Relay Contracts

The interfaces every agent and command in this plugin must honor. When an
agent prompt and this file disagree, this file wins. Change this file first,
then the prompts, in the same commit.

## 1. Severity: one ladder for every agent

Every finding carries exactly one of these tier words, first thing on its
line. Agents may add a sub-label in parentheses after the tier (for example
`HIGH (CRASH)` or `MEDIUM (DEGRADE)`), but the tier word decides everything.

| Tier   | Bar                                                                                   | Blocks merge |
|--------|---------------------------------------------------------------------------------------|--------------|
| HIGH   | Crash, data loss or corruption, security exposure, or the change does not do what it claims. | Yes |
| MEDIUM | Incorrect behavior a user will hit under realistic use.                               | Yes          |
| LOW    | Any other real defect: naming, style, a dead branch, a wrong comment.                 | No           |
| DEBT   | A decision that will be expensive to undo later. Not a defect today.                  | No           |
| REC    | A recommendation, not a defect: a missing test, an idea, a friction point, an alternative library. | No |

Rules:

- A HIGH or MEDIUM must name a mechanism and a traced path. "Could be a
  problem" is a LOW at most.
- Code quality, formatting, comment tone, and naming cap at LOW.
- Forward-looking findings (multiuser, architecture) are DEBT.
- multiuser-reviewer emits DEBT by default. gap-hunter, test-strategist,
  and ux-reviewer emit REC by default. These four may emit HIGH or MEDIUM
  only when the diff under review made a documented, currently working
  behavior worse, with the file:line that shows it.
- known-bugchecker copies the tier from the index entry that matched and
  marks every hit `unverified`. Downstream reviewers verify or clear it.
- Synthesis re-rates any finding whose text does not meet its tier's bar,
  and lists every move under "Re-tiered". Synthesis never moves a finding up
  without reading the cited code.
- "Blocks merge" means: must be fixed before this branch merges to the base
  branch. Nothing in the LOW, DEBT, or REC tiers ever blocks.

## 2. Finding ids

Agent reports number findings within each tier: `HIGH-1`, `HIGH-2`,
`MEDIUM-1`, `LOW-1`, `DEBT-1`, `REC-1`. Synthesis assigns its own ids in the
same form after merging, and those synthesis ids are the ones `/djinn:brief`
takes. A brief file is named `<synthesis-id>-<slug>.md`, for example
`HIGH-1-rename-shadowed-fn.md`.

## 3. Agent report format

Every review agent writes exactly one file, at the path the orchestrator
gives it, in this shape. Sections are mandatory even when empty; an empty
section contains the single word `none`.

```markdown
---
title: <agent-name> report, <audit folder>
author: Claude <model> (<agent-name>)
date: <YYYY-MM-DD>
status: audit finding, not yet deliberated
---

## Findings

### HIGH
HIGH-1. `path/to/file.ext:123` One-line claim.
Mechanism: what goes wrong, in one or two sentences.
Traced: the path you followed to confirm it, file:line to file:line.

### MEDIUM
none

### LOW
...

### DEBT
...

### REC
...

## Checked and Clean
- `path/to/file.ext`: what you checked and found sound, one line per file.

## Files read outside the fence
- `path/to/other.ext` (reason, five words or fewer)
none
```

A finding whose file:line is outside the fence goes under a `## Blast
radius` section between Findings and Checked and Clean, never under
Findings.

Agents whose main output is not a finding list (pipe-connector's dependency
map, consolidator's index proposals) put that output in their own sections
before Findings, and still end with Checked and Clean and Files read
outside the fence.

## 4. The fence

The orchestrator computes the changed-file list from git against the
configured base branch and pastes it into every agent prompt, verbatim,
inside this block:

```
FENCE. The files under review are exactly:
<one path per line>

Report findings only on these files. You may open other files to trace a
caller, an import, a subscriber, or a config the changed code reads. Every
such file goes under "## Files read outside the fence" with a reason in
five words or fewer. A finding on a file outside the fence goes under
"## Blast radius". Do not report pre-existing problems in unchanged files
as findings.
```

The dependency walk is bounded: one hop out from a changed file, in either
direction (what it imports, what imports it). Going further requires a
reason on the outside-fence line.

Not counted as outside-fence reads, so never listed: the audit folder
itself (`fence.txt`, `input-diff.patch`, other reports), the plugin's own
files (`CONTRACTS.md`, the agent's definition), the project config, the
files named in `conventions_files`, and the known-bugs index. Those are
inputs the orchestrator handed the agent, not code it went looking for.

## 5. Per-project config

Each project carries `.djinn/config.yaml`. The commands read it; agents
receive its values in their prompt and never guess them. Keys:

```yaml
base_branch: main            # required. The branch this work merges into.
build_cmd: npm run build     # or none. Gates dispatch batches.
test_cmd: npm test           # or none. Landing lane, run once per dispatch.
known_bugs_index: .djinn/known-bugs.md   # or none. The pattern index.
conventions_files:           # files every agent reads before reviewing
  - CLAUDE.md
hot_paths:                   # directories where per-call cost matters
  - src/sim/
goal_doc: none               # plan or spec the diff claims to implement
deps:
  manifests: [package.json]
  lockfiles: [package-lock.json]
  list_cmd: npm ls --depth=0
  check_cmd: none
  platform: none             # e.g. "CUDA 12.4, Python 3.11"
  coupled_sets: []           # packages that must move together
  landmines: []              # known bad version combinations
project_notes: |
  Free text the agents read as architecture context: state model, event
  mechanism, render or request loop, anything a new reviewer needs.
```

If `config.yaml` or `base_branch` is missing, the command stops and asks.
It never falls back to HEAD~1.

## 6. Ledger

Every command appends exactly one line to `audits/LEDGER.md` on every exit
path, including early stops and halts. The file starts with this header:

```
| when | command | audit folder | detail | outcome | counts |
|------|---------|--------------|--------|---------|--------|
```

Lines, pipe separated, no line breaks:

```
| 2026-09-12 14:02 | review standard | audits/2026-09-12-1402-standard | base=main@a1b2c3d files=6 | FIX THEN SHIP (quick scope; format, security, perf not run) | H2 M3 L1 D0 R4 failed=none outside-fence=3 |
| 2026-09-12 14:30 | brief | audits/2026-09-12-1402-standard | HIGH-1 -> fixes/HIGH-1-rename-shadowed-fn.md | work_set=inferred | n/a |
| 2026-09-12 15:10 | dispatch | audits/2026-09-12-1402-standard | briefs=HIGH-1,HIGH-2 | landed 2 / blocked 0 / skipped 0 COMPLETE | round-2=SHIP H0 M0 L1 D0 R0 |
| 2026-09-12 16:00 | dispatch | audits/2026-09-12-1402-standard | briefs=MEDIUM-1 | landed 0 / blocked 1 / skipped 0 HALTED batch 1: BLOCKED_SCOPE | round-2=not run |
```

A landed fix is not landed until `fixes/<id>-report.md` exists on disk.
Dispatch writes that file before it writes the ledger line.

**Usage table.** Review and dispatch also write `<AUDIT_DIR>/usage.md`
(dispatch appends to it) from the usage block the harness returns with
each agent's completion: one row per agent with tokens, tool uses, and
duration, and a total. The ledger counts column ends with
`tokens=<total>`. The harness figure is a summary; the exact four-way
split (input, output, cache read, cache write) comes from the transcript
and is what the token tracker reports.

```
| agent | model | tokens | tool uses | duration | wave |
|-------|-------|--------|-----------|----------|------|
| bugs-reviewer | opus | 61636 | 14 | 2m03s | 1 |
| total |  | 412500 | 96 | 9m40s |  |
```

## 7. Attribution header

Any file an agent or command writes into the repo starts with:

```
---
title: <what this is>
author: Claude <model> (<agent or command name>)
date: <YYYY-MM-DD>
status: <audit finding, not yet deliberated | agent output, not yet reviewed | pending | landed>
---
```

## 8. Model

Every Agent call names `model: opus` explicitly. Every agent file's
frontmatter says `model: opus`. Nothing in the relay runs on Sonnet or
Haiku. Fable is not used inside the relay; it is the human's escalation
after the relay has run.

## 9. Tools

Review agents: `Read, Grep, Glob, Write`. Write is for exactly one file, the
report at the given path. Nothing else.

Agents that need to run something (dependency-reviewer, devils-advocate,
test-strategist): add `Bash`, read-only use only. No installs, no lockfile
regeneration, no build, no test run, no git command that changes state.
These agents never run in a parallel batch; the orchestrator runs them one
at a time after the read-only wave.

Agents that check the outside world (dependency-reviewer, ux-reviewer):
add `WebFetch, WebSearch`. Every claim from the web carries its URL.

Fixer: `Read, Grep, Glob, Edit, Write, Bash`. Bash runs `build_cmd` and
`test_cmd` from config and nothing else that changes state.

## 10. Runtime notes

Claude Code specific mechanisms, which an adapter for another runtime must
map: the `tools:` and `model:` frontmatter keys, `allowed-tools`,
`$ARGUMENTS`, `${CLAUDE_PLUGIN_ROOT}`, the Agent tool with `subagent_type`
and `model`, and parallel spawning by placing several Agent calls in one
message. The wave structure (first pass alone, read-only wave in parallel,
executing agents serial, synthesis after) is the contract; the mechanism is
not. Every command and agent file ends with a short `## Runtime notes`
section naming which of these it uses.

## 11. Voice

No em dashes, no en dashes, in prompts or in the output templates the
prompts contain. Ranges are written "20 to 40". No machine register. Say
"merge to base" rather than "ship" when addressing a reader who has never
used a pull request; the verdict words SHIP, FIX THEN SHIP, and ESCALATE
stay because the commands parse them.
