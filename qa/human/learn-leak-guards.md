---
title: human QA, the /djinn:learn leak guards
author: Claude Opus 5.5 (fix of audits/2026-09-29-1303-custom, revised for round 2, audits/2026-09-29-1428-custom, and round 3, audits/2026-09-29-1654-custom)
date: 2026-09-29
status: agent output, not yet reviewed
---

The plugin has no test lane, so these walked steps are the proof that the
guards hold. Run each from a scratch repo you make for it, never from a
repo that holds real course content. Each step says what to do and what
you should see. A step that shows anything else is a failure: stop and
note which.

Setup: `git init /tmp/learn-guard-a` and `git init /tmp/learn-guard-b`.
In each, add `docs/facts.md` with two lines of public textbook facts (water
boils at 100 C at sea level; near 93 C at 2,000 m),
`content/quizzes/week-1.yaml` with one made up single choice item on them,
id `q1`, and a `.djinn/config.yaml` whose `learn` block sets
`sources: [docs/]`, so every run gets past the no sources stop, and
`base_branch: main` (or the branch `git init` made), so `/djinn:review`
gets past its step 1 in steps 8 and 9. In repo b, also add
`content/secure/probe.yaml` with a second made up item, id `s1`, and set
`item_shape: [content/secure/probe.yaml]` and
`secure_paths: [content/secure/]` in its `learn` block. Commit everything
in both repos. Make a third, repo c (`git init /tmp/learn-guard-c`), whose
tracked `learn/` holds code: `learn/app.py` with one line and a tracked
`learn/.gitignore` holding `*.pyc`, plus the same `docs/facts.md`, quiz
and config as repo a. Commit it.

1. **Cross-repo input.** From repo a, run
   `/djinn:learn /tmp/learn-guard-b/content/quizzes/week-1.yaml q1`.
   You should see `ABORTED step 3b: input outside this repo`, no run
   folder in either repo, and one line in repo a's `learn/LEDGER.md`, with
   `learn/.gitignore` holding `*` beside it, so the ledger is ignored
   (repo a's `learn/` tracks nothing, so Step 1's check passed and the
   stop may write there).
1b. **An early stop in a tracked learn/ folder.** In repo c, run
   `/djinn:learn content/quizzes/week-1.yaml q9` (an id the file lacks).
   You should see `ABORTED step 1: out_dir holds tracked files` with the
   ledger line printed, and `git -C /tmp/learn-guard-c status --porcelain`
   should print nothing: no `learn/LEDGER.md`, and `learn/.gitignore`
   still holds only `*.pyc`. Then change `learn/app.py`, commit, and run
   `/djinn:review quick --base <the full sha of HEAD~1>` there: its
   `context.md` should say `learn_skip: none`, and its `fence.txt` should
   name `learn/app.py`.
2. **out_dir outside the repo.** In repo b, set `learn.out_dir: ../elsewhere/`
   and run `/djinn:learn content/quizzes/week-1.yaml q1`. You should see
   `ABORTED step 1: out_dir outside this repo`, and nothing written under
   `/tmp/elsewhere/`. Then set `learn.out_dir: /tmp/learn-guard-b-site/`
   (a sibling whose name starts with the repo's) and run again: the same
   abort. Put `out_dir` back.
3. **out_dir holding tracked files.** In repo b, set `learn.out_dir: docs/`
   and run `/djinn:learn content/quizzes/week-1.yaml q1`. You should see
   `ABORTED step 1: out_dir holds tracked files`, the ledger line printed
   rather than written, and no `docs/.gitignore`. Put `out_dir` back.
4. **Topic pick from a secure bank.** In repo b, run
   `/djinn:learn --topic "boil"` and pick `s1`. The plan should say
   `secure=yes`, print `stem: withheld (secure)` and
   `key: withheld (secure)`, and wait for `go`. After
   the run, the README's first line after its header starts
   `SECURE SOURCE. Derived from`, the study sheet's first line says it is
   not for students, and every row in the three `.jsonl` files carries
   `"secure": "yes"`.
5. **The release sheet.** In the step 4 run folder, open
   `study-sheet-release.md`. It should hold the header, one line saying it
   is the release form with a `blind read:` result, and practice items
   with their answers, each answer ending VERIFIED or UNVERIFIED, and
   nothing else: no map, no misconception, no analogy, no plan step, no
   self check, no claim id. Take the source key terms the README lists and
   search the file for each (case-insensitive, whole words): every search
   finds nothing. `verification/blind-release.md` should exist, and its
   `leans on` column should read `none` for `S1`, or every item it names
   should be gone from the sheet. `blind/source.md` should hold no key.
6. **Seed-only topic run over a secure bank.** In repo b, run
   `/djinn:learn --topic "boil"` and answer `seed`. After `go` and the
   seed, `angles/seed-1/seed.md` should carry a `secure:` line; since the
   item shape is the secure bank, it should read `secure: yes` with
   `content/secure/probe.yaml`, the run's `context.md` should say
   `secure: yes` with the seed as the reason, and every row should carry
   `"secure": "yes"`. The seed's stem and options should share no sentence
   with `s1`. (Since round 3 the run is secure from the plan on, because
   `item_shape` names a secure bank; the seed's own line must agree.)
6b. **The blind read.** In the step 4 run folder, open `blind/items.md`:
   stems and sorted options under `B` labels, no key, no id, no note.
   `verification/blind-result.md` should give every label a result, and
   no item it fails should appear in `items-DRAFT.yaml` or any row.
7. **Ignored run folders.** After step 4, `git -C /tmp/learn-guard-b status
   --porcelain` should list nothing under `learn/`, and
   `learn/.gitignore` should hold the one line `*`.
8. **Review fence.** In repo b, force one learn file into git so the fence
   skip is what keeps it out, not the ignore:
   `git -C /tmp/learn-guard-b add -f learn/LEDGER.md` and commit. Then
   change `docs/facts.md`, commit, append a line to `learn/LEDGER.md`, and
   run `/djinn:review quick --base <sha>`, where `<sha>` is the full sha
   `git -C /tmp/learn-guard-b rev-parse HEAD~1` prints (a `~` fails the
   review's ref check, so give the sha). The new audit folder's
   `fence.txt` should name `docs/facts.md` and no path under `learn/`, and
   its `context.md` should say `learn_skip: learn/`.
9. **A learn agent in a review list.** Run
   `/djinn:review learn-fact-checker --base <the same sha>` in repo b. You
   should see `ABORTED step 2: learn agents run only under /djinn:learn`,
   one ledger line in `audits/LEDGER.md`, and no audit folder.
10. **The repo gate.** In a scratch clone of djinn-relay
    (`git clone ~/djinn-relay /tmp/relay-gate`), copy your
    `local/private-patterns.txt` into its `local/`, then add
    `docs/fake-run/input.md` holding the line
    `status: learn draft, not yet reviewed` and `docs/fake-run/sft.jsonl`
    holding `{"metadata": {"source_ref": "x"}}`, and commit both. Run
    `bash tools/check-private.sh` there. It should exit 1 and name both
    files. Add a line to a tracked file holding a word from the pattern
    list and run it again: it should name that file too, without printing
    the word. Now remove `docs/fake-run/`, undo the added line, and move
    `local/private-patterns.txt` out of the clone, then run it again: it
    should exit 1 with `does not exist`; with
    `PRIVATE_CHECK_ALLOW_MISSING=1` set it should exit 0 and end
    `except private words NOT CHECKED`. Delete the clone.
11. **The push hook.** Run `bash qa/bot/private-guards.sh` from this repo.
    It builds scratch repos with `mktemp -d`, pushes to a bare scratch
    remote through the real hook, and should end
    `private guards: 19 passed, 0 failed`: a word committed then scrubbed,
    a word in a commit message, a new branch, a home path, a `local/` file
    and a learn mark outside the defining files each refuse the push and
    leave the remote where it was; a clean push and a delete go out.

Last walked: steps 10 and 11 on 2026-09-29 (step 11 by running the
script, 19 of 19). Steps 1 to 9 never: they need 2.4.0 installed. Walk
them before 2.4.0 is published.
