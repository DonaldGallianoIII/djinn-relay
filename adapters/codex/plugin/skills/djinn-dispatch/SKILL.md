---
name: djinn-dispatch
description: Fix djinn findings with fixer agents, then review the combined change again. Takes a selection (all highs, all blocking, all, with recs) that one fixer per 20 findings works through, or brief paths. Shows its plan and waits for go before any code changes. Saves a diff and a report per brief; never commits. Usage - $djinn-dispatch [--no-tests] <audit-folder> <selection> [one each] [--max <n>], or $djinn-dispatch [--no-tests] <brief-path>... Codex does not run --prove yet.
---

<!-- Written by Claude Opus 5.5 for Donald, 2026-10-05. Codex adapter of
plugins/djinn/commands/dispatch.md. Status: not yet run from a Codex
session, not reviewed. This is the one djinn skill that changes code. -->

# Djinn Dispatch on Codex

The fixing is djinn's own command, unchanged; this file maps it to Codex.
`<plugin root>` is the folder two levels above this `SKILL.md`.

## Order of work

1. Follow `<plugin root>/shared/agent-model.md` Steps A and B for the
   fixers' and reviewers' model and effort, as review does. Then give its
   concurrency heads-up if the cap calls for one.
2. If the request has `--prove`, stop before anything else with:
   `djinn-dispatch on Codex does not run --prove yet; run it without --prove, or use /djinn:dispatch --prove in Claude Code.`
3. Follow `<plugin root>/commands/dispatch.md` Step 1 to Step 9 as mapped
   below. Read `CONTRACTS.md` first, in parts. A selection writes its
   briefs through `brief.md`'s Selection mode, with the `djinn-brief`
   skill's mapping, before the plan. Step 5's plan and its wait for `go`
   are kept exactly: nothing is spawned and no code changes
   before the owner says go.
4. Step 7's review round follows the `djinn-review` skill's mapping, its
   spawn messages, its quiet terminal and its ledger tag, with the model
   and effort chosen in item 1.

## The mapping

Everything `skills/djinn-review/SKILL.md` maps (plugin root, arguments,
tools and Bash list, spawns, waits, usage cells, author lines, git
prefix, quiet searches, runtime tag) applies here the same way. On top:

| `dispatch.md` says | On Codex |
|---|---|
| spawn a fixer with `subagent_type: "fixer"` and `model: "opus"` | `spawn_agent` per `shared/agent-model.md` Step D, task name `fixer_<brief id>_<run timestamp>`, message below |
| all fixer calls for a batch in one message | the batch's fixers as one rolling window up to the cap; the batch ends when every fixer has answered; the build gate and the next batch wait for that |
| the fixer's return text | its `FINAL_ANSWER`, the Fix Report, used as dispatch.md's Collect step says. It is written to `fixes/<id>-report.md`, never printed |
| "Max effort is set by the fixer's own prompt" | the effort chosen in item 1, passed on every spawn |
| `author: Claude Opus (fixer agent, via /djinn:dispatch)` | `author: Codex <agents model> (fixer agent, via djinn-dispatch)` |
| the question tool (`AskUserQuestion`) at Step 5's gate | `request_user_input_async` per `shared/agent-model.md`, Asking with the picker: the same questions and options, each option's `(Recommended)` dropped (the first option is the plan's choice). Print `Answer in the picker (Shift+Left opens it), or type go to run the plan as shown.` and wait for every answer |
| `harness_timeout_max_s` | Claude Code's Bash tool limit. Codex keeps a long command running in its exec session: poll it until it ends. Treat the key as none on Codex |
| `/djinn:review`, `/djinn:brief`, `/djinn:status`, `/djinn:view` in reports | `$djinn-review`, `$djinn-brief`, `$djinn-status`, `$djinn-view` |

### The fixer's message

```
You are the djinn agent fixer. Your instructions are in
<plugin root>/agents/fixer.md. Read that file first and follow it.
Its frontmatter tools line is binding here. The brief's work_set.files is
a hard boundary: edit no other file, create none, delete none; if the fix
needs one, stop and return BLOCKED_SCOPE as fixer.md says. Never run a
git command that changes anything.

<the prompt dispatch.md Step 6 gives, verbatim, with its values filled>

Your final answer is your whole Fix Report, in fixer.md's format. Write
no em dash and no en dash anywhere (CONTRACTS.md section 11).
```

## Keep the terminal quiet

- Show Step 5's plan in full: it is what the owner says go to.
- Between batches, one line each: `batch <k>: <brief ids>`, then
  `batch <k>: landed <ids>`, `batch <k>: partial <id>, fixed <n> of <m>`
  or `batch <k>: blocked <ids>`.
- Never print a Fix Report, a diff, a brief or a review report. The
  owner reads them with `$djinn-view <audit-folder>`.
- The final message is Step 9's report.

## Rules

- On Codex the work set is held by the fixer's instructions; Codex cannot
  lock an agent to a list of files. Afterward, dispatch.md Step 7 item 3
  names any changed file that is in no work set and was not in the
  original fence as a scope leak, in the final report, and reviews it. An
  edit to a file the original review already fenced is not flagged as a
  leak; the round's reviewers see it as part of the change.
- Never commit, push, stash (beyond `git stash create`), reset or switch
  branches, as dispatch.md's Rules say.
- Never run the Azure CLI (`az`) or anything that touches Azure.
