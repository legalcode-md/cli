---
name: counsel:strategize
description: Develop legal strategy with path mapping, risk-reward analysis, and workstream planning
argument-hint: "[matter id or description]"
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
Use after intake is complete to map out the strategic landscape. Produces decision trees for each viable legal path and identifies risks, costs, and expected outcomes.
</context>

<objective>
Produce a strategy memo with ranked paths, risk-reward matrix, workstream breakdown, and recommended course of action.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/strategize.md
@.claude/skills/counsel/references/risk-matrix.md
@.claude/skills/counsel/templates/strategy-memo.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
