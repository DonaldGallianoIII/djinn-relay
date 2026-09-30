---
title: integration-reviewer report, audits/2026-09-29-1654-custom
author: Claude Opus 5.5 (integration-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Round 3. No prior-finding status section: CONTRACTS.md section 3 gives that to synthesis alone. Every file:line below was read at HEAD 9298889. No private text, option property, bank file name or home path is quoted here; paths use `~`.

## Findings

### HIGH
none

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/learn.md:928` Every learn stop before Step 5 writes `<out_dir>/.gitignore` holding `*` and `<out_dir>/LEDGER.md` before Step 5 asks whether git tracks files under `out_dir`, and Step 1's own abort writes into the target repo's `learn/` whatever `out_dir` says; in a repo whose tracked `learn/` holds its own code, that marker turns on the review and dispatch learn skip.
Mechanism: the ledger rule (`learn.md:928` to `:934`) runs on "this step and every early stop", and only `ABORTED step 5` is exempt, so an unknown item id (`:112` to `:114`), a missing `--sources` path (`:120` to `:122`), `ABORTED step 3b: no sources` (`:167` to `:169`) or `input outside this repo` (`:182` to `:184`) each write the self-ignoring `*` file into a folder the Step 5 check (`:269` to `:275`) would have refused; Step 1's abort appends to `learn/LEDGER.md` by name (`:91` to `:94`), outside `out_dir`, against the Rules line at `:966` to `:968`. The `*` hides every new file under that folder from `git status` and `git add .`, and it is itself ignored, so nothing shows the change. The same file is the learn skip marker, so from then on review and dispatch drop the folder's tracked code from every fence, with only a `learn_skip:` line in context.md.
Traced: `plugins/djinn/commands/learn.md:112` (a typo'd id stops) to `:928` to `:931` (write `<out_dir>/.gitignore`, then LEDGER) to `plugins/djinn/commands/review.md:221` to `:226` (Glob finds `learn/.gitignore`, `<learn skip>` becomes `':!learn'`) to `review.md:244` and `:246` (changed and untracked listings carry it) and `plugins/djinn/commands/dispatch.md:182` to `:186`, `:320`, `:412`. The contract this breaks: `plugins/djinn/CONTRACTS.md:1407` to `:1411` ("the command stops before it writes anything there") and `:1512` to `:1514`, and section 4's promise at `:179` to `:182` that a repo whose tracked `learn/` holds code keeps it in the fence.
Suggestion: move the tracked-files and root checks into Step 1, right after `out_dir` resolves, and have the ledger rule print its line instead of writing whenever that check failed or has not run yet; Step 1's abort prints rather than writing into `learn/`.

### LOW
LOW-1. `tools/check-private.sh:128` A clone without the gitignored `local/private-patterns.txt` skips pass 4 and still ends `private check: clean` with exit 0 (`:152` to `:156`); the pre-push hook exists only in this clone (`.git/hooks/pre-push`), its install line is a comment at `tools/pre-push.sh:3` to `:4`, and `plugins/djinn/README.md` says nothing about either. So in a second clone the build_cmd (`.djinn/config.yaml:25`), dispatch's build gate (`plugins/djinn/commands/dispatch.md:295`, which reads the exit status) and a hand push all pass with no private word check, while project_notes calls that pass the gate a scrub must clear (`.djinn/config.yaml:97` to `:98`). LOW because no second clone is confirmed and the skip prints a capitals warning; it reads MEDIUM the day one exists. Suggestion: exit nonzero when the file is missing unless an explicit opt-out variable is set, or at least end with `private check: clean except private words NOT CHECKED`.

LOW-2. `plugins/djinn/commands/review.md:221` The learn skip marker `learn/.gitignore` is a file many code folders carry, so a repo whose tracked `learn/` holds code and its own tracked `.gitignore` gets `':!learn'` on every review and dispatch listing (also `plugins/djinn/commands/dispatch.md:184`, `plugins/djinn/CONTRACTS.md:180`), the outcome round 2 LOW-17 closed for the fixed text. Suggestion: mark on `learn/LEDGER.md`, or on a `learn/.gitignore` git does not track.

LOW-3. `plugins/djinn/commands/learn.md:231` The secure path list the command pastes into the seed block (`:231`), the angle block (`:392`) and the fact checker block (`:437`) holds only `learn.secure_paths`, while Step 3b (`:187` to `:189`) and `plugins/djinn/CONTRACTS.md:1384` to `:1385` also count any folder named `secure` in a real path. Item shape banks are not input files, so the command never checks them; a bank under a `secure` folder that no config or `CLAUDE.md` line names is invisible to every agent's never-quote rule and to the seed's `secure: yes` self-report (`plugins/djinn/agents/learn-known.md:103` to `:110`), and a seed drafted after reading it leaves the run `secure=no`.

LOW-4. `plugins/djinn/CONTRACTS.md:1114` The contract exempts from the key length rule only a source row whose `source_ref` is a `path:line`; the script (`plugins/djinn/commands/learn.md:693` to `:694`) and its prose (`:891` to `:894`) exempt any `source_ref` other than `seed`, so a pasted question's own row (`source_ref` `prompt`) is skipped by the script and failed by the contract. `learn.md:36` to `:37` says section 13 wins, and `:498` to `:499` says to run the script exactly as it stands. The script's reading is the sensible one (a pasted question's options are the owner's and the rewrite may not reword them); the contract line is the stale side.

LOW-5. `.djinn/config.yaml:93` project_notes says `tools/check-private.sh` greps audits/ for "the learn marks outside the files that define them"; pass 2 excludes audits/ (`tools/check-private.sh:97`), as the script's own header says (`:11` to `:13`). Every reviewer is handed project_notes (`plugins/djinn/commands/review.md:435`), so a reviewer reads a copy of a secure run's rows or README pasted into an audit folder as caught when only pass 4's word list could catch it.

LOW-6. `.djinn/config.yaml:25` build_cmd is a plain YAML scalar holding a colon and a space (inside the `voice check` message), so any YAML parser rejects the whole file. It breaks nothing today: `plugins/djinn/commands/review.md:18`, `plugins/djinn/commands/dispatch.md:35`, `plugins/djinn/commands/brief.md:28` and `plugins/djinn/commands/learn.md:71` read the file with the Read tool, and neither Bash allow list (`review.md:722` to `:731`, `learn.md:975` to `:981`) holds a YAML tool, so each orchestrator takes the rest of the line as the value. It breaks the first tool that loads the file with a parser, and a `learn:` block pasted in from a run's `learn-config.yaml` (`learn.md:356` to `:358`) lands in a file no parser can check. Suggestion: a single-quoted scalar with the inner single quotes doubled.

LOW-7. `plugins/djinn/README.md:235` The release test is summed up as two checks (no leak with the source, none of the source key's words); `plugins/djinn/CONTRACTS.md:1442` to `:1452` has four, and the two the README leaves out, the new fact and the sentence read against the source key's reason, are the ones the third dry run needed.

LOW-8. `plugins/djinn/commands/review.md:186` On an unknown custom list name the command lists every file in `agents/` as a valid name, the six learn agents included, which `:179` to `:184` then refuse at the same step.

### DEBT
none

### REC
REC-1. Add a short "Working on this repo" part to `plugins/djinn/README.md` (or a root `CONTRIBUTING.md`): make `local/private-patterns.txt`, link `tools/pre-push.sh` as the hook, and what `PRIVATE WORDS NOT CHECKED` means. A committed `core.hooksPath` instruction would make the hook one command per clone.

REC-2. `qa/human/learn-leak-guards.md` gains a step for MEDIUM-1: a scratch repo with a tracked `learn/` code folder, `/djinn:learn <bank> <bad id>`, expect nothing written under `learn/`, then `/djinn:review` records `learn_skip: none` and fences a change under `learn/`.

REC-3. The recheck prompt (`plugins/djinn/commands/learn.md:480` to `:490`) carries no `Secure paths:` line where Step 8's prompt does (`:437` to `:438`). The fact checker's own rule never quotes a non-source file (`plugins/djinn/agents/learn-fact-checker.md:95` to `:96`), so nothing leaks today; add the line for parity with the other blocks.

## Blast radius
none

## Checked and Clean
- Names: every `subagent_type` in `plugins/djinn/commands/learn.md` (`:219`, `:371` to `:372`, `:426`, `:451`, `:478`, `:901`) matches an agent frontmatter `name`, and `plugins/djinn/CONTRACTS.md:838` to `:840`, `plugins/djinn/README.md:312` to `:317` and `plugins/djinn/commands/review.md:180` to `:181` list the same six.
- The `LEARN RUN:` guard: all six agents refuse without it (`learn-known.md:28`, `learn-asked.md:32`, `learn-harder.md:19`, `learn-prepare.md:20`, `learn-fact-checker.md:24`, `learn-synthesis.md:22`), and every block the command sends opens with it (`learn.md:222`, `:377`, `:429`, `:454`, `:481`, `:902` to `:904`).
- Angle to fact checker to synthesis: the `key reason`, `new fact` and `leaks with` lines learn-asked (`:178` to `:181`) and learn-harder (`:208` to `:211`) write are the lines the fact checker reads for the key reason (`learn-fact-checker.md:52` to `:61`) and synthesis reads for restatements and leaks (`learn-synthesis.md:97` to `:104`, `:122` to `:129`); the fact checker's `## Double key check` table (`:167` to `:170`) is the table synthesis names (`learn-synthesis.md:130` to `:135`), and both match `CONTRACTS.md:1004` to `:1018`.
- Seeds: the path `angles/seed-<k>/seed.md` agrees at `learn.md:243`, `:434`, `:459`, `learn-known.md:114` to `:115` and `CONTRACTS.md:1492`; the `Q` series at `CONTRACTS.md:1031` to `:1033`, `learn-known.md:112` to `:113`, `learn-synthesis.md:52` to `:54`; the `secure:` line at `learn.md:234` to `:236` and `:247` to `:252`, `learn-known.md:107` to `:110`, `CONTRACTS.md:1386` to `:1390`. The seed block carries the secure paths and the never-quote sentence (round 2 MEDIUM-4's fix holds at `learn.md:231` to `:236`), with LOW-3's gap.
- The recheck: `rephrased.md` to `verification/rephrased.md`, its table and its FAILED TO RETURN rule agree at `learn.md:477` to `:496`, `learn-fact-checker.md:180` to `:202`, `learn-synthesis.md:234` to `:240` and `CONTRACTS.md:1119` to `:1129`; the rewrite pass names every file a quarantine touches (`learn.md:909` to `:912`, `learn-synthesis.md:531` to `:540`).
- The release sheet allow list: `learn-synthesis.md:389` to `:415` builds from an empty file and runs (a) to (d) of `CONTRACTS.md:1442` to `:1452`; the README line lists the terms, as `CONTRACTS.md:1457` asks.
- Named constants: the seven names at `learn.md:54` to `:60` are defined once in the script (`:510` to `:516`) and filled into the synthesis prompt (`:469` to `:470`), which `learn-synthesis.md:38` to `:39` lists.
- The banner: `CONTRACTS.md:1422` to `:1426`, `learn-synthesis.md:453` to `:457` and `tools/check-private.sh:42` agree. A grep of the three marks outside `audits/` and `local/` finds exactly the ten `MARK_FILES` (`tools/check-private.sh:48` to `:59`).
- Review's learn skip: `<learn skip>` sits on the changed, untracked, map, patch, tree.txt, tree-changes, ignored and import listings (`review.md:244`, `:246`, `:270`, `:280`, `:313`, `:318`, `:370`, `:390`); the mutant grep runs over the fence, which already has the skip; `learn_skip` in context.md (`:341`) matches `CONTRACTS.md:183`. Round 2 fix report's "seven review listings" is eight by this count, none missed.
- Dispatch's learn skip: defined once at `dispatch.md:182` to `:185` from review's rule and carried on `:186`, `:320` and `:412`; the round tree facts run through review's rule.
- `plugins/djinn/commands/brief.md` and `plugins/djinn/commands/status.md`: no git listing either could widen to `learn/` (grep); status reads only `audits/`.
- `plugins/djinn/agents/legibility-reviewer.md:110` to `:113`: matches `review.md:313`.
- The scrub of the 2.3.0 agents changed example descriptors only: `data-contract-reviewer.md:151` to `:161` (worked example, paths intact) and `:207` to `:213` (the stated invariants instruction, intact); `legibility-reviewer.md:344` to `:380` (calibration, with its "verify, never copy" rule intact); `proof-runner.md:463` to `:471` (proof table shape note); `CONTRACTS.md:255` to `:257` (section 5 example sentence). `gate-auditor.md` holds no scrubbed or learn text (grep). No instruction an agent acts on moved.
- Versions: `plugins/djinn/.claude-plugin/plugin.json:3` reads 2.4.0; the marketplace entry (`.claude-plugin/marketplace.json:7` to `:13`) carries no version, so plugin.json is the one source; both descriptions name `/djinn:learn`.
- `tools/pre-push.sh`: execs `tools/check-private.sh` from the root and exits 1 when `git rev-parse` fails; `.git/hooks/pre-push` in this clone reads the same text.
- `.djinn/config.yaml:25` build_cmd against `tools/check-private.sh`: it changes to the root first and calls the script last, as the comment at `:17` to `:24` says; the script reads every git status (`:69` to `:79`, `:82` to `:86`). known-bugchecker's reading of pass 4 as a skip with a reason is right about the skip; LOW-1 is about the final `clean` line and the install path.
- `plugins/djinn/templates/config.yaml:158` to `:181`: the `learn` keys match `CONTRACTS.md:870` to `:891` and `learn.md:72` to `:73`.
- `plugins/djinn/relay.md:247`: the learn row carries `--id` and `--secure`.
- `.gitignore`: ignores `local/`, which pass 1 of the check relies on.

## Files read outside the fence
- `plugins/djinn/commands/status.md` (grep, learn skip reach)
- `plugins/djinn/commands/brief.md` (grep, config and git reads)
- `.git/hooks/pre-push` (is the hook installed)
- `~/Conventions/code/known-bugs/any-language/tests-and-checks.md` (known-bugs entry tier)
- `audits/2026-09-29-1428-custom/synthesis.md` (round 2 findings)
- `audits/2026-09-29-1428-custom/fixes/fix-report.md` (round 2 fix claims)
- `audits/2026-09-29-1428-custom/input-diff.patch` (grep, scrub comparison)
- Glob of the repo root and of `**/README*` (hook and README presence; no file under `local/` opened)
