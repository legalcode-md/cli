---
name: counsel:draft
description: Template-first document drafting with cross-reference and citation enforcement
argument-hint: "[document type] [matter id]"
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
Use when producing legal documents (briefs, motions, contracts, opinions, correspondence). Starts from the appropriate template and enforces internal cross-reference consistency and citation format.
</context>

<objective>
Produce a draft document from a template with all cross-references resolved, citations formatted to jurisdiction rules, and defined terms consistent throughout.
</objective>

<execution_context>
@.claude/skills/counsel/workflows/draft.md
@.claude/skills/counsel/references/citation-standards.md
@.claude/skills/counsel/templates/document-templates.md
</execution_context>

<process>
Execute the workflow from the referenced file end-to-end.
</process>
