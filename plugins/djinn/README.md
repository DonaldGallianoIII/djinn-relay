# Djinn Review Relay

Multi-agent code review for Claude Code. You run one command, a team of
review agents reads your branch, and you get a folder of reports, one
verdict, and a ledger line saying it happened. Fixes are a second command,
one brief at a time, each inside a fence. Nothing is changed without a
written record.

If you have never used a pull request: a branch is a copy of the code you
work on. The base branch (usually `main`) is the copy everyone shares. This
tool reviews the difference between your branch and the base, and tells you
whether that difference is safe to merge back.

## Install

Once per machine:

```
/plugin marketplace add donaldgallianoiii/djinn-relay
/plugin install djinn@djinn-relay
```

Or, from a local checkout while developing the plugin itself:

```
/plugin marketplace add ~/djinn-relay
/plugin install djinn@djinn-relay
```

Restart Claude Code after installing. The commands `/djinn:review`,
`/djinn:brief`, `/djinn:dispatch`, `/djinn:status` and `/djinn:learn` now
exist in every project.

## Set up a project

Once per repo:

1. Create `.djinn/` in the repo root.
2. Copy `templates/config.yaml` from the plugin into `.djinn/config.yaml`.
3. Fill in `base_branch`. Fill in `build_cmd` and `test_cmd` if the project
   has them. Leave the rest as `none` or empty until you need it.
4. Commit `.djinn/`.

The plugin refuses to run without `base_branch`. It never guesses.

## Daily use

**Review your branch.** On your branch, with your work committed or not:

```
/djinn:review
```

Read the last line first: `SHIP`, `FIX THEN SHIP`, or `ESCALATE`, followed
by which agents did not run. Then open the synthesis file it names.

**Fix something it found.** Pick a finding id from the synthesis (they look
like `HIGH-1`, `MEDIUM-3`):

```
/djinn:brief audits/<folder> HIGH-1
```

Open the brief it writes. Fill in the WHY section: what you and Claude
decided, and why this fix rather than another. Check the file list. Then:

```
/djinn:dispatch audits/<folder>/fixes/HIGH-1-<slug>.md
```

It prints a plan and waits for you to say `go`. Then it edits the code,
writes a report per fix, and reviews the result again. Read the new verdict.

**See what is still open.** After any number of rounds:

```
/djinn:status
```

It prints every HIGH, MEDIUM and LOW still open across all rounds, which
ones block, and what the last round proved fixed. A round 2 finding shows
as `R2 MEDIUM-1`, so it never reads like round 1's MEDIUM-1. It reads the
`findings.json` synthesis writes each round and writes nothing itself.
Audits from before djinn 2.2.0 have no `findings.json`; it says so and
points at `synthesis.md`.

**Check what has happened on a branch.** Open `audits/LEDGER.md`. One line
per run, newest at the bottom.

## What the verdicts mean

| Verdict       | Meaning |
|---------------|---------|
| SHIP          | Nothing blocks a merge to the base branch. |
| FIX THEN SHIP | At least one HIGH or MEDIUM finding. The ids are named. Fix them, or decide with a human not to. |
| ESCALATE      | Two agents disagree on a fact the code could not settle. A human reads the synthesis. |

Severity tiers, from `CONTRACTS.md`:

| Tier   | Means                                                       | Blocks merge |
|--------|-------------------------------------------------------------|--------------|
| HIGH   | Crash, data loss, security exposure, or does not do what it claims | Yes |
| MEDIUM | Wrong behavior a user will hit                              | Yes          |
| LOW    | A real defect that will not hurt anyone today               | No           |
| DEBT   | A decision that will be expensive to undo later             | No           |
| REC    | A recommendation, not a defect                              | No           |

## Scopes

```
/djinn:review quick      small fixes
/djinn:review            standard, the default
/djinn:review full       new features, critical systems, before release
/djinn:review perf       hot-path code
/djinn:review cost       paid APIs, hosting, CI, memory and heap ceilings
/djinn:review live       blind review of a whole tool before its first live run
/djinn:review ideas      after a debugging session, to find what is missing
/djinn:review map        whole tree: maps, entry docs, names, folder READMEs
```

Flags: `--base <ref>` to review against a different base for one run,
`--untracked none` to leave untracked files out of the fence (the review
stops when there are more than 200 of them, or any under `node_modules/`
or a similar folder, rather than fence part of the list),
`--untracked <path-list-file>` to fence only the untracked files that file
names, past that stop,
`--goal "<text>"` to tell the deeper agents what the change is meant to
achieve, `+ux` to add the usability reviewer, `+a11y` to add the
accessibility reviewer.

Some agents join any scope but `ideas`, `live` and `map` on their own, when
the fence touches what they read: dependency-reviewer (manifests, lockfiles),
ux-reviewer (CLI, config schema, README), accessibility-reviewer (UI
files), data-contract-reviewer (schemas, migrations, content, persisted
formats), cost-complexity-reviewer (a `cost` key, IaC, CI, a paid API),
gate-auditor (tests, QA, check and bench tools, CI),
live-system-reviewer (browser drivers, content scripts, live systems) and
legibility-reviewer (a file added, moved, renamed or deleted, or an entry
doc, README or map touched).
`commands/review.md` Step 2 has the exact patterns. multiuser-reviewer runs
in `full` only when `project_notes` or `goal_doc` names a second actor.

`map` reads the whole tree, not a diff, and asks one question: can a
stranger, a person or an agent in a fresh session, find where a thing lives
and trust what the maps say? Add the owner's `code/LEGIBILITY.md` to
`conventions_files` first, and list any extra maps under `maps`.

`live` needs a `live.systems` block in the config and refuses without one.
It reads the whole tool cold, with no goal and no plan, the way a stranger
would before it touches a real portal or a production database.

**Prove a fix by running its test.** `/djinn:dispatch --prove <brief>`
runs proof-runner after the fixes land: the narrowest test file per fix,
one at a time, under the heap cap, the resident memory wrapper and the
timeout in the config's `proof` block. It never runs without all three, it
probes the wrapper before the first test (the wrapper must kill an
allocation past its cap, or proof-runner refuses), and nothing runs it
unless you ask. Each test file runs as your user, with your environment,
files and network; the caps bound memory and time, nothing else. The same
`heap_mb` and `timeout_s` also cap the fixer's own test runs. The landing
lane runs the whole `test_cmd`, chained or not, under `heap_mb` and
`lane_timeout_s`, or `timeout_s` when `lane_timeout_s` is unset, which the
plan says. With `memory_wrapper` and `lane_mem_mb` both set, dispatch
probes the wrapper and puts it in front of the landing lane and the
fixer's test runs; without them, the plan and the ledger say `heap cap
only, resident memory unbounded`. Without `heap_mb` the fixer runs no test
and the landing lane runs with no memory cap, and the dispatch plan says
so. `--no-tests` skips the landing lane.

## Learn: one question, four angles, training data

`/djinn:learn` is not a review. It takes an exam question and asks what a
student should have known, what else could have been asked, how the
question gets harder, and how to prepare, then checks every claim against
the repo and writes draft exam items, training rows and a study sheet.

```
/djinn:learn "Why does water boil at a lower temperature on a mountain?
A. The air pressure over the pot is lower
B. The air around the pot is colder
C. The air holds less oxygen
D. The air is drier
Answer: A" --id boil-altitude
/djinn:learn content/quizzes/week-3.yaml q7
/djinn:learn content/quizzes/week-3.yaml           # every item, after a plan you approve
/djinn:learn --topic "boiling point"               # pick bank items, or seed new ones
/djinn:learn <any of the above> --sources content/lectures/,docs/research/
/djinn:learn <any of the above> --secure           # mark the run secure by hand
```

It works in any repo. Your repo decides what counts as a source, what a
quiz item looks like, what the difficulty tiers mean, and which settings
items rotate through: say so in a `learn` block in `.djinn/config.yaml`
(`templates/config.yaml` shows it), or let the command propose each value
from your `CLAUDE.md`, schema docs and folders and confirm it at the plan.
A claim counts as VERIFIED only with a `file:line` in those sources.
Anything else ships marked UNVERIFIED for you to rule on, and anything a
source contradicts is held back in `quarantine.md` with both citations.

It never writes an item that only tests vocabulary, in any repo: every
item asks a case, a mechanism or a decision, and the names and values
themselves are taught in the study sheet's map, where every option's true
home is written down. It never ships an item that only restates the
source question: each new item names the fact it needs beyond the source's
key reason. Every item is asked whether a second option is also
defensible, and one that is never ships VERIFIED. Rationales and stems
follow your repo's own register and length, and every practice answer on
the study sheet places every option, not just the key.

The training files follow Hugging Face TRL's conversational shapes,
checked against the TRL docs on 2026-09-29 (`CONTRACTS.md` section 13 has
the URLs): `sft.jsonl` as `messages`, `dpo.jsonl` as `prompt`, `chosen`,
`rejected`, and `grpo.jsonl` as `prompt` and `answer` plus a rubric a
reward function scores, which the run folder's `learn_reward.py` does.
The command shuffles each row's options by a seed it records in the row,
so no key position is a tell, then checks every line before it reports
done: the shapes, the key position spread, the key length against the
distractors, and that no rubric term pays for echoing the prompt. Every
row carries a `secure` mark and a `split`, so you can filter secure rows
before any upload and hold whole questions out for eval.

It is an LLM pass, so two runs on one question give different output. The
run README records the input, the repo commit, the date and the model. Its
items are drafts in your quiz file's own shape, and nothing lands in the
repo's content: you move an item there by hand, and `review.md` records
what you kept, edited and dropped, which the next run on that file reads.

The command refuses an input file from any other repo, so a private
repo's items never land in another repo's folder. It stops before writing
anything when git tracks files under its output folder. The first run
writes `learn/.gitignore` so run folders stay out of git, and
`/djinn:review` leaves `learn/` out of its fence once a learn run is
there. A run is secure when any agent opens a secure file (an input,
source, item shape or bank under a `secure/` folder or a `secure_paths`
entry), in a whole-repo-private repo, when a pasted stem matches a secure
bank, or with `--secure`. A secure run is marked in its README, its study
sheet, its item file and every row, and its `study-sheet-release.md` holds
fresh practice on the concepts around the source that passes a release
test: no leak with the source in either direction, none of the source
key's words, a new fact of its own, no sentence that states or implies any
source's key reason, no shared citation with it, and a blind reader who
tries to answer the source from the sheet alone finds nothing to lean on
(CONTRACTS.md section 13, "The release sheet"). Every draft item is also
read by that blind reader, which never sees a key: an item it can answer
by a surface cue, or that it reads as having two right answers, is held
back.

## What gets written where

```
audits/
  LEDGER.md                          one line per run, never edited by hand
  2026-09-12-1402-standard/
    context.md                       base, merge base, scope, agents run, triggers
    fence.txt                        the files that were reviewed
    input-diff.patch                 the diff that was reviewed
    tree-facts.md                    untracked, ignored, mutant and large files, untracked imports, secret-shaped names, from git
    tree.txt, tree-changes.txt       the whole tree and the diff's moves, when legibility-reviewer runs
    agents/<name>.md                 one report per agent
    synthesis.md                     merged findings and the verdict
    findings.json                    the same, for tools, plus the open list (2.2.0 on)
    fixes/
      HIGH-1-<slug>.md               the brief (the contract for one fix)
      HIGH-1.diff                    what the fixer changed
      HIGH-1-report.md               the fixer's own account
    round-2/                         the re-review after fixes landed
      agents/, synthesis.md, findings.json, fence.txt, tree-facts.md
      proof.md                       proof-runner's table, only with --prove

learn/
  .gitignore                         "*", written by the first run, so git ignores it all
  LEDGER.md                          one line per learn run
  2026-09-29-1430-week-3-q7/
    context.md, input.md             what went in: the question, the commit, the model
    learn-config.yaml                the values used, ready to paste into .djinn/config.yaml
    learn_reward.py                  the GRPO reward, to import in a training script
    angles/<qid>/learn-*.md          the four angle reports per question (and seed.md in a topic run)
    verification/<qid>.md            every claim: VERIFIED, UNVERIFIED or CONTRADICTED, with file:line
    rephrased.md                     synthesis's list of items reworded after the check, or none
    verification/rephrased.md        the fact checker's recheck of those items
    blind/                           what the blind reader sees (no key), and the command's key to it
    verification/blind-*.md          the blind reader's picks and cues, and the pass or fail per item
    items-DRAFT.yaml                 new exam items in your quiz file's shape
    sft.jsonl, dpo.jsonl, grpo.jsonl training rows, TRL shapes, options shuffled by a recorded seed
    study-sheet.md                   for a student, every option explained, every line marked
    study-sheet-release.md           secure runs only: fresh practice that passes the release test and the blind read
    plan.md                          runs of more than one question: one plan across them
    quarantine.md                    what a source contradicted
    review.md                        yours to fill: kept, edited, dropped; accept or reject
    README.md                        counts, what is unverified, how to load each file
    check.txt                        the shuffle and the line by line check
    usage.md                         tokens per agent
```

## The agents

```
known-bugchecker          first, alone: the project's known-bugs index against the fence
format-reviewer           structure and formatting, LOW at most
bugs-reviewer             wrong results, corruption, leaks, races, desync
integration-reviewer      callers, consumers, events, and whether doc block tags are true
data-contract-reviewer    validator, resolver, save, load and migration agree on a data shape
security-reviewer         secrets, untrusted input reaching a sink, code quality
perf-reviewer             hot-path auditor: what a normal session pays
cost-complexity-reviewer  bill and ceiling auditor: money, platform limits, growth
accessibility-reviewer    color-only meaning, canvas with no text, no keyboard path
live-system-reviewer      code that drives a page or writes to a system it does not own
multiuser-reviewer        DEBT for when a second actor appears
breaker                   worst-case inputs and interruption sequences
pipe-connector            the dependency map before a split or rename
gap-hunter                what is missing, not what is wrong
ux-reviewer               friction for the person using a CLI, config, API or doc
legibility-reviewer       can a stranger find where a thing lives: maps, entry docs, names
dependency-reviewer       declared dependencies resolve and run together (web)
gate-auditor              the checks themselves: can each fail, and has it passed lately
devils-advocate           the gap between what the change claims and what it does
test-strategist           the check that would have caught each finding
synthesis                 merges every report into one list and one verdict
consolidator              proposes known-bugs index entries
fixer                     one brief, inside its work set (dispatch only)
proof-runner              runs one test file per fix under a heap cap (on request only)

learn-known               learn: every option placed in its true home, and why it is wrong here
learn-asked               learn: what could have been asked, each distractor turned into a key
learn-harder              learn: the repo's tiers or a five rung generic ladder, one new item per rung, no vocabulary items
learn-prepare             learn: the misconceptions, how each shows up, the fix, a study plan
learn-fact-checker        learn: every claim cited to a file:line, or UNVERIFIED, or CONTRADICTED
learn-synthesis           learn: draft items, SFT, DPO and GRPO rows, the study sheet, the README
learn-blind-reader        learn: reads each item with no key for a test-wise cue, and a secure run's release sheet for a leak
```

The learn agents are not reviewers: no fence, no severity tiers, no
verdict.

Every file an agent writes starts with a header naming the model that wrote
it and whether a human has reviewed it yet. Trust the `status` line.

## Rules the tool enforces

- Reviewers report only on the files in the fence. Files they open outside
  it are listed in the synthesis.
- Fixers edit only the files in the brief's work set. Anything else stops
  the fixer and asks you.
- A fix is not landed until its report is on disk.
- Every command that writes to `audits/` also writes a ledger line, even
  when it stops early. `/djinn:status` writes nothing.
- Everything runs on Opus. No exceptions.
- Three review rounds maximum, then a human decides.

## Rules the tool cannot enforce

- Fill in WHY. A brief without deliberation context gets a fixer that
  fixes the symptom.
- Read the synthesis, not just the verdict. LOW and DEBT do not block, and
  some of them matter.
- Apply the consolidator's index suggestions by hand. The tool proposes;
  you decide what becomes a rule.

## Files in this plugin

```
CONTRACTS.md        the interfaces every agent and command honor
relay.md            why the flow is shaped this way
commands/           review, brief, dispatch, status, learn
agents/             one prompt per reviewer, plus synthesis, fixer, consolidator, and the seven learn- agents
templates/          fix-brief.md, config.yaml
```

## Other runtimes

The agent prompts are plain markdown and portable. The orchestration
(parallel spawning, `$ARGUMENTS`, `${CLAUDE_PLUGIN_ROOT}`, the `tools:` and
`model:` frontmatter) is Claude Code specific. Each file ends with a
Runtime notes section naming what an adapter must map. An adapter for
another runtime lives under `adapters/` in the repo, not in this plugin.
