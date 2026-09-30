---
title: breaker report, audits/2026-09-27-1559-custom
author: Claude Opus 5.5 (breaker)
date: 2026-09-27
status: audit finding, not yet deliberated
---

## Findings

### HIGH
HIGH-1. `plugins/djinn/agents/cost-complexity-reviewer.md:200` The prompt's own model HIGH, a paid call that retries with no cap, cannot be filed whenever the price is uncited, so a real blocking defect ends up in a section that blocks nothing.
Attack: fence adds a script that calls a paid API in `while (!ok) { res = await callPaidApi(); }` with no cap and no backoff. Run it with no web access, or against a vendor whose pricing page sits behind a login, and put no price in `cost.paid_apis`.
Reachable via: any dispatch where web is off. Line 104 names that case outright. CONTRACTS.md section 9 also grants review agents `Read, Grep, Glob, Write` only, and CONTRACTS.md line 3 says the contract wins a disagreement, so a literal agent that has read its conventions files assumes no web. A login-walled pricing page gets the same result with web on.
Mechanism: line 178 names "a paid call that repeats without a cap" as the HIGH example. Lines 196 to 197 require every HIGH to carry "the arithmetic with its citations", and the template at line 250 asks for "units times price times frequency ... each figure cited". Lines 101 to 103 then turn an uncited price into a variable and say the claim is "never promoted to a finding", and line 200 says the same thing again. But an unbounded loop is unbounded at any price above zero. The price does not change the tier, and the prompt still demands it.
Traced: line 178 (HIGH example) to line 196 (HIGH needs cited arithmetic) to line 250 (price is a required factor) to line 104 (no web, so the price is UNVERIFIED) to line 101 (UNVERIFIED, never a finding). The break is at line 200.
Result: the report reads `### HIGH none`. The loop shows up only under `## UNVERIFIED`, which synthesis does not normalize, count, or block on. The verdict can come out SHIP over a retry storm.
Fix: add after line 201: "A finding whose tier rests on the absence of a bound needs no price and no limit: cite the call that bills (file:line) and show there is no cap on the loop, retry, or resume that repeats it (file:line). The price goes in the Cost model as a variable and the finding stays in its tier. The citation rule decides MEDIUM findings and dollar figures, never an unbounded one."

### MEDIUM
MEDIUM-1. `plugins/djinn/agents/cost-complexity-reviewer.md:182` The prompt's MEDIUM bar (a budget breach) and its HIGH bar (an unbounded bill) do not meet the CONTRACTS.md section 1 bars synthesis normalizes to, so a correct budget finding is moved down to LOW and stops blocking.
Attack: a correct, fully cited finding: "MEDIUM-1 (BUDGET) nightly job spends 3x `cost.budget`", with the arithmetic shown.
Reachable via: any run with `cost.budget` set, which is exactly what the cost block is for.
Mechanism: CONTRACTS.md line 16 sets MEDIUM as "Incorrect behavior a user will hit under realistic use", and line 15 sets HIGH as "Crash, data loss or corruption, security exposure, or the change does not do what it claims". A bill over budget is correct behavior that costs too much. synthesis.md lines 37 to 39 re-rate every HIGH or MEDIUM "whose text does not meet that tier's bar" down one tier, measured against CONTRACTS.md. The same goes for an unbounded bill with no crash: HIGH drops to MEDIUM. Line 198's claim that these findings block the merge is false once synthesis has run.
Traced: cost-complexity-reviewer.md:182 to 184 (MEDIUM = budget breach) to CONTRACTS.md:16 (MEDIUM = incorrect behavior) to synthesis.md:37 to 39 (moves down one tier). The break is at synthesis.md:38.
Result: every budget MEDIUM shows up under "Re-tiered" as a LOW, and the merge goes ahead over it.
Fix: the wiring commit has to add to CONTRACTS.md section 1: "MEDIUM also covers a documented limit, timeout, or stated budget that realistic load breaches, with cited arithmetic. HIGH also covers spend or a ceiling with no bound." Until that line exists, lines 177 to 184 say something CONTRACTS.md overrules.

MEDIUM-2. `plugins/djinn/agents/cost-complexity-reviewer.md:177` "No bound" does not separate growth over time from growth with input size, so any uncapped input becomes a HIGH that blocks the merge, and line 186 says the same input is a LOW.
Attack: fence adds a dev tool that runs `JSON.parse(fs.readFileSync(argv[2]))` with no size check. Config: `cost.hosting: local dev only, WSL2 with 31 GB`, no `cost.load`.
Reachable via: any fenced file that reads a whole file, response, or table with no cap. Category 3 at line 140 lists exactly this pattern.
Mechanism: line 177 files "a ceiling with no bound" and line 179 "memory that climbs until the platform kills the process" as HIGH. Line 71 bars only a HIGH "that depends on a load figure you were not given", and a no-bound HIGH depends on none by definition, so that guard never applies. Line 186 files "a missing cap that no configured load reaches" as LOW. With no load configured that is true for every input too. The same file:line fits both tiers, and the prompt gives no rule for choosing.
Traced: line 140 (whole file loaded) to line 177 (no bound, HIGH) against line 186 (missing cap, LOW). Line 71's guard does not fire. Break at line 177.
Result: two runs over one diff can return a blocking HIGH or a LOW. synthesis keeps the HIGH, because an OOM kill is a crash under CONTRACTS.md line 15.
Fix: rewrite line 177 as "HIGH: growth with no bound at a FIXED input: a retry or resume that re-buys, a leak that climbs across calls at constant load, a cost control claimed and not applied." Add to line 186: "Growth with an input that has no cap is MEDIUM only with a cited load that reaches the limit, and LOW otherwise."

MEDIUM-3. `plugins/djinn/agents/cost-complexity-reviewer.md:82` Under the standing IaC and CI exception, every diff inherits a pre-existing CI or hosting cost, and the prompt sends it to two places at once.
Attack: fence is one CSS file. The repo has an unchanged `.github/workflows/ci.yml` that runs a 40 minute matrix on every push, and a `cost.budget` it goes over.
Reachable via: any diff in a repo that has CI or IaC, which covers Donald's Azure case.
Mechanism: line 83 says to report on IaC "where a changed file's cost runs through them". Every changed file triggers the CI workflow, so the condition always holds. Line 78 calls these files "always in scope", which points to Findings. Lines 87 to 88 put every outside-fence file:line under Blast radius, and line 89 bars pre-existing problems in unchanged files altogether. That is three rules for one line with no precedence between them.
Traced: line 82 ("Read them", unconditional) to line 83 (runs through, so report) against line 89 (pre-existing, so don't report) and line 87 (outside the fence, so Blast radius). Break at line 83.
Result: either the same CI MEDIUM is filed in Findings and blocks every unrelated diff, audit after audit, or it lands under Blast radius, where CONTRACTS.md never says whether it blocks. Which one happens depends on the run.
Fix: "Report on an IaC, CI or manifest file only when the diff changes what that file bills: a new job, a new trigger, a new resource, or a changed file that the IaC sizes (a new container, a larger artifact). The finding goes under Blast radius. A cost the IaC carried before this diff is pre-existing and is not reported."

MEDIUM-4. `plugins/djinn/agents/cost-complexity-reviewer.md:106` When `cost.load` and a cap in the code disagree, the prompt has no rule for which figure wins, so a MEDIUM can be filed for a load the code refuses.
Attack: `cost.load: uploads up to 2 GB`, while the fenced handler enforces `maxBodyBytes = 100 * 1024 * 1024`, reads the body whole, and runs on a plan whose cited memory is 1.75 GB.
Reachable via: config text against a code constant. Owner configs are written ahead of the code and go stale.
Mechanism: line 106 says to use the code's bound only as the fallback when you would otherwise invent a load. Line 183 accepts a load "from `cost.load` or a bound in the code", either one. A literal agent takes the configured 2 GB, finds it holds 2 GB against 1.75 GB, and files MEDIUM (OOM KILL). The code refuses anything over 100 MB, so the kill cannot happen.
Traced: line 183 (either source) to line 116 (demand against limit) with demand taken from `cost.load`. Line 106's cap rule does not apply, because a load figure was given. Break at line 183.
Result: a false MEDIUM that blocks the merge, with correct-looking cited arithmetic.
Fix: "Demand is the smaller of `cost.load` and the tightest cap in the code, each cited. When `cost.load` exceeds a cap, say so in one line and add a REC to reconcile the config; the load above the cap is refused, not held."

### LOW
LOW-1. `plugins/djinn/agents/cost-complexity-reviewer.md:96` An "official page you fetched" does not have to match the region, tier, or currency in `cost.hosting`. A cited price can be the wrong price. Attack: `cost.hosting` says West Europe, and the fetched Azure pricing page renders its default region and currency, or loads prices by script so the fetch returns no figure, which the agent may fill from memory under a real URL. The rule the prompt exists for (Donald's 2026-09-27 agreement) holds in form and fails in fact. The tier moves only when the wrong figure sits close to a threshold, which is why this is LOW. Fix: "The cited figure names the region, tier, and currency it applies to, and they match `cost.hosting`. A page that does not show that combination makes the figure UNVERIFIED."

LOW-2. `plugins/djinn/agents/cost-complexity-reviewer.md:97` A stale price in config goes unnoticed. Lines 59 to 60 let `cost.paid_apis` carry "price if known", but line 97 does not list that key as a citation source, and no config key carries a date. A literal agent either treats a 2025 price as cited with no date, or sends the owner's own figure to UNVERIFIED. When a fetched page and the config disagree, the prompt names no winner. Fix: add `cost.paid_apis` prices to line 97's list, require an `as_of` date on every config price and limit, and add "When a fetched page and config disagree, use the page, show both, and file a REC to update the config."

LOW-3. `plugins/djinn/agents/cost-complexity-reviewer.md:44` "Never guess a value and never go looking for one" contradicts line 98, which allows fetching a limit when `cost.limits` is absent. A literal agent refuses to fetch the App Service memory limit because it is a config value it was not given, and every ceiling goes to UNVERIFIED. Fix: "never go looking for a config value in the repo; prices and limits may be fetched as section 'Prices and limits' says."

LOW-4. `plugins/djinn/agents/cost-complexity-reviewer.md:274` A fenced file whose only claims went to UNVERIFIED appears in neither Findings nor Checked and Clean, so synthesis marks it "not covered". Line 275 limits Checked and Clean to files shown "cheap or bounded", and an UNVERIFIED file is neither. synthesis.md lines 59 to 62 check coverage in those two sections only. Fix: "Every fenced file appears in Checked and Clean. A file whose claims are UNVERIFIED gets the line `UNVERIFIED, see that section`."

LOW-5. `plugins/djinn/agents/cost-complexity-reviewer.md:75` A 200 file fence, plus line 82's unconditional "Read them" over every IaC and CI file, gives no reading order. In an Azure monorepo with hundreds of manifests, the agent can run out of context before it reaches the one file that bills. Fix: "Read fenced files first. Rank by cost surface: paid call, I/O, loops over external data, then IaC the diff touches. Read unchanged IaC only when a fenced file names it. List what you skipped."

### DEBT
none

### REC
REC-1. Write a dispatch fuzz fixture for this agent: six config variants (no cost block, hosting only, load contradicting a cap, web off, a login-walled vendor, a CSS-only fence), each with its expected report skeleton. HIGH-1 and MEDIUM-2 are both regressions a literal read can bring back.

## Blast radius
- `plugins/djinn/CONTRACTS.md:15` Sections 1 and 9 need the wiring text from MEDIUM-1 and a web tools entry for this agent. Until then the contract overrules the prompt on tiers and on tools.

## Handed off
- `plugins/djinn/agents/cost-complexity-reviewer.md:4` `WebFetch, WebSearch` sits outside CONTRACTS.md section 9's review agent tools and is not in its web list, integration-reviewer
- `plugins/djinn/agents/cost-complexity-reviewer.md:214` says "The two sections before Findings" and then lists three, and places `## UNVERIFIED` after Findings where CONTRACTS.md section 3 allows extra sections only before, integration-reviewer
- `plugins/djinn/agents/cost-complexity-reviewer.md:104` "says so at the top", but the template has no slot for the no-web notice, integration-reviewer
- `plugins/djinn/agents/cost-complexity-reviewer.md:98` fetched pricing pages are an untrusted text channel into the agent, security-reviewer

## Checked and Clean
- `plugins/djinn/agents/cost-complexity-reviewer.md`, edge case inputs. No cost block at all: lines 66 to 68 list the missing keys and narrow the review to local and CI cost, and the guard holds. Hosting with no load: line 69 to 71's rule holds for MEDIUM, and the HIGH gap is MEDIUM-2. CSS-only fence: nothing breaks except the IaC reads (MEDIUM-3, LOW-5), and every section has a `none` form.
- Same file, timing. Stale data is the only timing surface. A fetched page is dated today at line 99. Config staleness is LOW-2.
- Same file, state corruption. Round 2 at lines 205 to 209: "assigned to you" relies on synthesis ids and does not break on a literal read, because synthesis reads findings.json `source`. No finding.
- Same file, resource exhaustion. A large fence is LOW-5. Line 111 ("Count, do not clock") and line 113 (every factor from source, config, or a cited page) stop invented CI durations and log volumes, so a made-up duration cannot get into the arithmetic.
- Same file, reentrancy. No self-invoking path. The agent spawns nothing, and line 293 limits it to one Write.
- Same file, boundary conditions. "Never invent a load" (line 106) against "name the n at which it breaks" (line 70): these do not conflict. n is derived from a limit and stated as a breakpoint, never used as a load, and the Ceilings table at line 234 has room for an n expression. O(n squared) over a capped list at line 123 is cleared correctly with the cap's file:line. The web denied path at line 104 degrades cleanly for MEDIUM. Its failure for HIGH is HIGH-1.

## Files read outside the fence
- `plugins/djinn/agents/synthesis.md` (re-tier and coverage rules)
