---
title: context for the /djinn:learn review, round 2
author: Claude Opus 5.5 (djinn:review)
date: 2026-09-29
status: audit finding, not yet deliberated
---

base_branch: 153ad84 (--base override)
merge_base: 153ad842e1dc4f9c5a07b9e73121c4253623c915
head: 1e45eb5bf4e45f29abca4ee0b0d81ec28cb2e9be
scope: custom (round 2)
agents_run: known-bugchecker, bugs-reviewer, integration-reviewer, security-reviewer, devils-advocate, synthesis
model: opus
fence_file: fence.txt
build_cmd: the voice check over plugins/ and tools/check-private.sh (see .djinn/config.yaml)
test_cmd: none
date: 2026-09-29T14:28:49-05:00

Round 2 of the review of djinn 2.4.0's /djinn:learn. Round 1 is
audits/2026-09-29-1303-custom (FIX THEN SHIP, H3 M7 L30 D1 R27); its fix report
is audits/2026-09-29-1303-custom/fixes/fix-report.md. The build and the fix
were squashed into a4ee7dc so no pushable commit carries the private dry run
examples. The fresh dry runs are in the gitignored local/dry-runs/ (read them
by path; they are outside git on purpose and must never be quoted into a
report: cite item ids and numbers only). Donald's rulings for the fix: no item
tests bare vocabulary in any repo; private course text never enters this
public repo; audits are committed after a scrub.
