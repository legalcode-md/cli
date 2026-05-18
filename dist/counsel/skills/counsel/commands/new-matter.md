---
name: counsel:new-matter
description: Create a new matter directory structure in .counsel/active/
argument-hint: "[matter name]"
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
Use to scaffold a new matter workspace before intake begins. Creates the standard directory layout, initializes STATE.md, and assigns a matter identifier.
</context>

<objective>
Create the matter directory at .counsel/active/{matter-id}/ with subdirectories for research, drafts, filings, correspondence, and an initialized STATE.md tracking file.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/new-matter.md
@.claude/skills/counsel/templates/matter-structure.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
