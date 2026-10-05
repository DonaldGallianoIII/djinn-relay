---
title: QA, Codex adapter slice 1, djinn-status
author: Claude Opus 5.5, for Donald
date: 2026-10-05
status: steps 2 to 7 run by Claude on 2026-10-05 with `codex exec` in a throwaway CODEX_HOME, all passed. Not yet run by a person in the interactive TUI.
---

# Codex adapter slice 1: djinn-status

Checks that Codex can install the adapter from this repo and that
`$djinn-status` prints the same report `/djinn:status` would. Claude Code is
not touched by any step.

Steps 1 to 4 change your real `~/.codex/config.toml`: they add one
marketplace and one plugin. Step 8 removes both.

## Steps

1. In a terminal, `cd ~/code/personal/djinn-relay` and
   `git checkout Claude-Development-djinn-relay-codex`.

2. Run `codex plugin marketplace add ~/code/personal/djinn-relay`.
   You should see `Added marketplace djinn-relay` and an installed root of
   this repo.

3. Run `codex plugin list`.
   Under `Marketplace djinn-relay` you should see exactly one row,
   `djinn-codex@djinn-relay`, status `not installed`. No plain `djinn` row:
   Codex does not pick up the Claude plugin.

4. Run `codex plugin add djinn-codex@djinn-relay`, then `codex plugin list`
   again. The row should now read `installed, enabled`, version `0.1.0`.

5. Still in the repo, start `codex` and type
   `Use $djinn-status with no folder named.`
   You should see, as the first line:
   `djinn status: audits/2026-09-29-1654-custom, round 3, verdict FIX THEN SHIP`
   then `open: HIGH 0, MEDIUM 10, LOW 25`, then 35 rows: ten MEDIUM rows
   `R3 MEDIUM-1` to `R3 MEDIUM-10`, then `R2 LOW-6` ending in
   `[not resolved]`, then `R3 LOW-1` to `R3 LOW-24`. Then a
   `resolved this round` line, a `blocking` line listing the ten MEDIUMs,
   and ten `raised in:` lines.

6. Type `Use $djinn-status on audits/2026-09-25-1902-custom`.
   That folder has a synthesis but no findings.json, so you should see the
   message that starts `audits/2026-09-25-1902-custom has no findings.json`
   and points you at its `synthesis.md`. No table.

7. Check nothing was written: `git status` shows the same as before step 5.

8. Clean up, if you are done testing:
   `codex plugin remove djinn-codex@djinn-relay`, then
   `codex plugin marketplace remove djinn-relay`.

## After editing the adapter

Codex runs a cached copy under `~/.codex/plugins/cache/`, not the repo. Run
`codex plugin add djinn-codex@djinn-relay` again after any edit; it refreshes
the cache without a version bump. Start a new Codex session to see it.

## Known, not a Codex bug

The `raised in:` lines in step 5 name `audits/2026-09-29-1654-custom/round-3`,
which does not exist. The Claude command's own rule produces the same path;
see the note in `adapters/codex/PLAN.md`.
