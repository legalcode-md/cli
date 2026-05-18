<purpose>
Legal research workflow using systematic methodology. Enforces Iron Law 1 (NO CONCLUSION
WITHOUT VERIFIED AUTHORITY). All research is delegated to the legalcode-search-agent subagent.
Produces research memos with full authority chains and documented research trails.
</purpose>

<iron_law>
Iron Law 1: NO LEGAL CONCLUSION WITHOUT VERIFIED AUTHORITY.
Every legal statement must cite to verified primary authority. Conclusions without citations
are deleted and restarted. "I believe the law is..." without a citation is a hallucination.
</iron_law>

<research_depths>
| Level | Name | When | Output |
|-------|------|------|--------|
| 1 | Quick Check | Confirming a known rule or citation | Inline analysis |
| 2 | Standard Research | Standard issue analysis | Research Memo |
| 3 | Deep Dive | Novel issues, multi-jurisdiction, high stakes | Comprehensive Memo with full authority chain |

Selection follows the proportionality assessment from STRATEGY.md.
</research_depths>

<process>

## 1. Load Matter Context

Read from `.counsel/active/{matter-id}/`:
- STATE.md -- current status
- STRATEGY.md -- proportionality assessment, research depth assignment
- MATTER-CONTEXT.md -- facts and identified issues
- AUTHORITIES.md -- already-verified authorities
- config.json -- jurisdiction, matter type

## 2. Frame the Issue

One legal question per research thread. Frame precisely:
- "Whether [legal question] when [key facts]"
- Identify the specific legal question to be answered
- Note what is NOT included in this research thread
- If multiple issues need research, create separate threads and run in parallel

Write the framed issue at the top of the research memo.

## 3. Identify Jurisdiction and Governing Law

Cannot research without knowing which law applies (Iron Law 6).

For each research thread:
- Confirm jurisdiction from MATTER.md / STRATEGY.md
- Identify the specific body of law (federal, state, regulatory, common law)
- Note any choice-of-law issues that affect which authority applies
- If jurisdiction is disputed, research that threshold question first

## 4. Delegate to legalcode-search-agent

Spawn the `legalcode-search-agent` subagent with:
- Specific legal question (from step 2)
- Jurisdiction (from step 3)
- Known authorities (from AUTHORITIES.md -- avoid redundant searches)
- Scope constraints (research depth level, time budget)

**Search order (enforced):**
1. Primary authority: Statutes -> Regulations -> Binding case law
2. Secondary authority: Treatises, law reviews, Restatements (for interpretation)

The search agent returns structured evidence packages:
- sourceRef, title, snippet, citation, confidence, fetched status
- Coverage analysis: gaps, conflicts, uncertainties
- Recommended fetches for full text retrieval

**For Deep Dive (Level 3):**
- Run multiple search iterations with refined queries
- Search for adverse authority explicitly (duty of candor)
- Search secondary jurisdictions for persuasive authority
- Check for pending legislation or proposed rules

## 5. Validate Authorities

For every authority returned by the search agent:

**Cases:**
- Confirm still good law (not overruled, distinguished, or superseded)
- Verify citation format (correct reporter, volume, page, year)
- Confirm pin-cite accuracy (specific page/paragraph cited supports the proposition)

**Statutes:**
- Confirm current version (not amended or repealed)
- Check effective date
- Verify correct section/subsection

**Regulations:**
- Confirm still in force
- Check for recent amendments

Assign verification status to each authority:
- `verified` -- confirmed current and good law
- `cited-unverified` -- referenced but not independently verified
- `negative-treatment` -- distinguished, criticized, or overruled
- `superseded` -- amended or repealed since cited version
- `not-found` -- CRITICAL: likely hallucinated, remove immediately

## 6. Apply IRAC/CREAC Analysis

Structure the research findings using the appropriate framework:
- IRAC for objective analysis (memos, opinions, advisories)
- CREAC for persuasive analysis (briefs, motions, position statements)

Reference references/irac-creac.md for full templates.

Every conclusion must:
- Cite to verified primary authority
- Address the strongest counter-argument (Iron Law 7)
- State confidence level and key assumptions

## 7. Document the Research Trail

Record what was searched, what was found, what was ruled out:

```markdown
## Research Trail

### Searches Performed
1. Query: "{search terms}" | Jurisdiction: {jur} | Source: {type} | Results: {count}
2. ...

### Authorities Found
{list with status}

### Authorities Ruled Out
{list with reason -- superseded, not on point, etc.}

### Gaps Identified
{areas where no authority found}

### Coverage Disclaimer
Verified against Legalcode database as of {date}. Coverage limitations: {specific gaps
for this jurisdiction/source type}. For critical authorities in high-stakes matters,
manual verification via Shepard's/KeyCite is recommended.
```

## 8. Fetch and Archive Authorities

This is where the matter's local reference library gets built. For every authority that will
be relied upon, fetch the full text from Legalcode and save it to the workspace.

**Step 8a: Fetch full text via legalcode-search-agent**

For each high-confidence result from step 4 where `fetched: false`, and for all authorities
that will be cited in the research memo:

```
Delegate to legalcode-search-agent:
  -> fetch_source(sourceRef) for each authority
  -> Returns: full document as markdown with metadata
```

**Step 8b: Save to authorities/ directory**

Save each fetched document to `.counsel/active/{matter-id}/authorities/`:

Naming convention: `{type}-{jurisdiction}-{slug}.md`
- Laws: `law-IS-fyrningarlög-150-2007.md`
- Cases: `case-IS-hrd-2020-1234.md`
- Guidance: `guidance-EU-eba-2024-guidelines.md`

These files persist in the workspace and become the matter's legal library. They are:
- Searchable locally (grep for specific provisions)
- Reusable across phases (drafting references them, verification re-checks them)
- Version-stamped (fetched date in the file metadata)

**Step 8c: Register in AUTHORITIES.md**

Add every cited authority to `.counsel/active/{matter-id}/AUTHORITIES.md`:

**Cases:**
| Citation | Jurisdiction | Status | Verified | Source | Local File | Proposition | Notes |

**Statutes:**
| Citation | Jurisdiction | Status | Verified | Source | Local File | Relevant Provision | Notes |

The `Local File` column links to the fetched markdown in `authorities/`. If a source could not
be fetched (e.g., case full text requires Pro tier), note this: `"not fetched -- Pro tier required"`.

**Coverage note:** Legalcode public MCP can fetch law full text across all 22 jurisdictions.
Case full text is available on Pro tier only. On public tier, case entries in AUTHORITIES.md
will have snippets but no local file — flag these for manual retrieval if critical.

## 9. Write Research Memo

Save to `.counsel/active/{matter-id}/workstreams/research/{issue-slug}-memo.md`:

```markdown
# Research Memo: {Issue Title}

## Question Presented
{framed issue from step 2}

## Short Answer
{direct answer with confidence level}

## Discussion
{IRAC/CREAC analysis from step 6}

## Research Trail
{from step 7}

## Authorities Cited
{summary table}
```

## 10. Update State

Update STATE.md with research completion status.
If research reveals new issues or changes to strategy, flag for review.

</process>

<outputs>
- Research memo(s) in .counsel/active/{matter}/workstreams/research/
- Updated .counsel/active/{matter}/AUTHORITIES.md
- Authority snapshots in .counsel/active/{matter}/authorities/ (for key sources)
</outputs>

<references>
- LEGAL_GSD.md: Phase 2 RESEARCH
- LEGAL_GSD.md: Iron Laws 1, 6, 7
- LEGAL_GSD.md: Authority Verification Statuses
- LEGAL_GSD.md: MCP Tool Integration
- references/irac-creac.md (when created)
</references>
