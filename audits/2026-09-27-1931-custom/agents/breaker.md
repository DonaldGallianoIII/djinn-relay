---
title: breaker report, audits/2026-09-27-1931-custom
author: Claude Opus 5.5 (breaker)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Round 1 status

Written because this round's dispatch asked for it. CONTRACTS.md:134 to 136
now says synthesis alone owns prior-finding status, so synthesis should
treat this table as input, not as the status table.

| Round 1 finding | Status | Proof |
|---|---|---|
| synthesis HIGH-1 (untracked content in the patch) | RESOLVED | review.md:234 to 238: "one line per untracked fenced file, `untracked: <path> (<bytes> bytes)` ... No untracked file's content ever enters the patch". CONTRACTS.md:164 to 167 says the same. The remaining untracked-content path is dispatch's `<id>.diff` (MEDIUM-6 below), which is a different file. |
| synthesis HIGH-2 (raw names in shell) | RESOLVED for file paths | CONTRACTS.md:490 to 496 feeds paths through `xargs -0` and patterns through `-f`, and proof-runner.md:167 to 169 refuses an unsafe name before `'{file}'` reaches the shell (:219). Refs are not covered (LOW-2), git's path quoting leaves some names unreachable (LOW-1), and the canonical form lacks `-r` (MEDIUM-1). |
| synthesis HIGH-3 (heap-only cap) | RESOLVED in proof-runner only | proof-runner.md:96 refuses without `memory_wrapper`, and :224 puts the wrapper in front of the run. The landing lane and the fixer's own test runs are still heap-only and are now labeled "capped" (HIGH-1 below). |
| breaker R1 HIGH-1 (untracked secret in patch) | RESOLVED | Same sentence as synthesis HIGH-1. |
| breaker R1 HIGH-2 (Buffer memory past heap cap) | RESOLVED for proof-runner, NOT RESOLVED for the lane | proof-runner.md:233 "The wrapper bounds resident memory for the whole process tree". dispatch.md:254 runs the lane as `NODE_OPTIONS=--max-old-space-size=<heap_mb> timeout <lane timeout> <test_cmd>` with no wrapper. |
| breaker R1 MEDIUM-1 (screen reads only the chosen file) | RESOLVED | proof-runner.md:163 to 165 reads "every file it imports by a relative path, one hop out". The rest (two hops, bare specifiers) is LOW-10. |
| breaker R1 MEDIUM-2 (network and billed calls) | RESOLVED | proof-runner.md:176 to 178 refuses `fetch(`, `http`, `https`, `net`, `.env` or `process.env` reads and paid API names, and :221 empties every paid key env var. |
| breaker R1 MEDIUM-3 (tool timeout) | RESOLVED | proof-runner.md:227 to 231 sets the tool timeout to `timeout_s` plus `KILL_MARGIN_S` plus `TOOL_SLACK_S`, and :103 to 105 refuses against `harness_timeout_max_s` when set. The lane has no such check (LOW-6). |
| breaker R1 MEDIUM-4 (snapshot blind spots) | RESOLVED | proof-runner.md:199 to 207 adds `--binary`, untracked content hashes, the ignored listing and a `find -newer` stamp. |
| breaker R1 MEDIUM-5 (untracked flood) | RESOLVED | review.md:210 to 217 stops above `MAX_UNTRACKED` or on a vendor segment. Tracked lists have no cap, which the new map scope makes reachable (LOW-4). |
| breaker R1 MEDIUM-6 (snapshot floods context) | RESOLVED | proof-runner.md:196 to 197 "only its hash and line count reach you; you never read a raw listing", and :241 to 243 uses `diff -q` on a mismatch. |
| breaker R1 MEDIUM-7 (runner check is presence only) | NOT RESOLVED | proof-runner.md:100 refuses `&&`, `||`, `;`, `|`, a backtick, `$(`, `>` and `<`, but not a newline, so a two-line runner still runs its second line outside `timeout`, outside the wrapper and with the real env (MEDIUM-3). My round 1 fix list left the newline out; the invariant still breaks. |
| breaker R1 MEDIUM-8 (test output named a scope leak) | RESOLVED | dispatch.md:243 to 247 takes the listing before the lane, and :306 to 308 puts anything that appears only after it on `written by test runs`, never into FENCE. |

## Findings

### HIGH
HIGH-1. `plugins/djinn/commands/dispatch.md:254` The landing lane and the fixer's own test runs are capped on the V8 heap only, while the plan prints "capped", so HIGH-3's Buffer hole is still open on the one test path that runs automatically after "go".
Attack: a project with `proof.heap_mb: 4096` and `proof.memory_wrapper` set, and `test_cmd: npm test`. Dispatch a fix that breaks a PNG decode loop, so a test grows `Buffer.concat` output until a condition that never comes true (the shape round 1 HIGH-3 accepted).
Reachable via: `/djinn:dispatch <brief>` then "go". No `--prove` is needed. The lane runs whenever `test_cmd` is set and `--no-tests` is not passed (dispatch.md:249 to 250).
Mechanism: CONTRACTS.md:349 to 350 says "`heap_mb` caps the V8 heap only. It does not bound Buffer or ArrayBuffer memory". D3 added the resident wrapper to proof-runner (proof-runner.md:224) and nowhere else. The lane command at dispatch.md:254 and the fixer's prefix at fixer.md:99 to 101 carry `NODE_OPTIONS` and `timeout` only. `NODE_OPTIONS` also reaches every child the suite starts, so the per-process cap multiplies: the game repo's `npm test` is `--test-concurrency=4` (the game repo package.json:10), four children at `heap_mb` each. Up to 4 fixers can do the same at once (dispatch.md:96, fixer.md:85).
Traced: dispatch.md:110 (plan line "capped <heap_mb> MB") to :253 to 254 (the command, no wrapper) to CONTRACTS.md:349 to 350 (heap only), where the claim breaks.
Result: the owner says "go" to a plan that reads "Landing lane: capped 4096 MB, 120 s". Buffer growth in one child runs resident memory up to the machine's total inside the lane timeout, which is the WSL crash proof-runner was built to prevent.
Fix: when `memory_wrapper` is set, put it in front of the lane (`<memory_wrapper> env NODE_OPTIONS=... timeout --kill-after=<KILL_MARGIN_S>s <lane timeout> <test_cmd>`) and in front of each fixer test run. `{mem_mb}` for the lane should be a whole-suite figure (a new `proof.lane_mem_mb`, or half of `free -m`), since the wrapper bounds the whole tree. When `memory_wrapper` is absent, the plan and ledger must read `heap cap only (per process), resident memory unbounded`, never `capped`.

### MEDIUM
MEDIUM-1. `plugins/djinn/CONTRACTS.md:492` The canonical path form `tr '\n' '\0' < <file> | xargs -0 <cmd> --` has no `-r`, so an empty list runs `<cmd> --` over the whole repository.
Attack: a docs-only change (every fenced path is `.md`), or a test-only change, in the game repo. Then `/djinn:review`.
Reachable via: `/djinn:review` on any fence with no code file. Editing CLAUDE.md or a `qa/human/*.md` script is enough.
Mechanism: GNU `xargs` with no input still runs the command once with no arguments unless `-r` is given, and `git grep ... --` with no pathspec searches the whole working tree. review.md:86 to 89 builds the content-trigger path list from fenced code files only, so a docs-only fence gives an empty list, and the accessibility regex (:106), the `cost.paid_apis` `-F -f` grep (:125 to 127) and the live trigger all run repo-wide. Tree-facts item 3 (:313 to 315) drops test files from the list, so a test-only fence runs the hand mutant grep over every file. proof-runner.md:201 shows the author knew the flag (`xargs -0 -r`); the rule every other site copies does not carry it.
Traced: CONTRACTS.md:492 (no `-r`) to review.md:86 to 92 (the code-file list, empty for markdown) to :106 (regex over the whole tree), where a fenced-only trigger reads unfenced files.
Result: on a CLAUDE.md edit in the game repo, accessibility-reviewer fires on `src/viewer/*` (`createElement(`, `WebGLRenderer`), and cost-complexity-reviewer, a web agent, fires on `tools/meshy.mjs` (`MESHY_API_KEY`). context.md records triggers "for which fenced files" that are not fenced. On a test-only change, tree-facts.md lists repo-wide mutant hits as "Hand mutant hits" in fenced source. This is the LOW-23 behavior the fix meant to remove, now reached another way.
Fix: write the form as `tr '\n' '\0' < <file> | xargs -0 -r <cmd> --` in CONTRACTS.md:492, gate-auditor.md:97, review.md:200 and dispatch.md:471 to 473. Also add one sentence: "An empty list runs nothing; the step's result is `none`."

MEDIUM-2. `plugins/djinn/agents/proof-runner.md:96` Nothing proves the memory wrapper works. A wrapper that fails to start reads as a test FAIL, and a wrapper whose `{mem_mb}` caps nothing passes the refusal.
Attack: (a) the template's own example, `systemd-run --user --scope -p MemoryMax={mem_mb}M -p MemorySwapMax=0`, in a harness Bash with no user bus, so `systemd-run` exits 1 before the test starts. (b) a wrapper where `{mem_mb}` is inert or in the wrong unit, such as `prlimit --as={mem_mb}` (bytes, so every node dies at start) or `nice -n 5 true {mem_mb}`.
Reachable via: an owner filling `proof.memory_wrapper` as the template suggests (templates/config.yaml:110 to 112 says "Test it once on your machine: nothing in the plugin checks it works"), then `/djinn:dispatch --prove`.
Mechanism: the refusal checks only that `{mem_mb}` appears (:96). The D8 placement rule applies to `{heap_mb}` only (:98 to 99). The reading rules (:253 to 260) map any exit other than 0, 124, 134 and 137 to FAIL, and :289 to 291 make a cited FAIL a HIGH. The fix report says itself that WSL may have no user systemd (FIX-REPORT.md "Risks the approved text carries").
Traced: :96 (presence check) to :224 (wrapper spliced first) to :260 ("Any other exit: FAIL") to :289 (cited FAIL is HIGH), where a wrapper error becomes a HIGH finding against a correct fix. For (b), the Limits line at :333 claims a resident cap that does not exist.
Result: (a) every cited test reads FAIL, and synthesis merges a HIGH per landed fix, which blocks merge on a config error. (b) a report that says "resident cap: 8192 MB" over a run with no resident cap.
Fix: before the first run, run a probe under the filled wrapper: `<wrapper> node -e "<allocate Buffers to mem_mb plus 256 MB, then exit 0>"`. Refuse unless it exits 137 or prints the wrapper's out-of-memory line, and refuse with `memory wrapper did not start` when it exits anything else. The probe allocates at most `mem_mb` plus 256 MB, which the half-of-total check (:110 to 112) already bounds.

MEDIUM-3. `plugins/djinn/agents/proof-runner.md:100` The operator refusal misses the newline, so a multi-line `runner` or `memory_wrapper` runs every line after the first outside the timeout, the wrapper, `NODE_OPTIONS` and the emptied keys.
Attack: `proof.runner: |` with two lines, `cd packages/sim` then `node --max-old-space-size={heap_mb} --test {file}`. That is the monorepo shape the `&&` refusal just told the owner they cannot write on one line. Also a single `&`, and `#` (`pytest {file} # --max-old-space-size={heap_mb}` passes the placement check at :98 to 99 with the flag commented out).
Reachable via: an owner writing a YAML block scalar for `proof.runner`, then `--prove`.
Mechanism: after filling the template, line 1 is `<wrapper> env KEY= NODE_OPTIONS=... timeout ... cd packages/sim`. `timeout` cannot exec the `cd` builtin. Line 2 is a new command, `node ... 'file' 2>&1 | { head ...; }`, with no wrapper, no `timeout`, and the real env, so the paid keys are set. `${PIPESTATUS[0]}` then reads line 2's exit, so the report looks normal.
Traced: :100 to 102 (the list with no newline) to :224 (the run line, where the template is spliced into one Bash call) to :253 to 260 (the exit reading), where an unbounded run is read as a normal PASS or FAIL.
Result: the round 1 HIGH-3 crash path, and a billed call with a live key, under a report that lists both caps.
Fix: an allowlist, not a denylist. Refuse `runner` or `memory_wrapper` unless every character is in `A-Z a-z 0-9 space . _ / - = : , @ + { }`. That shuts out newline, `&`, `#`, quotes, `$` and every operator at once.

MEDIUM-4. `plugins/djinn/agents/proof-runner.md:210` The widened mutant grep stops the whole invocation on a comment. The game repo's regression test for the hand-mutation bug holds `if (false)` in its header comment.
Attack: `--prove` on a finding in `qa/bot/viewer-shots.mjs` or `qa/bot/png.mjs`. The importer route picks `tests/qa-viewer-update.test.mjs`, which imports both (lines 26 to 27). It passes the one-hop screen: its imports are node builtins plus two files with no process, env or network use, and `png.mjs:5` names playwright in a comment only.
Reachable via: `/djinn:dispatch --prove`, or a direct proof request on any viewer QA finding.
Mechanism: MEDIUM-6's fix widened the grep to "every chosen test file, on any line" and kept "A hit anywhere stops the whole invocation before any run" (:213). `tests/qa-viewer-update.test.mjs:13` reads `` // ignored in finishShots (`if (false)` in place of `if (failed > 0)`), the ``. That is a test documenting the mutation it guards against, which is what KNOWN-BUGS asks a regression test to do.
Traced: :156 to 158 (importer chosen) to :163 to 178 (screen passes) to :210 to 214 (fixed-string grep, any line) to :279 (stop), where a comment ends every proof in the invocation.
Result: `Stopped: MUTANT tests/qa-viewer-update.test.mjs:13`, every finding NOT RUN, and the ledger reads `STOPPED ...: MUTANT`, all before a single run. JS defaults like `opts.x || true` stop it the same way.
Fix: stop on a hit that is on a line the landed diff added (`+` lines of `fixes/<id>.diff`), or on a line of a fixed or test file that differs from the merge base. Report every other hit under REC with its file:line, and skip whole-line comments (`//`, `#`, ` * `).

MEDIUM-5. `plugins/djinn/commands/dispatch.md:140` Every temp list has a fixed name under `$TMPDIR` with no `mktemp`, so two runs at once swap lists, and an unset `TMPDIR` writes to `/`.
Attack: two sessions dispatching in two repos with overlapping lifetimes (fixers take minutes, and the "go" gate holds a run open). Or any run in a shell where `TMPDIR` is unset.
Reachable via: `/djinn:dispatch` in two sessions, or `/djinn:review` in two sessions, or `--prove` in two sessions. The owner runs several sessions on one machine; the incident proof-runner.md:11 to 14 cites killed "every session on it".
Mechanism: dispatch.md:140 writes `$TMPDIR/untracked-before.txt`, and :244 to 246 write `$TMPDIR/untracked-landed.txt` and `$TMPDIR/changed-landed.txt`. proof-runner.md:198 to 206 writes `$TMPDIR/proof-status-<k>.txt` and `$TMPDIR/proof-stamp`. review.md:199 keeps its Step 3 lists "in files under `$TMPDIR`" with no unique name. With `TMPDIR` unset, `$TMPDIR/x` is `/x`.
Traced: dispatch.md:140 (repo A writes the before list) to repo B's run writing the same path to dispatch.md:301 to 305 (A compares its landed list against B's before list), where every untracked file in A that B lacks is named a scope leak and added to FENCE. For proof-runner, B's `touch $TMPDIR/proof-stamp` moves A's stamp, so A's `find -newer` (:206) reads against the wrong time.
Result: silently wrong scope leaks and a wrong round fence in dispatch, a spurious or missed TREE CHANGED in proof-runner, and with `TMPDIR` unset a permission error at the first write, which no step has an error path for.
Fix: one line at the start of review, dispatch and proof-runner: `RUN_TMP=$(mktemp -d)`, all lists under it, removed at the end. Then use `$RUN_TMP` everywhere the text says `$TMPDIR`.

MEDIUM-6. `plugins/djinn/commands/dispatch.md:196` Feeding untracked work-set files to `git diff --no-index /dev/null` through `xargs -0` breaks with two files. The rationale beside it is false, so `<id>.diff` holds whole files, not fixes.
Attack: a brief whose work set names two untracked files. This repo in this build had several untracked agent files; `legibility-reviewer.md` arrived untracked during the fix pass.
Reachable via: `/djinn:dispatch` on such a brief.
Mechanism: (a) `git diff --no-index` takes exactly two paths. "fed the same way" (:196) means `xargs -0 git diff --no-index /dev/null --`, which passes every file in one call when more than one exists, and git exits with its usage text. (b) The text says "These are the fixer's own new files", but Step 2 rejects any work-set file that does not exist (:65). So every untracked work-set file existed before the fixer, and the `/dev/null` diff is the whole file, not the fixer's change.
Traced: dispatch.md:65 (missing file rejected) to :194 to 199 (`--no-index` fed through `xargs`) to :366 to 367 (`round-patch.patch` built from these diffs) to :387 (synthesis verifies "by reading each diff"), where synthesis reads a usage message or a whole file as the fix.
Result: with two files, `<id>.diff` holds no content for either, and the round patch and devils-advocate's hunk walk miss them. With one file, synthesis sees the whole file as added and cannot tell what the fixer changed.
Fix: before spawning (Step 6 Snapshot), copy each untracked work-set file into `$RUN_TMP/pre/<same path>`. After the batch, diff each file one at a time (`xargs -0 -r -n 1`), as `git diff --no-index $RUN_TMP/pre/<path> <path>`, which gives the fixer's change. Fix the rationale sentence.

MEDIUM-7. `plugins/djinn/commands/dispatch.md:254` `test_cmd` is spliced after `timeout` with no operator check, so a chained `test_cmd` runs its tests outside both caps.
Attack: `test_cmd: npm run build && npm test`, or `cd packages/sim && pytest`.
Reachable via: `/djinn:dispatch` with `proof.heap_mb` set and such a `test_cmd`. Both are common config shapes.
Mechanism: the filled line is `NODE_OPTIONS=... timeout <t> npm run build && npm test`. The env assignment and `timeout` bind to the first simple command only, so `npm test` runs with neither. The `cd` form fails inside `timeout`, and `&&` then skips the tests entirely. D8's refusal (proof-runner.md:100) guards `runner`, not `test_cmd`.
Traced: dispatch.md:253 ("run it capped") to :254 (splice) to :258 (exit code recorded as the lane's), where the plan's "capped" line (:110) no longer describes the run.
Result: the plan says capped, the ledger says `lane=capped`, and the suite ran with no heap cap and no clock. Or, in the `cd` form, the suite never ran and the lane reads failed.
Fix: run the lane as `timeout ... bash -c <test_cmd from a file>`, so the whole string sits under `timeout` and the env. Or apply the same allowlist as MEDIUM-3 and print `uncapped: test_cmd chains commands` in the plan when it fails.

### LOW
LOW-1. `plugins/djinn/commands/review.md:207` Path lists come from git without `-z` or `core.quotePath=false`, so a name with a non-ASCII byte, a `"` or a `\` enters fence.txt C-quoted, as a path that does not exist.
Attack: an untracked or changed `docs/café-notes.md`, or a name with a typographic quote.
Mechanism: git's default `core.quotePath=true` prints such names as `"caf\303\251-notes.md"` in `diff --name-only` and `ls-files`. `tr '\n' '\0' | xargs -0 wc -c --` then gets a quoted string, `wc` errors, and every agent is told to read a path that is not on disk. The same holds for `.djinn/config.yaml:16`'s `build_cmd`, where check_voice.py raises FileNotFoundError, and for dispatch.md:139 and :245.
Fix: add `-c core.quotePath=false` to the section 9 read prefix and use `-z` with the NUL list files directly. A name holding a newline goes to tree-facts as `refused: newline in path`.

LOW-2. `plugins/djinn/commands/review.md:206` Refs are still typed into command lines (`git merge-base <base_branch> HEAD`, and `--base <ref>`), and the section 9 rule gives refs no safe form.
Attack: `--base donald's-fix`, or `base_branch: x$(id)`. Refnames may hold `'`, `$`, `(` and `)`.
Mechanism: an apostrophe ends the command in a syntax error, and Step 3 has no error path. A `$(...)` in a config ref runs, and the branch under review can edit the config (DEBT-4).
Fix: write the ref to a file and run `git merge-base --end-of-options "$(cat <file>)" HEAD` after `git check-ref-format --branch` reads it the same way. State the ref rule in CONTRACTS.md section 9.

LOW-3. `plugins/djinn/commands/review.md:211` The segment stop fires on legitimate new source under a `build/`, `dist/` or `vendor/` folder, and the only way past it drops every untracked file.
Attack: a new, untracked `tools/build/registry.mjs` or `scripts/build/pack.mjs`.
Mechanism: any untracked path with a `build/` segment stops the run (:211 to 216). The two remedies offered are `.gitignore`, which is wrong for source, and `--untracked none`, which removes the new file the review exists to see.
Fix: apply the segment rule only to a segment directory holding more than a handful of files, or add `--untracked <path-list-file>` to fence a named subset.

LOW-4. `plugins/djinn/commands/review.md:226` The map scope pastes every tracked path into the prompt with no cap, the flood the untracked stop was built to prevent.
Attack: `/djinn:review map` in a repo with tens of thousands of tracked files (a monorepo, or one that commits vendored code or assets).
Mechanism: :226 to 228 make the fence every tracked file, and :343 pastes `<contents of fence.txt>` into legibility-reviewer's prompt. Only untracked files are capped (:210 to 216).
Fix: in the map scope, paste `FENCE: <AUDIT_DIR>/fence.txt, <n> paths. Read it.` in place of the contents.

LOW-5. `plugins/djinn/commands/dispatch.md:320` A round's `tree-changes.txt` writes `A<TAB><path>` for every untracked file in the round fence, including files that existed before the dispatch.
Mechanism: Step 2 rejects missing work-set files (:65), so an untracked work-set file always predates the fixer. The round list still calls it added, legibility-reviewer's first trigger rule fires on it every round, and the agent is told the dispatch added a file it did not.
Fix: write `A` lines only for paths in `untracked-landed.txt` and not in `untracked-before.txt`.

LOW-6. `plugins/djinn/commands/dispatch.md:253` `lane_timeout_s` does nothing unless `heap_mb` is also set, it is never checked against `harness_timeout_max_s`, and the lane's `timeout` has no `--kill-after`.
Mechanism: CONTRACTS.md:359 calls it "the wall time for the landing lane" with no condition, while dispatch.md:253 to 256 applies it only "When `proof.heap_mb` and a lane timeout are both set". A whole-suite timeout is the value most likely to pass the harness maximum, and proof-runner's refusal (proof-runner.md:103 to 105) has no lane twin. A child that ignores SIGTERM outlives the lane.
Fix: apply the lane timeout whenever it is set, refuse or warn in the plan when it plus a margin passes `harness_timeout_max_s`, and add `--kill-after=<KILL_MARGIN_S>s`.

LOW-7. `plugins/djinn/commands/review.md:322` Tree-facts item 5's path-end patterns still flood on common base names such as `index`, `utils`, `types` or `config`.
Mechanism: `/index'` matches every import of any folder's `index`, not the untracked `src/new/index.js`. The fix stopped matches inside words but not matches in other folders.
Fix: include the parent folder in each pattern (`/<parent>/<name>'` and so on), and list a hit only when the import resolves to the untracked path.

LOW-8. `plugins/djinn/commands/review.md:234` A staged or intent-to-add secret-shaped file still enters the committed patch whole.
Attack: `git add -A` in a repo with an unignored `.env`, then `/djinn:review` before committing.
Mechanism: `git diff <merge-base>` includes staged new files. D1 withholds only untracked content, although tree-facts item 6 (:330 to 334) already names every secret-shaped fenced path.
Fix: add the section 9 secret pathspecs (`':!.env*' ':!*.pem' ':!*.key'`, plus the rest of item 6's list) to item 6's `git diff`, with one `withheld: <path> (secret-shaped name)` line each.

LOW-9. `plugins/djinn/agents/proof-runner.md:199` `git diff` follows the owner's `diff.external` and textconv drivers, so the patch and the proof snapshot may not be patches.
Attack: a global `diff.external = difft` (difftastic's documented setup).
Mechanism: porcelain `git diff` runs the external tool unless `--no-ext-diff`, and textconv unless `--no-textconv`. `input-diff.patch` (review.md:234) becomes difftastic output, and the `--binary` snapshot loses the binary content it was added to see. D11's prefix blocks index writes and the monitor, but not these two.
Fix: add `--no-ext-diff --no-textconv` to every `git diff` in CONTRACTS.md section 9's read rule.

LOW-10. `plugins/djinn/agents/proof-runner.md:163` The one-hop screen reads relative imports only, so a `#` subpath import, a workspace package or a second hop passes it.
Mechanism: a test importing `#tools/meshy` (package.json `imports`) or `../src/a.js`, which imports the network module, is screened on neither file. The emptied key holds unless the module reads `.env` by itself, which the game repo's `tools/meshy.mjs` does (round 1 MEDIUM-2). The disclosure (:19 to 22) covers the owner, so this stays LOW.
Fix: screen every import that resolves inside the repo (relative, `#` subpath, workspace), and state in Limits that deeper hops are not screened.

LOW-11. `plugins/djinn/agents/proof-runner.md:205` The `newer` part names the test for any write in the repo during its run, and dispatch halts the round on it.
Mechanism: `find -newer` sees an editor's swap file, another session's edit or a dev server's log as the test's write. :273 to 278 name "the file" as the cause, and dispatch.md:288 to 290 halt with `TREE CHANGED`.
Fix: word the stop as `the tree changed during <file>'s run (any writer)`, and list the newer paths from the saved file by count, not by blame.

LOW-12. `plugins/djinn/commands/dispatch.md:308` It is unclear which untracked list the round's `MAX_UNTRACKED` stop reads, so it may halt a round on test output.
Mechanism: the sentence follows the third listing, which holds test-written files, and says "the new untracked files". A lane that writes a `coverage/` or `build/` tree would halt the round, which is round 1 MEDIUM-8's misattribution in a new form.
Fix: "Apply the stop to files in `untracked-landed.txt` and not in `untracked-before.txt`; files on `written by test runs` never count toward it."

LOW-13. `plugins/djinn/agents/proof-runner.md:219` The fill wraps `{file}` in single quotes, so a runner template that already writes `"{file}"` passes the checks and runs a path with literal quotes in it.
Mechanism: `"{file}"` becomes `"'tests/x.test.mjs'"`. node gets a name that does not exist, the exit is FAIL, and a cited FAIL is a HIGH (:289).
Fix: refuse a runner where `{file}` sits inside quotes, or fill the bare template and quote only when `{file}` is unquoted.

### DEBT
none

### REC
REC-1. A wrapper fixture: the template's `systemd-run` example with no user bus, a wrapper with an inert `{mem_mb}`, and a probe that allocates past `mem_mb`. Each should end in a refusal, never in PASS or FAIL.
REC-2. A preflight fixture for the `-f` pattern files: a pattern file with a blank line, and a `paid_apis` entry named `none`. `grep -F -f` treats an empty pattern as matching every line, and git grep likely does the same (unverified here, since I ran nothing). The commands should write pattern files with no blank lines and refuse an empty pattern.
REC-3. An untracked symlink in the fence: one pointing at `/dev/zero` hangs `wc -c` in Step 3 item 6, and one pointing at a key outside the repo under a harmless name is read by agents whose secret rules go by name. A `find -type l` pass over the untracked list, listed in tree facts and never sized or read, closes both.
REC-4. A fixture for MEDIUM-1: a docs-only fence and a test-only fence, asserting context.md names no trigger on an unfenced file and tree-facts lists no hit outside the fence.

## Blast radius
- `plugins/djinn/agents/gate-auditor.md:97` copies the section 9 form without `-r`. An empty `gates[].guards` list makes `git log -1 ... --` read the whole repo's last commit as the guarded paths' last change, so a freshness verdict is wrong (same mechanism as MEDIUM-1).

## Handed off
- `plugins/djinn/CONTRACTS.md:490` says never type a config value into a command line, while dispatch.md:254 (`test_cmd`), proof-runner.md:224 (`runner`, `memory_wrapper`) and fixer's `build_cmd` are config values run as commands by design. The contract needs a sentence for command-valued keys. integration-reviewer
- `plugins/djinn/commands/dispatch.md:418` lists "halted on the untracked stop" as an exit, but the ledger format at :422 gives no outcome form for it. integration-reviewer
- This round's breaker prompt asks for a `## Round 1 status` section, which CONTRACTS.md:134 to 136 now forbids reviewers to write. integration-reviewer (review command's round prompt)

## Checked and Clean
- `plugins/djinn/agents/proof-runner.md`: edge input: `none` and `[]` read as absent (:66 to 67), and `max_files` above 20 is refused (:97). Boundary: `EXIT=137` splits on `SECONDS` against `timeout_s` (:253 to 255). GNU `timeout` re-raises a child's SIGKILL, so a cgroup OOM kill reads 137 under the time limit, which is CAPPED. `${PIPESTATUS[0]}` is expanded before the `$(date)` in the same word, so it reads the wrapper chain's exit. Resource: `head -c 16384` and `tail -c 4096` bound each run's output. The snapshot writes to files and only hashes and counts reach the agent (:196 to 209). Reentrancy: one run per file (:179 to 180), no rerun (:249), stop rules end the invocation (:269 to 280). Timing: the tool timeout sits `KILL_MARGIN_S` plus `TOOL_SLACK_S` above `timeout_s` (:227 to 229). Paid key names are safe to splice because review.md:27 to 31 and CONTRACTS.md:308 to 309 hold them to `^[A-Z_][A-Z0-9_]*$`. The dotenv default does not override a variable already set, even to empty, so `import 'dotenv/config'` leaves the emptied key empty. Breaks: MEDIUM-2, MEDIUM-3, MEDIUM-4, MEDIUM-5, LOW-9 to LOW-11, LOW-13.
- `plugins/djinn/commands/review.md`: edge: an empty fence stops at :231 to 233 before any folder exists. `--untracked none` skips item 3, and tree facts say so (:307 to 309). Boundary: the stop reads "more than `MAX_UNTRACKED`", so exactly 200 passes, which is consistent. Resource: untracked content never enters the patch (:234 to 238). The legibility trigger reads lists with Read, not a command line (:160 to 162). Injection: patterns go through `-f` (:125 to 127, :323 to 325), and fixed strings need no escaping. The widened a11y regex's library clause ends in `([^A-Za-z0-9_-]|$)`, so `rich_text` and `richardson` do not match. Reentrancy: proof-runner and fixer in a custom list abort at step 2 (:166 to 174). Timing: no async step. Breaks: MEDIUM-1, LOW-1 to LOW-4, LOW-7, LOW-8.
- `plugins/djinn/commands/dispatch.md`: state sequence: the listing before Step 6 (:138 to 142), after landing (:243 to 247) and after the tests (:306 to 308) separates fixer files from test files, which closes round 1 MEDIUM-8. A TREE CHANGED stop halts before any reviewer spawns (:288 to 290). The round cap at 3 bounds reentry (:237 to 238). `--no-tests` writes a one-line test-output file (:258 to 259). The fixer gets no test run without `heap_mb` (:163 to 166). Breaks: HIGH-1, MEDIUM-5 to MEDIUM-7, LOW-5, LOW-6, LOW-12.
- `plugins/djinn/CONTRACTS.md`: sections 4, 5, 6 and 9 read in full against the commands. The map-scope fence, tree lists and tree facts agree with review.md:226 to 274. The `lane=` and `proof=` ledger fields agree with dispatch.md:422. Breaks: MEDIUM-1 (section 9 form), LOW-6 (lane_timeout_s wording).
- `plugins/djinn/agents/fixer.md`: :95 to 105 read. With `heap_mb: none` it runs no test. With a number, the run is heap-only. Break folded into HIGH-1.
- `plugins/djinn/agents/gate-auditor.md`: Bash list (:91 to 115) checked for state change. Every git read carries the prefix, the search rule bans `--pre`, `--search-zip`, `-L` and `--no-ignore`, and `%b` is read-only. Break: the Blast radius line (no `-r`).
- `plugins/djinn/templates/config.yaml`: proof block (:96 to 116). The `none` defaults are covered by CONTRACTS.md:304 to 305. The example wrapper is the MEDIUM-2 attack input.
- `.djinn/config.yaml`: `build_cmd` (:16) now runs from the repo root, fails loudly on no files, and keeps a space in one argument. Break: LOW-1 (quoted non-ASCII names).
- `plugins/djinn/relay.md`, `plugins/djinn/README.md`, `plugins/djinn/.claude-plugin/plugin.json`: none of these runs anything. I checked the untracked flag and disclosure wording against review.md by grep through the patch only. No edge, timing, resource, reentrancy or boundary vector reaches them except through the command lines filed above.
- The other agent prompts in the fence (accessibility, breaker, bugs, consolidator, cost-complexity, data-contract, dependency, devils-advocate, format, integration, known-bugchecker, legibility, live-system, multiuser, perf, pipe-connector, security, synthesis, test-strategist, ux): none carries Bash except those checked above. Their six vectors reduce to prompt contradiction, which integration-reviewer owns. I did not read them in full this round, and that is a gap in this report.

## Files read outside the fence
- `<game repo>/.djinn/config.yaml` (lane test_cmd value)
- `<game repo>/package.json` (test concurrency, per-child cap)
- `<game repo>/tests/qa-viewer-update.test.mjs` (mutant grep false stop)
- `<game repo>/qa/bot/png.mjs` (one-hop screen check)
- `<game repo>/qa/bot/viewer-shots.mjs` (one-hop screen check)
- `<game repo>/` tests, src, tools and qa (grep: mutant strings)
