---
name: learn
description: Turn one exam question, a quiz file of them, or a topic into multi-angle study material and training data. Four angle agents look at each question (what you should have known, what could have been asked, how it gets harder, how to prepare), a fact checker cites every claim against the repo or marks it UNVERIFIED or CONTRADICTED, a blind reader with no key checks each item for a test-wise cue and a secure run's release sheet for a leak, and synthesis writes draft exam items in the repo's own shape, SFT, DPO and GRPO rows in Hugging Face TRL shapes, a study sheet, an owner review record and a README into a timestamped, git ignored run folder, with a ledger line. Never writes an item that only tests vocabulary. Writes nothing into the repo's content. Usage - /djinn:learn "<question text>" [--id <name>] | /djinn:learn <quiz file> [<item id> ...] | /djinn:learn --topic "<topic>", each with optional --sources <path>[,<path>...] and --secure.
allowed-tools: Read, Grep, Glob, Agent, Bash, Write
---

# Djinn Learn

A bad student reads "water boils at a lower temperature on a mountain",
circles it, and moves on. Ask them next week why a pressure cooker cooks
faster, or why the answer is not "the air up there is colder", and they are
guessing. They learned the key. They did not learn the map around it: that
cold air only slows the pot, that thin air changes breathing and not
boiling, that dry air speeds evaporation below the boiling point.

This command takes one question and looks at it from four sides:

1. **What should I have known?** Every option, the right one and each wrong
   one, placed in its true home, and why it is wrong here.
2. **What could have been asked?** The siblings: each wrong option turned
   into the right answer of its own question, and the reverse question,
   each asked as a case or a mechanism, never as a name.
3. **How does it get harder?** One new item per rung of a difficulty
   ladder.
4. **How do I prepare?** The misconceptions a bad student carries out of
   the room, how each shows up as a wrong answer, the fix, and a short plan.

Then a fact checker ties every claim to a line in the repo or says it could
not, synthesis turns what survives into draft exam items, training rows
and a study sheet, and a blind reader that never sees a key reads every
item the way a test-wise student would. It is a Learning Agent: it drafts material and plans, it
runs when the owner asks, and nothing it writes is final until a person
reads it.

You are the orchestrator. Subagents cannot spawn subagents, so you run every
wave yourself. Read `${CLAUDE_PLUGIN_ROOT}/CONTRACTS.md` sections 7, 8, 9,
11 and 13 first. Section 13 is the contract for this command: when this
file and section 13 disagree, section 13 wins. Every agent prompt below
carries `Contract: ${CLAUDE_PLUGIN_ROOT}/CONTRACTS.md`, expanded to the real
path, because an agent runs in the target repo, where that file does not
exist.

**This is an LLM pass and it is not deterministic.** The same question run
twice gives different items and different rows. The run records its input,
the repo HEAD, the date and the model so a reader knows exactly what
produced it, and it never claims to be reproducible. The option shuffle is
the one seeded step, and each row records its seed.

## Named constants

- `SLUG_MAX`: 40 characters, the most a run folder's slug carries.
- `PLAN_ABOVE`: 1. More questions than this, or any topic run, prints the
  plan and waits for `go` before spawning anything.
- `SEED_MAX`: 3, the most seed questions one topic run drafts.
- `RELEASE_ITEMS`: 4, the release items learn-asked drafts per source
  question in a secure run (CONTRACTS.md section 13, "The release sheet").
- `STEM_MATCH_WORDS`: 8, the opening words of a pasted stem the command
  greps for in secure banks.
- `ANSWER_WEIGHT`, `FORBIDS_PENALTY`, `KEY_POSITION_MAX_SHARE`,
  `KEY_POSITION_MIN_ROWS`, `KEY_LENGTH_MIN`, `KEY_LENGTH_MAX`,
  `LENGTH_CHECK_MIN_CHARS` and `CUE_WORDS`: defined once, at the top of the script in
  Step 9, which is the only place their values live. Where a prompt below
  says `<ANSWER_WEIGHT>`, `<FORBIDS_PENALTY>`, `<KEY_LENGTH_MIN>`,
  `<KEY_LENGTH_MAX>` or `<LENGTH_CHECK_MIN_CHARS>`, fill it from that
  script.

Each is Donald's to change.

## Step 1: Read the config

Find the working repo's root with
`git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false rev-parse --show-toplevel`.
That repo is the **target repo**: the sources, the item shape and the run
folder all live in it.

Read `.djinn/config.yaml` there if it exists and take the `learn` block:
`sources`, `exclude`, `item_shape`, `banks`, `writing_rules`, `tiers`,
`scenarios`, `secure_paths`, `holdout`, `out_dir` (absent means `learn/`). Take
`conventions_files` too; learn agents read them as house rules. No other
key matters here, `base_branch` is not required, and the file itself is
optional.

Learn is repo agnostic. Nothing in this command names a folder of any one
project: every path it uses comes from the config, the arguments, or Step
3b's discovery, which the owner confirms.

Make this run's temp folder, `RUN_TMP=$(mktemp -d)`, note the path it
printed, and remove it on every exit path (CONTRACTS.md section 9).

**out_dir stays inside the repo.** Write `<root>/<out_dir>` (or `out_dir`
itself when it is absolute) to `$RUN_TMP/out-dir` with Write, resolve it
with `tr '\n' '\0' < "$RUN_TMP/out-dir" | xargs -0 -r realpath -m --`, and
compare the result with the root as text: it must start with the root
followed by `/` and at least one more character. The root itself, a
sibling whose name starts with the root's (`<root>-site`), an absolute
path elsewhere and a `..` that climbs out all fail. A failure stops the
run with outcome `ABORTED step 1: out_dir outside this repo`: print the
ledger line to the owner, write nothing anywhere, and tell the owner to
set an `out_dir` inside the repo. From here on, `out_dir` means the
resolved absolute path; write it back to `$RUN_TMP/out-dir`.

**out_dir holds only run folders.** Before anything else can stop the run
and write, count the files under `out_dir` git tracks
(`tr '\n' '\0' < "$RUN_TMP/out-dir" | xargs -0 -r git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false ls-files -z --`).
Any output stops the run with outcome `ABORTED step 1: out_dir holds
tracked files`: print the ledger line to the owner, name the count, write
nothing anywhere (a `.gitignore` holding `*` in a tracked folder would
hide every new file there from git), and ask for a folder of its own, such
as `learn/`. Every stop after this check follows Step 10's ledger rule,
which writes `<out_dir>/.gitignore` first.

## Step 2: Parse the arguments

`$ARGUMENTS` is one of three input forms, plus optional flags.

- **A question in the prompt.** Any text that is not an existing file path
  and does not start with `--topic`. It may carry options and a key, each
  on its own line or inline: an option starts with a marker such as `A.`,
  `B)` or `-`, and the key follows `Answer:` or `Key:`. With no key, ask
  the owner for it once and stop until they give it. Never pick the key
  yourself. The question id is the `--id` value, lower case with every
  character outside `a` to `z`, `0` to `9` and `-` turned into `-`, or
  `prompt-<YYYYMMDD-HHMM>` without it, so two prompt runs never share a
  `source_id`.
- **A quiz file**, optionally followed by item ids:
  `/djinn:learn content/quizzes/week-3.yaml q7`.
  A path that exists, relative to the target repo root or absolute. With
  item ids, take those items; an id the file does not hold stops the run
  and lists the ids it does hold. With no ids, take every item in the file.
  The question id is the item's own full `id`, never a shortened form.
- **A topic**: `/djinn:learn --topic "boiling point"`. See Step 4.

Flags:

- `--sources <path>[,<path>...]`: replaces `learn.sources` for this run.
  Each path must exist under the target repo; one that does not stops the
  run and names it.
- `--id <name>`: the question id for a question in the prompt.
- `--secure`: marks the run secure whatever the paths say, for a pasted
  question from a secure bank.

Sources, item shape, banks, writing rules, tiers and scenarios the config
and the flags leave empty are proposed in Step 3b.

## Step 3: Read each question

Read the input with Read, never through a shell. For each question, record:

- the id, the file and line it starts on (`path:line`), or `prompt`
- its type as the file names it (for example `single`, `fill`, `justify`)
- the stem, every option in its authored order, the key, and the
  rationale if the file carries one, all verbatim
- any figure path the item names, and whether that file exists
- any other field the item carries, verbatim

An item whose key is missing or points at no option stops the run for that
item: say so and leave it out, and name it in the plan and the README.

For a file input, write its absolute path (the root, `/`, the path as
given, or the path itself when it is absolute) to `$RUN_TMP/input-path`
with Write, so no step depends on the shell's working folder. Record the
target repo's HEAD
(`git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false rev-parse HEAD`) and
whether the input file has uncommitted changes
(`tr '\n' '\0' < "$RUN_TMP/input-path" | xargs -0 -r git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false status --porcelain --`;
any output means dirty). Every path this command writes to a list file is
absolute in the same way.

## Step 3b: Discover what the config does not say, then the secure check

For every `learn` key still empty (`sources`, `item_shape`, `banks`,
`writing_rules`, `tiers`, `scenarios`, `secure_paths`), propose a value
from the target repo, by the rules in CONTRACTS.md section 13,
"Discovery". Read the repo's `CLAUDE.md` and `README` first; they usually
name where sourced material lives, where the quiz schema is, what the
tiers mean, which settings scenarios rotate through, and whether the repo
or any folder of it is private. Use Glob and Read, never a shell. Every
proposed value carries where it came from (`CLAUDE.md:42`, `folder name`,
`the input file`). A tier or scenario list is quoted from the file that
states it, never paraphrased into something the repo did not say.

If no sources come from config, flags or discovery: append the ledger line
with outcome `ABORTED step 3b: no sources`, tell the owner to add a
`learn.sources` list (CONTRACTS.md section 13) or pass `--sources`, and
stop. A fact checker with nothing to cite marks every claim UNVERIFIED, and
a run of that is noise presented as data.

**The secure check.** The same-repo test runs on every input file: the
quiz file here, and in topic mode each bank a picked item came from, after
Step 4. The secure test runs on every file the run will hand an agent to
open: the input files, every source, every `item_shape` file and every
`banks` file (a folder entry counts for every file under it).

1. **Same repo.** Resolve the file's real path
   (`tr '\n' '\0' < "$RUN_TMP/input-path" | xargs -0 -r realpath -e --`),
   write its folder to `$RUN_TMP/input-dir`, and find the git repo that
   holds it:
   `tr '\n' '\0' < "$RUN_TMP/input-dir" | xargs -0 -r -I{} git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false -C {} rev-parse --show-toplevel`.
   That is the **source repo**. When it is not the target repo, or the
   file is in no repo, stop, secure or not: append the ledger line with
   outcome `ABORTED step 3b: input outside this repo`, and tell the owner
   to run the command from inside the repo that holds the file. So the
   check below always reads the source repo's own config and `CLAUDE.md`,
   and nothing derived from one repo is written into another.
2. **Secure or not** (CONTRACTS.md section 13, "Secure sources": any
   agent that opens a secure file makes the run secure). The run is
   **secure** when any file the run hands an agent (input, source, item
   shape, bank) has a folder named `secure` in its real path or sits under
   a `learn.secure_paths` entry; when `secure_paths` holds `.` (the whole
   repo is private, so a pasted question and a seed are secure too); when
   the owner passed `--secure`; when a pasted question's stem matches a
   secure bank (below); or later, when an agent's `secure paths opened:`
   line names a path or is missing (Steps 4, 7 and 8). The **secure paths**
   every block below carries are `learn.secure_paths` plus every folder
   named `secure` on any of those files' real paths.
3. **A pasted question.** Take the first `STEM_MATCH_WORDS` words of its
   stem, put a backslash before each regex character as Step 4 does, and
   Grep every bank under a secure path for them, case-insensitive. A match
   makes the run secure, with the reason `pasted stem matches <path:line>`.

## Step 4: Topic mode (only with --topic)

Search every `learn.banks` file, every `learn.item_shape` file that is a
question bank, and every question bank the sources hold, for items whose
stem, options or key name the topic's words. Use the Grep tool, case-insensitive, with the topic as
its pattern after putting a backslash before each of `\ . + * ? ( ) [ ] {
} | ^ $`, so a topic such as `K+ channels` is matched as text. The Grep tool
is not a shell, so nothing typed there runs as a command. List up to the
first ten matches as `id  path:line  first words of the stem`, and ask the
owner which to run, or `seed` for a new question, or `seed <n>` for up to
`SEED_MAX` new questions.

In a run that is not secure, the list names an item from a bank under a
secure path by its id and `path:line` only, never its stem.

**Each picked item** goes through Step 3 (its record, `path:line`, HEAD,
dirty) and the Step 3b secure check against its own bank, and its bank is
**the input file** for that question: it is never evidence, and
`context.md` names it.

**Seed questions.** On `seed` or `seed <n>`, or when nothing matched, the
run drafts that many seed questions (one when no number is given, never
more than `SEED_MAX`), after Step 6 has made the run folder and before
Step 7. The plan shows each as `seed-<k>  (drafted after go)`. Spawn
learn-known once per seed, all in one message, each with
`model: "opus"` and the seed block:

```
LEARN RUN: <RUN_DIR>
MODE: seed
SEED: seed-<k> of <n>
TOPIC: <the topic>
Contract: <the real path of CONTRACTS.md>
Secure source: <yes | no>
Sources you may read and cite (learn.sources, in the owner's order of
trust): <list>
Never read as evidence: <each picked item's bank, <out_dir>, audits/, learn.exclude>
Secure paths: <list or none>. In a run that is not secure, name an item
from a bank under a secure path by id and path:line only; never quote or
summarize it, and never draft a seed from it. In a secure run, say what
it tests; never copy it. If you open any file under a secure path, for
its form or its content, write `secure: yes` in your seed file with the
paths you opened, else `secure: no`; that is your `secure paths opened:`
line.
Item shape (learn.item_shape): <list, or neutral>
Banks (learn.banks): <list>. Read them so the seed repeats no item there.
Writing rules (learn.writing_rules): <list or none>
House rules (conventions_files, and the target repo's CLAUDE.md): <list>
Other seeds in this run cover a different fact each; take the fact
numbered <k> in the order the sources state them most plainly.

Write exactly one file: <RUN_DIR>/angles/seed-<k>/seed.md
Reply with only the header line and your Counts line.
```

The retry and missing file rules of Step 7 apply. Read each `seed.md`
back. A seed file that says `secure: yes`, or carries no `secure:` line,
makes the run secure from here: rewrite the `secure:` line of
`context.md` with the reason (`seed-<k> read <paths>`, or `seed-<k> gave
no secure line`), and run Step 6's ignore check again, which stops a
secure run whose folder git does not ignore. Record each seed in
`input.md` as `seed-<k>, drafted by learn-known, not from any bank`, and
run the rest of the pipeline on it as question `seed-<k>`, with
`source_ref` `seed`. Its claims carry the `Q` letter, the
fact checker checks them in Step 8, and every row built on the seed uses
them. A seed question is model drafted and its README line says so.

## Step 5: The plan

Before the plan, read what git says about `out_dir` and the repo, with
every path absolute, in a list file and never typed: write
`<out_dir>/probe` to `$RUN_TMP/probe-path` and ask whether it is ignored
(`git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false check-ignore -q --no-index --stdin < "$RUN_TMP/probe-path"`;
exit 0 means ignored), and list the repo's remotes
(`git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false remote`).
Step 1 already stopped an `out_dir` that git tracks files under, or that
resolves to the root or outside the repo.

Print, before any agent is spawned:

```
learn plan: <n> question(s) from <input>, secure=<yes|no> (<why>)
  <qid>  <type>  <first words of the stem>   key: <key>
agents: <k> seed, <4 x n> angle, <n> fact checker, 1 synthesis, up to 1 recheck, <1, or 2 to 3 in a secure run> blind read, and 1 rewrite = <total> Opus runs
sources: <list>                              (config | --sources | discovered: <where>)
item shape: <list, or neutral>               (config | discovered: <where>)
banks: <list>                                (config | discovered: <where>)
writing rules: <list or none>                (config | discovered: <where>)
tiers: <name: definition, ... or generic ladder>   (config | discovered: <path:line>)
scenarios: <names or none>                   (config | discovered: <path:line>)
secure paths: <list or none>                 (config | discovered: <path:line>)
holdout: <n> of these questions are eval rows
out: <out_dir>/<timestamp>-<slug>/
out_dir ignored: <yes | no, the first run writes <out_dir>/.gitignore>; tracked files under it: 0; remotes: <names or none>
```

In a secure run the question line reads `<qid>  <type>  stem: withheld
(secure)   key: withheld (secure)`: the plan is printed to a terminal that
may be shared, and a stem is part of the item. In a topic run with seeds, the
secure line adds `(a seed that reads a secure path makes it yes)`.

With more questions than `PLAN_ABOVE`, in topic mode, when any line
above says `discovered`, or when the run is secure and the repo has a
remote, wait for the owner to say `go`. The owner may answer with a
correction instead ("sources: research/ only"); apply it, print the plan
again, and wait again. Anything else ends the run: append the ledger line
with outcome `DECLINED at plan` and stop. Otherwise (one question, every
value from config or flags), print the plan and go on.

## Step 6: Create the run folder

Timestamp: `date +%Y-%m-%d-%H%M`. Slug: the question id for one question,
the file's base name (no extension) plus the id for a file with one id, the
file's base name for a whole file, the topic for a topic run; lower case, every
character outside `a` to `z`, `0` to `9` and `-` turned into `-`, repeats
collapsed, cut to `SLUG_MAX`. `RUN_DIR` is `<out_dir>/<timestamp>-<slug>/`.
If it exists (Glob), append `-2`, `-3` and so on. Never overwrite. The
Write tool makes the folders; no `mkdir`.

**Keep it out of git.** When `<out_dir>/.gitignore` does not exist, write
it with the one line `*`. Then ask git whether the run folder is ignored:
write the absolute `<RUN_DIR>context.md` to `$RUN_TMP/run-path` and run
`git --no-optional-locks -c core.fsmonitor=false -c core.quotePath=false check-ignore -q --stdin < "$RUN_TMP/run-path"`
(exit 0 means ignored). A secure run whose run folder git does not ignore
stops: append the ledger line with outcome `ABORTED
step 6: out_dir not ignored`, and tell the owner which `.gitignore` rule or
tracked file keeps it visible. A run that is not secure goes on and the
report says the folder is not ignored.

Write, each with the attribution header (CONTRACTS.md section 7,
`author: Claude <model> (learn command)`, `status: learn draft, not yet
reviewed`):

- `<RUN_DIR>/context.md`:

  ```
  input: <the arguments as given>
  input_ref: <path:line per question, prompt, or seed>
  input_files: <the quiz file, or each picked item's bank, or none>
  target_repo: <the repo folder's name, never an absolute path>
  head: <full sha>
  input_dirty: <yes | no | n/a>
  secure: <yes | no>, <why>
  questions: <ids>
  sources: <list, and whether from config or --sources>
  exclude: <the input files, <out_dir>, audits/, plus learn.exclude>
  item_shape: <list, or neutral>
  writing_rules: <list or none>
  tiers: <the list, or generic ladder>
  scenarios: <the list, or none>
  holdout: <the ids, or none>
  provenance: <for sources, item_shape, writing_rules, tiers, scenarios and secure_paths: config, --sources, or discovered from where>
  model: <the model id you are running on>
  date: <iso>
  deterministic: no. An LLM pass; a rerun gives different output. The option shuffle is seeded per row.
  ```

- `<RUN_DIR>/input.md`: each question verbatim, as Step 3 recorded it,
  under a heading `## <qid>` with its `path:line`.
- `<RUN_DIR>/learn-config.yaml`: the values this run used, as a `learn:`
  block in the section 13 shape, with a comment line saying the owner can
  paste it into `.djinn/config.yaml` to skip discovery next time.
- `<RUN_DIR>/learn_reward.py`: the reference reward block from CONTRACTS.md
  section 13, verbatim, under a comment header with the section 7 fields.

**Past verdicts.** Glob `<out_dir>/*/review.md`. For each earlier run whose
`context.md` names the same input file, read its filled rows (a verdict
other than blank). Keep the `dropped` and `edited` item rows and the
`reject` claim rows, each with its reason, as **past verdicts**. They are
writing guidance, never evidence.

## Step 7: The angle wave

For each question, spawn the four angle agents in parallel: one message
with four Agent calls, `subagent_type` `learn-known`, `learn-asked`,
`learn-harder` and `learn-prepare`, each with `model: "opus"`. Wait for all
four before the next question's four, and print one progress line per
question (`3 of 17: angles done`). Each gets the angle block:

```
LEARN RUN: <RUN_DIR>
QUESTION: <qid>
Source: <path:line, or prompt, or seed>
Contract: <the real path of CONTRACTS.md>
Secure source: <yes | no>

The question, verbatim:
<the Step 3 record: type, stem, every option in authored order, the key,
the rationale if any, the figure path and whether it exists, any other
field>

Sources you may read and cite (learn.sources, in the owner's order of
trust): <list>
Never read as evidence: <the input files, <out_dir>, audits/, learn.exclude>.
You may read the input file to see the other items in it, never to support
a claim. Secure paths: <list or none>. In a run that is not secure, name
an item from a bank under a secure path by id and path:line only; never
quote or summarize it. In a secure run, say what it tests; never copy it.
Item shape (learn.item_shape): <list, or neutral>. Read these before you
write an item.
Banks (learn.banks): <list>. Read every one before you write an item: an
item a sibling bank already asks, or one that leaks with it, is dedupe and
leak work, the same as the input file's own items.
Writing rules (learn.writing_rules): <list or none>. Read these before you
write an item or an explanation.
Release items (learn-asked only, secure runs only): <RELEASE_ITEMS>, per
CONTRACTS.md section 13, "The release sheet".
Tiers (learn.tiers): <each name and definition, with path:line, or
"generic ladder">. learn-harder builds its ladder on these.
Scenarios (learn.scenarios): <each setting and the file its details come
from, or none>. Items rotate through these; details come only from the
named file.
House rules (conventions_files, and the target repo's CLAUDE.md): <list>.
Past verdicts on this input file: <the rows, or none>. Read them as
guidance on what the owner kept and dropped, never as evidence.

No item you write may test bare vocabulary (CONTRACTS.md section 13, "What
an item may test"). Write every distractor's home as `right for <the other
question>`, never "also right".
Secure paths opened: before your Counts line, write one line
`secure paths opened: <every file under a secure path you opened, for any
reason, or none>`. The command marks the run secure when it names any
path or is missing.

Contracts: <CONTRACTS>. Every "CONTRACTS.md section" above is a section
of that file. Start your file with the attribution header from its
section 7, status "learn draft, not yet reviewed". Write exactly one file:
<RUN_DIR>/angles/<qid>/<your-name>.md
Reply with only the header line and your Counts line.
```

`<CONTRACTS>` is the absolute path `${CLAUDE_PLUGIN_ROOT}/CONTRACTS.md`
expands to. The agent runs in the project repo, where a bare
`CONTRACTS.md` does not exist.

If an agent returned nothing or errored, or replied but its file is
missing, retry it once. If it fails again, write its file yourself with the
header and the single line `FAILED TO RETURN (2 attempts)`, and list it as
a failed agent. Never write an agent's reply to its path in place of its
file: a header and a Counts line hold no claims.

**Secure paths opened.** When the wave is done, read the `secure paths
opened:` line of every angle file (a file that reads `FAILED TO RETURN`
opened nothing). In a run that is not secure, a line that names any path,
or a missing line, makes the run secure from here: rewrite the `secure:`
line of `context.md` with the reason (`<agent> <qid> opened <paths>`, or
`<agent> <qid> gave no line`), and run Step 6's ignore check again, which
stops a secure run whose folder git does not ignore. Step 8's fact
checkers get the same read after they return.

## Step 8: The fact checker

When every angle file exists, spawn learn-fact-checker once per question,
all in one message, each with `model: "opus"`. Prompt:

```
LEARN RUN: <RUN_DIR>
QUESTION: <qid>
Contract: <the real path of CONTRACTS.md>
Angle files: <RUN_DIR>/angles/<qid>/learn-known.md, learn-asked.md,
learn-harder.md, learn-prepare.md
Seed file: <RUN_DIR>/angles/<qid>/seed.md, or none
Sources you may cite: <list>
Never evidence: <the input files, <out_dir>, audits/, learn.exclude>
Banks (learn.banks): <list>. A claim a bank states and no source does
stays UNVERIFIED, noted `stated in <path:line>, not a source`.
Secure paths: <list or none>. Name a file outside the sources by
path:line only; never quote it.
Ask the double key question of every item, reworded or not (CONTRACTS.md
section 13, "One defensible key"). Write `same fact as` for every claim.
Secure paths opened: before your Counts line, write one line
`secure paths opened: <every file under a secure path you opened, for any
reason, or none>`. The command marks the run secure when it names any
path or is missing.
Write exactly one file: <RUN_DIR>/verification/<qid>.md
Reply with only the header line and your Counts line.
```

Retry and missing file rules as in Step 7. A question whose verification
file reads `FAILED TO RETURN` has every claim UNVERIFIED, and synthesis is
told so.

## Step 9: Synthesis, the recheck and the blind read, then the script

Spawn learn-synthesis once, alone, with `model: "opus"`. Prompt:

```
LEARN RUN: <RUN_DIR>
Contract: <the real path of CONTRACTS.md>
Questions: <ids>
Context: <RUN_DIR>/context.md   Input: <RUN_DIR>/input.md
Angle files: <RUN_DIR>/angles/<qid>/learn-*.md, per question
Seed files: <RUN_DIR>/angles/<qid>/seed.md, per seed question, or none
Verification: <RUN_DIR>/verification/<qid>.md, per question
Failed agents: <list or none>
Secure source: <yes | no>
Secure paths: <list or none>
Holdout: <ids or none>
Item shape: <list, or neutral>   Banks: <list>   Writing rules: <list or none>
Tiers: <list, or generic ladder>   Scenarios: <list or none>
Past verdicts on this input file: <the rows, or none>
Model: <model id>   Date: <YYYY-MM-DD>
ANSWER_WEIGHT: <ANSWER_WEIGHT>   FORBIDS_PENALTY: <FORBIDS_PENALTY>
KEY_LENGTH_MIN: <KEY_LENGTH_MIN>   KEY_LENGTH_MAX: <KEY_LENGTH_MAX>   LENGTH_CHECK_MIN_CHARS: <LENGTH_CHECK_MIN_CHARS>
CUE_WORDS: <CUE_WORDS>   RELEASE_ITEMS: <RELEASE_ITEMS>
Write the files CONTRACTS.md section 13 lists for the run folder, except
context.md, input.md, learn-config.yaml, learn_reward.py, the angles,
verification, blind/source.md, check.txt and usage.md, which are not
yours. blind/items.md and blind/map.md are yours.
Reply with only the header line and the README's Counts line.
```

**The recheck.** When `<RUN_DIR>/rephrased.md` lists any item, spawn
learn-fact-checker once more, alone, with `model: "opus"`:

```
LEARN RUN: <RUN_DIR>
MODE: recheck
Contract: <the real path of CONTRACTS.md>
Rephrased: <RUN_DIR>/rephrased.md
Verification: <RUN_DIR>/verification/<qid>.md, per question
Sources you may cite: <list>
Never evidence: <the input files, <out_dir>, audits/, learn.exclude>
Secure paths: <list or none>. Name a file outside the sources by
path:line only; never quote it.
Run the double key read in full on each listed item as it now reads,
stem included.
Write exactly one file: <RUN_DIR>/verification/rephrased.md
Reply with only the header line and your Counts line.
```

**The blind read** (CONTRACTS.md section 13, "The blind read"). In a
secure run, first write `<RUN_DIR>/blind/source.md` yourself, with the
header: for every source question, a heading `## S<n>` (a neutral label,
never the question id), its stem, and its options sorted by their text,
and nothing else: no key, no rationale, no id, no path. Then spawn, in the
same message as the recheck, learn-blind-reader once with `MODE: items`
and, in a secure run, once more with `MODE: release`, each with
`model: "opus"`. Each prompt names only the files that mode may read:

```
LEARN RUN: <RUN_DIR>
MODE: items
Contract: <the real path of CONTRACTS.md>
Read only: <RUN_DIR>/blind/items.md
Write exactly one file: <RUN_DIR>/verification/blind-items.md
Reply with only the header line and your Counts line.
```

```
LEARN RUN: <RUN_DIR>
MODE: release
Contract: <the real path of CONTRACTS.md>
Read only: <RUN_DIR>/blind/source.md and <RUN_DIR>/study-sheet-release.md
Write exactly one file: <RUN_DIR>/verification/blind-release.md
Reply with only the header line and your Counts line.
```

Never paste a key, a note, a claim, a source path or an item id into
either prompt. The retry and missing file rules of Step 7 apply; a blind
read that fails twice fails every item it would have read, as a failed
recheck does.

**The blind result.** Read `verification/blind-items.md` beside
`blind/map.md` and write `<RUN_DIR>/verification/blind-result.md`, with the
header: one row per label, `| label | item | blind pick | cue | two keyed |
result |`, where an item **fails** when the blind pick is its key and the
cue is not `none`, or when the reader calls two options right; then, in a
secure run, one row per release item `verification/blind-release.md` says
the answer leaned on, each `fail`, and the reader's answer to each source
question beside that question's key. Write no key into the release rows;
write `right` or `wrong` for the answer.

The retry and missing file rules of Step 7 apply to the recheck. When it
fails twice, write `verification/rephrased.md` yourself with the header
and the line `FAILED TO RETURN (2 attempts)`: every item `rephrased.md`
lists then fails the recheck (CONTRACTS.md section 13, "The recheck"),
because no item keeps a status its old wording earned.

**The script.** Write this script to `$RUN_TMP/learn-rows.py` with Write,
exactly as it stands. It first shuffles each row's options by its seed
(CONTRACTS.md section 13, "Options in a prompt") and rewrites the file,
then checks every line:

```python
import hashlib
import json
import random
import re
import sys

ANSWER_WEIGHT = 0.5
FORBIDS_PENALTY = 0.15
KEY_POSITION_MAX_SHARE = 0.5
KEY_POSITION_MIN_ROWS = 8
KEY_LENGTH_MIN = 0.8
KEY_LENGTH_MAX = 1.25
LENGTH_CHECK_MIN_CHARS = 12
SEED_HEX_CHARS = 16
CUE_WORDS = ("not", "never", "no", "none", "cannot", "always", "only", "all", "every", "must",
             "may", "might", "usually", "often", "sometimes", "because", "since", "therefore")
HOME_LINE = re.compile(r"^- (.+?): right for (.+?); wrong here because (.+)$")

ROLES = {"system", "user", "assistant"}
META = ["source_id", "source_ref", "item", "run", "angle", "rung", "verification",
        "claims", "unverified_claims", "omitted", "secure", "model", "group", "split",
        "shuffle_seed", "key_position"]
LISTS = {"claims", "unverified_claims", "omitted", "group"}
PAIRS = ("shallow", "misconception", "misplaced")
TOP = {
    "sft": {"messages", "metadata"},
    "dpo": {"prompt", "chosen", "rejected", "metadata"},
    "grpo": {"prompt", "answer", "rubric", "metadata"},
}
OPTIONS_HEAD = "options:"
LAST_LINE = "end your reply with one line: answer:"


def found(term, text):
    pattern = r"(?<![a-z0-9])" + re.escape(term.lower()) + r"(?![a-z0-9])"
    return re.search(pattern, text.lower()) is not None


def user_message(row, kind):
    msgs = row.get("messages") if kind == "sft" else row.get("prompt")
    if not isinstance(msgs, list):
        return None
    users = [m for m in msgs if isinstance(m, dict) and m.get("role") == "user"
             and isinstance(m.get("content"), str)]
    return users[-1] if users else None


def option_block(text):
    lines = text.split("\n")
    heads = [i for i, line in enumerate(lines) if line.strip().lower() == OPTIONS_HEAD]
    if not heads:
        return lines, None, None
    i = heads[-1]
    j = i + 1
    while j < len(lines) and lines[j].startswith("- "):
        j += 1
    return lines, i + 1, j


def stem_of(row, kind):
    msg = user_message(row, kind)
    if msg is None:
        return None
    lines, a, b = option_block(msg["content"])
    return "\n".join(lines[:a - 1]) if a is not None else msg["content"]


def key_positions(meta, count):
    try:
        at = [int(p) for p in str(meta.get("key_position", "")).split(",")]
    except ValueError:
        return None
    if not at or len(set(at)) != len(at) or any(p < 1 or p > count for p in at):
        return None
    return at


def shuffle_rows(rows, kind):
    used = {}
    changed = False
    for n, row in rows:
        meta = row.get("metadata") if isinstance(row, dict) else None
        msg = user_message(row, kind) if isinstance(row, dict) else None
        if not isinstance(meta, dict) or msg is None:
            continue
        lines, a, b = option_block(msg["content"])
        if a is None or b == a:
            continue
        options = [line[2:] for line in lines[a:b]]
        at = key_positions(meta, len(options))
        if at is None or len(set(options)) != len(options):
            continue
        keys = [options[p - 1] for p in at]
        seed = hashlib.sha256("|".join(
            [str(meta.get("run")), kind, str(meta.get("item")), str(n)]).encode()).hexdigest()[:SEED_HEX_CHARS]
        rng = random.Random(seed)
        if len(keys) == 1:
            others = sorted(o for o in options if o != keys[0])
            rng.shuffle(others)
            spots = range(1, len(options) + 1)
            low = min(used.get(p, 0) for p in spots)
            pos = rng.choice([p for p in spots if used.get(p, 0) == low])
            used[pos] = used.get(pos, 0) + 1
            new = others[:pos - 1] + keys + others[pos - 1:]
        else:
            new = sorted(options)
            rng.shuffle(new)
        lines[a:b] = ["- " + o for o in new]
        text = "\n".join(lines)
        where = ",".join(str(new.index(k) + 1) for k in sorted(keys, key=new.index))
        if text != msg["content"] or meta.get("key_position") != where or meta.get("shuffle_seed") != seed:
            changed = True
        msg["content"] = text
        meta["key_position"] = where
        meta["shuffle_seed"] = seed
    return changed


def messages(value, where, last_role):
    if not isinstance(value, list) or not value:
        return [where + ": not a non-empty list of messages"]
    for i, m in enumerate(value):
        if not isinstance(m, dict) or set(m) != {"role", "content"}:
            return [where + "[" + str(i) + "]: keys are not exactly role, content"]
        if m["role"] not in ROLES:
            return [where + "[" + str(i) + "]: role is not system, user or assistant"]
        if not isinstance(m["content"], str) or not m["content"].strip():
            return [where + "[" + str(i) + "]: content is empty or not text"]
    if value[-1]["role"] != last_role:
        return [where + ": last message is not " + last_role]
    return []


def metadata(value, kind, secure):
    want = META + (["pair"] if kind == "dpo" else [])
    if not isinstance(value, dict):
        return ["metadata: not an object"]
    missing = [k for k in want if k not in value]
    extra = sorted(set(value) - set(want))
    if missing or extra:
        return ["metadata: missing " + (", ".join(missing) or "none") + "; extra " + (", ".join(extra) or "none")]
    errs = []
    if list(value) != want:
        errs.append("metadata: keys not in the contract's order")
    for key in want:
        ok = (isinstance(value[key], list) and all(isinstance(c, str) for c in value[key])) \
            if key in LISTS else isinstance(value[key], str)
        if not ok:
            errs.append("metadata." + key + ": wrong type")
    if errs:
        return errs
    if value["verification"] not in ("VERIFIED", "UNVERIFIED"):
        errs.append("metadata.verification: not VERIFIED or UNVERIFIED")
    elif (value["verification"] == "VERIFIED") != (value["unverified_claims"] == []):
        errs.append("metadata: verification disagrees with unverified_claims")
    if value["secure"] not in ("yes", "no"):
        errs.append("metadata.secure: not yes or no")
    elif secure and value["secure"] != secure:
        errs.append("metadata.secure: " + value["secure"] + ", the run is secure=" + secure)
    if value["split"] not in ("train", "eval"):
        errs.append("metadata.split: not train or eval")
    if value["source_id"] not in value["group"]:
        errs.append("metadata.group: does not hold source_id")
    if kind == "dpo" and value["pair"] not in PAIRS:
        errs.append("metadata.pair: not " + ", ".join(PAIRS))
    return errs


def options_check(row, kind):
    meta, msg = row["metadata"], user_message(row, kind)
    if msg is None:
        return [], None
    lines, a, b = option_block(msg["content"])
    if a is None or b == a:
        if meta["key_position"] != "none" or meta["shuffle_seed"] != "none":
            return ["metadata: key_position and shuffle_seed must be none with no options"], None
        return [], None
    options = [line[2:] for line in lines[a:b]]
    errs = []
    if any(not o.strip() or o != o.strip() for o in options) or len(set(options)) != len(options):
        errs.append("options: an option is empty, padded or repeated")
    at = key_positions(meta, len(options))
    if at is None:
        return errs + ["metadata.key_position: not positions of real options"], None
    if len(meta["shuffle_seed"]) != SEED_HEX_CHARS:
        errs.append("metadata.shuffle_seed: not set by the shuffle")
    if len(at) != 1:
        return errs, None
    key = options[at[0] - 1]
    rest = [o for i, o in enumerate(options) if i != at[0] - 1]
    if kind == "grpo" and key != row["answer"]:
        errs.append("options: the option at key_position is not the answer column")
    source_row = meta["source_ref"] != "seed" and re.fullmatch(
        re.escape(meta["source_id"]) + r"(-m[0-9]+)?", meta["item"]) is not None
    if rest and not source_row and min(len(o) for o in options) >= LENGTH_CHECK_MIN_CHARS:
        ratio = len(key) / (sum(len(o) for o in rest) / len(rest))
        if not KEY_LENGTH_MIN <= ratio <= KEY_LENGTH_MAX:
            errs.append("options: key over mean distractor length is " + format(ratio, ".2f"))
        if len(key) > max(len(o) for o in rest):
            errs.append("options: the key is the longest option")
    if rest and not source_row:
        cues = [w for w in CUE_WORDS if found(w, key) and not any(found(w, o) for o in rest)]
        if cues:
            errs.append("options: the key alone carries the cue word " + ", ".join(cues))
    return errs, (at[0], len(options))


def misplaced_check(row):
    chosen = [l.rstrip() for l in row["chosen"][0]["content"].split("\n")]
    rejected = [l.rstrip() for l in row["rejected"][0]["content"].split("\n")]
    if len(chosen) != len(rejected):
        return ["misplaced: chosen and rejected have different line counts"]
    diff = [i for i, (a, b) in enumerate(zip(chosen, rejected)) if a != b]
    if len(diff) != 1:
        return ["misplaced: rejected differs from chosen on " + str(len(diff)) + " lines, not exactly one"]
    i = diff[0]
    a, b = HOME_LINE.match(chosen[i]), HOME_LINE.match(rejected[i])
    if a is None or b is None:
        return ["misplaced: the changed line is not '- <option>: right for <home>; wrong here because <why>'"]
    if a.group(1) != b.group(1) or a.group(3) != b.group(3):
        return ["misplaced: the changed line changes more than its right for clause"]
    homes = {m.group(2) for j, m in enumerate(HOME_LINE.match(l) for l in chosen)
             if m is not None and j != i and m.group(1) != a.group(1)}
    if b.group(2) not in homes:
        return ["misplaced: the rejected right for clause is not another option's clause in chosen"]
    return []


def rubric(row):
    checks = row.get("rubric")
    if not isinstance(checks, list) or not checks:
        return ["rubric: not a non-empty list"]
    for c in checks:
        if not isinstance(c, dict) or set(c) != {"id", "kind", "weight", "terms"}:
            return ["rubric: a check's keys are not exactly id, kind, weight, terms"]
        if c["kind"] not in ("answer", "mentions", "forbids"):
            return ["rubric: kind is not answer, mentions or forbids"]
        if not isinstance(c["weight"], (int, float)) or isinstance(c["weight"], bool):
            return ["rubric: weight is not a number"]
        if not isinstance(c["terms"], list) or not c["terms"] or not all(
                isinstance(t, str) and t.strip() for t in c["terms"]):
            return ["rubric: terms is not a non-empty list of text"]
    errs = []
    if checks[0]["kind"] != "answer" or sum(c["kind"] == "answer" for c in checks) != 1:
        errs.append("rubric: not exactly one answer check, first")
    else:
        if checks[0]["terms"][0] != row.get("answer"):
            errs.append("rubric: the answer check's first term is not the answer column")
        if abs(checks[0]["weight"] - ANSWER_WEIGHT) > 1e-6:
            errs.append("rubric: the answer weight is not ANSWER_WEIGHT")
    if not any(c["kind"] == "mentions" for c in checks):
        errs.append("rubric: no mentions check")
    if abs(sum(c["weight"] for c in checks if c["kind"] != "forbids") - 1.0) > 1e-6:
        errs.append("rubric: answer and mentions weights do not add to 1.0")
    if any(c["kind"] == "forbids" and abs(c["weight"] - FORBIDS_PENALTY) > 1e-6 for c in checks):
        errs.append("rubric: a forbids weight is not FORBIDS_PENALTY")
    msg = user_message(row, "grpo")
    if msg is not None:
        for c in checks:
            if c["kind"] == "mentions":
                for t in c["terms"]:
                    if found(t, msg["content"]):
                        errs.append("rubric: mentions term in prompt: " + c["id"] + ": " + t)
    return errs


def check_row(row, kind, secure):
    if not isinstance(row, dict) or set(row) != TOP[kind]:
        return ["keys are not exactly " + ", ".join(sorted(TOP[kind]))], None
    errs = metadata(row["metadata"], kind, secure)
    if kind == "sft":
        errs += messages(row["messages"], "messages", "assistant")
        if user_message(row, kind) is None:
            errs.append("messages: no user message")
    else:
        prompt_errs = messages(row["prompt"], "prompt", "user")
        errs += prompt_errs
        if kind == "grpo" and not prompt_errs:
            lines = [l for l in row["prompt"][-1]["content"].splitlines() if l.strip()]
            if not lines or not lines[-1].strip().lower().startswith(LAST_LINE):
                errs.append("prompt: last line is not the Answer instruction")
    if kind == "dpo":
        for side in ("chosen", "rejected"):
            errs += messages(row[side], side, "assistant")
            if isinstance(row[side], list) and len(row[side]) != 1:
                errs.append(side + ": not exactly one assistant message")
        if row["chosen"] == row["rejected"]:
            errs.append("chosen and rejected are the same")
        elif not errs and row["metadata"]["pair"] == "misplaced":
            errs += misplaced_check(row)
    if kind == "grpo":
        if not isinstance(row["answer"], str) or not row["answer"].strip():
            errs.append("answer: empty or not text")
        errs += rubric(row)
    if errs:
        return errs, None
    return options_check(row, kind)


def read_rows(path):
    rows, bad = [], []
    with open(path, encoding="utf-8") as f:
        raw = f.read().split("\n")
    if raw and raw[-1] == "":
        raw.pop()
    for n, line in enumerate(raw, 1):
        if not line.strip():
            bad.append((n, "blank line"))
            rows.append((n, None, line))
            continue
        try:
            rows.append((n, json.loads(line), line))
        except json.JSONDecodeError as e:
            bad.append((n, "not JSON: " + e.msg))
            rows.append((n, None, line))
    return rows, bad


def mark_secure(parsed, secure):
    fixed = 0
    for n, row in parsed:
        meta = row.get("metadata") if isinstance(row, dict) else None
        if secure in ("yes", "no") and isinstance(meta, dict) and "secure" in meta and meta["secure"] != secure:
            meta["secure"] = secure
            fixed += 1
    return fixed


def source_stems(parsed, kind):
    stems = {}
    for n, row in parsed:
        meta = row.get("metadata") if isinstance(row, dict) else None
        if isinstance(meta, dict) and meta.get("item") == meta.get("source_id"):
            stem = stem_of(row, kind)
            if stem is not None:
                stems.setdefault(meta.get("source_id"), set()).add(stem)
    return stems


failed = False
secure = None
root = None
for arg in [a for a in sys.argv[1:] if a != "--"]:
    if arg.startswith("secure="):
        secure = arg.split("=", 1)[1]
        continue
    if arg.startswith("root="):
        root = arg.split("=", 1)[1].rstrip("/")
        continue
    path = arg
    shown = path[len(root) + 1:] if root and path.startswith(root + "/") else path
    kind = path.rsplit("/", 1)[-1].split(".", 1)[0]
    if kind not in TOP:
        print("FAIL " + shown + ": not sft, dpo or grpo")
        failed = True
        continue
    try:
        rows, bad = read_rows(path)
        parsed = [(n, row) for n, row, _ in rows if row is not None]
        fixed = mark_secure(parsed, secure)
        if shuffle_rows(parsed, kind) or fixed:
            out = [json.dumps(row, ensure_ascii=False) if row is not None else line for n, row, line in rows]
            with open(path, "w", encoding="utf-8") as f:
                f.write("\n".join(out) + "\n")
        if fixed:
            print("info " + shown + ": set metadata.secure to " + secure + " on " + str(fixed) + " rows")
    except (OSError, UnicodeDecodeError) as e:
        print("FAIL " + shown + ": cannot read or write: " + str(e))
        failed = True
        continue
    for n, why in bad:
        print("FAIL " + shown + ":" + str(n) + ": " + why)
        failed = True
    stems = source_stems(parsed, kind) if kind == "dpo" else {}
    spots = {}
    fewest = None
    for n, row in parsed:
        errs, spot = check_row(row, kind, secure)
        if not errs and kind == "dpo":
            meta = row["metadata"]
            known = stems.get(meta["source_id"])
            if known and re.fullmatch(re.escape(meta["source_id"]) + r"-m[0-9]+", meta["item"]) \
                    and stem_of(row, kind) not in known:
                errs.append("metadata.item: labeled a misconception on the source, but its stem is not the source's")
        for err in errs:
            print("FAIL " + shown + ":" + str(n) + ": " + err)
            failed = True
        if spot is not None:
            spots[spot[0]] = spots.get(spot[0], 0) + 1
            fewest = spot[1] if fewest is None else min(fewest, spot[1])
    keyed = sum(spots.values())
    print("info " + shown + ": " + str(len(parsed)) + " rows read; key positions " +
          (", ".join(str(p) + "=" + str(spots[p]) for p in sorted(spots)) or "none"))
    allowed = max(KEY_POSITION_MAX_SHARE * keyed, -(-keyed // fewest)) if fewest else 0
    if keyed >= KEY_POSITION_MIN_ROWS and max(spots.values()) > allowed:
        print("FAIL " + shown + ": one key position holds more than KEY_POSITION_MAX_SHARE of " + str(keyed) +
              " keyed rows, and more than the " + str(-(-keyed // fewest)) + " that " + str(fewest) + " option rows force")
        failed = True
if secure not in ("yes", "no"):
    print("FAIL the list file's first line is not secure=yes or secure=no")
    failed = True
print("RESULT: " + ("fail" if failed else "pass"))
sys.exit(1 if failed else 0)
```

Write `$RUN_TMP/jsonl-files` with Write: the first line `secure=<yes|no>`,
the second `root=<the target repo root, absolute>`, then the three
`.jsonl` paths, one per line, each absolute (the root, `/`, the path), so
nothing depends on the shell's working folder:
`tr '\n' '\0' < "$RUN_TMP/jsonl-files" | xargs -0 -r python3 "$RUN_TMP/learn-rows.py" --`.
The script prints paths relative to the root. Write its whole output to
`<RUN_DIR>/check.txt` with Write, with the attribution header. The check
passed only when the last line reads `RESULT: pass`. Every `FAIL` line is
a failure, and so is a missing last line. `info` lines report rows read,
where the keys landed, and any row whose `metadata.secure` the script set
to the run's mark. (xargs exits 123 when the script exits 1; read the
lines, not the code.) The length rule is CONTRACTS.md section 13's ("A key
is never cut"): the script fails a key outside the band or strictly longer
than every distractor, and a key that alone carries a word of `CUE_WORDS`
("A key alone carries no cue word"), and skips both only on rows built on
a bank's own or a pasted source question (`item` equal to `source_id`, or
`<source_id>-m<n>`, with a `source_ref` that is not `seed`), whose options
the run never changes. A `misplaced` DPO row must differ from its
`chosen` on exactly one `- <option>: right for <home>; wrong here because
<why>` line, and only in a `right for` clause that another line of
`chosen` carries (section 13, "A misplaced pair is drawn only from the
misplacement table"). A
DPO row labeled `<source_id>-m<n>` must carry the source row's stem. The
key position share allows one position more than half only as far as
two-option rows force it. The README says when the source's own options
break the bank's length rule, for the owner to fix in the bank.

**One rewrite.** When the check fails, `verification/rephrased.md` fails
any item or reads `FAILED TO RETURN`, or `verification/blind-result.md`
fails any item or release item, spawn learn-synthesis once more, alone,
with a prompt that opens with the lines `LEARN RUN: <RUN_DIR>` and
`Contract: <the real path of CONTRACTS.md>` (every learn agent refuses a
prompt without the first), then:
"`<RUN_DIR>/check.txt` lists lines that fail CONTRACTS.md section 13,
`<RUN_DIR>/verification/rephrased.md` lists rephrased items that failed the
recheck, or reads FAILED TO RETURN, which fails every item
`rephrased.md` lists, and `<RUN_DIR>/verification/blind-result.md` lists
items and release items the blind read failed. Take every failed release
item off `study-sheet-release.md` and list it in the README's release
section. Quarantine every other failed item as section 13's "The
recheck" says: remove it from `items-DRAFT.*`, `study-sheet.md`,
`study-sheet-release.md`, `plan.md`, `review.md`'s item rows and every row
of `sft.jsonl`, `dpo.jsonl` and `grpo.jsonl` built on it; add it to
`quarantine.md` with the recheck result; and fix the README's Counts line
and Merged and dropped. Then rewrite the lines `check.txt` names so every
line passes, and change nothing else. Never reword a key or an option in
this pass: the recheck has run. A row that could pass only with a
reworded option is dropped and listed under Merged and dropped." Then
run the script again and write `check.txt` again. A second failure is not retried: the outcome is
`PARTIAL: <file> failed its check`, and the report says which lines.
When the rewrite took any item off the release sheet, spawn the release
blind read once more on the new sheet, and add its rows to
`blind-result.md`. An item it leans on this time leaves too, and if it
leans on any item at all, cut the release sheet to its header and first
line yourself, saying `blind read failed twice; no practice is released
from this run`. No third read.

**Close the blind read.** Last, with or without a rewrite, replace the
release sheet's `blind read: pending` with what happened (`blind read:
nothing dropped`, or `blind read: <n> items dropped`), and the README's
`Blind read` line with the counts from `verification/blind-result.md`
(items read, failed by a cue, failed as two keyed; release items dropped;
the answer to each source question as `right`, `wrong` or `could not
answer`) and a pointer to that file. Apart from the cut above, these two
lines are the only lines of synthesis's files the command writes.

## Step 10: Usage table and ledger (always, even on an early stop)

**Usage.** Write `<RUN_DIR>/usage.md` with the attribution header and the
table from CONTRACTS.md section 6, one row per agent run (an angle agent
per question counts once per question, named `<agent> <qid>`), and a total.
Write `?` where an agent returned no usage block. A run stopped before
Step 6 has no folder and no usage file.

**Ledger.** The ledger rule, for this step and every early stop after
Step 1's tracked files check: when `<out_dir>/.gitignore` does not exist,
write it first with the one line `*`, so no ledger ever sits unignored;
then append exactly one line to `<out_dir>/LEDGER.md`, creating it with
the header row from CONTRACTS.md section 13 if it is missing. Step 1's two
stops (`out_dir outside this repo`, `out_dir holds tracked files`) come
before that check has passed, so they print their line to the owner and
write nothing anywhere: never `learn/LEDGER.md` by name, and never a `*`
file into a folder git tracks files under. The line:

```
| <YYYY-MM-DD HH:MM> | learn | <RUN_DIR or none> | input=<path#ids, prompt:<id>, or topic:<slug>> questions=<n> secure=<yes|no> | <outcome> | items=<n> sft=<n> dpo=<n> grpo=<n> claims=V<n> U<n> C<n> quarantined=<n> check=<pass|fail|not run> holdout=<n> key_first=<n of grpo> tokens=<total or ?> |
```

Counts come from the README's Counts line, and `key_first` from the
script's `info` line for `grpo.jsonl` (the count at position 1). A run
stopped before synthesis writes its counts as `?`. Never write a key, a
stem or an answer into the ledger: an input from a secure source must not
leak through it, so the input column carries only the path and the ids.

## Step 11: Report to the owner

- `RUN_DIR`, and `SECURE SOURCE: keep this folder out of any public repo
  and off any public dataset hub` first when the input is secure.
- Whether the run folder is git ignored, and the `.gitignore` the run wrote,
  if it wrote one.
- Per output: the count, and `check pass` or the failing lines.
- Claims: VERIFIED, UNVERIFIED, CONTRADICTED, and what was quarantined.
- The UNVERIFIED claims, as `<qid>.<id> <the claim>`, so the owner can rule
  on each in `review.md`. Past ten, the count and `see README.md`.
- Items dropped as naming items or as restatements of the source, items
  held back from VERIFIED as double keyed, items the recheck failed, and
  items and release items the blind read failed, each with its cue.
- In a secure run: how many release items reached `study-sheet-release.md`
  of those written, and the blind reader's answer to each source question
  from that sheet alone (`right`, `wrong` or `could not answer`).
- Failed agents, if any.
- Next step: "Read `<RUN_DIR>/README.md`, then `items-DRAFT.*`, and fill
  `review.md` as you go: the next run on this file reads it. Nothing here
  is in the repo's content. Move an item there by hand once you have read
  it and made its explanation your own."

## Rules

- Write nothing outside `RUN_DIR`, `<out_dir>/LEDGER.md` and
  `<out_dir>/.gitignore`. Never write into the repo's content, its
  question banks, its own `.gitignore`, or `audits/`.
- Every Agent call passes `model: "opus"` explicitly.
- Angle agents run in parallel per question. The fact checkers run in
  parallel after every angle file exists. Synthesis runs alone, then the
  recheck when any item was rephrased and the blind read in one message,
  then the script.
- Never give learn-blind-reader a key, a note, a claim, a source or an
  item id: its prompt names only the `blind/` files and, in release mode,
  `study-sheet-release.md`.
- Never pick an answer key yourself. A question without one waits for the
  owner.
- Bash is for `git rev-parse`, `git status --porcelain`, `git ls-files`,
  `git check-ignore` and `git remote` (each with the CONTRACTS.md section
  9 read prefix), `date`, `mktemp -d`, `rm -rf "$RUN_TMP"` for that folder
  only, `realpath -e` and `realpath -m` for the path checks, `tr` and
  `xargs -0 -r`, and the one `python3` call on the script above. Nothing
  else. No path or argument is typed into a command line: paths go through
  a list file in `$RUN_TMP`.
- Read input files and sources with Read, Grep and Glob, never through a
  shell. Never open `.env`, key or credential files; the section 9 secret
  shapes apply to every search.

## Runtime notes

Claude Code specific: `allowed-tools`, `$ARGUMENTS`,
`${CLAUDE_PLUGIN_ROOT}`, the Agent tool with `subagent_type` and `model`,
and parallel spawning by putting several Agent calls in one message. An
adapter for another runtime maps each of these. The waves (four angle
agents per question in parallel, then the fact checkers, then synthesis
alone, then the recheck and the blind read, then the script) are the
contract, not the mechanism.
The script needs a `python3` on the owner's machine; without one the
options stay unshuffled, the outcome is `PARTIAL: script not run`, and the
report says so.
