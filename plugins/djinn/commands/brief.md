---
name: brief
description: Generate a fix brief skeleton from an audit finding. Usage - /djinn:brief <audit-folder> <finding-id> where audit-folder is like audits/2026-04-20-1530-standard and finding-id matches an entry in the synthesis (e.g. HIGH-1, MEDIUM-3). Creates audits/<folder>/fixes/<id>-<slug>.md pre-filled from the finding. Human + orchestrator fill in WHY (deliberation context) and confirm work_set before dispatching.
allowed-tools: Read, Grep, Glob, Write, Bash
---

# Djinn Fix Brief Generator

You are creating a fix brief skeleton for a specific audit finding so it can be dispatched to a fixer.

## Step 1: Parse arguments

$ARGUMENTS contains `<audit-folder> <finding-id>`.
- audit-folder: path like `audits/2026-04-20-1530-standard`
- finding-id: identifier in the synthesis (e.g. `HIGH-1`, `MEDIUM-3`) or the synthesis list number

If arguments are missing or ambiguous, ask the user to clarify. Do not guess.

## Step 2: Read the synthesis and the finding

- Read `<audit-folder>/synthesis.md`
- Locate the finding matching `<finding-id>`
- Extract: file:line reference, severity, one-line description, originating agent(s)
- Read those agent report files under `<audit-folder>/agents/` to get the full context around the finding

## Step 3: Check for pipe-connector analysis

If `<audit-folder>/agents/pipe-connector.md` exists:
- Read it
- If it covers the file(s) involved in this finding, extract:
  - Full list of importers / callers → feeds `work_set.files`
  - Symbols declared / renamed → feeds `symbols_renamed` / `symbols_touched`
  - Observable emitters/subscribers affected
- Pre-fill work_set confidently

If pipe-connector was not run, or doesn't cover this file:
- Grep the repo for importers of the affected file
- Grep for callers of any symbol the finding mentions renaming/changing
- Pre-fill work_set with your best inference, and mark uncertain entries with a `# UNCERTAIN` trailing comment per line
- Flag to the user in your final message: "pipe-connector was not run for this file — work_set is inferred, please verify before dispatch"

## Step 4: Load the template

Read `ReviewRelay/templates/fix-brief.md`.

## Step 5: Fill the skeleton

Substitute placeholders:

- `{{FIX_ID}}` → `<finding-id>-<slug>` where slug is 3-5 words from the finding description, kebab-case (e.g. `HIGH-1-rename-madeup-callers`)
- `{{AUDIT_FILE}}` → path to the specific agent report that raised this (the most specific one)
- `{{SEVERITY}}` → from synthesis (HIGH / MEDIUM / LOW / CRASH / CORRUPT)
- `{{ISO_DATE}}` → today in `YYYY-MM-DD` format
- `{{AGENT_NAME}}` → name of the originating agent
- `{{QUOTED_FINDING}}` → exact quoted text from the agent's finding
- `{{SYMPTOM}}` → one-line summary of the observable symptom
- `{{SYNTHESIS_FILE}}` → `<audit-folder>/synthesis.md`
- `{{PIPE_CONNECTOR_FILE_OR_NONE}}` → path if exists, else "none (inferred)"
- `{{FILE_PATHS}}` → relevant files the fixer will likely need to read for context (not just edit)

For **WHAT**: draft from the finding description. Be specific — name files and symbols, not "this" or "the function".

For **WHY**: keep the quoted finding, keep the TODO marker. **Do not speculate on deliberation context.** That's the human's job. Your WHY section should look like:

```
From bugs-reviewer: "HeightMap.madeup() shadows a Babylon built-in, causing ambiguous autocomplete."

**TODO (deliberation context):** _<fill in what was decided with the user>_

This fix addresses the name-shadowing symptom. Pipe-connector shows 4 external callers across Toolbar.ts and DebugOverlay.ts — rename must cascade to all of them.
```

For **SUCCESS CRITERIA**: derive testable checkboxes from WHAT. Always include:
- `npm run build` passes
- No lingering references to removed/renamed symbols (grep-checkable)

For **REFERENCES**: list the actual paths, not placeholders.

For **NOTES FOR FIXER**: keep as-is from template (boilerplate reminders about the work-set guard).

## Step 6: Write the brief

Ensure `<audit-folder>/fixes/` exists (`mkdir -p`).

Write to `<audit-folder>/fixes/<finding-id>-<slug>.md`.

If a brief with the same filename already exists: do NOT overwrite. Report to user that the brief already exists and ask whether to append a suffix, overwrite, or abort.

## Step 7: Report

Tell the user:
- Path of the brief just created
- Which fields need human input (always: the TODO in WHY; sometimes: work_set if pipe-connector was missing)
- One-line suggestion of next step:
  - If work_set is confident: "Fill in WHY, then `/djinn:dispatch <brief-path>`"
  - If work_set is inferred: "Verify work_set against the actual importers, fill in WHY, then `/djinn:dispatch <brief-path>`"

## Rules

- Do NOT dispatch. Dispatch is a separate command (`/djinn:dispatch`).
- Do NOT fill WHY's deliberation context with speculation. Structural draft only — the TODO stays.
- If the same underlying fix shows up under two synthesis findings, flag it and suggest merging into one brief rather than generating two.
- Do NOT modify any code. Briefs only describe fixes — they don't execute them.
