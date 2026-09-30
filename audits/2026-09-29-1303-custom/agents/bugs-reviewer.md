---
title: bugs-reviewer report, audits/2026-09-29-1303-custom
author: Claude Opus 5.5 (bugs-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Redacted 2026-09-29, before this folder was committed: quoted exam item text, answer keys, topic words drawn from a secure item, and private scenario names from two private course repos are replaced by item ids and neutral descriptions in [brackets], because this repo is public. Every finding, id, line citation and number is unchanged.

## Findings

### HIGH
HIGH-1 (SECURITY). `plugins/djinn/commands/learn.md:140` The secure check cannot see a private repo's `secure_paths: [.]` when the input file lives in another repo. So a course repo item run from any other repo is marked `secure=no`, is not refused, and its key and derived rows are written into that other repo with no SECURE SOURCE line.
Mechanism: Step 1 reads `learn.secure_paths` only from the target repo's own `.djinn/config.yaml` (learn.md:60 to 64), and Step 3b's discovery reads only the target repo's CLAUDE.md. The secure test at learn.md:140 to 141 is "a folder in its path is named `secure`, or it sits under a `learn.secure_paths` entry", and those entries are the target repo's paths. An input in another repo that is private by its own rule (`secure_paths: [.]`) has no `secure` folder in its path, so it passes as not secure, and the "outside the target repo" refusal at learn.md:141 to 145 never fires.
Traced: learn.md:83 to 85 (a quiz file may be any absolute path) to learn.md:60 to 64 (config from the target repo only) to learn.md:138 to 145 (secure test against the target's `secure_paths`) to CONTRACTS.md:883 (the course repo's own example is `secure_paths: [.]`) and the input path in docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/context.md:9 (`content/tracks/...`, no `secure` segment) to learn.md:196 to 197 (RUN_DIR under the target's `out_dir`) to learn-synthesis.md:270 (the SECURE SOURCE line is written only "when the source is secure"). This breaks CONTRACTS.md:1115 to 1116, "The command refuses an input path from a secure source in another repo". The dry run's own notes claim the guard exists for exactly this input: the course repo example README.md:95 to 96 says "the command itself would refuse a secure source outside its repo", and context.md:25 says the same.
Trigger: from the teaching repo (which has sources, so Step 3b does not abort), run `/djinn:learn <course repo>/<module quiz> e-01`. The plan prints `secure=no`. The run writes `the teaching repo/learn/<ts>-e-01/` with the key in input.md, sft.jsonl, dpo.jsonl and grpo.jsonl, and no warning in its README.
Fix: in Step 3b, refuse every file input whose `realpath -e` is outside the target repo root, whether or not it looks secure. `--sources` already has to live under the target repo (learn.md:93), so a cross-repo input has nothing in its own repo to cite anyway. State the rule in CONTRACTS.md section 13 "Secure sources", and correct the two claims in the course repo example (README.md:95 to 96, context.md:25).

### MEDIUM
MEDIUM-1. `plugins/djinn/commands/learn.md:138` Topic mode picks a real bank item but never runs the secure check or the Step 3 record on it. A secure item chosen by topic ships with `secure=no`, and its own bank is never named as "the input file" for the never-evidence list.
Mechanism: the secure check is labeled "(file inputs only)" and runs in Step 3b, before Step 4 exists. Step 4 then searches `learn.item_shape` banks and the banks inside the sources, and the owner picks items from them. Nothing after Step 4 sends those items back through Step 3 (path:line, HEAD, dirty) or Step 3b (secure). context.md's `input_ref` takes `topic`, and the never-evidence list names "the input file", which a topic run does not have.
Traced: learn.md:138 ("Secure check (file inputs only)") to learn.md:150 to 155 (Step 4 searches `learn.item_shape` banks and source banks, the owner picks) to learn.md:172 (plan prints `secure=<yes|no>` with no computed value) to learn.md:208 and 212 to 215 (`input_ref: ... topic`, `exclude: <the input file, ...>`) to learn.md:249 and 285 (angle and checker never-lists name "the input file") to learn-synthesis.md:255 to 257 and 270 to 273 (the study sheet and README warnings print only when secure). CONTRACTS.md:856 and 874 to 876 make the teaching repo's `item_shape` a file under `content/secure/`, so its topic search lands in a secure bank first.
Trigger: in the teaching repo with the contract's example config, run `/djinn:learn --topic "[the item's topic word]"` and pick `tB-06` from the list. The run proceeds with `secure=no`. study-sheet.md, which is written "for a student", reveals the secure key with no "not for students" line. README.md has no SECURE SOURCE line, and the ledger says `secure=no`. In the course repo, where banks can sit inside `sources`, the picked item's own bank is also never excluded as evidence.
Fix: after the owner picks in Step 4, run every picked item through Step 3 (record `path:line`, HEAD, dirty) and the Step 3b secure check, and treat each picked item's bank as the input file for the never-evidence list and `context.md`. Drop "(file inputs only)", or reword it as "file inputs and topic picks".

MEDIUM-2. `plugins/djinn/commands/learn.md:282` The seed question's claims are never fact checked, and its claim ids collide with learn-known's. So a model-drafted seed stem ships in rows with facts nobody verified.
Mechanism: in seed mode, learn-known writes `angles/seed-1/seed.md` with "the same header and a Claims table" (learn-known.md:85 to 87). That table uses learn-known's `K` ids (learn-known.md:75, 143). Then learn-known runs again, in normal mode, on `seed-1` and writes `K1` onward again. The fact checker is handed only the four angle files (learn.md:282 to 283) and reads "the Claims table of each angle file" (learn-fact-checker.md:37), so no one checks seed.md. Synthesis is handed `angles/<qid>/*.md` (learn.md:302), which does include seed.md. It then finds two `seed-1.K1` claims, and the verification table's status belongs to learn-known.md's `K1`, not seed.md's. The seed stem, its options and its model-picked key become "the source question" of every source-question row (learn-synthesis.md:182 to 183, 191 to 195, 206 to 208). A bank question's stem is the owner's text. The seed's stem is the model's, and it is treated as trusted anyway.
Traced: learn.md:157 to 165 (seed written, then "run the rest of the pipeline on it as question seed-1") to learn-known.md:79 to 87 (seed Claims table, K ids) to learn.md:280 to 286 (checker prompt: four files, no seed.md) to learn-fact-checker.md:37 to 45 (collects claims only from those files) to learn.md:302 (synthesis glob sees seed.md) to CONTRACTS.md:939 to 942 (claim ids unique within one question, broken by two K series) to learn-synthesis.md:37 to 42 (status looked up by `<qid>.<claim id>`).
Trigger: `/djinn:learn --topic "[a topic]"`, answer `seed`. learn-known drafts a stem [whose premise is a single stated value], and that premise rests on seed.md's own K1. The fact checker never reads it. The sft, dpo and grpo rows built on the seed carry that stem, and they are VERIFIED if learn-known's normal-mode claims all verify.
Fix: give seed claims their own letter (for example `Q`) in CONTRACTS.md section 13 and learn-known.md seed mode. Add `angles/seed-1/seed.md` to the Step 8 fact-checker prompt as a fifth file. Tell learn-synthesis that a seed source question's rows also use the seed's claims.

### LOW
LOW-1. `plugins/djinn/commands/learn.md:272` An angle agent that replies but writes no file is not recorded as failed. Its two-line reply becomes the angle file, and the run can report COMPLETE with that angle empty.
Mechanism: each angle agent is told to "Reply with only the header line and your Counts line" (learn.md:266). The recovery rule writes that reply to the path (learn.md:272). So the file holds a header and a Counts line such as `claims 14, items 7` and no claims. The agent is only listed as failed after two empty or errored returns (learn.md:269 to 271), so `Failed agents:` reads `none` in the synthesis prompt (learn.md:304), and CONTRACTS.md:1152 to 1153's `PARTIAL` is never reached.
Traced: learn.md:264 to 266, then learn.md:269 to 272, then learn.md:304, then learn.md:477 (outcome).
Trigger: an angle agent that ends its turn without calling Write, which a long generation can do. The fact checker finds no Claims table. Synthesis sees nothing from that angle, and the ledger says COMPLETE.
Fix: when the reply exists but the file does not, retry once like an error. On a second miss, write `FAILED TO RETURN (2 attempts)` and list the agent as failed.

LOW-2. `plugins/djinn/commands/learn.md:215` The never-evidence list hardcodes `learn/` instead of `<out_dir>`. With a custom `out_dir` inside a source folder, earlier runs' model-written study sheets and rows can be cited as VERIFIED evidence.
Mechanism: `context.md` `exclude`, the angle block (learn.md:249) and the checker prompt (learn.md:285) all pass the literal `learn/`, as do CONTRACTS.md:854 and 894. `out_dir` is configurable (learn.md:62). learn-fact-checker.md:31 says "every learn run folder", but the pasted list names only `learn/`, so the agent has no path to match against.
Traced: learn.md:62 (`out_dir`) to learn.md:215, 249, 285 (literal `learn/`) to learn-fact-checker.md:95 (never cite a file "on the never list").
Trigger: config `learn: { sources: [docs/], out_dir: docs/learn-runs/ }`, two runs on one topic. The second run's checker greps `docs/`, hits the first run's `study-sheet.md` line, and cites it for a recall claim.
Fix: write `<out_dir>` wherever the lists say `learn/`, in learn.md, CONTRACTS.md:854 and 894, and the template comment.

LOW-3. `plugins/djinn/commands/learn.md:152` Step 4 tells the orchestrator to search with a pattern file passed by `-f`. The Grep tool has no `-f`, and the Rules' Bash list (learn.md:507 to 512) allows no `grep` or `rg`.
Mechanism: the only permitted way to search is the Grep tool. It takes the pattern as a regex argument, with no pattern file and no fixed-string flag. The orchestrator will type the topic in as a regex, so a topic holding `(`, `+` or `.` (for example `C++ templates`, `[a stage name] ([a waveform])`) errors or matches the wrong lines.
Traced: learn.md:150 to 153 against learn.md:507 to 513.
Trigger: `/djinn:learn --topic "K+ channels"`. `+` is a quantifier, so the search misses the literal text.
Fix: say to escape the topic's regex metacharacters before passing it to the Grep tool, or add `grep -F -i -f` over a list file to the allowed Bash list with the section 9 secret excludes.

LOW-4. `plugins/djinn/CONTRACTS.md:1110` A closing code fence with text after it (```` ``` The file lives in the run folder ...````) is not a closing fence in CommonMark. The rest of section 13 renders with its code blocks shifted by one.
Mechanism: the neutral-shape YAML block opened at :1091 does not close at :1110. It closes at :1123, where the run folder tree should open. The tree at :1124 to 1140 then renders as a paragraph, and the fence at :1150 opens a block that runs to end of file, swallowing the "### The command's one interpreter call" heading.
Traced: CONTRACTS.md:1091, :1110, :1123, :1141, :1146, :1150, end of file.
Trigger: `python3 ~/Conventions/tools/render-doc.py plugins/djinn/CONTRACTS.md --open`. The last subsection of section 13 shows as code.
Fix: put the closing ```` ``` ```` on its own line and start "The file lives in the run folder..." on the next line.

LOW-5. `plugins/djinn/README.md:273` The agent table says learn-harder builds "a five rung difficulty ladder". The contract and the agent both give six rungs.
Mechanism: wrong count in the map a newcomer reads.
Traced: README.md:273 against CONTRACTS.md:923 to 928 and learn-harder.md:37 to 56 (recall, discrimination, application, multi-step, spot-the-mistake, edge-case).
Trigger: read the README's agent table.
Fix: "a six rung generic ladder, or the repo's own tiers".

LOW-6. `plugins/djinn/README.md:178` The first usage example puts the options and `Answer: R` on one line. Step 2 parses options and the key as lines, so the documented example lands on the "no key line, ask the owner and stop" path.
Mechanism: learn.md:78 to 81 reads options as "lines starting `A.`, `B)`" and the key as "a line starting `Answer:` or `Key:`". In the example, every option and the key sit mid-line.
Traced: README.md:178 to learn.md:77 to 81.
Trigger: paste the README's first example as written. A literal-reading orchestrator finds no key line, asks for the key, and stops.
Fix: show the example with the options and `Answer: R` on their own lines, or let Step 2 accept `A.` to `D.` and `Answer:` markers anywhere in a one-line question.

LOW-7. `plugins/djinn/commands/learn.md:430` The check script does not catch a missing or unreadable `.jsonl`. `open` raises, the traceback ends the loop, and the files after it are never checked.
Mechanism: no try around `open(path, encoding="utf-8")` or around the line iteration, so `FileNotFoundError` or `UnicodeDecodeError` kills the script. The failure is still caught, because learn.md:454 to 456 counts any line other than `rows read` as a failure. But check.txt then lists only the first bad file, and the one rewrite (learn.md:459 to 462) fixes only that one, so a second problem file shows up only in the second check and becomes PARTIAL with no rewrite.
Traced: learn.md:424 to 446 to learn.md:454 to 463.
Trigger: synthesis skips `dpo.jsonl` (missing) and `grpo.jsonl` has one bad row. Run 1 names only dpo, the rewrite writes dpo, and run 2 fails on grpo. Outcome `PARTIAL`.
Fix: wrap the open and the loop in `try: ... except (OSError, UnicodeDecodeError) as e: print(path + ": cannot read: " + str(e)); failed = True; continue`.

LOW-8. `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/study-sheet.md:8` The course repo example is a secure run (context.md:13 `secure: yes`), but its study sheet has no line saying it reveals a secure item's key. The teaching repo example has one (study-sheet.md:8).
Mechanism: learn-synthesis.md:255 to 257 requires that line first after the header when the source is secure. This example is one of the two worked outputs a reader copies.
Traced: context.md:13 to study-sheet.md:1 to 8 to learn-synthesis.md:255 to 257.
Trigger: open the example's study sheet. The line after the header is "For Donald as the student."
Fix: add the secure line after the header, or note in the example README that the dry run left it out and why.

### DEBT
none

### REC
none

## Blast radius
none

## Checked and Clean
- `plugins/djinn/commands/learn.md`: the Step 9 check fails closed on blank lines, bad JSON and non-object rows (lines 432 to 441, 395 to 396). `verification` is tied to an empty `unverified_claims` (359 to 362). The rubric requires one `answer` check, first, whose `terms[0]` equals the `answer` column (383 to 386), and the non-forbids weights must sum to 1.0 (387 to 388). The `--` that xargs passes is filtered at 424.
- `plugins/djinn/commands/learn.md`: the ledger's input column carries only the path and ids (480 to 483), so no key reaches it. Every abort path names a ledger line (133, 143, 188, 465 onward).
- `plugins/djinn/commands/learn.md`: Step 9's synthesis prompt says to write "the files section 13 lists", which read literally takes in `angles/` and `verification/`. learn-synthesis.md:307 to 308 forbids touching those files or writing outside the run folder, so the angle and checker outputs are not overwritten.
- `plugins/djinn/CONTRACTS.md`: the reference `learn_reward` matches the scoring rules at 1022 to 1029 (normalized last-line match, then answer weight plus the mentions fraction minus forbids penalties, clamped at 0). `zip(completions, rubric)` aligns one rubric to each completion as TRL passes them.
- `plugins/djinn/CONTRACTS.md`: section 6 routes learn to its own ledger (462 to 464), and section 7 adds the learn status word (522, 526 to 529), consistent with every learn agent's header template.
- `plugins/djinn/agents/learn-fact-checker.md`: a hit in the input file is ignored even when it states the claim (95 to 96). Statuses are never upgraded on reasoning (94).
- `plugins/djinn/agents/learn-synthesis.md`: the CONTRADICTED note exception keeps the stem, options, key and rationale out of reach (47 to 54), matching CONTRACTS.md:955 to 959.
- `plugins/djinn/agents/learn-asked.md`, `learn-harder.md`, `learn-prepare.md`, `learn-known.md`: claim letters A, H, P and K match CONTRACTS.md:941 to 942 in normal mode. Each agent writes exactly one file under its own name.
- `docs/examples/learn-dry-run/2026-09-29-1237-tB-06`: README Counts sft=19 dpo=19 grpo=14 match check.txt run 2. The UNVERIFIED list has 8 entries (U8) and quarantine has 2 (C2). grpo row 1's `verification` agrees with `unverified_claims: []`. The README carries the SECURE SOURCE line first.
- `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01`: README Counts sft=9 dpo=9 grpo=7 match check.txt. The UNVERIFIED list totals 19 (U19). The only VERIFIED grpo row (row 5) has `unverified_claims: []`.
- `docs/examples/learn-dry-run/LEDGER.md`, `docs/examples/learn-dry-run-<course>/LEDGER.md`: the header and line shape match CONTRACTS.md:1147 to 1149.
- `plugins/djinn/templates/config.yaml`: the `learn` block's keys and sub-keys (`name`/`tests`, `name`/`where`) match CONTRACTS.md:850 to 870.
- `plugins/djinn/.claude-plugin/plugin.json`, `.djinn/config.yaml`, `plugins/djinn/relay.md`: the version 2.4.0 and the six agent names agree across all three and the agents folder.

## Files read outside the fence
none
