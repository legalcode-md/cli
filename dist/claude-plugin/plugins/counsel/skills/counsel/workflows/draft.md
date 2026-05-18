<purpose>
Document drafting workflow. Produces legal documents from completed analysis. Enforces
template-first approach, defined-term consistency, cross-reference integrity, citation
format compliance, and the no-placeholder rule. Applies deviation rules for substantive
vs. mechanical issues.
</purpose>

<process>

## 1. Load Matter Context

Read from `.counsel/active/{matter-id}/`:
- STATE.md -- current status
- STRATEGY.md -- what documents are needed
- MATTER-CONTEXT.md -- facts for factual sections
- AUTHORITIES.md -- verified authorities for citations
- workstreams/analysis/ -- completed analysis to incorporate
- config.json -- jurisdiction (controls citation format, procedural rules)

## 2. Identify Document Type

Determine the document type and its workflow:

| Type | Key Quality Gates |
|------|-------------------|
| Legal Memo | Every citation verified; counter-analysis included |
| Brief/Motion | Jurisdiction-specific formatting; TOA accurate |
| Contract | Defined terms consistent; cross-refs valid; no orphaned clauses |
| Opinion Letter | Risk language precise; qualifications clear; not overbroad |
| Filing | Correct court; correct format; deadline met; service requirements |
| Settlement | All negotiated terms captured; release language precise |

## 3. Select Template

**Template-first rule (enforced):** Always start from precedent or template, never blank page.

Search order:
1. Check `skills/` library for a matching template (see skills/TOC.md)
2. Check matter-specific precedent in `deliverables/`
3. If no template found, note this as a gap and build from the closest available template

For jurisdiction-specific documents (briefs, filings), verify the template matches the
target court/agency format requirements.

## 4. Draft with Subagent Protocol

For complex documents, break into sections and assign to subagents:

**Each subagent receives:**
- Section scope (what to draft)
- Relevant analysis (from workstreams/analysis/)
- Precedent/template (the section template)
- Style guide (jurisdiction-specific conventions)
- Authorities to cite (from AUTHORITIES.md)

**Parallel drafting:** Independent sections (e.g., different contract articles, different brief
sections that don't cross-reference each other).

**Sequential drafting:** Dependent sections (e.g., brief argument sections that build on each
other, contract sections with cross-references).

Orchestrator assembles sections and runs consistency review.

## 5. Enforce Drafting Rules

**Rule 1: Defined Terms Consistency**
- Extract all defined terms (capitalized terms with definitions)
- Verify each is used consistently throughout
- Flag any defined term used without being defined
- Flag any defined term that is defined but never used

**Rule 2: Cross-Reference Integrity**
- Map all internal references (Section X, Exhibit Y, Schedule Z)
- Verify each reference points to an existing section/exhibit/schedule
- Flag orphaned references (point to nothing)
- Flag orphaned sections (nothing references them, if that's unexpected)

**Rule 3: Citation Format Compliance**
- Apply the citation format from config.json (bluebook, oscola, jurisdiction_default)
- Verify every citation follows the required format
- Verify pin-cites are accurate
- For briefs: generate Table of Authorities

**Rule 4: No Placeholder Content**
Scan the entire document for:
- "[INSERT]", "[TBD]", "[PARTY NAME]", "[DATE]", "XXX", "___"
- Any bracketed placeholder text
- Any "to be determined" or "to be provided" language

These are COMPLETION BLOCKERS. The document is not done until all are resolved.

## 6. Apply Deviation Rules

| Priority | Trigger | Action |
|----------|---------|--------|
| 5 | Document may waive privilege | STOP -- privilege review |
| 4 | Draft changes legal position or strategy | STOP -- strategy review |
| 3 | Unverified or negative-treatment citation | REVIEW -- flag with suggested replacement |
| 2 | Required document section absent | REVIEW -- draft from analysis, present for approval |
| 1 | Format/procedural violation | Auto-fix (purely mechanical) |

Auto-fix is ONLY for purely mechanical operations: reformatting margins/fonts, citation format
conversion, cross-reference number updates. If a "format fix" would change meaning, STOP.

## 7. Document-Type-Specific Checks

**Briefs/Motions:**
- Page limit compliance
- Font/margin requirements per local rules
- Table of Contents accuracy
- Table of Authorities completeness
- Certificate of compliance (if required)
- Proof of service template

**Contracts:**
- Recitals consistent with operative provisions
- Conditions precedent all have consequences for non-satisfaction
- Termination provisions cover all necessary scenarios
- Governing law clause matches jurisdiction analysis
- Dispute resolution clause complete

**Opinion Letters:**
- Qualification language present and appropriate
- "Based on the facts as you have described them" or equivalent
- Assumptions clearly stated
- Limitations on reliance clearly stated
- Not overbroad in conclusion

**Filings:**
- Correct court/agency identified
- Case number/docket reference correct
- Filing deadline confirmed (Iron Law 2)
- Electronic filing requirements met
- Required attachments/exhibits listed

## 8. Write Draft

Save to `.counsel/active/{matter-id}/deliverables/{document-name}-v1.md`:

Include metadata header:
```markdown
---
document_type: {type}
matter_id: {matter-id}
version: 1
status: draft
author: COUNSEL AI (pending human review)
date: {ISO date}
---
```

## 9. checkpoint:human-review

Present the draft with:
- Summary of what was drafted and why
- List of authorities cited (with verification status)
- Any flagged issues from deviation rules
- Any areas where judgment calls were made
- Placeholder report (should be empty -- if not, explain why)

The attorney reviews for accuracy, judgment, and completeness.

## 10. Update State

Update STATE.md with drafting status.
Record document in `documents/index.md`.
Commit the draft.

</process>

<outputs>
- Draft document(s) in .counsel/active/{matter}/deliverables/
- Updated .counsel/active/{matter}/documents/index.md
- Updated .counsel/active/{matter}/AUTHORITIES.md (if new citations added)
</outputs>

<references>
- LEGAL_GSD.md: Phase 4 DRAFTING
- LEGAL_GSD.md: Drafting Rules (Enforced)
- LEGAL_GSD.md: Deviation Rules
- LEGAL_GSD.md: Iron Laws 2, 5
- skills/TOC.md -- template library
</references>
