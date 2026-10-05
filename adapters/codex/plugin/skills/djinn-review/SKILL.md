---
name: djinn-review
description: Run the djinn review relay audit phase on the current repo's change against its base branch, with review agents, synthesis, an audit folder and a ledger line. Stops at the audit; never fixes. Use only when the user asks for a djinn review. This Codex build supports the quick scope and custom agent lists.
---

<!-- Written by Claude Opus 5.5 for Donald, 2026-10-05. Codex adapter,
slice 4. Status: draft, not yet run end to end, not reviewed. -->

# Djinn Review on Codex

The review itself is djinn's own command, unchanged. This file only says
how to run it on Codex. Paths below are relative to the plugin root, the
folder two levels above this `SKILL.md` (it holds `CONTRACTS.md`,
`agents/`, `commands/` and `shared/`).

## Order of work

1. Follow `shared/agent-model.md` Steps A and B: take or ask for the
   agents' model and effort, and check them. Nothing else happens until
   that is settled.
2. Check the scope (below). Stop on one this build does not run.
3. Follow `commands/review.md` from Step 1 to Step 10, as mapped below.
   Read `CONTRACTS.md` first, as that file says.
4. Right after `review.md` Step 4 creates `AUDIT_DIR`, follow
   `shared/agent-model.md` Step C (write `runtime.md`). Every spawn after
   that follows its Step D.

## Scopes this build runs

`quick`, and a custom comma-separated agent list. Any other scope word,
`standard` included, stops before anything is written with:
`djinn-review on Codex runs quick or a custom list for now; <scope> is not yet tested here.`
The default scope in `review.md` is `standard`, so a request that names no
scope gets that message too, with the hint `try: $djinn-review quick`.

## The mapping

`review.md` names these Claude Code mechanisms; on Codex each becomes:

| `review.md` says | On Codex |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}` | the plugin root above |
| `$ARGUMENTS` | the request text after `$djinn-review`, minus any model or effort words `shared/agent-model.md` took |
| `allowed-tools` and the Rules' Bash list | shell commands from that list only; read files with `cat`, `sed -n` or `rg`; write files with `apply_patch` or a shell heredoc. Nothing else, and no command that changes git state |
| the Agent tool with `subagent_type: "<name>"` and `model: "opus"` | `spawn_agent` per `shared/agent-model.md` Step D, with the message built as below |
| several Agent calls in one message | spawn up to the concurrency limit (`shared/agent-model.md`), wait for those final answers, then the next batch, until the wave is done |
| an agent "returns" | its `FINAL_ANSWER` message arrives; `wait_agent` only yields until then |
| every agent's usage block | Codex gives none: `?` in every `usage.md` cell |
| `model: opus` in `context.md` | `model: <agents model> at <effort>, codex` |
| `author: Claude Opus (...)` in a header the coordinator writes | `author: Codex (djinn-review)` |
| `templates/config.yaml` | not shipped in this build; point the owner at `plugins/djinn/templates/config.yaml` in the djinn-relay repo |

The ledger line's detail column also carries
`runtime=codex model=<model> effort=<effort>`, after `files=<n>`.

### The spawn message

Every spawn's `message` is:

```
You are the djinn agent <name>. Your instructions are in
<plugin root>/agents/<name>.md. Read that file first and follow it.
Its frontmatter tools line is binding here: Read, Grep and Glob mean
read and search commands only; Write means writing your one report file
and nothing else; Bash only if the line names it. Do not edit, create,
move or delete any other file.

<the prompt review.md gives for this agent: the fence block with
<CONTRACTS> set to <plugin root>/CONTRACTS.md, the per-agent block, and
the step's extra lines>
```

The agent's final answer is the header line and its Counts, as the fence
block asks. Nothing longer comes back.

## Keep the terminal quiet

- Never print, quote or summarize an agent report, `synthesis.md`, the
  patch or `fence.txt`. Do not open a report except to check the file
  exists (`review.md` Step 8).
- Between waves, one line each: `wave <n>: <agent names>`, then
  `wave <n>: done`.
- The final message is `review.md` Step 10's report and nothing else.

## Rules

- Never fix, never spawn a fixer, never run proof-runner.
- Agents write only their report under `AUDIT_DIR/agents/`. The
  coordinator writes the audit folder's own files and the ledger line.
- On Codex, read-only reviewers are read-only by instruction, not by
  sandbox; `runtime.md` says so.
- Never run the Azure CLI (`az`) or anything that touches Azure.

## Runtime notes

Codex adapter of `plugins/djinn/commands/review.md`, which ships here as the
generated `commands/review.md` (see `adapters/codex/build.mjs`); edit the
source, never the copy. The wave structure in `review.md` is the contract;
this file maps only the mechanism.
