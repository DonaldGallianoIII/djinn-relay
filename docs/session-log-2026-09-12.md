---
title: Session log, 2026-09-12, djinn-relay v2.1.0
author: Claude Fable 5.1 (orchestrating session), with 20 Fable review agents and 16 Opus apply agents
date: 2026-09-12
status: written by the orchestrating session, reviewed by no human yet
---

# What was built

**A standalone plugin repo.** `~/djinn-relay` seeded from the 2026-08-01
ReviewRelay (byte-identical copies existed in four other private repos). Wrapped as a Claude Code marketplace:
`.claude-plugin/marketplace.json` at the root, the plugin at
`plugins/djinn/`. Both manifests pass `claude plugin validate`. Version
bumped 2.0.0 to 2.1.0. Branch `Claude-Development-djinn-relay`; no `main`
exists yet.

**A contracts file.** `plugins/djinn/CONTRACTS.md` defines the interfaces
every agent and command honor: one severity ladder (HIGH, MEDIUM, LOW,
DEBT, REC), finding ids (`HIGH-1`), the agent report shape with mandatory
Checked and Clean and Files read outside the fence sections, the fence
block, the per-project config keys, the ledger line, the attribution
header, model and tool rules, runtime notes, voice.

**Every prompt rewritten.** 17 agents, 3 commands, relay.md, the brief
template. Line count went from 2417 to 3895 across agents and commands.
Nothing project-specific remains: no the engine repo, Babylon, EditorState,
Vite, JAX, npm, or hardcoded memory paths. Everything on Opus, zero
Sonnet.

**New files.** `templates/config.yaml` (the per-project config every
command reads), `README.md` (the directions, written for two developers
who have never used a pull request), `tools/render_html.py` (renders every
markdown file to a styled HTML page plus an index).

**The wake-up idea, as shipped.** Scope comes from
`git merge-base <base_branch> HEAD`, never HEAD~1. The changed-file list is
written to `fence.txt` and pasted verbatim into every agent prompt. Agents
list every file they open outside it. Synthesis reports those reads and
per-file coverage. A quick-scope SHIP names the agents it did not run.

**The logging requirement, as shipped.** Every command appends one line to
`audits/LEDGER.md` on every exit path, including a run that aborts at step
one for a missing config. A fix is not landed until
`fixes/<id>-report.md` exists; dispatch writes it before the ledger line.

# What went wrong, and what each taught

1. **Cost estimate off by ten times.** I told Donald twenty read-only
   Fable reviewers would cost "a few thousand tokens in and a couple
   thousand out" each. Actual: about 77k per agent, 1.54M total. Cause:
   each agent read the methodology, two conventions files, and its
   siblings, and reasoned at length. Lesson: count the context reads the
   brief asks for, not just the target file. The apply pass, on Opus, cost
   about 1.19M across sixteen agents (74k average), so the estimate for a
   comparable job is now 75k per agent, not 5k.

2. **Two silent handoff bugs in the original.** `/djinn:brief` expected
   ids like `HIGH-1`; synthesis emitted a running number. known-bugchecker
   was told to write its own report but had no Write tool. Neither would
   fail on paper, both would fail on the first real run. Lesson: the
   contract between producer and consumer has to live in one file
   (CONTRACTS.md now), and every prompt review should cross-read its
   consumers, which the reviewers did.

3. **Eight independent reviewers found the same verdict leak.** A
   formatting nit, a gap idea, a missing test, or a UX suggestion could
   each produce FIX THEN SHIP, because every agent defined severity its
   own way. Fixing synthesis alone would not have worked. Lesson: a
   normalized scale has to be emitted by every agent and re-checked by
   synthesis; both ends, or it drifts.

4. **Appliers extended the contract where it was silent.** Several agents
   added fields (Trigger, Fix, Attack, Cost, Depth) inside the finding
   shape, and two used `# Runtime notes` instead of `## Runtime notes`.
   None of it breaks a consumer, since synthesis reads the tier word and
   the file:line. Lesson: say which parts of a template are fixed and
   which are extensible; CONTRACTS.md section 3 should get that sentence
   in the next pass.

5. **Contract gaps the appliers caught.** Section 1 did not name
   multiuser-reviewer in the "HIGH or MEDIUM only if the diff made things
   worse" rule. Section 3 called known-bugchecker an agent with no
   severity scale, while section 1 required a tier per hit. Section 9 did
   not name the web tools. All three were fixed in CONTRACTS.md during the
   run.

# Proof

- `claude plugin validate .` and `claude plugin validate plugins/djinn`:
  both pass.
- `grep -c "—\|–"` across every plugin file: zero.
- Project-specific word grep (engine repo, babylon, editorstate, vite,
  djinnax, bugs_to_avoid, sonnet): zero hits outside the one sentence in
  CONTRACTS.md that bans Sonnet.
- `model:` lines across 17 agents: 17 `opus`.
- `check_voice.py` over 24 plugin files: 1 failure (fixed: "many
  perspectives" in relay.md), 0 warnings.
- Not tested: the plugin has not been installed or run on a real repo.
  Every claim above is about the text of the prompts, not their behavior.
  First real test: `/plugin marketplace add ~/djinn-relay`, install, then
  `/djinn:review quick` on a private repo with a `.djinn/config.yaml`.

# Open items

- Install locally and run one real review. Nothing here is verified by
  execution.
- Section 3 of CONTRACTS.md: state which template parts are fixed and
  which agents may extend.
- Two agents' Runtime notes use `#` rather than `##`. Cosmetic.
- REVIEW.md in `~/Conventions` still points at the automation repo copy of the
  relay. Update it to `~/djinn-relay` once the plugin has run once.
- Codex adapter: not started. Every file ends with a Runtime notes section
  naming what the adapter must map.
- Push to GitHub as `donaldgallianoiii/djinn-relay` and tag `djinn--v2.1.0`
  with `claude plugin tag`, after the first real run.
