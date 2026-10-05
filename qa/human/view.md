---
title: QA, the djinn audit viewer
author: Claude Opus 5.5, for Donald
date: 2026-10-05
status: steps 1 to 6 run by Claude on 2026-10-05 with node and a headless browser (screenshots, color and grayscale). Not yet run by a person, and /djinn:view and $djinn-view not yet run from a live session.
---

# The audit viewer

Checks `/djinn:view` (Claude) and `$djinn-view` (Codex) against the scratch
repo `~/scratch/djinn-codex-test`, which holds four Codex audits. For
Claude, djinn 2.5.0 must be installed; for Codex, run
`codex plugin add djinn-codex@djinn-relay` first.

## Steps

1. In a terminal: `cd ~/scratch/djinn-codex-test`, then
   `node ~/code/personal/djinn-relay/plugins/djinn/scripts/view.mjs --open`.
   Your browser opens "djinn audits": four rows, newest first, each saying
   `Codex gpt-6.1-sol medium` under Ran on and `! FIX THEN SHIP` under
   Outcome. The terminal shows one `djinn view:` line with a `file://` link.

2. Click `2026-10-05-1029-standard`. At the top: `! FIX THEN SHIP`, then
   `▲ HIGH 1 open`, `◆ MEDIUM 1 open`, `● LOW 0 open`, `■ DEBT 0`, `○ REC 0`.
   Every tier shows its word and its shape. Color is never the only cue.

3. Under Open across rounds, untick `▲ HIGH`. The HIGH row disappears and
   the counter reads `1 shown`. Tick it again. Type `cart.js:11` in Search:
   only MEDIUM-1 stays.

4. Click `HIGH-1` in the table. The page jumps to HIGH-1 in the synthesis,
   outlined in cyan. Its `Mechanism:` and `Traced:` lines each start on a
   line of their own.

5. Open `agents/security-reviewer` under Agent reports. It reads as a
   formatted report, not raw markdown. Open `runtime.md` under Run details:
   `agents model: gpt-6.1-sol`.

6. Check nothing landed in the repo: `git status --short` still shows only
   `?? audits/`. The pages live under `~/.cache/djinn-view/`.

7. In Claude Code, in the same repo: `/djinn:view audits/2026-10-05-1001-quick`.
   The browser opens straight on that audit.

8. In Codex, in the same repo: `$djinn-view`. One command runs and the
   index opens. If Codex asks to approve the command (the cache folder is
   outside the repo), approve that one command.

9. Run `$djinn-status` in Codex: its last line reads
   `read it in a browser: $djinn-view audits/2026-10-05-1029-standard`.
