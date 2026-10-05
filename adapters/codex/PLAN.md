---
title: Codex adapter for djinn, the plan
author: Claude Opus 5.5, for Donald
date: 2026-10-05
status: plan, agreed in conversation, not built. Nothing here is tested yet.
branch: Claude-Development-djinn-relay-codex
---

# Codex adapter for djinn

## Goal

Run the djinn relay inside OpenAI Codex as well as Claude Code, from this one
repo. The Claude side does not change: nothing under `plugins/djinn/` or
`.claude-plugin/` is edited by this work. The plugin README already says where
this belongs: "An adapter for another runtime lives under `adapters/` in the
repo, not in this plugin."

## What Codex 0.154 offers

Read from the installed binary and the plugins Codex ships with, on
2026-10-05. None of it is tested against a djinn build yet.

| Need | Claude Code | Codex |
|---|---|---|
| Plugin manifest | `.claude-plugin/plugin.json` | `.codex-plugin/plugin.json` |
| Marketplace | `.claude-plugin/marketplace.json` | `.agents/plugins/marketplace.json` |
| Entry points | `commands/*.md` | `skills/<name>/SKILL.md` (no commands in a plugin) |
| Spawn an agent | Agent tool, `subagent_type`, `model` | `spawn_agent`, with `task_name`, `model`, a reasoning effort, `fork_turns` |
| Wait for agents | parallel calls in one message | `wait_agent` |
| Ask the owner | the conversation | `request_user_input` |
| Plugin root | `${CLAUDE_PLUGIN_ROOT}` | unknown, see open question 2 |

Codex also lists `.claude-plugin/plugin.json` and
`.claude-plugin/marketplace.json` among the files it recognizes. It may try to
load the Claude plugin too. Slice 1 tests that.

## Layout

```
.agents/plugins/marketplace.json      new, points Codex at the adapter
adapters/codex/
  PLAN.md                             this file
  build.mjs                           generates plugin/agents/ from plugins/djinn/agents/
  plugin/
    .codex-plugin/plugin.json
    skills/djinn-status/SKILL.md      one skill per command, hand written
    skills/djinn-review/SKILL.md
    skills/djinn-brief/SKILL.md
    skills/djinn-dispatch/SKILL.md
    skills/djinn-learn/SKILL.md
    agents/*.md                       GENERATED, do not edit, see build.mjs
```

## The agents: one source, built for Codex

The 31 agent prompts stay in `plugins/djinn/agents/`, the only copy anyone
edits. `build.mjs` copies each one into `adapters/codex/plugin/agents/`, drops
the Claude frontmatter (`tools:`, `model:`), and stamps a header saying the
file is generated and from which source commit. The output is committed,
because Codex installs from git and only sees what is committed.

A check fails when the generated copy is stale, so an edit to a Claude agent
cannot silently skip the Codex side. It runs from `tools/pre-push.sh`.

Each skill reads an agent file and hands its text to `spawn_agent` as the
task, together with the four inputs the agent's own `# Inputs` section lists
(fence, config values, report path, prior synthesis). The agents already say
"An adapter for another runner must supply those four."

## Choosing the reviewer model

Every skill that spawns agents asks first, with `request_user_input`:

- Which model the agents run on. Default: GPT-6.1-Sol.
- What reasoning effort. Default: medium.

The skill passes both explicitly on every `spawn_agent` call, the same rule
the Claude side follows with `model: "opus"`. Codex's own default effort for
GPT-6.1-Sol is low, so leaving it unset would quietly run reviewers below
what was chosen.

The choice is recorded in the audit folder and in the `audits/LEDGER.md`
line. A Codex audit has to say it did not run on Opus, or it reads as an Opus
audit six months from now.

Whether the coordinating session can change its own model is not in scope.
It runs on whatever Codex session started it.

## Slices, in order

Each slice is built, tested by Donald in Codex, and agreed before the next.

1. **Skeleton and `djinn-status`.** Manifest, marketplace file, the status
   skill (read-only, 114 lines on the Claude side, spawns nothing). Test:
   `codex plugin marketplace add` on the local repo, then `codex plugin add`,
   then run it against an existing audit folder. Answers open questions 1
   and 2.
2. **`build.mjs` and the staleness check.** No new behavior, just generated
   agent files and a failing check when they drift.
3. **The model question.** One shared step the spawning skills use, with the
   GPT-6.1-Sol and medium defaults, written to the audit folder.
4. **`djinn-review`, quick scope first.** known-bugchecker, then
   bugs-reviewer, then synthesis. Then standard, then full. The wave
   structure is the contract (first pass alone, read-only wave in parallel,
   executing agents serial, synthesis after).
5. **`djinn-brief`, then `djinn-dispatch`.** Dispatch is the first slice that
   lets agents edit files, so it needs Codex's write sandbox and the work-set
   guard mapped.
6. **`djinn-learn`.** Last and largest (1,159 lines), and it has its own
   private-content guards (`tools/check-private.sh`, `qa/bot/private-guards.sh`)
   that must keep working.

Every slice ships with `qa/human/codex-<slice>.md`. A bot script and a
programmatic test are added where there is a deterministic loop to replay.

## Open questions

1. Does Codex also pick up the Claude plugin through
   `.claude-plugin/marketplace.json`, and list djinn twice?
2. When Codex installs a plugin, does it copy it into
   `~/.codex/plugins/cache/`? If yes, can a skill find `../../agents/` by a
   path relative to its own folder, or does Codex expose a plugin root the way
   Claude exposes `${CLAUDE_PLUGIN_ROOT}`?
3. Does `spawn_agent` run agents truly in parallel, and can a read-only agent
   be held to read-only? Codex agent configs know `read-only` and
   `workspace-write`; whether a spawn can set it is unchecked.
4. Can a skill force `fork_turns="none"` so reviewers start blind, the way
   djinn's reviewers do on Claude?
5. Codex tells its models not to spawn agents unless a skill or AGENTS.md
   says to. The skills must say so in plain words.
