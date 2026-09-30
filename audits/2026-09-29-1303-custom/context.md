---
title: context for the /djinn:learn review
author: Claude Opus 5.5 (djinn:review)
date: 2026-09-29
status: audit finding, not yet deliberated
---

Redacted for the public repo: private course and work identifiers.

base_branch: 153ad84 (--base override; the config's base_branch is this same branch, which its comment says always needs --base <commit before the change>)
merge_base: 153ad842e1dc4f9c5a07b9e73121c4253623c915
head: 32a1c170c9f47acf837e47e59915fc53ec90dc2c
scope: custom
agents_run: known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, ux-reviewer, gap-hunter, devils-advocate, synthesis
model: opus
fence_file: fence.txt
build_cmd: the voice check over plugins/ (see .djinn/config.yaml)
test_cmd: none
date: 2026-09-29T13:03:25-05:00

Why this run: Donald's rule for a new djinn agent: a djinn review runs over it,
then it is discussed, before it is accepted. This fences djinn 2.4.0's
/djinn:learn command, its six learn- agents, the contract and wiring changes,
and the two dry run example folders, so the generated items are judged too.

Goal (given to devils-advocate): /djinn:learn must produce study material and
training data at the level of Donald's own quizzes: items that test mechanism
and job scenarios, never vocabulary; distractors that are plausible wrong
mechanisms of the same length and shape as the key; a hard tier that makes the
student spot a mistake in a spec or make a call; every option's true home
explained (the bad student who learns "N1 = slow eye movements" and moves on
is the failure it exists to fix); DPO rejected answers that read like that bad
student, not like nonsense; every claim cited to a file in the target repo or
marked UNVERIFIED; repo agnostic across <teaching repo> and <course repo>.
Calibration: the course repo's module quiz,
<course repo>/<module quiz>,
and the teaching repo's content/secure/<secure bank>*.yaml.
