<purpose>
Full intake workflow for a legal matter. This is the most critical phase -- it has professional
responsibility implications. Skipping conflict checks or missing limitation periods is
malpractice. Intake has four hard gates that must all pass before any substantive work begins.
</purpose>

<hard_gates>
These are non-negotiable. Cannot proceed to Phase 1 (Strategy) without all four cleared:
1. Jurisdiction identified and documented
2. Limitation periods checked and registered in DEADLINES.json
3. Conflict screen completed (checkpoint:human-action for actual database search)
4. Privilege classification set
</hard_gates>

<process>

## 1. Load Matter Context

Read `.counsel/active/{matter-id}/MATTER.md` and `STATE.md`.
Verify phase is `intake`. If phase is beyond intake, warn and confirm re-intake is intentional.

## 2. Matter Classification

Confirm or refine the matter type set during new-matter creation.

Determine sub-classification:
- Litigation: breach of contract, tort, employment, IP infringement, etc.
- Transactional: M&A, financing, real estate, licensing, etc.
- Regulatory: compliance, enforcement, investigation, etc.

Update config.json with refined classification.

## 3. Jurisdiction Identification [HARD GATE 1]

Confirm the jurisdiction(s) from MATTER.md. For each jurisdiction:
- Identify governing substantive law
- Identify procedural rules (which court/agency/tribunal)
- Note any choice-of-law issues
- Check for federal/state interaction (if applicable)

Iron Law 6: NO JURISDICTION ASSUMPTION. Every jurisdiction must be explicitly stated with its source
(contract choice-of-law clause, domicile, where events occurred, etc.).

Write jurisdiction analysis to MATTER.md.
Gate status: PASS when at least primary jurisdiction is documented with basis.

## 4. Conflict Screening [HARD GATE 3]

Generate a structured conflict check questionnaire covering:
- All party names and known aliases
- Related entities (parents, subsidiaries, affiliates)
- Adverse parties
- Key individuals (officers, directors, principals)
- Subject matter conflicts

Write the questionnaire to `engagement/CONFLICT.md`.

**checkpoint:human-action** -- The actual conflict search against a firm's database is a human
action. Present the questionnaire and wait for human to report results.

Document the conflict check outcome in `engagement/CONFLICT.md`:
- Clear / Potential conflict identified / Conflict found
- If conflict found: nature of conflict, waiver possibility, ethical rule reference

Gate status: PASS when human confirms conflict check completed and result documented.

## 5. Privilege Classification [HARD GATE 4]

Determine privilege classification for the matter:
- Attorney-client privilege scope
- Work product doctrine applicability
- Common interest / joint defense considerations
- Third-party communications handling

Write classification to `engagement/PRIVILEGE.md` with handling instructions:
- What can be shared externally
- What requires privilege markings
- Who is within the privilege circle

Iron Law 5: NO PRIVILEGE WAIVER. When in doubt, treat as privileged and flag for human review.

Gate status: PASS when privilege classification is documented.

## 6. Limitation Period Check [HARD GATE 2]

THE FIRST SUBSTANTIVE THING. Use Legalcode to discover applicable limitation periods for this
jurisdiction. Do NOT assume any limitation period — look it up.

**Step 6a: Search for limitation/prescription statutes**

Delegate to `legalcode-search-agent`:
- Query: limitation periods / prescription periods / statute of limitations for the identified
  claim types in the matter's jurisdiction (from config.json)
- Call `get_facets(jurisdiction, "law")` first if this is an unfamiliar jurisdiction
- Search for: general limitation acts, specific limitation provisions for the claim type,
  administrative filing deadlines, any mandatory pre-action notice requirements

**Step 6b: Fetch and archive the statutes**

For every limitation statute found, fetch the full text and save it locally:
```
sourceRef from search results -> fetch_source(sourceRef) -> save to authorities/{slug}.md
```

This creates a local copy of the governing limitation law in the matter workspace. These
files persist and become the matter's reference library.

Example: for an Icelandic tort claim, the search agent finds lög um fyrningu kröfuréttinda
nr. 150/2007. Fetch the full act and save to `authorities/is-fyrningarlög-150-2007.md`.

**Step 6c: Identify all deadlines**

From the fetched statutes and any contractual/regulatory sources:
- Limitation/prescription periods for each potential claim
- Contractual deadlines (notice provisions, cure periods, option periods)
- Administrative filing deadlines (if applicable in this jurisdiction)
- Court-imposed deadlines (if matter is already in proceedings)
- Tolling/suspension arguments available under this jurisdiction's rules

For each deadline found:
- Calculate days remaining from today
- Classify urgency: CRITICAL (< 30 days) | URGENT (< 90 days) | WATCH (< 1 year) | STANDARD

**Step 6d: Register deadlines and authorities**

Register ALL deadlines in `DEADLINES.json`:
```json
{
  "type": "limitation|contractual|regulatory|court",
  "description": "General prescription period for contract claims",
  "date": "YYYY-MM-DD",
  "source": "Act No. 150/2007, Art. 3 (fetched: authorities/is-fyrningarlög-150-2007.md)",
  "urgency": "CRITICAL|URGENT|WATCH|STANDARD",
  "notes": "4-year period from when claimant knew or should have known"
}
```

Register the limitation statutes in `AUTHORITIES.md` with status `verified` (since we fetched
the full text from Legalcode).

Iron Law 2: NO FILING WITHOUT DEADLINE CHECK.

Gate status: PASS when limitation analysis is documented and deadlines registered.

## 7. Fact Pattern Extraction

Use the Interactive Questioning System (reference questioning.md):

**Select questioning mode:**
- Mode 1 (Interactive Discussion): Default for new matters. One question at a time.
- Mode 2 (Assumptions Mode): When client has provided substantial documents.
- Mode 3 (Strategy Discussion): When client needs path selection before full intake.

**Extract using Legal Domain Probes:**
When specific topics arise, generate targeted follow-up probes per the probe table in
LEGAL_GSD.md (fired/terminated -> at-will?, contract -> written or oral?, etc.).

**Always extract in this order:**
1. Timeline first -- dates determine limitation periods
2. Parties -- map all parties and relationships
3. Facts vs. goals -- separate what happened from what client wants

**Output:** Write `MATTER-CONTEXT.md` with all sections:
- Matter Boundary, Established Facts, Legal Issues Identified, Parties, Timeline,
  Document Inventory, Client Preferences, Open Questions, Jurisdictional, Deferred Matters

## 8. Issue Spotting

From the extracted facts, identify preliminary legal issues:
- List each potential legal issue
- Note which are threshold issues (standing, jurisdiction, ripeness)
- Flag any that require immediate research
- Identify issues that may generate additional workstreams

Do not analyze issues yet -- that is Phase 3. Identification only.

## 9. Scope Definition

Define engagement scope in `engagement/SCOPE.md`:
- What we ARE doing (specific deliverables, phases)
- What we are NOT doing (explicit exclusions)
- Budget constraints (if any)
- Timeline expectations
- Team / expertise requirements

## 10. Risk Assessment

Create initial risk matrix:

| Risk | Probability | Impact | Mitigation | Priority |
|------|-------------|--------|------------|----------|
| {risk} | High/Med/Low | High/Med/Low | {action} | {P x I ranking} |

Write to MATTER-CONTEXT.md or a dedicated section in STATE.md.

## 11. Engagement Formalization

Document fee arrangement terms and engagement letter provisions.
This is a **checkpoint:human-review** -- attorney reviews and finalizes engagement terms.

## 12. Gate Check and Phase Transition

Verify all four hard gates passed:
- [ ] Jurisdiction identified: {status}
- [ ] Limitation periods checked: {status}
- [ ] Conflict screen completed: {status}
- [ ] Privilege classification set: {status}

If all pass: Update STATE.md phase to `strategy`. Present summary of intake findings.
If any fail: List failing gates. Cannot proceed until resolved.

Commit all intake artifacts.

</process>

<outputs>
- .counsel/active/{matter}/MATTER.md -- Updated with jurisdiction analysis
- .counsel/active/{matter}/MATTER-CONTEXT.md -- Full questioning output
- .counsel/active/{matter}/engagement/CONFLICT.md -- Conflict check results
- .counsel/active/{matter}/engagement/SCOPE.md -- Engagement scope
- .counsel/active/{matter}/engagement/PRIVILEGE.md -- Privilege handling
- .counsel/active/{matter}/DEADLINES.json -- Initial deadline register
- .counsel/active/{matter}/config.json -- Updated configuration
- .counsel/active/{matter}/STATE.md -- Updated to next phase
</outputs>

<references>
- LEGAL_GSD.md: Phase 0 INTAKE
- LEGAL_GSD.md: Interactive Questioning System
- LEGAL_GSD.md: Iron Laws 2, 3, 5, 6
- LEGAL_GSD.md: Checkpoint System
- references/questioning.md (when created)
</references>
