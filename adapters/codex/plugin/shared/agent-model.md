<!-- Written by Claude Opus 5.5 for Donald, 2026-10-05, revised the same
day after a live spawn test and Codex's own review of the first draft.
Codex adapter, slice 3. Status: tested once live, not reviewed.
Every djinn skill that spawns agents follows this file before its first
spawn. Tool facts below come from a Codex 0.160.0 session's own tool
definitions and from the spawned child's session log, 2026-10-05. -->

# Choosing the agents' model

djinn on Claude runs every agent on Opus and says so on every spawn. On
Codex the owner picks the model and the reasoning effort once per run, and
every spawn in the run carries both. Nothing is left to inherit.

## Defaults

- model: `gpt-6.1-sol`
- reasoning effort: `medium`

`spawn_agent` documents that an omitted `reasoning_effort` inherits the
parent's effort, and the parent session may run at any effort. Set both on
every spawn so the run uses what was chosen, whatever the parent is on.

## Step A: take the choice from the request, or ask once

1. If the request names a model, an effort, or both (for example
   `model gpt-6-luna`, `effort high`, `on gpt-6.1-sol at xhigh`), use what
   it names and the default for the rest. Do not ask.
2. If the request says `default` or `defaults`, use both defaults. Do not
   ask.
3. Otherwise, before anything else, send exactly this and end your turn:

   ```
   djinn agents will run on gpt-6.1-sol at medium effort.
   Reply go to use that, or name a model and effort.
   ```

   Start the run's other steps only after the reply, so a run the owner
   abandons leaves nothing behind.
4. A reply of `go`, `yes`, `ok`, `default` or `defaults` means the
   defaults. A reply naming a model, an effort or both is taken as in
   item 1. `cancel`, `stop` or `no` ends the run with nothing written. A
   question (`what options?`) gets the available models and efforts from
   Step B's lists, then the same prompt again. No reply is not a yes: wait.

`request_user_input` is not used. In Codex 0.160.0 its own description
says it is available in Plan mode only, and a skill cannot choose the mode
it runs in. `request_user_input_async` exists and returns at once; it is
not used either, because the run must not start until the owner has
answered, and a plain question that ends the turn does that with nothing
left behind. This skill's instruction to stop and ask is explicit.

## Step B: check the choice before the first spawn

The model must be one of the overrides `spawn_agent` lists in this
session, and the effort one that model lists. Read both lists from the
tool's own description; a list written here would go stale with the next
Codex version. On a name that is not listed, spawn nothing, show
`model <m> is not available here; available: <list>` or
`effort <e> is not available for <m>; available: <list>`, record the
ledger outcome `ABORTED step model: <that message>`, and stop.

## Step C: record it

Write `<AUDIT_DIR>/runtime.md` once the audit folder exists and before the
first spawn:

```
---
title: runtime, <AUDIT_DIR>
author: Codex (<skill name>)
date: <YYYY-MM-DD>
status: agent output, not yet reviewed
---

runtime: codex <version if known, else unknown>
coordinator model: <an exact model id your instructions state, else unknown>
agents model: <model>
agents reasoning effort: <effort>
chosen by: <default | request | reply>
read-only agents: by instruction only, see agent-model.md
```

A family name such as "GPT-6" is not an exact id; write `unknown`.

The skill's ledger line carries
`runtime=codex model=<model> effort=<effort>` in its detail column, so a
Codex audit can never pass for an Opus one.

## Step D: every spawn

Every `spawn_agent` call in the run passes all of:

- `task_name`: the agent's name with `-` turned into `_`, then `_` and the
  run's timestamp (`bugs_reviewer_202610051001`). Task names are unique
  across the whole Codex session, not per run: a second review in the same
  session that reused `known_bugchecker` was refused with `agent path
  /root/known_bugchecker already exists`. If a name is still refused that
  way, add `_2`, `_3` and so on. Never reuse an earlier child with a
  follow-up: it still holds its earlier review.
- `model`: the chosen model
- `reasoning_effort`: the chosen effort
- `fork_turns`: `"none"`
- `message`: everything the agent needs

`fork_turns` must be `"none"`. The tool's instructions say a full-history
fork does not accept `model` or `reasoning_effort` overrides, and it would
hand a blind reviewer the whole conversation. With `"none"` the child gets
Codex's own system and developer instructions, the skill catalog, the
environment context and its `message`, and none of the parent's turns
(read from the child's session log, 2026-10-05). So the `message` carries
the agent file's path and every input that file asks for.

If a spawn fails on the model or the effort, never retry without them. Stop
the run, record `ABORTED step <k>: spawn rejected <model> <effort>`, and
show the error.

## What this skill must plan around

- **Concurrency.** Codex caps how many agents run at once, and the cap is
  stated in the session's own instructions ("There are <n> available
  concurrency slots ... including you"). The parent takes one slot, so
  `<n> - 1` children run at once. Seen on 2026-10-05: 4 slots by default
  (3 children); 9 slots when Codex was started with
  `-c agents.max_concurrent_threads_per_session=8` (8 children). If the
  instructions state no number, assume 3 children, and when a spawn is
  refused for capacity, wait for a child to finish and spawn again.

  Run a parallel wave as a rolling window: spawn up to the cap, and each
  time a child's final answer arrives, spawn the next agent of the wave.
  The wave ends when every agent in it has answered; nothing from the next
  wave (synthesis included) starts before that.

  **The heads-up.** When the cap leaves fewer than 8 children, say this
  once, right after the model choice is settled, and carry on without
  waiting for a reply:

  ```
  Heads-up: this Codex session runs 3 agents at a time, so djinn takes them in turns and the review runs slower. Nothing to do now. For future sessions, start Codex with -c agents.max_concurrent_threads_per_session=8, or add max_concurrent_threads_per_session = 8 under [agents] in ~/.codex/config.toml.
  ```

  with `3` replaced by the real number of children. The run never stops or
  asks to restart over this: the owner may be mid project with a session
  they do not want to lose.
- **No per-agent sandbox.** `spawn_agent` has no sandbox or approval field.
  In the 2026-10-05 test session the child's log listed `workspace-write`
  with the repo as its workspace root, the same as its parent: a write
  inside the repo (a gitignored file) succeeded, one to a folder outside it
  was refused. Codex reports `/tmp` among its writable roots too. Reports
  under `audits/` are inside the repo, so agents can write them. An agent
  the Claude side limits with its `tools:` line is limited here by its
  instructions alone.
- **Answers arrive as messages.** `wait_agent` returns which agents have
  updates, or a timeout, never their text. Each child's final answer
  reaches the parent as its own message (`Message Type: FINAL_ANSWER`,
  with the sender's task path). djinn agents answer in one line, their
  header line and Counts, so the parent never holds a report.
