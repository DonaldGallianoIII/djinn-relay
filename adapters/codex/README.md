---
title: djinn for Codex, install and first run
author: Claude Opus 5.5, for Donald
date: 2026-10-05
status: install from GitHub tested in a throwaway Codex home; review runs and the first-run self-setup tested live on scratch repos. The one-question first run (config and model answered by a single go) is not yet run live, and no second machine yet.
---

# djinn for Codex

djinn is a multi-agent code review. A team of review agents reads your
branch against its base, a synthesis agent merges what they found into one
verdict, and everything lands in an `audits/` folder you can open in the
browser.

## You need

- Codex 0.160 or newer (`codex --version`; `codex update` if older)
- Node (`node --version`)
- A git repo with a branch to review against its base

## Install, once

```bash
codex plugin marketplace add DonaldGallianoIII/djinn-relay --ref Claude-Development-djinn-relay-codex
codex plugin add djinn-codex@djinn-relay
```

Start a new Codex session after installing.

## First run

In your repo, in Codex:

```
$djinn-review quick
```

The first time, djinn sets itself up: it reads your repo, shows a draft of
`.djinn/config.yaml` (base branch, build and test commands, conventions
files, dependency files) and asks one question. Reply `go` to write it and
run the review agents on GPT-6.1-Sol at medium effort, or say what to
change. Commit `.djinn/` afterward. To set up without reviewing, use
`$djinn-setup`.

`quick` is a fast first pass with three reviewers. It can miss things the
standard scope (`$djinn-review`) would catch.

## Commands

| Type | What it does |
|---|---|
| `$djinn-review quick` | known-bugchecker, bugs, integration, then synthesis |
| `$djinn-review` | the standard scope: adds format, security and perf |
| `$djinn-review quick default` | skips the model question |
| `$djinn-status` | what is still open in the latest audit, in a few lines |
| `$djinn-view` | opens every audit in your browser |
| `$djinn-setup` | sets djinn up in a repo |

## Faster reviews

Codex runs 3 agents at a time unless told otherwise; djinn takes them in
turns and says so. Start Codex with
`codex -c agents.max_concurrent_threads_per_session=8` for 8 at a time, or
reply `set it up` when a review offers to make that permanent.

## Not on Codex yet

- `brief` and `dispatch` (turning findings into fixes) and `learn`. Use them
  from Claude Code for now.
- The `full`, `perf`, `cost`, `live`, `ideas` and `map` scopes.
- Read-only reviewers are read-only by instruction: Codex cannot lock one
  agent to read-only the way Claude Code does.
