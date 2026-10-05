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
| Plugin root | `${CLAUDE_PLUGIN_ROOT}` | the skill's own folder, resolved by the model from its catalog path |

Codex also lists `.claude-plugin/plugin.json` and
`.claude-plugin/marketplace.json` among the files it recognizes. It may try to
load the Claude plugin too. Slice 1 tests that.

## Layout

```
.agents/plugins/marketplace.json      new, points Codex at the adapter
adapters/codex/
  PLAN.md                             this file
  build.mjs                           generates plugin/agents/ and plugin/CONTRACTS.md
  plugin/
    .codex-plugin/plugin.json
    skills/djinn-status/SKILL.md      one skill per command, hand written
    skills/djinn-review/SKILL.md
    skills/djinn-brief/SKILL.md
    skills/djinn-dispatch/SKILL.md
    skills/djinn-learn/SKILL.md
    agents/*.md                       GENERATED, do not edit, see build.mjs
    CONTRACTS.md                      GENERATED, the agents read it by path
```

## The agents: one source, built for Codex

The 31 agent prompts stay in `plugins/djinn/agents/`, the only copy anyone
edits. `build.mjs` copies each one, and `CONTRACTS.md`, into
`adapters/codex/plugin/`, behind a comment naming the source and its
SHA-256. No dates and no commit ids, so the same sources always build the
same bytes. The output is committed, because a git install of the plugin
sees only what is committed.

The Claude frontmatter stays. Built in slice 2, this changed from the
plan's first draft: each agent's own text says "The frontmatter above is
Claude Code agent metadata", and its `tools:` line is how the review skill
will know which agents are read-only. The skill names the model on every
spawn, so `model: opus` in the copy is never read as an instruction.

`node adapters/codex/build.mjs --check` fails on a stale, missing or extra
copy. `tools/pre-push.sh` runs it, so a push cannot carry stale copies.
It is not in djinn's `build_cmd`: that would fail every Claude-side fixer
run that edits an agent until someone rebuilds. Donald's call whether to
add it. `tools/check-private.sh` lists the generated learn copies beside
their sources as files allowed to carry the learn marks.

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

## Keep the main terminal quiet

Donald, 2026-10-05: on Claude, agents launch as one line each and djinn
comes back with one line of counts. The coordinator never reads the agent
reports, so the terminal stays readable. The Codex side keeps that:

- Every agent writes its report to `<AUDIT_DIR>/agents/<name>.md` and
  ends with a one-line final answer: its name, the report path, and its
  counts. The coordinating session reads that line, never the report.
- Only synthesis reads the reports.
- A skill's own output is a few lines. Long output sits behind an explicit
  ask, the way `djinn-status --full` does.

## Slice 3 results (2026-10-05)

`plugin/shared/agent-model.md` is the shared step. Facts it rests on, from
a live Codex 0.160.0 session through the message folder:

- `spawn_agent` takes `model`, `reasoning_effort` and `fork_turns`; the
  overrides hold only with `fork_turns` `"none"` or a number. A probe child
  spawned with `gpt-6.1-sol`, `medium`, `"none"` ran exactly that, per its
  own session log, and received no parent turns.
- `request_user_input` is Plan mode only, so the skill asks in a plain
  message and ends its turn, unless the request already names the choice.
- No per-agent sandbox field: children run with the parent's permissions.
  A child wrote inside the repo; a write outside it was refused.
- At most 3 children at once in that session (4 agents including the
  parent). Waves run in batches.
- `wait_agent` returns no text; each child's final answer arrives as its
  own message.

## Slice 4, first run (2026-10-05)

`$djinn-review quick` ran end to end on a scratch repo (a cart module with
a planted off-by-one and an `innerHTML` line): model question answered
`go`, known-bugchecker alone, then bugs, integration and accessibility (its
UI trigger fired) together, then synthesis. Verdict FIX THEN SHIP,
H0 M1 L1; the off-by-one is MEDIUM-1. The `innerHTML` hit is LOW because
the test index wrote `Tier:` where known-bugchecker reads `Tier when hit:`,
which is the agent following its own rule. Nothing outside `audits/`
changed. Codex listed 15 places the skill or review.md did not fit; the
skill now maps the ones that are the adapter's to fix. Three agents wrote
dashes, so every spawn message now repeats the section 11 rule.

The concurrency cap is a Codex setting:
`-c agents.max_concurrent_threads_per_session=8` gave 9 slots. Whether to
set it in `~/.codex/config.toml` for good is Donald's call.

Found in djinn itself, not fixed: synthesis's status line
`agent output, not yet deliberated` is not one of the statuses CONTRACTS.md
section 7 allows.

## Slice 4, runs 2 to 4 (2026-10-05)

- Run 2 (`quick default`, 9 slots): no model question; HIGH-1 is KB-1 now
  the test index reads `Tier when hit:`, MEDIUM-1 the off-by-one; no
  dashes. Found: task names are unique per Codex session, so names now
  carry the run's timestamp.
- Run 3 (`quick default`, 4 slots, no flag): the heads-up after the model
  choice and the set it up offer at the end, as built.
- Run 4 (`default`, so standard, 4 slots): six agents in wave 2 through 3
  children, each final answer freeing a slot for the next; synthesis after
  all six. No failed-command lines, exact model in every author line.

Quick and standard are open in the skill. Full, perf, cost, live, ideas
and map are not yet run on Codex.

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

## Answered by slice 1 (2026-10-05)

1. Codex does not pick up the Claude plugin. With
   `.agents/plugins/marketplace.json` present, `codex plugin list` shows only
   `djinn-codex@djinn-relay`.
2. Codex copies the plugin folder, and only that folder, into
   `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`. Anything a
   skill reads must sit inside `adapters/codex/plugin/`, which is why the
   generated agents go in `plugin/agents/`. Running `codex plugin add` again
   refreshes the cache without a version bump.
3. A skill can reach files beside it. Codex lists the skill with a short
   alias path (`r1/djinn-codex/0.1.0/skills/djinn-status/SKILL.md`, with
   `r1` mapped to the marketplace cache root), and the model resolves
   `scripts/status.mjs` against that folder and runs it from the cache.
   Confirmed by a live Codex session through the shared message folder.
4. A skill with `allow_implicit_invocation: false` in `agents/openai.yaml`
   is left out of the model's skill catalog entirely; Codex's own
   `review-agent` is missing the same way. Typing `$djinn-status` then
   finds nothing, and the model goes searching the disk. Skills here use
   `true`. Revisit for skills that spawn agents or write files, where an
   unasked run costs more.

## Found in passing, in djinn itself, not fixed

`/djinn:status` prints `raised in: <audit>/round-<k>`, but this repo's
round 3 lives in its own folder (`audits/2026-09-29-1654-custom`, whose
findings.json names `audits/2026-09-29-1303-custom` round 3). The printed
path does not exist. Both runtimes follow the same rule, so the fix belongs
in `plugins/djinn/commands/status.md` first. Owner's call.

## Open questions

3. Does `spawn_agent` run agents truly in parallel, and can a read-only agent
   be held to read-only? Codex agent configs know `read-only` and
   `workspace-write`; whether a spawn can set it is unchecked.
4. Can a skill force `fork_turns="none"` so reviewers start blind, the way
   djinn's reviewers do on Claude?
5. Codex tells its models not to spawn agents unless a skill or AGENTS.md
   says to. The skills must say so in plain words.
