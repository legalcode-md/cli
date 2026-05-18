---
name: counsel:research
description: Systematic legal research using IRAC/CREAC methodology with authority verification
argument-hint: "[research question]"
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
Use when a matter requires legal research. Delegates search execution to the legalcode-search-agent for iterative source discovery and verification. Structures findings using IRAC/CREAC methodology.
</context>

<objective>
Produce a research memo with verified authorities, organized by issue, following IRAC/CREAC structure. All citations must be verified through the search agent.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/research.md
@.claude/skills/counsel/references/citation-standards.md
@.claude/agents/legalcode-search-agent.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
