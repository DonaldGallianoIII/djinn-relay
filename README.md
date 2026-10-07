# djinn relay

A code review done by a team of AI agents, plus the prompts that run it.

You run one command on your branch. About twenty specialist reviewers each
read the change for one kind of problem: bugs, how it fits the rest of the
code, security, speed, cost, accessibility, missing pieces. A synthesis
agent merges their reports into one ranked list and one verdict: `SHIP`,
`FIX THEN SHIP`, or `ESCALATE`. Everything lands in an `audits/` folder in
your repo, with one line in `audits/LEDGER.md` per run.

The review never edits your code. Fixing is a separate step: you pick a
finding, a brief gets written, you fill in why, and a fixer agent makes
that one change inside a fenced list of files. Then the review runs again
on the result.

Think of it as a relay race. Each runner carries the work one leg and hands
it off in writing, so nobody has to remember what the last runner did.
Where it breaks: in a real relay the baton is one object. Here every
handoff is a file on disk, so you can stop between legs, read it, and
change it before the next runner starts.

There is a second, separate pipeline in here too: `learn` takes one exam
question and turns it into study material and training data, with every
claim cited to your repo or marked UNVERIFIED.

## On Claude Code

Install once per machine:

```
/plugin marketplace add donaldgallianoiii/djinn-relay
/plugin install djinn@djinn-relay
```

Restart Claude Code. Then, in any repo:

```
/djinn:review              review your branch against its base
/djinn:status              what is still open, across every round
/djinn:brief <audit> HIGH-1
/djinn:dispatch <brief>    fix it, then review again
/djinn:view                open every audit in the browser
/djinn:learn "<question>"  study material and training data from one question
```

The first `/djinn:review` in a repo sets itself up: it reads the repo,
shows you a draft `.djinn/config.yaml`, and writes it when you say go.

Full manual: [`plugins/djinn/README.md`](plugins/djinn/README.md).

## On Codex

Needs Codex 0.160 or newer and Node. Install once:

```bash
codex plugin marketplace add DonaldGallianoIII/djinn-relay --ref Claude-Development-djinn-relay-codex
codex plugin add djinn-codex@djinn-relay
```

Start a new Codex session, then in your repo:

```
$djinn-review quick
```

Commands are the same with a `$djinn-` prefix: `$djinn-review`,
`$djinn-status`, `$djinn-brief`, `$djinn-dispatch`, `$djinn-view`,
`$djinn-setup`. When djinn asks a question, press **Shift+Left** to open
Codex's picker, or type `go` to take the defaults.

Codex does not have everything yet. `learn`, `dispatch --prove`, and the
`perf`, `cost`, `live`, `ideas` and `map` scopes are Claude Code only. And
Codex cannot lock a reviewer to read only the way Claude Code can, so on
Codex that rule holds by instruction alone.

Full manual: [`adapters/codex/README.md`](adapters/codex/README.md).

## On anything else

No plugin, no automation. The prompts still work.

Every agent is a plain markdown file in
[`plugins/djinn/agents/`](plugins/djinn/agents/). The rules they all share
(the severity ladder, the report format, what a finding must cite) are in
[`plugins/djinn/CONTRACTS.md`](plugins/djinn/CONTRACTS.md). Any model that
can read your code can run them. You do the orchestration by hand:

1. **Make the fence.** List the files your branch changed:
   `git diff --name-only main...HEAD`. That list is the boundary. Reviewers
   report only on those files.
2. **Run a reviewer.** Open a fresh chat. Paste `CONTRACTS.md` sections 1
   and 3, then the body of one agent file (skip the frontmatter between the
   `---` lines), then the fence list, then the changed files themselves if
   the tool cannot read your disk. Start with `bugs-reviewer.md` and
   `integration-reviewer.md`.
3. **Repeat** in a new chat for each reviewer you want. A fresh chat per
   reviewer matters: one that has read another's report starts agreeing
   with it.
4. **Synthesize.** Paste every report into a last chat with
   `synthesis.md`. You get one deduplicated list and a verdict.

What you lose without the plugin: the parallel runs, the audit folder and
ledger, the round 2 review after a fix, the work-set guard on the fixer,
and the tool locks that keep a reviewer read only. What you keep is the
part that does the thinking.

## What is in this repo

| Path | What it is |
|---|---|
| `plugins/djinn/` | The Claude Code plugin: agents, commands, contracts, templates. The source of truth. |
| `adapters/codex/` | The Codex port. `build.mjs` copies the agents and contracts into `plugin/`. |
| `audits/` | djinn's reviews of its own changes. Real examples of the output. |
| `qa/`, `tests/` | Human QA walkthroughs and the automated tests. |
| `tools/` | The private-content check and the pre-push hook. See [`CONTRIBUTING.md`](CONTRIBUTING.md). |
| `docs/` | Carried findings and session history. |

## About me

I'm Donald Galliano III, a machine learning engineer in New Orleans. I came
up inside hospital sleep labs and health information management, so I
learned what clinical data looks like before anyone cleans it. Now I build
ML systems, retrieval that cites its sources, and code that runs a lot
faster than it used to.

djinn started as the review harness I run on my own work before anything
ships. I wanted every finding traced to a line and every decision written
down, so I could trust the result without rereading the whole diff myself.

My shop is **[Crawdata](https://crawdata.ai)**: ML engineering, performance
work, custom models, and consulting. If you have something slow, or
something you need built, write to
[hello@crawdata.ai](mailto:hello@crawdata.ai).
