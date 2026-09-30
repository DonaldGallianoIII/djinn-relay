---
title: breaker report, audits/2026-09-27-1806-custom
author: Claude Opus 5.5 (breaker)
date: 2026-09-27
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

## Findings

### HIGH
HIGH-1. `plugins/djinn/commands/review.md:162` An untracked secret file gets written in full into `input-diff.patch`, and the audit folder is committed.
Attack: a repo with `.env` (or `meshy-key.txt`, `id_rsa.bak`, `.npmrc` holding a token) that `.gitignore` does not name, then `/djinn:review`.
Reachable via: `/djinn:review` in any repo where a secret file is untracked and not ignored. That is common in a fresh repo, or with a secret file under a name nobody thought to ignore.
Mechanism: Step 3 item 3 (`review.md:150`) adds every untracked, non-ignored file to the fence. Item 6 (`review.md:162-164`) then appends `git diff --no-index /dev/null <file>` for each one, which is the whole file content. Step 4 writes that to `<AUDIT_DIR>/input-diff.patch` (`review.md:178`). No step in review.md filters by name. The agents' "Never open `.env`" rules (`gate-auditor.md:100`, `proof-runner.md:99`) bind the agents. They do not bind the orchestrator's own `git diff`. Every agent is then told to read the patch (`review.md:257`), so the secret also lands in every agent's context.
Traced: `review.md:150` to `:153` (fence) to `:162` (`--no-index` diff of the untracked file) to `:178` (written into the audit folder). The owner's rule "audits/ get committed, never gitignored" then puts the value into git history.
Result: `MESHY_API_KEY=<value>` sits in `audits/<ts>-standard/input-diff.patch`, gets committed, and is quoted into every agent context.
Fix: before item 6, split untracked files into three groups: (a) names matching `.env`, `.env.*`, `*.pem`, `*.key`, `id_*`, `*.p12`, `.npmrc`, `credentials*` or `*secret*`: fence path only, never content; the patch line reads `untracked secret-shaped file, content withheld`; (b) files over `large_file_kb` (or 1024 KB when unset) and binaries: a size line only; (c) everything else as now. Name group (a) in `tree-facts.md` as a new section so security-reviewer sees it. Mirror the same rule in `dispatch.md:161-162`.

HIGH-2. `plugins/djinn/agents/proof-runner.md:147` The heap cap bounds the V8 old-space heap only, so the 30 GB incident class still takes the machine down through Buffer memory.
Attack: `--prove` on a fix whose covering test fails inside a loop that grows `Buffer`, `ArrayBuffer` or typed-array memory. For example, a decode or compare that `Buffer.concat`s chunks until a condition the broken fix never meets. The candidates are `tests/png.test.mjs` or `tests/qa-viewer-update.test.mjs`, both of which import the PNG decoder from `qa/bot/png.mjs`.
Reachable via: `/djinn:dispatch --prove` or a direct request, on any finding whose cited or importer test allocates binary buffers.
Mechanism: `--max-old-space-size` limits the JavaScript heap. Buffer and ArrayBuffer backing stores are external memory outside that limit. The only other bound is the wall clock (`proof.timeout_s`, 120 in the example at `CONTRACTS.md:223`), and 120 s is long enough to allocate tens of GB. The half-of-`free -m` check (`proof-runner.md:70-72`) compares one heap cap against total memory. It ignores external memory, and it ignores N capped child processes (`tests/studio-batch.test.mjs:99` and `tests/viewer-log.test.mjs:37` each spawn a node child, and every child gets its own `heap_mb`).
Traced: `proof-runner.md:52` (cap defined as heap) to `:147` (the only limits in the command are `NODE_OPTIONS` and `timeout`) to `:150-151` ("carries the cap"), which is where the claim breaks: nothing bounds resident memory.
Result: the WSL VM runs out of memory and every session on it dies, before `timeout` fires. That is the event the agent exists to prevent (`proof-runner.md:11-14`).
Fix: bound resident memory, not the heap alone. Wrap the run in `systemd-run --user --scope -p MemoryMax=<heap_mb * 2>M -p MemorySwapMax=0` when `systemd-run --user` works, or under a cgroup the owner names in config (`proof.memory_wrapper`). Otherwise refuse with "no resident memory cap available". Change the Limits line to say "heap cap (V8 only)" and add the resident cap as its own line. Make the half-of-total check count the resident cap times the most node processes the file can start.

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/proof-runner.md:119` The bot, browser and child-process screen reads only the chosen test file, so a helper one import away launches a browser or an uncapped process.
Attack: `tests/viewer-render.test.mjs` imports `./helpers/launch.mjs`, which imports `playwright` and starts Chromium. Or a test runs `spawnSync(process.execPath, ['--max-old-space-size=16384', 'tools/x.mjs'])`. Or `spawn('node', args, { env: { PATH: process.env.PATH } })`. Or `spawn('python3', ...)`.
Reachable via: `--prove` on a finding whose importer route picks such a file. The importer route (`:109-111`) picks by module import, not by content.
Mechanism: rule 2 (`:121`) matches playwright imports in the file itself. Rule 3 (`:122-123`) lists only `npm`, `npx`, `git`, an installer or a build. A `node` child with an explicit heap flag overrides `NODE_OPTIONS` (the command line wins). A child given an explicit `env` never gets `NODE_OPTIONS`. Chromium and python are not node, so the cap never applies to them.
Traced: `:116` ("read each chosen file") to `:121-123` (content checks on that file only) to `:147` (the run), where the grandchild runs outside the cap.
Result: a browser or a 16 GB node child runs under a report that says "heap_mb: 4096".
Fix: extend the screen one hop. Read each relative import of the chosen file. Mark NOT RUN any file whose own text or one-hop imports contain `child_process`, `worker_threads` with `resourceLimits`, `--max-old-space-size`, an `env:` option on a spawn, or a browser driver. The reason reads `spawns a process the cap may not reach`.

MEDIUM-2. `plugins/djinn/agents/proof-runner.md:119` Nothing stops a test that makes a network call, including a billed API call.
Attack: a fix in the game repo `tools/meshy.mjs`. The importer route picks `tests/meshy-finish.test.mjs`, whose base name matches. A broken fix or test reaches one of the module's `fetch` calls (`tools/meshy.mjs:123`, `:308`, `:641`). The module reads `MESHY_API_KEY` from `.env` by itself (`tools/meshy.mjs:108-114`).
Reachable via: `--prove` on any finding in a module that talks to a paid API.
Mechanism: the NOT RUN list has no network clause. The Never list at `:157-159` forbids "a server", not an outbound call. The dispatch prompts pass `cost.limits` only (`review.md:455-457`, `dispatch.md:221-223`), never `cost.paid_apis`, so the agent cannot know which modules are billed. "Never open `.env`" (`:99`) binds the agent, not the node process it starts.
Traced: `:109-111` (importer chosen by base name) to `:119-124` (no network screen) to `:147` (the run), where the key is read from `.env` and the call is billed.
Result: a billed Meshy task started by a proof run the owner believed was offline.
Fix: pass `cost.paid_apis` names and key env var names to proof-runner. Mark NOT RUN any file whose text or one-hop imports contain a `paid_apis` key name, `fetch(`, `http.request`, `https.request` or a `.env` read, with reason `may reach the network`. Run with each key env var set to the empty string. Say in Limits that this does not block a module that reads `.env` itself.

MEDIUM-3. `plugins/djinn/agents/proof-runner.md:147` With the documented example `timeout_s: 120`, the harness's own Bash timeout (120 s by default) fires at or before GNU `timeout`, so TIMEOUT is never produced.
Attack: `proof.timeout_s: 120` (the example at `CONTRACTS.md:223` and `templates/config.yaml:91`), plus a test that hangs.
Reachable via: `--prove` with the example config and any hanging test.
Mechanism: the prompt never tells the agent to set the Bash tool's timeout parameter. `timeout --kill-after=10s 120s` can take up to 130 s. The harness aborts the call at 120 s, before `echo "EXIT=..."` runs, so the agent sees a tool error and no exit code. `:165` maps TIMEOUT from `EXIT=124/137`, which never arrives. `:187` then stops the run as "a Bash call failing for a reason that is not the test itself", which is the wrong stop reason. Whether the harness kills the node process tree is up to the harness, not this prompt. Any `timeout_s` of 590 or more can never be honored, because the harness maximum is 600 s.
Traced: `:63-65` (any positive whole number accepted) to `:143-147` (no tool timeout set) to `:165` (the TIMEOUT reading needs an EXIT line that is never printed).
Result: the ledger reads `STOPPED ...: <tool error>` where it should read TIMEOUT, and a node process may outlive the call.
Fix: add "Set the Bash tool's timeout to `(timeout_s + 30) * 1000` ms on every run call." Refuse at the top when `timeout_s + 30 > 600`.

MEDIUM-4. `plugins/djinn/agents/proof-runner.md:135` The tree snapshot misses writes to ignored files, content changes to already untracked files, and a rewrite of an already modified binary.
Attack: a test that (a) writes `content/bundle.json` or any path `.gitignore` names; (b) overwrites a file the fixer created, which is still untracked (`?? src/new.js` reads the same before and after); or (c) regenerates an already modified tracked PNG reference at the same byte size.
Reachable via: `--prove` on a fix that created a file or touched a gitignored output. The game repo's bots and save tests write exactly this kind of output.
Mechanism: `git status --porcelain` shows untracked files by name only and ignored files not at all. `git diff` without `--binary` prints "Binary files differ" for any binary content, and `--stat` shows only sizes. So `git diff | git hash-object --stdin` matches before and after in all three cases.
Traced: `:135-137` (the three snapshot commands) to `:183` (stop only when the snapshot differs), which reads "unchanged" after a write.
Result: the report says `After last run: unchanged` after a run that changed the tree. The stop rule that guards tree writes never fires.
Fix: snapshot `git diff --binary HEAD | git hash-object --stdin`, plus `git ls-files -o -z | xargs -0 -r git hash-object --` piped into one more hash, plus `git ls-files -o -i --exclude-standard | wc -l` and the newest mtime under the repo, taken with `find . -newer <stamp> -not -path './.git/*' -print -quit` against a stamp file made in `$TMPDIR` before the run.

MEDIUM-5. `plugins/djinn/commands/review.md:150` Thousands of untracked files (an unignored `node_modules/` or `.venv/`) blow up the fence, fire every conditional agent, and overflow the per-file steps.
Attack: `npm install` in a repo whose `.gitignore` does not yet name `node_modules/`, then `/djinn:review`.
Reachable via: `/djinn:review` in a fresh or half-configured repo. Also `/djinn:dispatch` round n (`dispatch.md:237`).
Mechanism: item 3 appends every untracked file with no count limit. `review.md:231-232` pastes the whole list into every agent prompt. Item 6 appends a `--no-index` diff per file, so every package's source enters the patch, and a large untracked text file (a 500 MB trace JSON) goes in whole: `large_file_kb` only lists it (`:217-219`) and never withholds it. The triggers then fire at once: `.html`/`.css` for accessibility (`:78`), `schema`/`model`/`validat` basenames for data-contract (`:91`), `test/` and `*.test.*` for gate-auditor (`:106`), `Dockerfile*` for cost (`:99`), and playwright-core outside `qa/` for live-system (`:118-120`). The pathspec list handed to `git grep --untracked -l ... -- <fenced files>` (`:70-71`, `:212`) can pass ARG_MAX (about 2 MB), and tree-facts item 5 (`:220-222`) runs one `git grep` per untracked file.
Traced: `:150` (no cap) to `:231-232` (fence pasted per agent) to `:303-307` (every triggered agent spawned). The run breaks at the first prompt too large for the context window.
Result: 10 or more agents each get a prompt with 20,000 or more fence lines. Agents fail to return, get retried once (`:349-351`), and are written as `FAILED TO RETURN`. Or Bash fails with `Argument list too long` and the step has no error path.
Fix: after item 3, if untracked files exceed a named constant (`MAX_UNTRACKED`, 200) or any path contains a `node_modules/`, `.venv/`, `venv/`, `vendor/`, `dist/`, `build/` or `__pycache__/` segment, stop before the audit folder is created. The ledger reads `ABORTED step 3: <n> untracked files, add them to .gitignore or pass --untracked none`. Give `--untracked none` as a flag. Feed pathspecs through `git grep --untracked -l -f <pattern> --pathspec-from-file=<fence.txt>` so the argument list is bounded.

MEDIUM-6. `plugins/djinn/agents/proof-runner.md:135` The tree snapshot floods the agent's context in a repo with many untracked files.
Attack: the MEDIUM-5 repo (unignored `node_modules/`), then `--prove` with `max_files: 10`.
Reachable via: `--prove` in that repo.
Mechanism: `git status --porcelain=v1 --untracked-files=all` lists every file under an untracked directory, one line each, with no collapse to the folder. It runs once before the first run and once after every run, up to 11 times, and the stop rule says "paste both `--stat` and `--porcelain` outputs" (`:184-185`). Nothing hashes or counts it before it reaches the context.
Traced: `:135-137` (raw porcelain read) to `:243` (the Tree section wants a line count, but the agent reads every line to get it).
Result: 11 copies of a 50,000-line listing. The agent runs out of context before it writes the report, and nothing records which files ran.
Fix: the snapshot is `git --no-optional-locks status --porcelain=v1 --untracked-files=all | tee >(wc -l >&2) | git hash-object --stdin`. The agent reads the hash and the count only. On a mismatch, paste the first 50 lines of `diff` between two files saved in `$TMPDIR`.

MEDIUM-7. `plugins/djinn/agents/proof-runner.md:63` The refusal checks only that `{heap_mb}` and `{file}` appear somewhere in `proof.runner`, so a template can pass it while escaping the timeout or carrying no cap.
Attack: (a) `proof.runner: "cd packages/sim && node --max-old-space-size={heap_mb} --test {file}"`, a normal monorepo shape; (b) `proof.runner: "pytest {file} -p no:cacheprovider # {heap_mb}"`; (c) `node_modules/.bin/vitest run {file} --reporter=dot --maxWorkers={heap_mb}`.
Reachable via: an owner filling in `proof.runner` for a monorepo, python or vitest project.
Mechanism: in (a), after filling in the template, the shell parses `NODE_OPTIONS=... timeout ... cd packages/sim && node ...`. `timeout` tries to exec `cd` (a builtin, so it fails), and `node` runs with neither the timeout nor `NODE_OPTIONS`. In (b) and (c), `{heap_mb}` is present but inert. `:152` then drops `NODE_OPTIONS` because the runner "is not node", and trusts that "its template carries the cap", which it does not.
Traced: `:54-55` ("inside a heap cap flag", never checked) to `:63-65` (presence only) to `:147` (template spliced into a shell line) to `:152`, where the cap disappears.
Result: an uncapped run, or a run with no clock, reported as "heap_mb: 4096".
Fix: refuse a runner containing `&&`, `||`, `;`, `|`, `` ` ``, `$(`, `>` or `<`, and refuse one where `{heap_mb}` does not sit inside `--max-old-space-size=` or an explicit list of known cap flags. For a non-node runner, require the resident memory wrapper from HIGH-2 or refuse.

MEDIUM-8. `plugins/djinn/commands/dispatch.md:236` Files that the landing lane's tests or proof-runner write into the tree get reported as fixer scope leaks and reviewed in round n.
Attack: a `test_cmd` that leaves an unignored `coverage/` or `test-results/` folder, or a bot run that keeps its shots in the repo on a failed diff.
Reachable via: `/djinn:dispatch` in a project whose tests write unignored output.
Mechanism: the landing lane runs `test_cmd` (`:206-208`) and `--prove` runs proof-runner (`:210-215`), both before item 3 computes leaks from `git ls-files -o --exclude-standard` (`:237`). Every file those runs wrote is "neither in FENCE nor in the original fence.txt", so it is named a scope leak and added to the round fence (`:239-240`). `.html` coverage pages then fire accessibility-reviewer through the trigger pass at `:249-251`.
Traced: `:206` (tests write files) to `:237` (untracked listing taken after them) to `:239-240` (labeled scope leak), which is the wrong attribution.
Result: the Step 9 report says `Scope leaks: coverage/lcov-report/index.html, ...`, blaming the fixer. Round n spends extra agents reviewing generated output.
Fix: take the untracked listing once before Step 6 and once after the batches land (before item 2). A leak is a file new in the second listing. Files that appear only after item 2 go under their own line, `written by test runs: <files>`, and never into FENCE.

### LOW
LOW-1. `plugins/djinn/agents/gate-auditor.md:92` `git diff --name-only HEAD` is allowed, but it can rewrite the index the same way the excluded `git status` can.
Attack: a repo where files are stat-dirty with unchanged content (a `touch`, a checkout on WSL's `/mnt/c`), plus another session running `git commit` at the same moment.
Reachable via: gate-auditor's freshness check (`:152-153`) in any full-scope or triggered run.
Mechanism: a worktree `git diff` refreshes stat info and writes `.git/index` opportunistically when it finds stat-only changes (git's `refresh_index_quietly` path; unverified here, since I ran nothing). That is the same side effect `:95` cites to exclude `git status`. With `core.fsmonitor=true` set locally, either command may start `git fsmonitor--daemon`, a background process that outlives the call. proof-runner (`proof-runner.md:135`) and `CONTRACTS.md:394` allow `git status` outright, so the three files disagree about the same command.
Fix: prefix every allowed git command in gate-auditor.md, proof-runner.md, review.md and dispatch.md with `git --no-optional-locks -c core.fsmonitor=false`. State the reason once in CONTRACTS.md section 9 and drop the per-file `git status` exclusion.

LOW-2. `plugins/djinn/agents/gate-auditor.md:93` "`grep` or `rg` over the repo" names the commands but not their flags. `rg --pre <cmd>` executes a program per file, and `grep -r` reads `.env`.
Attack: an injected or mistaken `rg --pre ./tools/x.sh MUTANT`, or a broad `grep -rn "API" .` in a repo with an unignored `.env`.
Reachable via: any gate-auditor run. The mutant grep at `:185` names `|| true`, which also matches shell lines inside `.env`-style files.
Mechanism: `rg --pre` and `--search-zip` run external programs. `grep -r` has no hidden-file or gitignore skip, so matching `.env` lines print into context, despite "Never open `.env`" (`:100`).
Fix: allow `git grep --untracked -n` only, which respects `.gitignore`, or `rg` with a fixed set of flags that bans `--pre`, `--search-zip`, `-L` and `--no-ignore`. Add `':!.env*' ':!*.pem' ':!*.key'` pathspecs.

LOW-3. `plugins/djinn/commands/review.md:220` Tree-facts item 5 builds a regex from a raw base name, so short or special names produce floods of false "imports an untracked file" facts, or a grep error.
Attack: an untracked `src/el.js` (base `el`), `index.js` (`index`), `test.mjs` (`test`), or `c++.h` / `foo(1).js`.
Reachable via: `/djinn:review` with any such untracked file.
Mechanism: `'(import|require|from).*el'` matches every import line containing "el" (`model`, `level-bar`). `test` matches every `import test from 'node:test'`. An unbalanced `(` makes the ERE invalid, and the orchestrator has no error path for that.
Result: tree-facts.md labels hundreds of tracked files "importing an untracked file", presented as "facts from git" (`:253-255`).
Fix: grep fixed strings for the path forms a module is imported by: `git grep -n -F -e "/<name>.<ext>'" -e "/<name>.<ext>\"" -e "/<name>'" -e "/<name>\""`, restricted to lines matching `^\s*(import|export)|require\(`.

LOW-4. `plugins/djinn/commands/review.md:84` The trigger regexes match their own definition, and any markdown prose that names the APIs.
Attack: any djinn-relay review whose fence contains `commands/review.md`, or a game repo change to a doc that quotes `WebGLRenderer` or `executeScript(`.
Reachable via: `/djinn:review` on this repo from 2.3.0 on.
Mechanism: `review.md:84` contains the literal `WebGLRenderer` and `.textContent`, and `review.md:121` contains the literal `executeScript(`. The `git grep --untracked -l` triggers (`:70-71`) run over every fenced file with no extension filter. `accessibility-reviewer.md:117` also matches `getContext(`. The game repo `tools/bench-page.mjs` and the other bench tools import playwright outside `qa/`, so live-system-reviewer (a real-system reviewer) fires on any bench change.
Result: accessibility-reviewer and live-system-reviewer spawn on documentation. The ledger records it as a trigger, not as noise.
Fix: run the content greps only over files whose extension is code (`.js .mjs .cjs .ts .tsx .jsx .vue .svelte .py .html`), never `.md`. Let `ui_paths` or `live.systems[].code` opt a path back in.

LOW-5. `.djinn/config.yaml:14` The voice `build_cmd` checks `~/Conventions` instead of the plugin when `find` returns nothing, and crashes on a path with a space.
Attack: (a) run from any directory but the repo root (a session opened in `plugins/djinn/`); (b) add `plugins/djinn/notes draft.md`.
Reachable via: `/djinn:dispatch` build gate or a fixer's baseline run (`dispatch.md:129`, `:186`).
Mechanism: (a) `find plugins` fails, `$(...)` expands to nothing, and `check_voice.py` with no paths scans its own `ROOT`, the Conventions repo (`check_voice.py:26`, `:54-65`). The gate passes or fails on the wrong repo, and the output still ends `N file(s) checked`. (b) The unquoted substitution splits the path in two. `check_file` catches only `UnicodeDecodeError` (`check_voice.py:71-74`), so `FileNotFoundError` gives a traceback and exit 1.
Result: (a) a silent wrong verdict; (b) dispatch HALTs on a traceback that names a file that does not exist.
Fix: `build_cmd: cd "$(git rev-parse --show-toplevel)" && git ls-files -z --cached --others --exclude-standard -- 'plugins/*.md' 'plugins/*.yaml' 'plugins/*.json' | xargs -0 sh -c '[ $# -gt 0 ] || { echo "voice: no files"; exit 1; }; exec python3 ~/Conventions/tools/check_voice.py "$@"' sh`.

LOW-6. `plugins/djinn/agents/proof-runner.md:147` `{file}` is spliced into the shell line unquoted.
Attack: a test file named `tests/a b.test.mjs`, or `tests/x$(touch pwned).test.mjs`. Both match `tests/**/*.test.*`.
Reachable via: a cited or importer test with such a name.
Mechanism: the space splits the name into two arguments, node fails, and the result is recorded as FAIL (a HIGH for a cited test, per `:196`). `$(...)` runs a command. The same unquoted interpolation appears in `review.md:212`, `:217` and `:222` (`-- <fenced files>`), where the name comes from untracked files.
Fix: refuse any path outside `[A-Za-z0-9._/@+-]` with NOT RUN `(unsafe file name)`, and write the template as `'{file}'`.

LOW-7. `plugins/djinn/agents/proof-runner.md:81` Index mode has no check that an entry belongs to this repo, and its ids are not unique.
Attack: index mode over `~/Conventions/code/KNOWN-BUGS.md`, a cross-project index, from a repo other than the game repo that also has `tests/trace.test.mjs`. Separately, entries at `KNOWN-BUGS.md:146` and `:157` both cite `MEDIUM-*` ids from different audits.
Reachable via: "run proof-runner on the index's untested entries" (`review.md:436-437`).
Mechanism: the cited route (`:106-108`) only checks that the file exists and matches the globs. The id rule (`:82-83`) takes the audit id, so `MEDIUM-1` from two audits collides in the proof table, and the entry at `:344-348` cites four ids at once.
Result: a PASS recorded against another project's fix, or two rows the table cannot tell apart.
Fix: skip entries whose `Source:` names a project other than this repo's folder name, as NOT RUN `(other project)`. Make the id `<audit folder>/<id>`, and use the bold title when an entry cites several ids.

LOW-8. `plugins/djinn/agents/proof-runner.md:59` `proof.max_files` has no upper bound, and each run can put about 20 KB of output into context.
Attack: `proof.max_files: 200`.
Mechanism: `:147` caps each run at 16 KB plus 4 KB, so 200 runs is about 4 MB of output, well past the context window.
Fix: refuse `max_files` above a named constant (`MAX_FILES_CEILING`, 20).

### DEBT
DEBT-1. `plugins/djinn/commands/review.md:66` A project with no new config blocks does not review the way it did in 2.2.0, and no file says so.
Mechanism: with zero new keys, a standard review now (a) adds untracked files to the fence (`:150`); (b) writes tree-facts; (c) can spawn gate-auditor, a Bash-carrying agent, on any `tests/` path (`:105-106`), accessibility-reviewer on any `.css`/`.html` or a `classList.` grep (`:77-84`), data-contract-reviewer on basenames with `model`/`schema`/`validat`/`fixture` (`:87-95`), and live-system-reviewer on a playwright import outside `qa/` (`:115-124`). For the game repo, nearly every src change fires at least three of these. `cost`, `live.systems` and `gates` triggers stay off when their blocks are absent (`:96`, `:113`), and that part does match 2.2.0.
Fix: one README paragraph under the 2.3.0 notes naming the four content triggers and the untracked fence as the changes a config-free project sees, plus a `triggers: off` config key for owners who want 2.2.0's fixed sets.

### REC
REC-1. `plugins/djinn/agents/proof-runner.md:130` A dry-run fixture repo for proof-runner: one test that allocates Buffers to 2x `heap_mb`, one that hangs past `timeout_s`, one that writes an ignored file, one that spawns node with `env: {}`, and one named with a space. Each should end in its named verdict or stop reason. None of the five does today.
REC-2. `plugins/djinn/commands/review.md:145` A fixture repo for the preflight: an unignored `.env`, 5,000 untracked files, a 200 MB untracked JSON, and a file named `a b.md`. Assert the patch holds no `.env` content and the run stops at step 3.

## Blast radius
none

## Handed off
- `plugins/djinn/CONTRACTS.md:394` lists `git status --porcelain` while `proof-runner.md:135` runs `--porcelain=v1 --untracked-files=all`; wording drift, integration-reviewer

## Checked and Clean
- known-bugchecker MEDIUM-1 (`fixer.md:100`): the line reads "Your narrowed run carries no heap cap of its own", with the prefix only "When the dispatch prompt gives `proof.heap_mb`" (`fixer.md:100-102`). Not a false positive. Not re-reported. MEDIUM-2 (mutant grep too narrow) is not re-reported and was not re-verified.
- `plugins/djinn/agents/proof-runner.md`: reentrancy and loops: no rerun of a failed file (`:161`), one run per file (`:124`), stop rules end the invocation (`:179-187`). No loop is reachable. Whole suite: `:157` bans `npm test`, `test_cmd` and globs, and the default runner names one `{file}`. Two files in one call: banned (`:158`), and the template has a single `{file}`. Background or parallel runs: banned (`:158-159`). Test output flood: the head and tail at `:147` bound each run to about 20 KB, and `PIPESTATUS[0]` is expanded in the `echo` right after the pipeline, so it reads the runner's exit, not `tail`'s. That holds. Without an owner invocation: `:21-22` refuses without the `INVOKED BY OWNER` line, and review.md and dispatch.md never auto-spawn it (`review.md:126-131`, `dispatch.md:26-28`). Missing caps: refused at `:63-68` and again by the orchestrators (`review.md:440-444`, `dispatch.md:39-43`). Tree writes by the agent itself: its git list is read-only apart from LOW-1's index refresh. Detached grandchildren: GNU `timeout` signals its whole process group unless `--foreground` is given, so only a `setsid`/`detached: true` child escapes. That is covered by MEDIUM-1's screen fix.
- `plugins/djinn/agents/gate-auditor.md`: every allowed command checked for state change. `git log -1 --format` and `git log -n <k>`: read-only (no `--output` in the allowed shapes). `git ls-files` and `git ls-files -o --exclude-standard`: read-only, with no index write. `git diff --name-only HEAD`: see LOW-1. `grep`/`rg`: see LOW-2. The list names no `npm`, `node` or build (`:95-98`).
- `plugins/djinn/commands/review.md`: tree-facts items 2 and 4 (`ls-files -ci`, `wc -c` on files that exist) are read-only and bounded by the fence. Deleted fenced files are handled by "that exist" (`:217`). A fence that fires nothing: every conditional stays off and the scope's fixed set runs. That holds. The empty fence stops at `:160-161` before any folder is made. proof-runner in a custom list aborts at `:129-131`.
- `plugins/djinn/commands/dispatch.md`: `git stash create` (`:115`) moves no ref. That holds. Round cap at 3 (`:200-201`) bounds reentry through repeated dispatch. proof-runner runs alone (`:211-213`).
- `.djinn/config.yaml`: `import yaml` in the checker resolves against the system package (`/usr/lib/python3/dist-packages/yaml`), so bare `python3` does not fail on import. Paths all start with `plugins/`, so no file name can pass as a `--fix-dashes` option. Empty-list and space cases are in LOW-5.
- `plugins/djinn/CONTRACTS.md`, `templates/config.yaml`, `relay.md`, `README.md`, `plugin.json`: read the sections the attacks above cite (sections 4, 5, 6, 7, 9 and 11, plus the proof block). Edge-case, timing and boundary vectors land only through the command and agent lines already filed. None of these files executes anything.
- The fourteen non-executing agent prompts (accessibility, breaker, bugs, consolidator, cost-complexity, data-contract, devils-advocate, fixer, integration, live-system, multiuser, perf, security, synthesis, test-strategist, ux): these have no Bash except fixer, and fixer's Bash is known-bugchecker's MEDIUM-1. Read only where a trace above crossed them (`accessibility-reviewer.md:117`, `fixer.md:100-102`). Their six vectors reduce to prompt contradiction, which is the other reviewers' job. Not read in full. This is a gap in this report, stated plainly.

## Files read outside the fence
- `~/Conventions/tools/check_voice.py` (build_cmd's callee)
- `/usr/lib/python3/dist-packages/yaml/__init__.py` (checker import exists, glob only)
- `<game repo>/tests/` (grep: child spawns, helper imports)
- `<game repo>/tools/serve.mjs` (grep: spawned child inherits env)
- `<game repo>/tools/meshy.mjs` (grep: fetch and .env read)
