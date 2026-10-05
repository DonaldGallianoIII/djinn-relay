---
name: djinn-view
description: Open this repo's djinn audits, and djinn's guide with every agent's prompt, in the browser as a styled site built fresh into a cache folder outside the repo. Name an audit folder for that audit's page, guide for the guide, or none for the index of every audit.
---

<!-- Written by Claude Opus 5.5 for Donald, 2026-10-05. Codex adapter of
plugins/djinn/commands/view.md. Status: tested with node, not yet run from
a Codex session, not reviewed. -->

# Djinn View

From the repo root (the folder that holds `audits/`), run exactly one
command:

```
node <plugin root>/scripts/view.mjs [<audit-folder> | guide] --open
```

`<plugin root>` is the folder two levels above this `SKILL.md`; the script
is the generated copy of djinn's own viewer. Pass the audit folder the
request names, or `guide` when the request asks for the guide, the agents
or the prompts; pass nothing for the index. `$djinn-view` with no other
text means the index (the guide, when the repo has no audits yet).

Show the script's output lines as they are, and nothing else. It prints a
`file://` link the owner can open again later.

The cache folder is outside the repo, so the sandbox may refuse the write
or the browser launch. If it does, ask the owner to approve exactly this
one command, and nothing broader.

## Rules

- One command. Read nothing yourself, write nothing in the repo.
- If the script prints `no audit folder ...`, show that line and stop.
- Never print a report, `synthesis.md` or `findings.json`: the page is how
  the owner reads them.
