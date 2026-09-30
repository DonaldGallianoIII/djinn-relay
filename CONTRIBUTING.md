---
title: working on this repo
author: Claude Opus 5.5 (round 3 fix of the /djinn:learn review, audits/2026-09-29-1654-custom)
date: 2026-09-29
status: agent output, not yet reviewed
---

This repo is public. The plugin's README (`plugins/djinn/README.md`) is
for people who install the plugin; this file is for a clone you work in.

## Before your first commit in a clone

1. **Make the private pattern list.** `local/private-patterns.txt`, one
   extended regex per line (`grep -E`, matched case insensitive), `#` for
   comments. `local/` is gitignored, so the words never enter the repo.
   Copy it from your other clone; there is no template on purpose.
2. **Install the push hook.** From the repo root:
   `git config core.hooksPath tools/hooks`. The hook
   (`tools/hooks/pre-push`, which runs `tools/pre-push.sh`) reads the refs
   git is about to push and checks every added line, added path and commit
   message of the pushed range, the tree at the pushed tip, and the working
   tree. Any hit refuses the push, and nothing is sent.
3. **Run the gate.** `.djinn/config.yaml`'s `build_cmd`: the voice check,
   `tools/check-private.sh`, then `qa/bot/private-guards.sh`, which drives
   the check and the hook in scratch repos.

## What the check says

- `private check: clean`: all four passes ran and found nothing.
- `private check: FAIL, local/private-patterns.txt does not exist`: the
  list is missing, so the private words were not checked, and the check
  fails. Make the list (step 1).
- `private check: clean in ..., except private words NOT CHECKED`: you set
  `PRIVATE_CHECK_ALLOW_MISSING=1`, so the other passes ran and the word pass
  did not. Never push on that line.
- A hit names the file (and in history mode the commit), never the word.

## A word already committed

Scrubbing the file is not enough once a commit that is not yet pushed
carries the word: the push sends that commit too, and the hook refuses it.
Collapse the unpushed range onto the last pushed commit (or rewrite it),
run `bash tools/check-private.sh --history <pushed>..HEAD`, and push only
when it reads clean. A word in a commit that is already public stays
fetchable by its sha even after a force push; only deleting and recreating
the repository, or a GitHub Support purge, removes it.
