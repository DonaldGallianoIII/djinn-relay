---
name: djinn-review
description: Run the djinn review relay audit phase on the current repo's change against its base branch, with review agents, synthesis, an audit folder and a ledger line. Stops at the audit; never fixes. Use only when the user asks for a djinn review. This Codex build supports the quick scope and custom agent lists.
---

<!-- Written by Claude Opus 5.5 for Donald, 2026-10-05. Codex adapter,
slice 4. Revised after the first end to end quick run on a scratch repo
(audits/2026-10-05-0950-quick there), using Codex's own notes on where
this file and review.md did not fit. Status: one live run, not reviewed. -->

# Djinn Review on Codex

The review itself is djinn's own command, unchanged. This file only says
how to run it on Codex. Paths below are relative to the plugin root, the
folder two levels above this `SKILL.md` (it holds `CONTRACTS.md`,
`agents/`, `commands/` and `shared/`).

## Order of work

1. Follow `shared/agent-model.md` Steps A and B: take or ask for the
   agents' model and effort, and check them. Nothing else happens until
   that is settled. Then give its concurrency heads-up if the session's
   cap calls for one.
2. Check the scope (below). Stop on one this build does not run.
3. Follow `commands/review.md` from Step 1 to Step 10, as mapped below.
   Read `CONTRACTS.md` first, as that file says. Read long files in parts
   (`sed -n '1,200p'` and so on): a single read is cut off by the output
   limit.
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
| `allowed-tools` and the Rules' Bash list | shell commands from that list, plus `cat`, `sed -n` and `rg` to read; write files with `apply_patch` or a shell heredoc. Handling a git list in a script instead of a list file is fine, as long as no path or config value is typed into a command line (CONTRACTS.md section 9). No build, no test, no command that changes git state |
| the Agent tool with `subagent_type: "<name>"` and `model: "opus"` | `spawn_agent` per `shared/agent-model.md` Step D, with the message built as below |
| several Agent calls in one message | a rolling window up to the concurrency cap (`shared/agent-model.md`, Concurrency): each final answer frees a slot for the next agent of the wave; the next wave starts only when every agent of this one has answered |
| an agent "returns" | its `FINAL_ANSWER` message arrives on its own; `wait_agent` only yields until then and never carries it. While final answers are missing, call `wait_agent` with `timeout_ms` 60000. Waits get no commentary of their own; the only progress line is the one under Keep the terminal quiet |
| the waves | wave 1 is Step 5 (known-bugchecker), wave 2 is Step 6, wave 3 and up are Step 7's executing agents one per wave, and the last wave is synthesis. `usage.md` uses these numbers |
| every agent's usage block | Codex gives none: `?` in every `usage.md` cell |
| `model: opus` in `context.md` | `model: <agents model> at <effort>, codex` |
| `author: Claude Opus (...)` in a header the coordinator writes | `author: Codex (djinn-review)` |
| `templates/config.yaml` | not shipped in this build; point the owner at `plugins/djinn/templates/config.yaml` in the djinn-relay repo |

The ledger line's detail column also carries
`runtime=codex model=<model> effort=<effort>`, after `files=<n>`.

### Reading results without reading reports

The coordinator never opens a report, so two places in `review.md` that
assume it does are mapped:

- Step 5 says to note the patterns known-bugchecker flagged, and Step 6
  pastes them. On Codex, Step 6's line reads: "known-bugchecker (a pattern
  matcher, unverified) flagged the hits in the Findings section of
  `<AUDIT_DIR>/agents/known-bugchecker.md`; read it. Do not re-report these
  as your own findings. If you read the code and one is a false positive,
  say so under Checked and Clean with the line that disproves it."
- Steps 9 and 10 take the verdict, the Counts and the outside-fence count
  from synthesis. Synthesis's spawn message adds: "Your final answer is
  one line: the verdict word, your Counts as H<n> M<n> L<n> D<n> R<n>, and
  outside-fence=<n>." The ledger line and the Step 10 report use that
  line.

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

Every message also ends with: "Write no em dash and no en dash anywhere in
your file (CONTRACTS.md section 11); write ranges as 9 to 14."

Synthesis gets the same opening, except that its files are
`<AUDIT_DIR>/synthesis.md` and `<AUDIT_DIR>/findings.json` rather than a
report under `agents/`, with the status its own agent file gives. In its
prompt, the fence block's last paragraph ("Start your report with ... Reply
with only the header line and your Counts.") is replaced by that.

A reviewer's final answer is its header line and its Counts, as the fence
block asks. Synthesis's final answer is the one line set under Reading
results without reading reports. Nothing longer comes back.

## Keep the terminal quiet

- Never print, quote or summarize an agent report, `synthesis.md`, the
  patch, `fence.txt` or a spawn message. Do not open a report except to
  check the file exists (`review.md` Step 8).
- Between waves, one line each: `wave <n>: <agent names>`, then
  `wave <n>: done`. A wave still running after a minute gets one
  `wave <n>: <agent> still running` line, no more.
- The final message is `review.md` Step 10's report and nothing else.

## Rules

- Never fix, never spawn a fixer, never run proof-runner.
- Each reviewer writes only its report under `AUDIT_DIR/agents/`.
  Synthesis writes only `AUDIT_DIR/synthesis.md` and
  `AUDIT_DIR/findings.json`. The coordinator writes the audit folder's own
  files and the ledger line.
- On Codex, read-only reviewers are read-only by instruction, not by
  sandbox; `runtime.md` says so.
- Never run the Azure CLI (`az`) or anything that touches Azure.

## Runtime notes

Codex adapter of `plugins/djinn/commands/review.md`, which ships here as the
generated `commands/review.md` (see `adapters/codex/build.mjs`); edit the
source, never the copy. The wave structure in `review.md` is the contract;
this file maps only the mechanism.
