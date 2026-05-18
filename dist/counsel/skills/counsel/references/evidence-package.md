# Evidence Package Reference

Format and integration guide for the `legalcode-search-agent` evidence packages.

---

## Tool Flow

```
COUNSEL Phase
  -> Invokes skill (e.g., legal-research)
    -> Delegates to legalcode-search-agent (subagent)
      -> Calls MCP tools (search_laws, search_cases, get_facets, etc.)
      -> Returns structured evidence package
    -> Skill integrates evidence into analysis
    -> Writes to .counsel/active/{matter}/
    -> Updates AUTHORITIES.md
```

Skills never call MCP tools directly. All legal research goes through the search agent.

---

## Evidence Package Format

The `legalcode-search-agent` returns:

```markdown
## Search Summary
[Query, jurisdiction, sources searched, iterations performed]

## Results
1. sourceRef: law/IS/uuid-123
   title: "Act No. 90/2003 on Income Tax"
   snippet: "Article 7 provides that..."
   citation: "Act No. 90/2003, Art. 7"
   confidence: high
   fetched: true

2. sourceRef: case/IS/uuid-456
   title: "Hrd. 2020/1234"
   snippet: "The court held that..."
   citation: "Hrd. 2020/1234"
   confidence: medium
   fetched: false

## Coverage Analysis
- gaps: [areas where no authorities found]
- conflicts: [contradictory authorities identified]
- uncertainties: [areas where law is unsettled]
- recommended_fetches: [sources worth retrieving in full]
```

---

## Parsing Results

For each result in the evidence package:

| Field | Usage |
|-------|-------|
| `sourceRef` | Unique identifier for the source in Legalcode. Use for fetch_source calls. |
| `title` | Display name of the authority. |
| `snippet` | Relevant excerpt. Use in analysis but verify context. |
| `citation` | Formatted citation for use in documents. |
| `confidence` | `high` / `medium` / `low` -- affects verification priority. |
| `fetched` | Whether full text was retrieved. If `false`, snippet is from search index only. |

---

## Integrating into AUTHORITIES.md

Each result maps to a row in the authority registry:

1. **Citation** -- Use the `citation` field from the evidence package.
2. **Jurisdiction** -- Extract from `sourceRef` prefix or search parameters.
3. **Status** -- Set initial status based on confidence:
   - `confidence: high` + `fetched: true` -> `verified`
   - `confidence: high` + `fetched: false` -> `cited-unverified`
   - `confidence: medium/low` -> `cited-unverified`
4. **Verified** -- Date of verification (today if fetched and confirmed).
5. **Source** -- Always "Legalcode" for search agent results.
6. **Proposition/Relevant Provision** -- Derived from snippet and analysis context.
7. **Notes** -- Include confidence level and any coverage caveats.

---

## Fetch and Archive Protocol

After receiving an evidence package, fetch full text for key authorities and save them to
the matter's `authorities/` directory. This builds the local reference library.

**When to fetch:**
- Always: statutes and regulations that will be cited in any deliverable
- Always: cases that are central to the analysis (binding precedent, leading cases)
- Selectively: secondary authority, persuasive authority from other jurisdictions

**How to fetch:**
1. For each authority to archive, delegate to `legalcode-search-agent` with `fetch_source(sourceRef)`
2. Save the returned markdown to `authorities/{type}-{jurisdiction}-{slug}.md`
3. Add a `Local File` column entry in `AUTHORITIES.md` pointing to the saved file

**Naming convention:**
- `law-IS-fyrningarlög-150-2007.md` (Icelandic prescription act)
- `law-EU-directive-2019-1937.md` (EU whistleblower directive)
- `case-IS-hrd-2020-1234.md` (Icelandic Supreme Court case)
- `case-GB-smith-v-jones-2023-uksc-42.md` (UK Supreme Court case)
- `guidance-EU-eba-2024-guidelines.md` (EBA guidance)

**The `authorities/` directory is the matter's legal library.** These files:
- Persist across sessions (unlike search results which are ephemeral)
- Are searchable locally via grep
- Are reused by drafting, verification, and review phases
- Provide the primary source text for IRAC/CREAC application

---

## Coverage Limitations

- Public MCP: law full text available across all 22 jurisdictions. Case full text requires Pro tier.
- On public tier, case entries will have snippets but no fetchable full text — flag for manual retrieval if critical.
- Source availability varies by jurisdiction. Always call `get_facets` before searching an unfamiliar jurisdiction.
- Call `list_jurisdictions` to check current coverage before assuming a jurisdiction is available.

---

## Coverage Disclaimer (for deliverables)

> Verified against Legalcode database as of [date]. Coverage limitations: [list gaps for this jurisdiction/source type]. For critical authorities in high-stakes matters, manual verification via local legal databases is recommended.
