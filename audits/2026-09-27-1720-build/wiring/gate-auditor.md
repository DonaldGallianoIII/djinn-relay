---
title: wiring note for gate-auditor, phase 2 writer input
author: Claude Opus 5.5 (phase 1 drafter, gate-auditor)
date: 2026-09-27
status: agent output, not yet reviewed
---

Agent file: `plugins/djinn/agents/gate-auditor.md`. Candidate C2, REC-3 of
`audits/2026-09-27-1655-ideas/agents/gap-hunter.md`.

## 1. Scope membership

- **full**: add gate-auditor to the Step 7 executing agents.
- **custom list**: valid by name, like any agent file.
- **ideas**: never.

`commands/review.md:37` to `:40` (the full list) becomes:

```
- **full**: known-bugchecker, format-reviewer, bugs-reviewer,
  integration-reviewer, security-reviewer, perf-reviewer,
  multiuser-reviewer, breaker, pipe-connector, gap-hunter, then the
  executing wave (gate-auditor, devils-advocate, test-strategist), then
  synthesis, then consolidator
```

## 2. Conditional trigger

Add to the conditional list at `commands/review.md:44` to `:49` (every scope
except ideas):

```
- **gate-auditor** runs when the fence contains any path matching:
  `tests/`, `test/`, `__tests__/`, `qa/`, `*.test.*`, `*.spec.*`,
  `tools/check*`, `tools/bench*`; a file in `deps.manifests` (the agent
  checks whether the scripts block itself changed and says so); a test
  runner config (`jest.config.*`, `vitest.config.*`, `playwright.config.*`,
  `.mocharc*`, `karma.conf.*`, `pytest.ini`, `tox.ini`, `setup.cfg`,
  `pyproject.toml`, `conftest.py`); a CI definition (`.github/workflows/*`,
  `azure-pipelines.yml`, `.gitlab-ci.yml`, `.circleci/*`); or any file named
  in the config's `gates[].cmd` or `gates[].evidence`.
```

## 3. Step 7 placement and what the dispatch pastes

Serial, after dependency-reviewer and BEFORE devils-advocate and
test-strategist, so both can cite its table rows instead of re-deriving
them. New Step 7 bullet in `commands/review.md` (currently `:160` to `:169`):

```
- **gate-auditor** (full scope, if triggered, or a custom list naming it):
  the fence block, plus the config's `gates` block verbatim (or "gates:
  none"), `deps.manifests`, the wave 1 findings list (agent name plus one
  line per finding), and known-bugchecker's flags. In round 2 and later,
  the round number and the prior synthesis path. Its findings join the list
  handed to devils-advocate and test-strategist.
```

The existing devils-advocate and test-strategist bullet then says "the wave
1 findings list and gate-auditor's findings".

Step 1 of `commands/review.md` (`:18` to `:20`) adds `gates` to the keys it
takes. `commands/dispatch.md`, wherever it runs the next round's agents,
spawns gate-auditor under the same trigger when a fixer's work set matches
it.

`relay.md:133` full row: "then gate-auditor, devils-advocate and
test-strategist serially". `README.md:113` scope line unchanged in wording;
add gate-auditor wherever README lists the full agents or the conditional
agents.

## 4. New config key: `gates` (optional)

Meaning: the project's own list of checks, where each runs, what it guards,
and where a clean run is recorded. Without it the agent builds the inventory
from the scripts block, CI files, runner config and conventions, and files a
REC to write it down.

Add to `templates/config.yaml` after `deps` and to `CONTRACTS.md` section 5:

```yaml
# Checks and where their passes are recorded, for gate-auditor. Optional.
# runs: gate (inside test_cmd or the check script), ci, or beside the gate
# (run by a human). evidence: a stamp file the check writes on a clean run,
# a ledger or doc that records runs, or a reference folder.
gates: []
# e.g.
#  - name: qa:viewer
#    cmd: npm run qa:viewer
#    runs: beside the gate
#    guards: [src/viewer/, src/sim/, tools/serve.mjs]
#    evidence: qa/bot/reference/viewer/
```

## 5. CONTRACTS.md changes this agent depends on

Section 9, `CONTRACTS.md:237`, replace the opening of the paragraph with:

"Agents that need to run something (dependency-reviewer, devils-advocate,
test-strategist, gate-auditor): add `Bash`, read-only use only."

and append to that paragraph:

"gate-auditor's Bash is narrower still: `git log`, `git ls-files`, `git
diff --name-only HEAD`, and grep. It never runs a test, a bot, a bench or a
build, and never regenerates a reference."

Section 1, after the rule that begins "multiuser-reviewer emits DEBT by
default" (`CONTRACTS.md:42` to `:45`), add:

"gate-auditor files LOW and MEDIUM on checks that exist: a check that
cannot fail is at least MEDIUM when it guards a claim the project relies
on, cited by file:line. Its STALE and UNKNOWN gate table rows are not
findings by themselves."

Section 5: the `gates` key as in section 4 above.

## 6. Neighbor lines to change so lanes do not overlap

- `plugins/djinn/agents/test-strategist.md:18`, new text:
  "2. Test files that reference a changed module by import or by name,
  found with Grep. Not the whole test tree. Bots, benches and scripts that
  guard a page or a folder by URL or path are gate-auditor's."
- `plugins/djinn/agents/test-strategist.md:87`, new text:
  "- Is it marked slow, skipped, or unvalidated, so it never actually runs?
  If gate-auditor already filed it, cite its finding id and write only the
  replacement spec."
- `plugins/djinn/agents/test-strategist.md:94`, new text:
  "- What runs only by hand, and is there a release gate that enforces it?
  Whether it has passed since its paths changed is gate-auditor's table;
  cite the row."
- `plugins/djinn/agents/devils-advocate.md:49`, new text:
  "Only when the weak check is the success signal for THIS change's stated
  goal. General test-suite weakness belongs to test-strategist; a check that
  cannot fail, never runs, or has not passed since its paths changed belongs
  to gate-auditor, whose findings are pasted into your prompt. Cite its row."
- `plugins/djinn/agents/devils-advocate.md:15`, new text:
  "- The findings the wave 1 reviewers and gate-auditor already filed."
- `plugins/djinn/agents/bugs-reviewer.md`, "Not your job" list after `:71`,
  add:
  "- A wrong guard, forced pass or skipped check inside a test, bot, bench
  or check script: gate-auditor. Wrong results in shipped code stay yours."

## 7. Not done here

No edits made outside `plugins/djinn/agents/gate-auditor.md` and this note.
Nothing was run.
