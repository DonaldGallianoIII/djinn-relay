---
title: bugs-reviewer report, audits/2026-09-29-1654-custom
author: Claude Opus 5.5 (bugs-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Round 3. CONTRACTS.md section 3 says prior-finding status belongs to
synthesis alone, so this report writes no round 2 status section. What I
read for each round 2 HIGH and MEDIUM is listed under Checked and Clean,
with the line that carries the fix, for synthesis to rule on.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/CONTRACTS.md:1436` The release sheet's allow list leaves out the status word, so an UNVERIFIED practice item reaches students unmarked.
Mechanism: the allow list names the header, one line, and each passing item's stem, sorted options and answer (`CONTRACTS.md:1436 to 1441`), and says anything not named stays out "however harmless it looks" (`:1433 to 1434`). The status word is not named. learn-synthesis is told to start from an empty file and add only what the list names (`learn-synthesis.md:391 to 395`, `:411 to 413`). In study-sheet.md the same answer ends with its status word (`learn-synthesis.md:374 to 375`).
Traced: `CONTRACTS.md:1053 to 1055` (an item with any UNVERIFIED claim ships marked UNVERIFIED), `learn-synthesis.md:83` ("Never ship an unmarked fact"), then `CONTRACTS.md:1433 to 1441` and `learn-synthesis.md:391 to 413`. The allow list is the newer and narrower rule, so an agent that follows it drops the mark. The mark is lost on the one file the owner may hand to students.
Trigger: a secure run with a practice item that uses any UNVERIFIED claim and passes the release test. The round 2 course repo dry run had every item UNVERIFIED (round 2 fix report, `:276 to 277`), so this is the normal case in a repo whose sources are not source checked. The item then appears in `study-sheet-release.md` with no VERIFIED or UNVERIFIED word.
Fix: add to item 2 of the allow list (`CONTRACTS.md:1438 to 1440`) and to `learn-synthesis.md:394 to 395`: "and its status word, VERIFIED or UNVERIFIED, as in the study sheet". Claim ids stay off the sheet.

MEDIUM-2. `tools/pre-push.sh:13` The pre-push hook checks the working tree, never the commits being pushed, so it passes a push whose history carries private words.
Mechanism: the hook execs `tools/check-private.sh`. Every content pass there is `git grep --untracked` with no tree-ish (`check-private.sh:71`), which reads working tree files. The ref lines git writes to the hook's stdin (local sha, remote sha) are never read. A private word that sits in a pushed commit, or only in the index, but not in the working tree is never seen. The header admits this (`pre-push.sh:5 to 6`, `check-private.sh:20 to 23`) and leaves the history check to a command run by hand.
Traced: `pre-push.sh:12 to 13`, then `check-private.sh:69 to 79` (grep_files), `:100`, `:112`, `:138`. None of these names a commit. The round 2 fix report shows this state really occurred: after the scrub commit the tree read 0 hits (`audits/2026-09-29-1428-custom/fixes/fix-report.md:147 to 149`), while `git log -p` over the uncollapsed range held 1204 hit lines (`:110 to 112`). With the hook installed, a plain `git push` of that range would have passed. This matches known-bugs "A check that passes by not checking" (`~/Conventions/code/known-bugs/any-language/tests-and-checks.md:17`, Tier when hit: MEDIUM). The claim it guards is that a hand push publishes nothing private.
Trigger: commit a scrub on top of commits that carry a private word, leave the range unsquashed, and run `git push origin Claude-Development-djinn-relay`. The hook prints `private check: clean` and the push goes out.
Fix: in `pre-push.sh`, read each stdin line `<local ref> <local sha> <remote ref> <remote sha>`, skip deletes, and take the range `<remote sha>..<local sha>` (or `<local sha> --not --remotes` for a new branch). Grep the added lines of `git log -p` over that range with the pattern file, the home path and the marks. Also run the tree passes against `<local sha>` (`git grep ... <local sha> -- .`), not the working tree. Exit 1 on any hit, and when the pattern file is missing.

MEDIUM-3. `plugins/djinn/commands/learn.md:167` Every stop before Step 5 writes `<out_dir>/.gitignore` and `LEDGER.md` into out_dir before anything checks whether git tracks files there.
Mechanism: the ledger rule writes `<out_dir>/.gitignore` holding `*`, then appends to `<out_dir>/LEDGER.md`, on every early stop. The only exception is the Step 5 abort (`learn.md:928 to 934`). The tracked-files check runs only in Step 5 (`:269 to 275`), and the Step 1, Step 2 and Step 3b stops all come before it. Step 1 also hard codes `learn/LEDGER.md` (`:92 to 93`).
Traced: `learn.md:167 to 169` (ABORTED step 3b: no sources, "append the ledger line") or `:181 to 183` (input outside this repo), then `:920` (Step 10 runs "always, even on an early stop"), then `:928 to 931` (the `*` written first). That breaks the promise at `CONTRACTS.md:1407 to 1411` that a tracked out_dir is refused "before it writes anything there". Then `review.md:221 to 225`: a `learn/LEDGER.md` or `learn/.gitignore` turns on `':!learn'` for every listing (`:244`, `:246`, `:270`, `:280`, `:313`, `:318`, `:370`, `:390`), which is exactly the case section 4 says must keep a repo's own tracked `learn/` in the fence.
Trigger: a repo whose tracked `learn/` holds its own lessons or code, with no `learn` block, where discovery finds no sources (or the owner passes an item id the file lacks). Run `/djinn:learn content/quizzes/week-3.yaml q7`. `learn/.gitignore` now holds `*`, so every new file the owner adds under `learn/` is silently skipped by `git add -A`. Every later `/djinn:review` and `/djinn:dispatch` then drops that folder from its fence.
Fix: move the Step 5 tracked-files probe into Step 1, right after out_dir resolves, and apply the Step 5 rule to every stop before or at that point: print the ledger line and write nothing into an out_dir that git tracks files under. The Step 1 stop should print its line too, not write to `learn/LEDGER.md`.

MEDIUM-4. `plugins/djinn/agents/learn-fact-checker.md:120` The double key rule fires on a note's wording alone. The notes the angles must write routinely use those words, so sound items ship UNVERIFIED and leave `grpo.jsonl`.
Mechanism: an item whose note calls a distractor "defensible, arguable or also right" is double keyed "whatever you find" (`CONTRACTS.md:1014 to 1016`, `learn-fact-checker.md:120 to 122`, `learn-synthesis.md:131 to 135`). Every pull or trap note must name the option's true home, "the question it IS the right answer to" (`learn-asked.md:108 to 110`, `learn-harder.md:136 to 137`, `learn-known.md:58`). In a spot-the-mistake item every distractor is by design a sound line, "in fact fine" (`learn-harder.md:110 to 111`), so its note calls it right. The rule cannot tell right elsewhere, which is a home, from right here, which is a second key.
Traced: `learn-harder.md:110 to 111` and `:136 to 137` (the note says the line is right), then `learn-fact-checker.md:120 to 122` (double keyed whatever the check found), then `learn-synthesis.md:133 to 135` (never VERIFIED, out of `grpo.jsonl`), then `CONTRACTS.md:1273` (the load recipe keeps VERIFIED only). This was observed: in the round 2 fix report's dry run, draft 6, a spot-the-mistake item, was held back by "a word in its own note" (`audits/2026-09-29-1428-custom/fixes/fix-report.md:263`, `:307 to 308`).
Trigger: any spot-the-mistake rung whose distractor notes say a sound line "is also right", or any item whose pull line says a distractor "is also right for a sealed pressure cooker". The item ships UNVERIFIED with a false `U<n>` or `S<n>`, and the README lists it as double keyed.
Fix: fire on a note only when it says the distractor answers this stem ("defensible here", "also correct for this case"). Have the fact checker read each flagged note against the stem and record `note places the option elsewhere, not a second key` when the note names another question. Tell the angles to write homes as "right for <other question>", never "also right".

### LOW
LOW-1. `plugins/djinn/commands/learn.md:693` The script exempts a pasted question's rows from the key length rule, but the contract exempts only rows whose `source_ref` is a `path:line`.
Mechanism: the script sets `source_row` for any `source_ref` other than `seed` (`learn.md:693 to 694`, restated at `:893 to 894`), so `prompt` rows are skipped. `CONTRACTS.md:1113 to 1117` names only a bank's source question "with a `source_ref` that is a `path:line`".
Traced: `learn.md:693 to 697`, against `CONTRACTS.md:1113 to 1115`. Section 13 wins over the command (`learn.md:36 to 37`).
Trigger: `/djinn:learn "<question>"` with a key 1.4 times the mean distractor length. The script passes the rows, and the contract says they fail.
Fix: the script's reading is the sensible one, since the owner's pasted options are never changed. Amend `CONTRACTS.md:1114` to "a `source_ref` that is a `path:line` or `prompt`".

LOW-2. `plugins/djinn/agents/learn-fact-checker.md:116` The ambiguous stem rule asks for the stem as a citation that the same prompt forbids.
Mechanism: step 6 makes the stem "the second citation" (`:116 to 120`). The stem lives only in an angle file inside the run folder, and the run folder is on the never list (`CONTRACTS.md:1050 to 1051`). Rule `:130` says "Never cite ... one on the never list", and `:132 to 135` require a full `path:line` on every row.
Traced: `learn-fact-checker.md:116 to 120`, then `:130`, then `:132`.
Trigger: an item whose stem defines a term one way while the key reads it another. The checker has to break one rule: cite a never-list file, write a citation that is not a `path:line`, or leave the double key row out.
Fix: name the form in step 6, `angles/<qid>/<file>:<line> (stem, a location, not evidence)`, and exempt that form from `:130`.

LOW-3. `plugins/djinn/agents/learn-fact-checker.md:192` The recheck never reads a reworded distractor against the stem or the key reason's lines, which the first pass's double key read does.
Mechanism: recheck question 2 reads every option only against "the key's new wording" (`:192 to 196`; `CONTRACTS.md:1122 to 1124`). The main source of rewording is the length rule, which rewrites distractors "to be equally specific" (`learn-synthesis.md:227 to 229`). That is the change most likely to make a distractor right under the stem's case or under a cited home line, and those are the two reads step 6 does (`:110 to 120`) and the recheck skips.
Traced: `learn-synthesis.md:227 to 240` (the reworded distractor goes to `rephrased.md`), then `learn.md:477 to 490` (recheck mode), then `learn-fact-checker.md:187 to 196`.
Trigger: a key too long for the band. Synthesis lengthens a distractor with a qualifier the stem's case satisfies, and the recheck passes it because the key's wording did not change.
Fix: recheck question 2 runs step 6 in full on each listed item: every option against the key reason's and homes' cited lines and against the stem.

LOW-4. `plugins/djinn/agents/learn-synthesis.md:405` The new sentence read checks a practice item only against its own source's key reason. A multi-question secure run can release an item that paraphrases another source question's key.
Mechanism: step 1 collects key terms "for every source question in the run" (`:398 to 399`), but step 3 reads each sentence against "the claim the source key rests on", singular (`:405 to 408`; `CONTRACTS.md:1446 to 1449`). A whole quiz file is the default input (`learn.md:113 to 114`), so every other item in it is also a source question.
Traced: `learn.md:113 to 114`, then `learn-synthesis.md:398 to 408`. Test (a) catches the case only when an angle named the other source on its `leaks with` line, which is the step round 2 MEDIUM-3 found angles skipping.
Trigger: a secure run on a whole bank where a practice item for q7 states q8's key reason in other words and uses none of q8's key terms.
Fix: in step 3 and in (d), read each sentence against the key reason claim of every source question in the run.

LOW-5. `plugins/djinn/CONTRACTS.md:1452` The source key term list is empty for a key made of short tokens or numbers, so test (b) checks nothing for that source.
Mechanism: the terms are "every word of four letters or more in the source's key option" plus the mechanism words (`:1452 to 1456`). A key such as "93 C", or a three letter acronym, contributes no term, so a practice item that carries the key verbatim in an option passes (b).
Traced: `CONTRACTS.md:1452 to 1456`, then `learn-synthesis.md:398 to 404`. Only (a) and the sentence read remain, and both rest on the agent's judgment.
Trigger: a secure item keyed "93 C" (water at 2,000 m). A sibling practice item lists "93 C" as an option, and the found-rule search has no term to look for.
Fix: take every token of the key option that the stem lacks, numbers with their units and short acronyms included, and drop only the listed function words.

LOW-6. `plugins/djinn/commands/learn.md:231` The seed block passes only `learn.secure_paths`, while the command also counts a folder named `secure` as secure, so a seed drawn from a bank in `secure/` can mark the run `secure: no`.
Mechanism: the secure check treats an input under any folder named `secure` as secure (`learn.md:187 to 189`, `CONTRACTS.md:1384 to 1385`). The seed block's `Secure paths:` line is the config list alone (`learn.md:231`), and learn-known writes `secure: yes` only when it opens a file "under a secure path" as the block gives them (`learn-known.md:103 to 110`). The command never checks the item shape paths itself.
Traced: `learn.md:231 to 236`, then `learn-known.md:106 to 110`, then `learn.md:247 to 252` (only the seed's own line flips the run).
Trigger: `item_shape: [content/secure/bank.yaml]` with `secure_paths` empty or undiscovered, then `/djinn:learn --topic "boil"` and answer `seed`. The seed reads the bank for its form, writes `secure: no`, and every row says `"secure": "no"`.
Fix: before spawning seeds, the command marks the run secure when any `item_shape` file has a `secure` segment in its real path or sits under `secure_paths`, and adds every such folder to the block's `Secure paths:` line.

LOW-7. `plugins/djinn/agents/learn-synthesis.md:377` In a secure run the study sheet still tells the owner it is released by cutting its last section, which the contract forbids.
Mechanism: section 6's heading is "For the owner, remove before release", and the rule says "the sheet is released by cutting this section" (`:377 to 380`), with no secure run exception. The secure first line says only "not for students until the owner releases it" (`:384 to 387`, `CONTRACTS.md:1427 to 1428`) and never names `study-sheet-release.md`. The contract says the release form is "never by cutting the study sheet" (`CONTRACTS.md:1431 to 1432`). `README.md:274` calls study-sheet.md "for a student".
Traced: `learn-synthesis.md:377 to 387` against `CONTRACTS.md:1431 to 1434`.
Trigger: an owner who follows the sheet's own heading in a secure run cuts section 6 and hands out the map, which places the source key in its home.
Fix: in a secure run, the first line names `study-sheet-release.md` as the only release form, and section 6's heading drops "before release".

LOW-8. `qa/human/learn-leak-guards.md:17` Repo b's config has no `base_branch`, so QA steps 8 and 9 stop at `ABORTED step 1: no config` and never reach the fence or the learn agent refusal.
Mechanism: the setup gives each scratch repo a `.djinn/config.yaml` holding only a `learn` block (`:17 to 22`). `/djinn:review` stops when `base_branch` is missing (`review.md:33 to 36`), and `--base` does not waive that.
Traced: `learn-leak-guards.md:66 to 78`, then `review.md:18` and `:33 to 36`.
Trigger: walk step 8 as written. The run stops at step 1, and step 9 expects `ABORTED step 2` but gets step 1.
Fix: add `base_branch: main` (or the scratch repo's branch) to repo b's config in the setup.

LOW-9. `tools/check-private.sh:128` With no pattern file, the private word pass is skipped and the script still ends `private check: clean` with exit 0. The pre-push hook then passes a push from any fresh clone.
Mechanism: a missing `local/private-patterns.txt` prints a warning (`:129 to 130`) and does not set `failed`, so `:156` prints `clean`. `local/` is gitignored (`.gitignore:5`), so every clone lacks the file until someone copies it in.
Traced: `pre-push.sh:13`, then `check-private.sh:124 to 130`, then `:152 to 156`. Skipping with a reason is what the known-bugs entry's prevention allows, so this is LOW. The final word still says the opposite of what ran.
Trigger: clone the repo on a second machine, commit, push. The hook warns and the push goes out.
Fix: under the hook, fail when the pattern file is missing. In the build, end with `private check: clean except private words NOT CHECKED` rather than `clean`.

LOW-10. `tools/check-private.sh:4` The header says the check stops round 2's "secure item's answer tell"; no pass can match one.
Mechanism: a tell is a prose sentence about a key's property. Under the scrub convention it cites a pseudonymous id (`tA-nn`), so it holds no private word for pass 4. It holds no home path (`:60`), and pass 2's marks are exempt in `audits/` (`:97`).
Traced: `check-private.sh:4 to 7`, then `:97`, `:112`, `:138`. The round 2 tell was caught only because it carried a real id.
Trigger: a reviewer writes, under `tA-03`, a key property that survives shuffling. The check reads clean.
Fix: reword the header to say the tell guard is the scrub by reading, and that this check catches real ids and words only.

LOW-11. `plugins/djinn/CONTRACTS.md:541` Section 7 says every learn file carries `learn draft, not yet reviewed`, but section 13 has `items-DRAFT.*` use the shape's own status word, so that file carries none of the three marks the private check greps.
Mechanism: when the shape has an `attribution:` block, synthesis writes the shape's word for unreviewed work and a note starting `SECURE SOURCE.` (`CONTRACTS.md:1079 to 1082`, `learn-synthesis.md:159 to 164`). None of `SECURE SOURCE. Derived from`, `"source_ref"` or `learn draft, not yet reviewed` (`check-private.sh:42 to 44`) need appear. `check-private.sh:11 to 13` calls the draft status "the status every learn file carries".
Traced: `learn-synthesis.md:159 to 164`, then `check-private.sh:96 to 109`.
Trigger: copy a secure run's `items-DRAFT.yaml`, from a shape with its own attribution block, to `docs/`. Passes 1 to 3 read clean, and only pass 4 can catch it, if its ids are on the pattern list.
Fix: require the attribution note to carry the exact string `learn draft, not yet reviewed`, and state that in section 13 beside the banner rule.

LOW-12. `plugins/djinn/README.md:235` The README's summary of the release test names two of its four parts.
Mechanism: it says "no leak with the source in either direction and none of the source key's words". It leaves out (c), the new fact, and (d), the sentence read (`CONTRACTS.md:1442 to 1452`).
Traced: `README.md:235 to 237` against `CONTRACTS.md:1442 to 1452`.
Trigger: a reader who trusts the README expects a term search alone.
Fix: add "a new fact of its own, and no sentence that states or implies the source's key reason".

### DEBT
none

### REC
REC-1. The sentence read (d), together with (a) to (c), may leave `study-sheet-release.md` empty in most runs. The course repo run was already empty before it landed (round 2 fix report, `:287 to 288`). Have the README print passed and kept-off counts per test, and rerun a secure dry run (round 2 "Needs round 3" item 2) before 2.4.0 is published.

## Blast radius
- `audits/2026-09-29-1428-custom/fixes/fix-report.md:25` LOW. It says the private check now greps `audits/`, "so the next tell of this kind fails the build".
  Mechanism: no pass matches a prose tell that uses a pseudonymous id (LOW-10).
  Traced: `tools/check-private.sh:97`, `:112`, `:138`.
  Fix: reword the claim to "a tell that names a real id or word".

## Checked and Clean
- Round 2 HIGH-1: `audits/2026-09-29-1303-custom/fixes/fix-report.md:156 to 161` now says only that the length check read the bank's authored options. The ratio lines round 2 cited are gone.
- Round 2 MEDIUM-1: `plugins/djinn/agents/data-contract-reviewer.md:208 to 209` describes the example by kind. `.claude-plugin/marketplace.json:5` and `:10` still carry the owner's full name, which the fix report keeps on purpose because pushed history already holds it. Not re-filed.
- Round 2 MEDIUM-2: `plugins/djinn/agents/learn-synthesis.md:391 to 413` builds the release sheet from an empty file and bars maps, misconceptions, analogies, plan steps, self checks and owner notes. The one gap is MEDIUM-1 above.
- Round 2 MEDIUM-3: `learn-asked.md:87 to 95` and `learn-harder.md:119 to 126` write leaks both ways and always weigh the source. `learn-synthesis.md:122 to 129` makes each edge symmetric and adds missed ones.
- Round 2 MEDIUM-4: `plugins/djinn/commands/learn.md:231 to 236` gives the seed block `Secure paths:` and the never-quote sentence. `:247 to 252` flips the run secure on `secure: yes` or no line and reruns the ignore check. The folder name gap is LOW-6.
- Round 2 MEDIUM-5: `CONTRACTS.md:957 to 969`, `learn-synthesis.md:97 to 104`, `learn-asked.md:179` and `learn-harder.md:116 to 118` judge restatement by key reason and a named new fact, never by homes.
- Round 2 MEDIUM-6: `learn-fact-checker.md:108 to 122` asks the double key question of every item, and `learn.md:439 to 440` puts it in the spawn prompt. The note word trigger is MEDIUM-4.
- `tools/check-private.sh`: `grep_files` (`:69 to 79`) returns 2 on any git exit above 1, and every caller sets `failed` on 2 (`:102`, `:114`, `:140`). Pass 1 reads `ls-files` status (`:82 to 86`). An empty pattern list fails (`:134 to 136`). An unreadable one leaves `$tmp` empty, so the count is 0 and the check fails. A mktemp failure exits 1 (`:64`). Within the working tree it fails closed; the history and missing-file gaps are MEDIUM-2 and LOW-9.
- `tools/pre-push.sh`: a `rev-parse` failure exits 1 (`:12`), and a missing `check-private.sh` makes `exec bash` exit 127, which blocks the push. Both scripts are mode 100755 in the patch.
- `.djinn/config.yaml:25` build_cmd: no file in the tree parses YAML (Grep for `safe_load`, `import yaml`, `yq`, `js-yaml` found none). `review.md:18 to 19`, `dispatch.md:35` and `brief.md` read the value as text, and it holds no ` #`, so a text read takes the whole line. The colon and space break only a strict YAML parser, which no command runs. In the chain, an empty list or a failed git trips the `test -n` before the voice check, and `check-private.sh` runs last under `&&`.
- `plugins/djinn/commands/review.md` and `dispatch.md`: every listing carries `<learn skip>` (`review.md:244`, `:246`, `:270`, `:280`, `:313`, `:318`, `:370`, `:390`; `dispatch.md:186`, `:320`, `:412`), and `dispatch.md:414` is bounded by the round fence. The skip's Glob sees gitignored files: a Glob of `local/*.txt` returned the ignored pattern file.
- `review.md:179 to 184` refuses any `learn-` name at step 2, before any spawn.
- `learn.md` Step 9 script: the shuffle sorts the non-key options before its seeded shuffle, so a rerun gives the same order. The misconception label check (`:852 to 857`) touches only `<source_id>-m<n>`, never `<item>-m<n>`. The position share (`:867`) allows what two-option rows force.
- The three learn marks, grepped outside `audits/`, appear only in the ten `MARK_FILES` (`check-private.sh:48 to 59`). No tracked or unignored file holds a `/home/<user>/` path.

## Files read outside the fence
- `audits/2026-09-29-1303-custom/fixes/fix-report.md` (confirm round 2 HIGH-1 scrub)
- `~/Conventions/code/known-bugs/any-language/tests-and-checks.md` (index entry tier, grep only)
- `local/` (Glob only, ignore behavior test)

## Counts
HIGH 0, MEDIUM 4, LOW 12, DEBT 0, REC 1
