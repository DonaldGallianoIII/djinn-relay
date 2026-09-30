---
title: integration-reviewer report, audits/2026-09-25-1902-custom
author: Claude Opus 5.5 (integration-reviewer)
date: 2026-09-25
status: audit finding, not yet deliberated
---

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/status.md:75` The status command assumes the verdict reflects the open list. Synthesis computes the verdict from this round's Fix List only. So a correct findings.json gets flagged as corrupt, and the user is told to re-run synthesis, which changes nothing.
Mechanism: A partial fix is marked NOT RESOLVED in the status table (`synthesis.md:74`). CONTRACTS section 12 then keeps it in `open` with `status: "not-resolved"` (`CONTRACTS.md:323 to 325`). But the verdict rule (`synthesis.md:179`) counts only HIGH and MEDIUM "after normalization", meaning Fix List entries, and status table rows are not Fix List entries. Example: round 2 has no new findings and one NOT RESOLVED MEDIUM. It writes verdict SHIP with a blocking entry in `open`. `status.md:76` claims "a blocking entry means FIX THEN SHIP", and `status.md:82 to 87` prints "disagrees with its open list; trust synthesis.md and re-run the round's synthesis". A re-run applies the same rule and produces the same file. Meanwhile `dispatch.md:275` tells the user "SHIP: done. Nothing blocks a merge", and `/djinn:status` for the same round says `blocking: MEDIUM-1`. The synthesis self-check (`synthesis.md:166 to 170`) compares counts only, never verdict against `open`, so nothing upstream catches this.
Traced: `synthesis.md:74` (partial fix goes to NOT RESOLVED) to `CONTRACTS.md:323 to 325` (carried as not-resolved) to `synthesis.md:176 to 181` (verdict from Fix List) to consumer `status.md:75 to 87` (blocking list plus the disagreement note) and consumer `dispatch.md:267, 275` (SHIP next step).

MEDIUM-2. `plugins/djinn/commands/status.md:65` Status prints ids by `(round, id)`, but no command can act on a finding carried over from an earlier round. `/djinn:brief` takes a bare `<TIER>-<n>` and looks it up in one folder's Fix List, so a carried finding either cannot be briefed or gets briefed as a different finding with the same id.
Mechanism: A round 1 MEDIUM-3 marked NOT RESOLVED in round 2 stays in `open` and prints bare as `MEDIUM-3 [not resolved]`. The round 2 next step (`dispatch.md:276 to 277`) says `/djinn:brief <audit-folder>/round-<n> <id>`. `brief.md:31 to 32` looks for an exact id match in `round-2/synthesis.md`, and that Fix List holds only round 2 findings. So the lookup stops, or, if round 2 has its own MEDIUM-3, it silently briefs the wrong finding. That is the id collision CONTRACTS section 12 (`CONTRACTS.md:334 to 336`) says a reader must never make. Passing the displayed form `R2 MEDIUM-3` does not parse: `brief.md:17 to 22` expects exactly two arguments. Briefing from the audit root instead hits `brief.md:121 to 123` (the landed brief refuses overwrite, so it offers a suffix). Dispatch then computes round 2 again from that path (`dispatch.md:178 to 181`) and rewrites `round-2/synthesis.md` and `round-2/findings.json`, so the first round 2's findings drop out of `open`. And even if a later round fixed the finding, round 3's table has rows only for "prior-round" findings (`synthesis.md:70 to 71`), so the round 1 entry is never re-checked. It keeps its status (`CONTRACTS.md:325 to 326`) and stays blocking in every later `/djinn:status`.
Traced: `status.md:65 to 67, 75` (display ids) to `dispatch.md:276` (next-step instruction) to consumer `brief.md:17 to 22, 31 to 32` (bare id, single Fix List), and `dispatch.md:178` (round from brief path) to `synthesis.md:70 to 71` (table scope).

### LOW
LOW-1. `plugins/djinn/commands/dispatch.md:221` In round 2 and later, the findings.json-only retry does not give synthesis the prior round's findings.json, and synthesis needs that file to build `open`.
Mechanism: Dispatch says to retry "as `/djinn:review` step 8 does". That prompt (`review.md:189 to 190`) names only `synthesis.md`. Synthesis may read only the files it is handed or that reviewers cite (`synthesis.md:30 to 31`), so it cannot follow `synthesis.md:155 to 157` ("start from the prior round's findings.json open list"). It will build `open` from this round alone and silently drop carried entries, which contradicts `synthesis.md:194 to 195`. Also, the final report line at `dispatch.md:270` reads counts "from round-<n>/findings.json" and has no wording for the file being missing, unlike `review.md:232`. Trigger: synthesis skips findings.json on its first try in a round of 2 or more.

LOW-2. `plugins/djinn/agents/synthesis.md:158` In round 3, rebuilding the open list from prose loses round 1 LOW findings that were never fixed.
Mechanism: The rebuild reads the prior `synthesis.md` Fix List and status table (`CONTRACTS.md:329 to 332`). Round 2's Fix List holds only round 2 findings. Its table holds only round 1 HIGH, MEDIUM, and fixed LOW (`synthesis.md:70 to 72`). An unfixed round 1 LOW appears in neither, and the "Open across rounds" line gives only counts, not ids. Trigger: round 2 has no findings.json. That happens if the retry failed, or if round 2 ran on the installed 2.1.0 copy and round 3 runs on 2.2.0, which is likely while the two versions coexist.

LOW-3. `plugins/djinn/agents/synthesis.md:71` The rule for which LOW findings get a status row checks for `fixes/<id>.diff` by bare id. Ids repeat across rounds, so this breaks the `(round, id)` identity from CONTRACTS section 12.
Mechanism: `brief.md:118 to 119` writes briefs and diffs under `<audit-folder>/fixes/`, so the root `fixes/` holds round 1 diffs. `dispatch.md:216` passes "every `fixes/<id>.diff`" with no round scope. In round 3, a round 1 `LOW-1.diff` makes round 2's unrelated LOW-1 look like a landed fix, so it gets a table row and a `prior` record. Needs round 3.

LOW-4. `plugins/djinn/agents/perf-reviewer.md:134` The edited round section still tells perf-reviewer to write its own status table. That contradicts the round prompt, and it now uses the same heading as synthesis's authoritative table.
Mechanism: `dispatch.md:207 to 208` tells every round-n reviewer "Do not re-verify round <n-1> findings; synthesis owns that", and `synthesis.md:76 to 77` repeats it. The changed lines extend the contradiction to round 3. They also adopt the exact heading `## Round <n-1> status` that `synthesis.md:103` uses. The consolidator is told to trust "that round's `## Round <n-1> status` table" (`consolidator.md:44`) and opens everything under the audit folder (`consolidator.md:51`), including `round-<n>/agents/perf-reviewer.md`. "Every round n-1 finding assigned to you" also names an assignment that no command makes.

LOW-5. `plugins/djinn/commands/status.md:19` "Most recent folder under `audits/` by name" can pick the wrong audit.
Mechanism: Folder names are `<timestamp>-<scope>` (`review.md:72 to 73`). Two runs in the same minute sort by scope word, not by time. An ideas-scope folder has no synthesis (`review.md:42`), so a bare `/djinn:status` right after `/djinn:review ideas` prints "has the review finished?", which is false. The fix is to skip folders with no synthesis.md when picking the default.

LOW-6. `.djinn/config.yaml:12` `base_branch` is the branch that is checked out (`.git/HEAD` is `refs/heads/Claude-Development-djinn-relay`), so a plain `/djinn:review` fences only uncommitted work.
Mechanism: `review.md:62` computes `git merge-base <base_branch> HEAD`, which equals HEAD here. `review.md:63` then diffs only the working tree, and after a commit `review.md:66 to 67` reports NO-CHANGES. This audit's own `context.md:8` records that it needed `--base` for exactly this reason. No `main` exists yet (session log), so no better value is available. But the config carries no comment telling the next run to pass `--base`.

LOW-7. `plugins/djinn/agents/synthesis.md:147` "Every section is present even when empty; write `none`" contradicts `synthesis.md:91` ("In round 1, leave out the `## Round <n-1> status` section entirely"). A round 1 synthesis may write `## Round 0 status` / `none`. No consumer breaks on it (`brief.md:31` keys on Fix List ids, `status.md` never reads prose), so this is cosmetic.

### DEBT
DEBT-1. `plugins/djinn/agents/synthesis.md:104` The status table has no round column, and `prior.round` is always inferred as `n-1`. That holds only while the table checks nothing older than the prior round. Any fix to MEDIUM-2 that re-checks carried findings needs a round column in both the table and the `prior` mapping, plus a schemaVersion bump under `CONTRACTS.md:288`.

### REC
REC-1. integration-reviewer: Other reviewers trigger on the literal "Round 2", but dispatch now says "This is round <n>" (`dispatch.md:205`). So in round 3, bugs-reviewer, security-reviewer, integration-reviewer, and known-bugchecker skip their round sections, and bugs-reviewer still uses STILL OPEN where the rest of the relay uses NOT RESOLVED. Only perf-reviewer was updated. Pick one policy (reviewers do not re-verify, per `dispatch.md:207`) and align all five in one commit.

REC-2. integration-reviewer: Add a worked three-round example to CONTRACTS section 12: a round 1 LOW carried unfixed, a round 1 MEDIUM that is NOT RESOLVED in round 2, and id collisions between rounds. Every LOW and MEDIUM above sits on a round 3 path that the current two-round example does not exercise.

## Blast radius
- MEDIUM `plugins/djinn/commands/brief.md:17` Accepts only `<audit-folder> <TIER>-<n>` and one folder's Fix List (`brief.md:31 to 32`), so it cannot address the `(round, id)` findings `/djinn:status` now lists. A carried finding cannot be briefed, or gets briefed as the wrong finding. Traced from `plugins/djinn/commands/status.md:65` and `plugins/djinn/commands/dispatch.md:276`.
- LOW `plugins/djinn/agents/bugs-reviewer.md:94`, `plugins/djinn/agents/security-reviewer.md:131` Round triggers are hard-coded to "Round 2" and never fire in round 3 under the new `This is round <n>` prompt. Pre-existing wording. Filed here only because the change updated perf-reviewer alone (see REC-1). Traced from `plugins/djinn/commands/dispatch.md:205`.

## Checked and Clean
- `plugins/djinn/commands/review.md:220`: the ledger takes H, M, L, D, R "from the synthesis Counts block". The new second line has its own label and only three tiers, so it does not match the five-field ledger shape. No misparse.
- `plugins/djinn/commands/dispatch.md:247`: the round-n ledger counts use the same five-field shape. It is not affected by the "Open across rounds" line.
- `plugins/djinn/commands/dispatch.md:268`: "Resolved: n of m prior HIGH and MEDIUM" still works now that the table includes LOW rows, because the Prior id cell holds the bare id with its tier (`synthesis.md:93`). The orchestrator can filter.
- `plugins/djinn/commands/brief.md:31`: reads the Fix List by exact id. The Fix List shape and id format are unchanged by this diff.
- `plugins/djinn/agents/consolidator.md:44`: the renamed heading matches the dispatch prompt at `dispatch.md:227` and the synthesis template at `synthesis.md:103`. A repo grep found no leftover consumer of the old `Round 1 status` synthesis heading. The only remaining hit is security-reviewer's own report heading.
- `plugins/djinn/agents/synthesis.md:4`: frontmatter grants Write. Both spawning prompts (`review.md:185 to 186`, `dispatch.md:219 to 220`) name both output paths, as CONTRACTS section 9 allows.
- `plugins/djinn/commands/status.md:4`: `Read, Glob` is enough for a read-only print. It appends no ledger line, as CONTRACTS section 6 now exempts. `review.md:233` points users at it correctly.
- `plugins/djinn/.claude-plugin/plugin.json:3`: the version bump is the only version source. `.claude-plugin/marketplace.json` pins no version, so nothing else needs to move.
- `plugins/djinn/relay.md:179` and `plugins/djinn/README.md:132 to 138`: the command table and folder tree match the files the commands now write.
- `plugins/djinn/CONTRACTS.md:261 to 284`: the example JSON's field order matches the field lists at `CONTRACTS.md:338 to 341`.

## Files read outside the fence
- `plugins/djinn/commands/brief.md` (consumes synthesis ids)
- `plugins/djinn/agents/bugs-reviewer.md` (round trigger wording)
- `plugins/djinn/agents/security-reviewer.md` (round trigger wording)
- `.claude-plugin/marketplace.json` (version pin check)
- `.git/HEAD` (confirm LOW-6 checked-out branch)
- `docs/session-log-2026-09-12.md` (confirm LOW-6, no main)
