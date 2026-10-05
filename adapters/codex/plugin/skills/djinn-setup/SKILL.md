---
name: djinn-setup
description: Set djinn up in this repo for Codex. Checks Codex and Node, drafts .djinn/config.yaml from the template and what the repo shows, writes it only after the owner says go, and offers to raise the agent concurrency cap. Never overwrites an existing config. Use when the user asks to set up djinn, or when djinn-review finds no config.
---

<!-- Written by Claude Opus 5.5 for Donald, 2026-10-05. Codex adapter of
plugins/djinn/commands/setup.md, plus the Codex checks. Status: tested
with node, not yet run from a Codex session, not reviewed. -->

# Djinn Setup on Codex

`<plugin root>` is the folder two levels above this `SKILL.md`.

## Step 1: Check the tools

Run `codex --version` and `node --version`. djinn on Codex was built and
tested on Codex 0.160.0. On an older Codex, say
`djinn was tested on Codex 0.160.0; this is <version>, so some steps may not work. Update with: codex update`
and carry on. Without Node, say `djinn needs Node; install it, then run $djinn-setup again` and stop.

## Step 2: Draft, ask, write

Follow `<plugin root>/commands/setup.md` Steps 1 to 3 exactly, with
`${CLAUDE_PLUGIN_ROOT}` read as `<plugin root>`. The script it runs is the
generated copy of djinn's own `setup-project.mjs`. In the finishing line,
say `$djinn-review quick` instead of `/djinn:review quick`.

## Step 3: The agent cap

Read the concurrency sentence in your own instructions. When it leaves
fewer than 8 children, give the heads-up and the offer from
`<plugin root>/shared/agent-model.md` (Concurrency), in that order, and
follow the offer only on the owner's yes.

## Rules

- The script writes the config; never write or edit `.djinn/config.yaml`
  yourself, and never overwrite one that exists.
- Never edit `~/.codex/config.toml` except through the offer's script.
