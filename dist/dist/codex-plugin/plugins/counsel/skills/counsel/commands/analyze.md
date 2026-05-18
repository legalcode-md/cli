---
name: counsel:analyze
description: Apply law to facts using IRAC/CREAC structured analysis with counter-argument requirement
argument-hint: "[issue or matter id]"
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
Use after research is complete to apply findings to the matter's facts. Every conclusion must include at least one counter-argument and a response. Uses IRAC/CREAC structure.
</context>

<objective>
Produce a structured legal analysis memo with issue-by-issue application of law to facts, mandatory counter-arguments, and confidence-rated conclusions.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/analyze.md
@.claude/skills/counsel/references/irac-creac.md
@.claude/skills/counsel/templates/analysis-memo.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
