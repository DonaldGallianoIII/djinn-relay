---
name: djinn-brief
description: Write fix briefs for a djinn audit, the contract a fixer agent works to (the files it may touch, what done means): one finding, or a selection (all highs, all blocking, all, with recs) as group briefs of up to 20 findings, one fixer each. Writes brief files only; changes no code. Usage - $djinn-brief <audit-folder> <finding-id | selection> [one each] [--max <n>].
---

<!-- Written by Claude Opus 5.5 for Donald, 2026-10-05. Codex adapter of
plugins/djinn/commands/brief.md. Status: not yet run from a Codex session,
not reviewed. -->

# Djinn Brief on Codex

Follow `<plugin root>/commands/brief.md` from Step 1 to Step 8, exactly.
`<plugin root>` is the folder two levels above this `SKILL.md`; it holds
`commands/`, `templates/` and `CONTRACTS.md` (read it first, as brief.md
says).

| `brief.md` says | On Codex |
|---|---|
| `$ARGUMENTS` | the audit folder and the finding id or selection after `$djinn-brief` |
| `templates/fix-brief-group.md` | `<plugin root>/templates/fix-brief-group.md` |
| `${CLAUDE_PLUGIN_ROOT}` | `<plugin root>` |
| `allowed-tools` | read with `cat`, `sed -n` or `rg`; write the brief with `apply_patch` or a shell heredoc; nothing else |
| `/djinn:dispatch` in the report | `$djinn-dispatch` |
| `author: Claude ...` in the brief's header | `author: Codex (djinn-brief)` |

Show only Step 8's report. Never print the finding's full text, the
synthesis or the brief: the owner opens the brief file, or
`$djinn-view <audit-folder>`.
