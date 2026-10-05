---
name: djinn-status
description: Print what is still open in a djinn audit, across every review round, from its findings.json, as a few lines of counts; ask for full for every finding. Read only; writes nothing and appends no ledger line. Name an audit folder, or none for the most recent audit under audits/.
---

<!-- Written by Claude Opus 5.5 for Donald, 2026-10-05. Codex adapter of
plugins/djinn/commands/status.md at djinn 2.4.0; that file is the spec.
Status: tested with codex exec, not reviewed. -->

# Djinn Status

Answer one question: what is still open in this audit, across every round?
A script does the whole job. It reads `findings.json` and prints a short
report: the audit, round and verdict, the open counts, the blocking ids, and
where the full list is. Your part is to run it once and show what it prints.

## Run it

From the repo root (the folder that holds `audits/`), run exactly one
command:

```
node <this skill's folder>/scripts/status.mjs [--full] [<audit-folder>]
```

`<this skill's folder>` is the folder that holds this `SKILL.md`. Pass the
audit folder the request names, for example
`audits/2026-09-12-1402-standard`. If the request names none, pass nothing;
the script picks the most recent audit and its first line says which.

Pass `--full` only when the request asks for the full list, every finding,
or the titles. Then the script prints one row per open finding with its
whole title, by the rules in djinn's `commands/status.md`, which runs long.

`$djinn-status` with no other text means: no folder, no `--full`. Run it;
do not ask what the user wants.

## Show it

Print the script's output exactly as it came, in a code block, and nothing
before it. Do not summarize it, reorder it, shorten it or add to it.

## Rules

- One command, the one above. Do not open `findings.json`, `synthesis.md`
  or any agent report yourself, before or after. The script is the reader.
- If the script prints a message instead of a report (no synthesis, no
  findings.json, not a folder), show that message and stop. Do not go
  looking for the findings another way. A guess presented as status is
  worse than no status.
- If `node` is missing or the script exits 2, show its error and stop.
- Read only. Write nothing, append nothing to `audits/LEDGER.md`. Spawn no
  agent.

## Runtime notes

Codex adapter of `plugins/djinn/commands/status.md`. `$ARGUMENTS` is the
folder named in the request. `allowed-tools: Read, Glob` becomes the one
command above. The Claude command has the model format the report; here
`scripts/status.mjs` does, so the session never loads the 40 KB JSON. The
short default is a Codex-only change, Donald's call on 2026-10-05; `--full`
is the Claude command's output. Tests:
`adapters/codex/tests/status.test.mjs`. Spawns no agent, so it
carries no model line.
