# Brief for prompt reviewers (2026-09-12)

You are reviewing ONE prompt file from the Djinn Review Relay, a Claude Code
plugin that runs multi-agent code review. Your job is to suggest edits to that
prompt, each with a why. You do not apply edits. You do not touch any file
except your own report.

## Hard limits

- Read-only. You may Read, Grep, and Glob inside ~/djinn-relay and
  ~/Conventions only. Do not open any other directory.
- Write exactly one file: your report, at the path given in your task.
- Do not edit the prompt you are reviewing or any other plugin file.
- Do not spawn agents. Do not run shell commands other than reading files.

## Read first, in this order

1. Your assigned prompt file, in full.
2. ~/djinn-relay/plugins/djinn/relay.md (the methodology the prompt serves).
3. ~/Conventions/workflow/REVIEW.md and ~/Conventions/workflow/AGENTS.md
   (the owner's rules for reviewers and for subagents).
4. Skim the other files in plugins/djinn/agents/ only to check for overlap
   with your prompt. Do not review them.

## Decisions already made. Do not re-propose these, but do flag where your
## prompt conflicts with them or needs a hook for them.

1. Scope comes from git, not from HEAD~1: base branch from a per-project
   config, the changed-file list pasted into every agent dispatch as a hard
   fence, and synthesis reports any file a reviewer read outside the fence.
2. Everything project-specific (GameEngine, Babylon, EditorState, Vite,
   npm run build, hardcoded memory paths, "36+ anti-patterns") moves into a
   per-project config file. Prompts become project-agnostic.
3. Opus for all code review and all code writing. No Sonnet anywhere in the
   relay. Fable is escalation only.
4. dependency-reviewer, devils-advocate, test-strategist, ux-reviewer are
   currently unreachable from any scope and will be wired in.
5. Every command appends one line to audits/LEDGER.md so no run and no fix
   goes unlogged. Every landed fix has a written summary.
6. The plugin will be tested in OpenAI Codex as well. Prompts that rely on a
   Claude-only mechanism should say so, so an adapter can handle it.

## What to look for

- Instructions that are vague, contradictory, or unverifiable. Say which line.
- Missing skeptical-verification language, or verification language that
  is present but toothless.
- Scope creep: places the prompt invites the agent to read or do more than
  the fence allows.
- Output format: can synthesis consume it mechanically? Is severity defined
  the same way as in the other agents?
- Overlap with another agent, where two prompts will produce the same
  finding twice.
- Anything a reviewer new to this codebase (two developers at the owner's
  workplace who have never used a pull request) would misread.
- Length. If a section earns nothing, say so.

## Report format

Frontmatter first, exactly:

---
title: Prompt review of <file name>
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

Then numbered suggestions. Each one:

**N. <one-line claim>** (line X to Y)
Current: <quote, short>
Proposed: <the replacement text, or "delete">
Why: <one to three sentences>

Rank by impact, highest first. Keep is a valid verdict for a section; say
so briefly rather than inventing an edit. End with a three-line summary:
keep / change / delete counts, and the single most important change.

## Voice rules for your report

No em dashes. No en dashes. No "it's important to note", "delve", "dive
into", "not only X but also Y", "unlock", "seamless", "elevate", "in
today's". Short sentences. Name the line and the file.
