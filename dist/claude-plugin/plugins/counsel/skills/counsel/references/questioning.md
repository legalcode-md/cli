# Questioning Reference

Legal intake questioning adapted from GSD's domain-aware questioning with one-at-a-time discipline. Intake is collaborative extraction of legally relevant facts, not form-filling.

---

## Three Questioning Modes

| Mode | Use When | Interaction Style | Typical Rounds |
|------|----------|-------------------|----------------|
| **Interactive Discussion** | New matters, limited documents | One question at a time; multiple-choice for facts, open narrative for circumstances | 15-20 |
| **Assumptions Mode** | Document-rich matters | Read docs, form assumptions with evidence citations, present grouped by area with confidence levels; ask "Are these correct?" | 2-4 |
| **Strategy Discussion** | Path selection after facts established | Present legal paths with pros/cons; probability, cost/timeline/risk tradeoffs; settlement vs. litigation calculus | 3-5 |

---

## Interactive Discussion Protocol

1. Classify the matter domain first.
2. **Extract timeline first** -- dates determine limitation periods.
3. Map all parties and relationships.
4. Separate facts from goals (what happened vs. what the client wants).
5. Surface legal gray areas as selectable topics.
6. Deep-dive each area with targeted probes.

---

## Fact vs. Feeling Separation

Distinguish rigorously between:

- **Facts** -- Observable events with dates, parties, documents. "On March 3, the employer issued a written warning."
- **Characterizations** -- Client's interpretation. "They were out to get me."
- **Goals** -- What the client wants to happen. "I want my job back."
- **Feelings** -- Emotional state. "I felt humiliated."

Record all four categories but flag which is which. Only facts enter legal analysis. Characterizations may point to additional facts worth probing.

---

## Legal Domain Probes

When specific topics arise, generate targeted follow-up probes. These are jurisdiction-neutral starting points — use Legalcode `get_facets` and `search_laws` for the matter's jurisdiction to discover what specific rules apply. Do not assume US/common-law concepts (e.g., "at-will employment" does not exist in most civil law jurisdictions).

| Client mentions | COUNSEL probes (adapt to jurisdiction) |
|---|---|
| "fired" / "terminated" | Employment contract terms? Notice period? Duration of employment? Grounds stated? Any protected status? Internal complaints before termination? Applicable labour code? |
| "contract" / "agreement" | Written or oral? Choice-of-law clause? Breach alleged or anticipated? Damages type? Governing law? |
| "injured" / "accident" | When and where? Medical treatment? Witnesses? Insurance? Liability framework in this jurisdiction? |
| "business" / "company" | Entity type? Formation jurisdiction? Ownership structure? Governing documents? Regulated industry? |
| "property" / "real estate" | Residential or commercial? Ownership structure? Encumbrances? Planning/zoning? Registration system? |
| "will" / "estate" | Existing estate plan? Family situation? Forced heirship rules in this jurisdiction? Tax thresholds? |
| "patent" / "trademark" / "copyright" | Existing registrations? Prior art? Filing jurisdictions? International conventions (PCT, Madrid, Berne)? |
| Deadline-sensitive matter | Identify limitation statutes via Legalcode search for this jurisdiction. Prescription periods, notice requirements, administrative filing deadlines. |
| Dispute with identifiable parties | Party identification, relationships, power dynamics, procedural standing in this jurisdiction's system |
| Risk/exposure questions | Risk tolerance, exposure quantification, insurance coverage, indemnification, cost-shifting rules |
| Structuring a deal or entity | Tax implications, governance preferences, succession, regulatory requirements in formation jurisdiction |

---

## Questioning Output

All questioning produces `MATTER-CONTEXT.md` with 10 sections:

1. Matter Boundary
2. Established Facts
3. Legal Issues Identified
4. Parties
5. Timeline
6. Document Inventory
7. Client Preferences
8. Open Questions
9. Jurisdictional
10. Deferred Matters

See `templates/matter-context.md` for the full template.
