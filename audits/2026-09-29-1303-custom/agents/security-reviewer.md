---
title: security-reviewer report, 2026-09-29-1303-custom
author: Claude opus (security-reviewer)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

Redacted 2026-09-29, before this folder was committed: quoted exam item text, answer keys, topic words drawn from a secure item, and private scenario names from two private course repos are replaced by item ids and neutral descriptions in [brackets], because this repo is public. Every finding, id, line citation and number is unchanged.

## Findings

### HIGH

HIGH-1 (SECURE CONTENT). `docs/examples/learn-dry-run/2026-09-29-1237-tB-06/input.md:15` A live secure exam item from the teaching repo, with its answer key and rationale, is committed to the public djinn-relay repo, along with a second secure bank's text and private lecture lines.
Mechanism: the teaching repo keeps `content/secure/` off every public path because its secure bank README says each item there loses its value once students have seen it. The example folder reproduces item tB-06 word for word with its key. Pushing `Claude-Development-djinn-relay`, the branch the marketplace installs from, publishes it to any student who searches the item.
Traced: `input.md:15 to 22` (stem, the four options in order, `a: 0`, the `r:` rationale) matches `<teaching repo>/content/secure/<secure bank>:209 to 216` word for word; I opened the bank to confirm. The same item and key repeat in `sft.jsonl:1`, `dpo.jsonl:1`, `grpo.jsonl:1`, `study-sheet.md:16` and `angles/tB-06/learn-known.md`. Three neighbor secure items (tB-05, tB-07, tB-01) are summarized with their line numbers at `angles/tB-06/learn-asked.md:12 to 14`. A second secure bank is quoted: `verification/tB-06.md:80` carries `content/secure/<second secure bank>:279` word for word (confirmed against the bank). Private lecture lines are quoted throughout `verification/tB-06.md` and at `quarantine.md:17 to 19, 31`. Home paths are at `context.md:9 to 11` and `check.txt:14 to 16, 24 to 26`. The folder's own `README.md:8 to 12` says pushing publishes it. Tracked: yes. Commit 32a1c17 ("Add two hand dry runs of /djinn:learn", `.git/logs/HEAD:14`). `.gitignore:1 to 3` ignores only `node_modules/`, `.venv/` and `html/`. The dispatch says nothing is pushed yet, and `origin/Claude-Development-djinn-relay` reads 6587f87.
Fix: take the commit out of history before anything is pushed. Drop 32a1c17 (reset the branch to 28e269c, or an interactive rebase that removes it). A later commit that deletes the folder is not enough, because the blob still ships in history. If the plugin needs a worked example, build it from an invented question in a scratch repo. Donald decides how the history is rewritten.

HIGH-2 (PRIVATE REPO CONTENT). `docs/examples/learn-dry-run-<course>/2026-09-29-1254-e-01/context.md:20` A whole-repo-private course repo item, its trap notes and the private scenario keys are committed to the public repo.
Mechanism: the course repo stays private under its own house rules. The example reproduces a quiz item and names [a private scenario key], [its source file under `source/`] and a second setting, [a second scenario key] with [its source file under `source/`]. It also carries the private repo's track layout and research file paths. The physiology itself comes from a published paper, so the item text alone does little harm. The exposure is the private scenario link and the private repo's structure, placed next to Donald's name in a public repo. `README.md:13` says the item itself names no private setting, but `README.md:75` says the [scenario key's] wording follows a repo rule that exists to replace that name.
Traced: `input.md:13 to 19` reproduces `<course repo>/<module quiz>:16 to 26` (stem, options, key flag, trap notes; confirmed). The scenario keys and file paths appear at `context.md:20`, `README.md:75`, `items-DRAFT.yaml:147` (`scenario: [the first scenario key]`), `angles/e-01/learn-harder.md:62` and `study-sheet.md`. Home paths are at `context.md:8, 10` and `check.txt:11 to 13`. Tracked: yes, same commit 32a1c17, not ignored (`.gitignore:1 to 3`).
Fix: the same history removal as HIGH-1. The two folders came in one commit, so one drop covers both.

### MEDIUM

MEDIUM-1. `plugins/djinn/commands/learn.md:138` The secure check reads the working repo's config, not the input's repo, so a private file passed from another repo runs as `secure=no` and lands in the working repo.
Mechanism: the target repo is whatever repo the command runs in (`learn.md:55 to 58`). A quiz file may be "relative to the target repo root or absolute" (`learn.md:84`), and Step 3 expects an input from outside the repo (`learn.md:118`, "an input outside the target repo reads `n/a`"). Discovery proposes `secure_paths` from the target repo's own CLAUDE.md (`learn.md:122 to 124`). The secure check only fires on a folder named `secure` or a target-repo `secure_paths` entry (`learn.md:140 to 141`), and it only refuses a secure input outside the repo (`learn.md:142 to 144`). A private repo like the course repo, whose privacy lives in its own CLAUDE.md and not in a folder name, passes as not secure.
Traced: from `~/djinn-relay`, run `/djinn:learn <course repo>/<module quiz> e-01`. Target repo is djinn-relay (`learn.md:55`). Its config has no `learn` block (`.djinn/config.yaml`), so discovery reads djinn-relay's CLAUDE.md and finds no secure path. The input path has no `secure` folder, so `secure=no` (`learn.md:140`) and the run proceeds. RUN_DIR becomes `djinn-relay/learn/<stamp>-e-01/` (`learn.md:197`). No SECURE banner is written (`agents/learn-synthesis.md:270` fires only when secure). `learn/` is not ignored (`.gitignore:1 to 3`), so the next commit and push publish it. This is the same leak HIGH-2 made by hand, reached through the command itself.
Fix: in Step 3b, refuse any file input whose real path is outside the target repo root, secure or not, and tell the owner to run the command from the input's repo. That makes the input's own repo the target, so its CLAUDE.md drives discovery.

MEDIUM-2. `plugins/djinn/commands/learn.md:197` `out_dir` is never checked to sit inside the target repo, so the promise that a secure input "never leaves the target repo" holds only for where the input comes from, not where the output goes.
Mechanism: `out_dir` comes from config with no check (`learn.md:62`). RUN_DIR is `<out_dir>/<timestamp>-<slug>/` (`learn.md:197`). The rule "Write nothing outside `RUN_DIR`" (`learn.md:500`, `agents/learn-synthesis.md:307`) bounds writes to RUN_DIR but never bounds RUN_DIR itself. `out_dir: ../djinn-relay/docs/examples/`, or any absolute path, sends secure-derived items, keys and rows outside the repo. `CONTRACTS.md:1115` ("never leaves the target repo") and `plugins/djinn/README.md:206` ("never leaves the repo it came from") both claim more than the command enforces. `--sources` already gets an inside-the-repo check (`learn.md` Step 2 flags); `out_dir` does not.
Traced: `.djinn/config.yaml` in the teaching repo sets `learn.out_dir: ~/djinn-relay/docs/examples/`. The input `content/secure/<secure bank>` is inside the repo, so the secure check passes (`learn.md:142`). RUN_DIR lands in djinn-relay (`learn.md:197`), and every angle, fact checker and synthesis write follows it (`learn.md:265`, `:286`, Step 9). The plan prints `out:` (`learn.md:181`), but with one question and every value from config it prints and goes on without waiting (`learn.md:184 to 189`). The only thing that stops it is Claude Code's permission prompt for writes outside the working directory, and that sits outside the plugin.
Fix: in Step 1, resolve `out_dir` with `realpath -m` (fed through the list file, as section 9 requires). Stop with `ABORTED step 1: out_dir outside the target repo` unless the resolved path is under the repo root. Then rewrite `CONTRACTS.md:1115` and `README.md:206` to describe both checks.

MEDIUM-3. `plugins/djinn/commands/learn.md:138` A secure mark is set only by the input file's path, so secure bank content reaches `secure=no` runs through topic mode, item shape banks and quoted non-source files.
Mechanism: the check is "file inputs only" (`learn.md:138`). Topic mode picks items from every `item_shape` bank (`learn.md:150 to 155`), and the section 13 example sets `item_shape` to a secure bank (`CONTRACTS.md:856`). A topic run can therefore study a secure item as `secure=no`. A pasted question never gets a secure check at all. In a normal run on a non-secure quiz, learn-asked "Read[s] the whole input file and every question bank the item shape names" and lists what they ask (`agents/learn-asked.md:29 to 34`). learn-prepare greps "the question banks" (`agents/learn-prepare.md:31 to 35`). The fact checker writes `stated in <path:line>` for a non-source file (`agents/learn-fact-checker.md:74`) and quotes up to twenty words (`:59`). Secure bank text then ships in a run with no SECURE banner (`agents/learn-synthesis.md:270`), no study sheet warning (`:255 to 257`) and `secure=no` in the ledger.
Traced: this already happened once. `verification/tB-06.md:80` in the dry run quotes `content/secure/<second secure bank>:279`, a bank that was neither the input nor a source. In that run the input was also secure, so the banner hid the gap. With a `content/questions/` input and the same `item_shape`, the same quote ships unmarked.
Fix: a run is secure when the input, any item picked in topic mode, any `item_shape` file, or any file an agent quotes sits under a secure path. Compute that in Step 3b and Step 4, and pass it on to every banner. Tell the fact checker to name a non-source file by `path:line` only, never to quote it.

MEDIUM-4. `plugins/djinn/agents/learn-synthesis.md:229` Training rows carry no secure marker, and the README's load recipe strips the only provenance they do carry.
Mechanism: the rows are the artifact most likely to leave the folder: copied to a training box, merged with other runs, pushed to a dataset hub. The secure warning lives only in a sibling `README.md` (`learn-synthesis.md:270`). Row `metadata` holds exactly nine keys with no secure field (`learn-synthesis.md:229 to 238`), and the Step 9 check rejects any extra key (`learn.md:323`, `set(value) != want`). So the owner cannot even add one without failing the check. For a `secure_paths: [.]` repo the rows' `source_ref` looks ordinary (`content/tracks/...`). The recommended loader then runs `remove_columns("metadata")` (`learn-synthesis.md:294`, `CONTRACTS.md:1004`), which drops even that. `items-DRAFT` gets no secure note either (`learn-synthesis.md:103 to 110`). The course repo draft's attribution note (`items-DRAFT.yaml:1 to 11`) says nothing about privacy.
Traced: secure input, then synthesis writes the rows (`learn-synthesis.md:229`), the check enforces the nine keys (`learn.md:323`), the README recipe filters and drops metadata (`learn-synthesis.md:294`), and a clean dataset object comes out with no trace of where it came from.
Fix: add `secure` (`"yes"` or `"no"`) to the metadata keys in `learn-synthesis.md:229`, `CONTRACTS.md` section 13 and `META` at `learn.md:323`. In the README recipe, filter `secure == "no"` before any push. Write the SECURE SOURCE line into the `items-DRAFT` attribution note as well.

### LOW

LOW-1. `plugins/djinn/CONTRACTS.md:856` The shipped public contract and README name a real secure bank and item in a private repo.
Mechanism: `CONTRACTS.md:856` and `:1149`, and `plugins/djinn/README.md:179 to 181`, give `content/secure/<secure bank>` and `tB-06` as examples. `CONTRACTS.md:872 to 883` also describes the teaching repo's and the course repo's private layouts. This is no key and no item text, but it is a course code, a quiz title and a private repo map in every installed copy.
Traced: grep for `<secure bank>` and `<course track>` over `plugins/djinn/`.
Fix: use invented paths (`content/secure/<quiz>.yaml`, `q7`, `content/quizzes/week-3.yaml`) and describe the two repos by shape without naming them.

LOW-2. `plugins/djinn/commands/learn.md:209` Run files record absolute home paths, so a run folder that is shared carries the owner's username and repo locations.
Mechanism: `context.md` writes `target_repo: <root>` as an absolute path (`learn.md` Step 6 template), and Step 9 feeds absolute paths to the check, whose output goes verbatim into `check.txt`. The dry runs show both (`learn-dry-run/.../context.md:11`, `check.txt:14`).
Traced: the Step 6 template and the Step 9 list file, against the two example `check.txt` files.
Fix: write `target_repo` as the repo's folder name, and rewrite each path in `check.txt` relative to the repo root before saving.

### DEBT
none

### REC

REC-1. Add a `qa/human` style script for `/djinn:learn`'s leak guards: a cross-repo input, an `out_dir` outside the repo, and a topic run over a secure bank. Each should stop or mark `secure=yes`. The plugin has no test lane, so a walked script is the only proof these guards hold.

REC-2. In a secure run, report in the plan whether `out_dir` is tracked by git and whether the repo has a remote, so the owner sees before `go` that the folder will ride along with the next push.

REC-3. For djinn-relay itself, a pre-push check (a hook or a line in `build_cmd`) that fails on `SECURE SOURCE`, `content/secure/` or `/home/` in any tracked file outside `plugins/`. It would have caught 32a1c17.

## Blast radius
none

## Checked and Clean
- `plugins/djinn/commands/learn.md` Step 9: file paths go through `$RUN_TMP/jsonl-files` and `xargs -0 -r python3 ... --`, and the script is written with Write. No path or config value is typed into a shell.
- `plugins/djinn/commands/learn.md` Step 4: the topic reaches Grep through a pattern file with `-f` (`learn.md:150 to 155`), so topic text never runs as shell.
- `plugins/djinn/commands/learn.md` Step 6: the slug keeps only `a` to `z`, `0` to `9` and `-`, cut to `SLUG_MAX`, so a question id cannot put `..` or `/` into RUN_DIR. `out_dir` is the open path (MEDIUM-2).
- `plugins/djinn/commands/learn.md` Step 10: the ledger takes path and ids only, never a key or stem. Both example `LEDGER.md` lines comply.
- `plugins/djinn/commands/learn.md` Step 2: `--sources` paths must exist under the target repo.
- Default `out_dir: learn/` inside the teaching repo: its site bundles through an allowlist of three globs (its secure bank README), so `learn/` in that private repo is not a publication path.
- Every agent file (`learn-known`, `learn-asked`, `learn-harder`, `learn-prepare`, `learn-fact-checker`, `learn-synthesis`): the tools are `Read, Grep, Glob, Write`, with no Bash. Each says never to open `.env`, key or credential files.
- Secret grep over the whole patch (`API_KEY`, `SECRET`, `TOKEN`, `password`, `Bearer`, `private_key`, `BEGIN PRIVATE KEY`, and strings of 40 or more alphanumerics): the only hits are the two target repos' commit SHAs (`e25edc2...`, `76d738d...`). Those are public identifiers, not secrets.
- `.djinn/config.yaml`, `plugins/djinn/.claude-plugin/plugin.json`, `plugins/djinn/relay.md`, `plugins/djinn/templates/config.yaml`: prose and version changes, with no private data and no new sink. The `out_dir` default in the template belongs to MEDIUM-2.
- `docs/examples/*/LEDGER.md`, `usage.md`, `quarantine.md` (the course repo): no key, stem or quote beyond what HIGH-1 and HIGH-2 already cover.

## Files read outside the fence
- `~/djinn-relay/.gitignore` (is the example folder tracked)
- `~/djinn-relay/.git/logs/HEAD` (confirm commit 32a1c17 exists)
- `~/djinn-relay/.git/refs/remotes/origin/Claude-Development-djinn-relay` (what is pushed)
- `<teaching repo>/content/secure/<secure bank>` (verify item copied verbatim)
- `<teaching repo>/content/secure/<second secure bank>` (verify quoted line 279)
- `<teaching repo>/content/secure/README.md` (secure rule, named in context.md)
- `<teaching repo>/.gitignore` (is learn/ out_dir tracked)
- `<course repo>/CLAUDE.md` (private rule, cited line 246)
- `<course repo>/<module quiz>` (verify item copied verbatim)
