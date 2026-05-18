---
description: >
  Legal research via Legalcode. For any legal question, compliance check, contract review,
  regulatory research, or citation lookup, delegate to the legalcode-search-agent subagent.
  Do not call Legalcode MCP tools or the legalcode CLI directly for research tasks.
  Triggers: legal research, find a law, case law lookup, regulation search, statute text,
  GDPR, privacy law, labor agreement, trade agreement, court decision, legal citation,
  regulatory guidance, compliance, patent search, prior art, IP research, download legal
  document, case search, find court decisions.
---

# Legalcode

## How to use

For any legal research task, delegate to the **legalcode-search-agent** subagent.

Do NOT call `mcp__legalcode__*` tools directly. Do NOT run `legalcode` CLI commands
for search. The search agent handles all retrieval, verification, and evidence packaging.

## When to use the search agent

- Finding statutes, regulations, or directives
- Finding court decisions and case law
- Finding regulatory guidance
- Patent search, prior art, and IP landscape research
- Cross-jurisdiction legal comparison
- Citation lookup and verification
- Contract review requiring governing law research
- Any task that needs primary legal sources

## How to call

Launch the `legalcode-search-agent` with a clear research question. Include:
- Target jurisdiction(s)
- Source types needed (law, case, guidance, agreement, patent)
- Time period if relevant
- Specific filters (court level, agency, act type, parties, etc.)

## What you get back

The search agent returns a structured evidence package containing:
- Ranked results with sourceRefs, titles, dates, snippets, citations
- Confidence levels per result (high / medium / low)
- Whether each source was fetched and verified
- Coverage gaps and uncertainties
- Recommended fetches for deeper reading

Use the evidence package to reason and advise. The search agent does not
produce final legal conclusions.

## Direct CLI usage (non-search tasks)

The `legalcode` CLI can still be used directly for non-search operations:

```bash
legalcode login                              # authenticate
legalcode jurisdictions                      # list available jurisdictions
legalcode download <source-id> --out ./tmp   # download a known document locally
```
