---
title: Prompt review of commands/review.md
author: Claude Fable 5.1 (prompt review agent)
date: 2026-09-12
status: review, not yet applied
---

File reviewed: `~/djinn-relay/plugins/djinn/commands/review.md` (112 lines).
Read alongside: `plugins/djinn/relay.md`, `~/Conventions/workflow/REVIEW.md`,
`~/Conventions/workflow/AGENTS.md`, the `commands/brief.md` and
`commands/dispatch.md` siblings (for the `context.md` contract), and the
frontmatter, severity, and output sections of every file in `agents/`.

This is the orchestration command. Nothing in it reads code itself; every
weakness here is multiplied by the number of agents it spawns. The two
biggest gaps are the ones the brief already named: the scope fence and the
ledger. Neither exists in the file today.

---

**1. Scope comes from HEAD~1, which is the wrong diff for every workflow except "one commit on main"** (line 32 to 45)
Current: `git diff HEAD~1 --name-only` ... `git diff HEAD~1` ... "(or `git diff <base>..HEAD --name-only` if user supplied a base ref)"
Proposed: Replace Step 3 with:

```
## Step 3: Identify changes (this is the fence)

1. Read `.djinn/config.md` (or the path named in the project's CLAUDE.md
   under "djinn config"). Take `base_branch` from it. If the file or the key
   is missing, stop and ask the user for the base branch. Do not guess and do
   not fall back to HEAD~1.
2. If $ARGUMENTS contains `--base <ref>`, that ref overrides the config for
   this run only. Say so in context.md.
3. Compute the merge base: `git merge-base <base_branch> HEAD`.
4. Changed files: `git diff --name-only <merge-base>` (no second ref, so
   uncommitted work in the working tree is included). This list is the
   FENCE. Save it verbatim to `<AUDIT_DIR>/fence.txt`, one path per line.
5. Full patch: `git diff <merge-base>` saved to `<AUDIT_DIR>/input-diff.patch`.
6. If the fence is empty: append the ledger line (see Step 9) with
   `verdict=NO-CHANGES`, do not create the audit folder, tell the user, stop.
```

Why: Decision 1 says scope comes from git against a configured base, not HEAD~1. HEAD~1 reviews only the last commit, so a branch with three commits gets one third of itself reviewed, and a fresh repo with one commit errors out. The two existing forms also disagree with each other: `git diff HEAD~1` includes uncommitted work, `git diff <base>..HEAD` excludes it, and the prompt never says which the reviewers should expect. For two developers who have never used a pull request, "HEAD~1" means nothing and "the base branch from config" means "the thing you branched from."

**2. The changed-file list is passed as context, not as a fence, and no agent is told to report fence breaches** (line 63 to 69, line 77 to 82)
Current: "Each agent's prompt: - List of changed files - One-line summary of changes - Path to `<AUDIT_DIR>/input-diff.patch` for reference"
Proposed: Add a fixed block that every dispatch (Steps 4, 5, 5b, 6) pastes verbatim, and reference it by name:

```
## Fence block (paste into every agent prompt, unchanged)

FENCE. The files under review are exactly:
<contents of fence.txt>

Report findings only on these files. You may open other files to trace a
caller, an import, or a subscriber; if you do, list every such path under a
final heading `## Files read outside the fence`, one per line, with the
reason in five words or fewer. A finding whose file:line is outside the
fence goes under `## Blast radius`, not under `## Findings`. If the section
is empty, write `none`.
```

And in the synthesis prompt (Step 6) add: "Read `fence.txt`. Under `### Coverage Gaps` list (a) every fence file no agent mentions and (b) every path any agent listed under `Files read outside the fence`, with the agent name. Do not judge whether the read was justified; list it."

Why: Decision 1 requires the fence in every dispatch and requires synthesis to report out-of-fence reads. Today the list is "for reference" and synthesis is only told to check coverage of "changed files" it was never given (line 78 hands it report paths, not the file list). The nuance matters: bugs-reviewer and integration-reviewer are told in their own prompts to read callers, so a fence that forbids all outside reads would be breached on every run and synthesis would drown in noise. Reporting the reads, not forbidding them, is what Decision 1 actually asks for.

**3. No ledger line is written, so a run that stops early is unlogged** (whole file; no step exists)
Current: none
Proposed: Add after Step 8:

```
## Step 9: Ledger (always, even on early stop)

Append exactly one line to `audits/LEDGER.md` (create with a header row if
missing). Format, pipe separated, no line breaks:

<timestamp> | review | <scope> | base=<base_branch>@<merge-base short sha> | <AUDIT_DIR or "none"> | verdict=<SHIP|FIX THEN SHIP|ESCALATE|IDEAS|NO-CHANGES|ABORTED> | H=<n> M=<n> L=<n> F=<n> | failed=<comma list or none> | outside-fence=<n>

Counts come from the `## Fix List` headings in synthesis.md (HIGH tier
includes CRASH/CORRUPT; MEDIUM includes DEGRADE; F counts the Architectural
Debt section). For ideas scope write H/M/L as tier 1/2/3 counts. If the run
aborts before synthesis, write the counts as `?` and verdict=ABORTED with
the step number that failed.
```

Why: Decision 5 says every command appends one ledger line so no run goes unlogged. The marketplace.json description already promises "a ledger line" (line 9 of `.claude-plugin/marketplace.json`), and nothing in the plugin writes one. A fixed, pipe-separated line is the only format the brief and dispatch commands can grep later without parsing prose.

**4. Project-specific paths and file names leak into every dispatch** (line 52, line 68, line 90, line 92)
Current: "read the project's CLAUDE.md and the bugs_to_avoid index" (52), "read CLAUDE.md and bugs_to_avoid.md" (68), "proposes additions to `bugs_to_avoid.md`" (90, 92)
Proposed: In Step 3 item 1, also read from the config: `known_bugs_index` (path), `build_cmd` (string, may be `none`), `conventions_files` (list). Replace lines 52 and 68 with: "Instruction: the known-bugs index is at `<known_bugs_index>`; read it and any file it links." Replace `bugs_to_avoid.md` on lines 90 and 92 with "the known-bugs index at `<known_bugs_index>`". Add to the Fence block: "Project conventions: <conventions_files>."
Why: Decision 2 moves every project-specific name into the per-project config. `bugs_to_avoid.md` is an engine repo memory file with a hardcoded home-directory path in `agents/known-bugchecker.md` line 10; a second project has no such file and the agents will either invent one or report it missing. The command is where the config is read, so it is the one place that can hand agents a real path.

**5. Model is never named on any dispatch** (line 49, line 61, line 77, line 90)
Current: "Use the Agent tool with `subagent_type: "known-bugchecker"`" and equivalents
Proposed: Add a one-line rule under `## Rules`: "Every Agent call passes `model: opus` explicitly, including known-bugchecker, synthesis, and consolidator. Never rely on the agent file's frontmatter." Add the same phrase to Steps 4, 5, 6, 7 next to `subagent_type`.
Why: Decision 3 is Opus everywhere in the relay, and AGENTS.md line 65 to 68 says name the model on every dispatch because an unnamed agent inherits the session model. `agents/known-bugchecker.md` line 5 still says `sonnet` and `relay.md` line 101 still says "fast Sonnet pass"; until those are fixed, the command is the only place that can force Opus. In Codex the frontmatter is not read at all, so the explicit model is the adapter's only signal.

**6. The four unreachable agents need a scope, a wave, and a serial lane** (line 13 to 21)
Current: five scopes, none of which name dependency-reviewer, devils-advocate, test-strategist, or ux-reviewer
Proposed: Change `full` to: "known-bugchecker, format-reviewer, bugs-reviewer, integration-reviewer, security-reviewer, perf-reviewer, multiuser-reviewer, breaker, pipe-connector, gap-hunter, then wave 2: devils-advocate, test-strategist, synthesis (+ consolidator)". Add two conditional agents to every scope except `ideas`: "dependency-reviewer runs whenever the fence contains a manifest or lockfile (package.json, package-lock.json, pyproject.toml, requirements*.txt, uv.lock, Cargo.toml, go.mod). ux-reviewer runs whenever the fence contains a CLI entry point, a config schema, or a README, or when the user passes `+ux`." Add a Step 5b:

```
## Step 5b: Wave 2 (full scope, or any custom list naming them)

After wave 1 returns, spawn devils-advocate and test-strategist ONE AT A
TIME, not in parallel. Their prompt adds: the goal statement from
$ARGUMENTS `--goal "<text>"` or from the config's `goal_doc` path (if
neither exists, say "no goal document; review the diff's own stated
intent"), and the wave 1 findings list (agent name plus one line each).
```

Why: Decision 4 says these four will be wired in and the scope table on lines 13 to 19 is the only place an agent becomes reachable. Their own "Invocation tips" sections say devils-advocate and test-strategist need "what the other reviewers already flagged," so they cannot run in the parallel wave. devils-advocate, test-strategist, and dependency-reviewer carry the Bash tool; REVIEW.md line 68 to 72 says parallel reviewers are read-only and anything that executes code runs serially.

**7. Custom agent lists are parsed "flexibly," which is unverifiable** (line 21)
Current: "If $ARGUMENTS is something else (e.g. a custom agent list), parse it flexibly."
Proposed: "Otherwise $ARGUMENTS is a comma-separated list of agent names. Each name must match a file in the plugin's `agents/` directory; on any unknown name, stop and list the valid names. known-bugchecker is prepended and synthesis appended unless the list is exactly `gap-hunter`. The folder suffix is `custom`. Flags: `--base <ref>` (see Step 3), `--goal "<text>"` (see Step 5b)."
Why: "Flexibly" gives a new user no way to know what they typed will do, and gives the orchestrator permission to invent an agent name. The `--base` flag mentioned on line 34 has no defined syntax anywhere, so the user cannot actually supply one.

**8. Audit folder is created before the command knows there is anything to audit** (line 23 to 30, then line 45)
Current: Step 2 creates `audits/<timestamp>-<scope>/agents/`; Step 3 later says "If there are no changes to review, stop and tell the user."
Proposed: Swap Steps 2 and 3. Identify changes first; create the folder only after the fence is non-empty. Keep the timestamp line and the collision rule (line 112) as they are.
Why: Every no-change run otherwise leaves an empty audit folder in the repo, and the collision suffix rule on line 112 then fires on the next real run. Keep verdict for the folder naming itself.

**9. The known-bugchecker handoff tells agents to skip, not to verify** (line 67)
Current: "Note: 'known-bugchecker flagged: <list or 'none'>. Focus on issues it did not catch.'"
Proposed: "Note: 'known-bugchecker (a pattern matcher, unverified) flagged: <list or none>. Do not re-report these as your own findings. If you read the code and one is a false positive, say so under Checked and Clean with the line that disproves it.'"
Why: known-bugchecker describes itself as "a pattern matcher, not an analyzer" (agents/known-bugchecker.md line 12). Telling Opus reviewers to look elsewhere means a wrong pattern hit is never checked by anyone and flows straight into synthesis as a HIGH. The skeptical-verification clause every reviewer carries should apply to the first pass too.

**10. Synthesis is not given what it needs to do its coverage and failure checks** (line 77 to 82, line 111)
Current: "Prompt: - List of all agent reports under `<AUDIT_DIR>/agents/` - Instruction: deduplicate, rank by severity, resolve conflicts, produce ship verdict" and Rule "If an agent fails to return, note it in the synthesis step (coverage gap)."
Proposed: Synthesis prompt becomes: "Reports: <list>. Fence: `<AUDIT_DIR>/fence.txt`. Agents that did not return after one retry: <list or none>. Scope run: <scope>, agents not run in this scope: <list>. Follow your Coverage Gaps and Ship Verdict sections; add the fence reads per the Fence block." And under Rules: "If an agent returns nothing or errors, retry it once. If it fails again, write `<AUDIT_DIR>/agents/<name>.md` containing only `FAILED TO RETURN (2 attempts)` and pass the name to synthesis and to the ledger."
Why: synthesis.md line 21 says "Check if any changed file was missed by all agents" but the command never gives it the file list. "Note it in the synthesis step" (line 111) names no mechanism, so a failed agent vanishes from the folder. AGENTS.md line 69 to 71 puts correctness over speed, which justifies one retry.

**11. Consolidator at audit time contradicts its own prompt and cannot write its file** (line 86 to 92)
Current: "Spawn consolidator via Agent tool. It reads the synthesis and proposes additions to `bugs_to_avoid.md` ... Write output to `<AUDIT_DIR>/consolidator.md`."
Proposed: "Spawn consolidator (model opus). Prompt: 'No fixes have landed yet; treat every HIGH and MEDIUM in synthesis.md as a candidate entry, not a confirmed one. The known-bugs index is at <known_bugs_index>.' The consolidator has no Write tool: take its returned text verbatim and write it to `<AUDIT_DIR>/consolidator.md` yourself, with the attribution header (see item 12)."
Why: agents/consolidator.md line 10 and 18 say it runs "after fixes shipped" and looks at findings "that was fixed," while relay.md line 87 calls it post-relay. Running it in Round 1 is a design choice worth keeping (it seeds the index early) but the prompt must say the findings are unfixed, or it will mark unverified hits as confirmed patterns. Its tools are Read, Grep, Glob (line 4), so "write output to" cannot be its job; consolidator.md line 12 already says the orchestrator writes.

**12. No attribution header on any file the run writes into the repo** (line 53, line 69, line 80, line 90, line 37 to 43)
Current: reports written without any header instruction
Proposed: Add to the Fence block: "Start your report with this header, filling the model you are running on:

```
---
title: <agent-name> report, <AUDIT_DIR>
author: Claude <model> (<agent-name>)
date: <YYYY-MM-DD>
status: audit finding, not yet deliberated
---
```
" and write the same header at the top of `context.md`, `synthesis.md`, and `consolidator.md`.
Why: AGENTS.md line 10 makes the header a hard rule for any file an agent writes into a repo, and `audits/` lives in the repo. The `status` line is what tells the two new developers, six months on, that synthesis.md was a machine draft and not a decision.

**13. `context.md` is the Round 2 contract but its keys are underspecified** (line 37 to 43)
Current: `base_commit: <sha>` / `scope: <scope>` / `changed_files: <list>` / `date: <iso>`
Proposed:

```
base_branch: <name, or the --base override>
merge_base: <full sha>
head: <full sha at run time>
scope: <scope>
agents_run: <comma list, in the order spawned>
model: opus
fence_file: fence.txt
date: <iso>
```
Why: dispatch.md line 128 says "If the base isn't recorded, use HEAD~N" and then guesses N. Naming `merge_base` and `head` removes the guess. `agents_run` lets dispatch Step 7 item 2 stop inferring the agent list from the folder name, which breaks for `custom`.

**14. Step 8 verdict wording hides what a narrow scope did not check** (line 96 to 105)
Current: "Ship verdict (from synthesis, or N/A for ideas)"
Proposed: "Ship verdict from synthesis, followed in the same line by the agents this scope did NOT run, e.g. `SHIP (quick scope; format, security, perf, multiuser, breaker not run)`. For `full` write `(full scope)`."
Why: relay.md line 77 defines SHIP against a Round 2 synthesis with every relevant agent; a `quick` run saying SHIP reads as a full clearance to someone who has never seen a review pipeline. One parenthetical fixes that without touching synthesis.

**15. Runtime notes for the Codex adapter** (line 4, line 13, line 49, line 61)
Current: `allowed-tools:` frontmatter, `$ARGUMENTS`, `subagent_type`, "Send ALL of them in a single message with multiple Agent tool-use blocks"
Proposed: Add a short final section:

```
## Runtime notes

Claude Code specific: the `allowed-tools` frontmatter, `$ARGUMENTS`, the
Agent tool and its `subagent_type` / `model` fields, and parallel spawning
by putting several Agent calls in one message. An adapter for another
runtime must map each of these; the wave structure (Step 4 first, Step 5
parallel and read-only, Step 5b serial, Step 6 after) is the contract, not
the mechanism.
```
Why: Decision 6. Four mechanisms in this file have no equivalent in Codex, and naming them once costs six lines.

**16. Em dashes throughout** (line 3, 7, 9, 15 to 19, 92, 102 to 105, 109 to 110)
Current: em dashes as list separators and asides
Proposed: Replace each with a colon, comma, period, or parentheses. Line 7 becomes `# Djinn Review Relay: Audit Phase`. Line 15 to 19 become `- **full**: known-bugchecker, ...`.
Why: The owner's voice rule in `~/.claude/CLAUDE.md` applies to all writing, and this file is also the example every future prompt in the plugin will be copied from. Low impact on behavior, zero cost.

**17. Delete the duplicate ideas-scope sentence** (line 84)
Current: "If scope IS `ideas`: skip synthesis. gap-hunter's output is standalone creative work."
Proposed: delete
Why: Line 19 and line 73 already say synthesis is skipped for ideas. Third statement earns nothing.

**Keep verdicts.** Step 2 folder naming and the collision suffix (line 25 to 30, line 112): keep. Step 4 running known-bugchecker first and alone (line 47 to 55): keep; it is the one sequencing decision that makes the handoff in item 9 possible. Step 6's one-line description of synthesis duties (line 79): keep, it does not need to restate synthesis.md. Rules lines 109 to 110: keep.

---

Keep 4 sections, change 12, delete 1.
Most important change: replace Step 3 with the config-driven merge-base fence (item 1) and paste that fence verbatim into every dispatch with the outside-fence reporting rule (item 2); the ledger step (item 3) is the second priority.
Nothing in this file was tested by running it; every claim above comes from reading the prompt and its siblings.
