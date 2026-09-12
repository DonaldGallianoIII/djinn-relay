---
name: review
description: Run the Djinn review relay audit phase. Spawns review agents in parallel, synthesizes findings, writes a timestamped audit folder, and STOPS. Does NOT auto-fix — use /djinn:brief + /djinn:dispatch for that. Usage - /djinn:review [scope] where scope is "full", "standard" (default), "quick", "perf", or "ideas".
allowed-tools: Read, Grep, Glob, Agent, Bash, Write
---

# Djinn Review Relay — Audit Phase

You are orchestrating the audit phase of the relay. Your output is a folder of markdown reports — **not fixes**. No code is modified. No fixers are spawned. Stop at synthesis.

## Step 1: Determine scope

Based on $ARGUMENTS (default: `standard`):

- **full** — known-bugchecker, format-reviewer, bugs-reviewer, integration-reviewer, security-reviewer, perf-reviewer, multiuser-reviewer, breaker, pipe-connector, gap-hunter, synthesis (+ consolidator post-synthesis)
- **standard** — known-bugchecker, format-reviewer, bugs-reviewer, integration-reviewer, security-reviewer, perf-reviewer, synthesis
- **quick** — known-bugchecker, bugs-reviewer, integration-reviewer, synthesis
- **perf** — known-bugchecker, perf-reviewer, breaker, synthesis
- **ideas** — gap-hunter (standalone, no synthesis)

If $ARGUMENTS is something else (e.g. a custom agent list), parse it flexibly.

## Step 2: Create audit folder

Compute timestamp via `date +%Y-%m-%d-%H%M`.

Create directories:
- `audits/<timestamp>-<scope>/agents/`

Record this as `AUDIT_DIR` for all subsequent steps.

## Step 3: Identify changes

- Run `git diff HEAD~1 --name-only` for changed files (or `git diff <base>..HEAD --name-only` if user supplied a base ref)
- Run `git diff HEAD~1` for the full patch
- Save patch to `<AUDIT_DIR>/input-diff.patch`
- Record the base commit SHA in a small `<AUDIT_DIR>/context.md` so Round 2 has a reference point:
  ```
  base_commit: <sha>
  scope: <scope>
  changed_files: <list>
  date: <iso>
  ```

If there are no changes to review, stop and tell the user.

## Step 4: Spawn known-bugchecker (always first)

Use the Agent tool with `subagent_type: "known-bugchecker"`. Prompt includes:
- The list of changed files
- One-line summary of the changes (from the diff)
- Instruction: read the project's CLAUDE.md and the bugs_to_avoid index
- Instruction: write report to `<AUDIT_DIR>/agents/known-bugchecker.md`

Wait for return. Note any patterns it flagged.

## Step 5: Spawn remaining review agents in parallel

For each agent in the scope (minus known-bugchecker, minus synthesis, minus consolidator):

Use Agent tool with the agent's `subagent_type`. Send ALL of them in a single message with multiple Agent tool-use blocks for parallelism.

Each agent's prompt:
- List of changed files
- One-line summary of changes
- Path to `<AUDIT_DIR>/input-diff.patch` for reference
- Note: "known-bugchecker flagged: <list or 'none'>. Focus on issues it did not catch."
- Instruction: read CLAUDE.md and bugs_to_avoid.md
- Instruction: write report to `<AUDIT_DIR>/agents/<agent-name>.md`

Wait for all to return.

## Step 6: Synthesis (skip for ideas scope)

If scope is NOT `ideas`:

Spawn synthesis via Agent tool with `subagent_type: "synthesis"`. Prompt:
- List of all agent reports under `<AUDIT_DIR>/agents/`
- Instruction: deduplicate, rank by severity, resolve conflicts, produce ship verdict
- Instruction: write to `<AUDIT_DIR>/synthesis.md`

Wait for return.

If scope IS `ideas`: skip synthesis. gap-hunter's output is standalone creative work.

## Step 7: Consolidator (full scope only)

If scope is `full`:

Spawn consolidator via Agent tool. It reads the synthesis and proposes additions to `bugs_to_avoid.md` for any new generalizable patterns. Write output to `<AUDIT_DIR>/consolidator.md`.

Do NOT automatically apply consolidator's suggestions to `bugs_to_avoid.md` — the user reviews and decides.

## Step 8: Report to user

Tell the user:
- `AUDIT_DIR` path
- Ship verdict (from synthesis, or N/A for ideas)
- Count: HIGH / MEDIUM / LOW / FUTURE findings
- Suggested next step based on verdict:

  - **SHIP** → "No blocking issues. Audit archived at `<AUDIT_DIR>`. Done."
  - **FIX THEN SHIP** → "Review `<AUDIT_DIR>/synthesis.md` to deliberate. For each fix you want to execute: `/djinn:brief <AUDIT_DIR> <finding-id>`. Then `/djinn:dispatch <brief-path>`."
  - **ESCALATE** → "Agents disagreed or findings are ambiguous. Open `<AUDIT_DIR>/synthesis.md` — the 'Conflicts Resolved' section is your starting point."
  - **ideas scope** → "gap-hunter output at `<AUDIT_DIR>/agents/gap-hunter.md` — skim tier 1, pick what to act on."

## Rules

- Do NOT spawn fixers. Do NOT modify code. This command is audit-only.
- All agent reports go to `<AUDIT_DIR>/agents/<name>.md` — never to the repo root or random locations.
- If an agent fails to return, note it in the synthesis step (coverage gap).
- Do NOT overwrite an existing `audits/<timestamp>-<scope>/` folder — if by some chance the timestamp collides, append `-2` / `-3` suffix.
