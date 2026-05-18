---
name: counsel:verify
description: Three-tier verification -- authority, substantive, and procedural
argument-hint: "[document path or matter id]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
  - Agent
  - AskUserQuestion
---
<context>
Use before any document leaves the workspace. Runs three independent verification passes: (1) authority verification -- confirms citations exist and say what is claimed, (2) substantive verification -- checks logical consistency and completeness, (3) procedural verification -- validates format, deadlines, and filing requirements.
</context>

<objective>
Produce a verification report with pass/fail for each tier, itemized findings, and a final clearance recommendation.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/verify.md
@.claude/skills/counsel/references/verification-checklist.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
