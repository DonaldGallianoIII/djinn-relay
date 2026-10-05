---
name: view
description: Open this repo's djinn audits, and djinn's guide, in the browser as a styled site, built fresh into a cache folder. Read only for the repo. Usage - /djinn:view [<audit-folder> | guide]. With a folder, opens that audit's page; with guide, the guide and the agent catalog; without, the index of every audit.
allowed-tools: Bash
---

# Djinn View

Run exactly one command from the repo root:

```
node ${CLAUDE_PLUGIN_ROOT}/scripts/view.mjs $ARGUMENTS --open
```

Show its output lines as they are, and nothing else. The script builds
the pages into a cache folder outside the repo (it empties that folder
first, and only that folder), opens the landing page in the browser, and
prints a `file://` link the owner can open again later.

If it prints `no audits/ folder here` or `no audit folder ...`, show that
line and stop. Do not look for audits elsewhere.

## Rules

- One command. Read nothing yourself, write nothing in the repo.
- Never print a report, `synthesis.md` or `findings.json`: the page is how
  the owner reads them.

## Runtime notes

Claude Code specific: `allowed-tools`, `$ARGUMENTS`,
`${CLAUDE_PLUGIN_ROOT}`. The script itself is plain Node with no packages,
so another runtime runs the same file. Spawns no agent, so it carries no
model line.
