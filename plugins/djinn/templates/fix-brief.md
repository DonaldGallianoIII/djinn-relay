---
id: {{FIX_ID}}
source: {{AUDIT_FILE}}
severity: {{SEVERITY}}
status: pending
created: {{ISO_DATE}}
work_set:
  files: []
  symbols_renamed: []
  symbols_touched: []
depends_on: []
---

# WHAT

{{One-paragraph description of the change. Be specific — name files, name symbols, name the desired end state.}}

# WHY

From {{AGENT_NAME}}: {{QUOTED_FINDING}}

**TODO (deliberation context):** _<fill in what was decided with the user, the root-cause insight if any, why THIS fix and not a variant>_

This fix addresses {{SYMPTOM}}.

# SUCCESS CRITERIA

- [ ] {{specific, testable outcome 1}}
- [ ] {{specific, testable outcome 2}}
- [ ] `npm run build` passes with no new errors
- [ ] No references to removed/renamed symbols remain in the repo

# REFERENCES

- Audit: {{AUDIT_FILE}}
- Synthesis: {{SYNTHESIS_FILE}}
- Pipe analysis: {{PIPE_CONNECTOR_FILE_OR_NONE}}
- Related code: {{FILE_PATHS}}

# NOTES FOR FIXER

- Work-set is binding. If you need to touch a file outside `work_set.files`, STOP and report.
- If you need to rename a symbol not in `work_set.symbols_renamed`, STOP and report.
- After applying changes: run `npm run build` and include its output in your report.
- Report format: (1) files changed with +/- line counts, (2) summary of changes, (3) build status, (4) success-criteria checkmarks, (5) any scope concerns.
