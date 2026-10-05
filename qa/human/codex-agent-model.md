---
title: QA, Codex adapter slice 3, choosing the agents' model
author: Claude Opus 5.5, for Donald
date: 2026-10-05
status: tests 1 to 3 run by Codex on 2026-10-05 through the message folder and checked by Claude in the child's session log. Not yet run by a person.
---

# Codex adapter slice 3: choosing the agents' model

No skill uses `shared/agent-model.md` yet; the review skill in slice 4 is
the first. Until then this script drives the step by hand in Codex. Run
`codex plugin add djinn-codex@djinn-relay` first, then start `codex` in
`~/code/personal/djinn-relay`.

## Steps

1. Type: `Read the djinn-codex plugin's shared/agent-model.md. Apply Step A
   to the request "review my change" and show me what you would send.`
   You should see exactly:
   `djinn agents will run on gpt-6.1-sol at medium effort.`
   `Reply go to use that, or name a model and effort.`
   and nothing spawned.

2. Type: `Apply Step B to model gpt-6-luna at effort ultra.`
   You should see
   `effort ultra is not available for gpt-6-luna; available: low, medium, high, xhigh, max`
   (the list may differ on another Codex version) and nothing spawned.

3. Type: `Following Step D, spawn one agent named probe with the defaults
   whose task is: reply with the one word ok.`
   You should see one spawn with `model` `gpt-6.1-sol`,
   `reasoning_effort` `medium`, `fork_turns` `"none"`, and its answer `ok`.

4. Check the model held. In a terminal:
   `ls -t ~/.codex/sessions/$(date +%Y/%m/%d)/ | head -3`, open the
   newest file, and find its `turn_context` line: it should name
   `gpt-6.1-sol` and `medium`, and its `session_meta` source should be a
   `thread_spawn` with `agent_path` `/root/probe`.
