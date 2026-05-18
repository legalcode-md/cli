---
name: counsel:intake
description: Initialize a new matter with conflict check, jurisdiction, privilege classification, and fact extraction
argument-hint: "[matter description]"
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
Use at the start of any new legal matter. Performs conflict screening, identifies the governing jurisdiction(s), classifies privilege obligations, and extracts the initial fact set from user-provided materials.
</context>

<objective>
Produce a complete matter intake record: conflict memo, jurisdiction analysis, privilege log header, and structured fact chronology.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/intake.md
@.claude/skills/counsel/references/privilege-classification.md
@.claude/skills/counsel/templates/intake-memo.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
