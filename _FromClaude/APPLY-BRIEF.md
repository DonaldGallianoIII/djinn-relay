# Brief for prompt appliers (2026-09-12)

You are rewriting ONE agent prompt file in the Djinn Review Relay plugin,
applying the suggestions from its review report. You write the new version
of that one file in place. You touch nothing else.

## Hard limits

- Read only inside ~/djinn-relay and ~/Conventions.
- Edit or overwrite exactly one file: the prompt named in your task.
- Do not create new files. Do not edit any other prompt, report, or doc.
- Do not spawn agents. Do not run shell commands beyond reading files.

## Read first, in this order

1. ~/djinn-relay/plugins/djinn/CONTRACTS.md. This is the authority. Where
   the review report and CONTRACTS.md disagree, CONTRACTS.md wins.
2. Your assigned prompt file, in full.
3. Your assigned review report, in full.
4. ~/djinn-relay/plugins/djinn/relay.md for the methodology (it is being
   rewritten in parallel; treat CONTRACTS.md as current where they differ).

## What to do

Apply every suggestion in the report that CONTRACTS.md does not override or
contradict. Where the report proposed a severity scale, id format, report
format, fence wording, config key, or ledger line, use the CONTRACTS.md
version instead of the report's wording. Where the report says Keep, keep.
Where the report says delete, delete.

The rewritten file must:

- Keep the frontmatter shape: `name`, `description`, `tools`, `model`.
  `model: opus`. Tools per CONTRACTS.md section 9.
- Be project-agnostic. No the engine repo, Babylon, EditorState, Vite, JAX,
  djinnax, CUDA, pip, npm, or hardcoded paths. Where the old prompt needed
  a project fact, say the agent gets it from the config values pasted into
  its prompt (`build_cmd`, `hot_paths`, `known_bugs_index`,
  `conventions_files`, `project_notes`, `deps.*`, `goal_doc`).
- Contain the Skeptical verification clause, sharpened per the report.
- Emit the report format from CONTRACTS.md section 3, including the
  mandatory Checked and Clean and Files read outside the fence sections,
  and the attribution header.
- Use only the five tier words from CONTRACTS.md section 1, with the bar
  for each stated in the agent's own terms where useful.
- End with a short `## Runtime notes` section per CONTRACTS.md section 10.
- Contain no em dashes and no en dashes anywhere, including inside
  templates and examples. Ranges as "20 to 40".
- Contain none of: "it's important to note", "delve", "dive into",
  "not only X but also Y", "unlock", "seamless", "elevate", "in today's",
  "load-bearing", "arguably", "genuinely".
- Stay under 200 lines unless the report argued for more.

## What to return

Your final message is at most 25 lines:

- One line: new line count vs old.
- Applied: the report's suggestion numbers you applied, comma separated.
- Overridden by CONTRACTS: suggestion numbers where you used the contract
  wording instead of the report's, comma separated or none.
- Rejected: suggestion number and a five-word reason each, or none.
- One line naming anything in CONTRACTS.md this prompt could not satisfy.
