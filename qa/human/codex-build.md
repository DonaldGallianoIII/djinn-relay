---
title: QA, Codex adapter slice 2, generated agent copies
author: Claude Opus 5.5, for Donald
date: 2026-10-05
status: steps 1 to 5 run by Claude on 2026-10-05, all passed. Not yet run by a person.
---

# Codex adapter slice 2: generated agent copies

Checks that the Codex plugin's copies of the agents and CONTRACTS.md come
from `plugins/djinn`, and that a stale copy cannot be pushed. Run from
`~/code/personal/djinn-relay` on `Claude-Development-djinn-relay-codex`.

## Steps

1. Run `node adapters/codex/build.mjs --check`.
   You should see `codex build: up to date, 32 files`.

2. Run `diff <(tail -n +4 adapters/codex/plugin/agents/synthesis.md) plugins/djinn/agents/synthesis.md`.
   No output: the copy is the source byte for byte under its 3-line marker.

3. Add a blank line to the end of `plugins/djinn/agents/fixer.md`, then run
   step 1 again. You should see
   `stale: adapters/codex/plugin/agents/fixer.md` and exit code 1
   (`echo $?`).

4. Run `PRIVATE_CHECK_ALLOW_MISSING=1 bash tools/pre-push.sh </dev/null`,
   then `echo $?`. The last lines name the stale copy and say
   `pre-push: FAIL, the push is refused`, and the exit code is 1.

5. Undo step 3 with `git checkout plugins/djinn/agents/fixer.md`, run step
   1 again: up to date. Run step 4 again: exit code 0.

## Notes

- `PRIVATE_CHECK_ALLOW_MISSING=1` is only there because this machine has no
  `local/private-patterns.txt`. With the list in place, drop it.
- After editing any file in `plugins/djinn/agents/` or `CONTRACTS.md`, run
  `node adapters/codex/build.mjs` and commit the copies with the source.
