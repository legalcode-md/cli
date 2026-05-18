<purpose>
Three-tier verification workflow. The most legally-critical quality gate. Checks authority
validity (Tier 1), substantive completeness (Tier 2), and procedural compliance (Tier 3).
Produces a verification outcome matrix that determines whether work product can proceed
to review, must be revised, or is blocked.
</purpose>

<process>

## 1. Load Matter Context

Read from `.counsel/active/{matter-id}/`:
- STATE.md -- current status
- AUTHORITIES.md -- all cited authorities
- config.json -- jurisdiction, citation format
- DEADLINES.json -- filing deadlines
- The specific deliverable(s) to verify

Identify which deliverable is being verified and its type (memo, brief, contract, filing, etc.).

## 2. Tier 1: Authority Verification

Re-verify EVERY cited authority. Do not rely on prior verification -- Iron Law 4 requires
fresh verification before any deliverable is marked complete.

**For each cited case:**
- Delegate to `legalcode-search-agent`: re-search the citation
- Confirm still good law (not overruled, distinguished, superseded)
- Confirm citation format correct (reporter, volume, page, year)
- Confirm pin-cite accuracy (cited page/paragraph supports the stated proposition)

**For each cited statute:**
- Confirm current version (not amended or repealed since last check)
- Verify effective date covers the relevant time period
- Confirm correct section/subsection citation

**For each cited regulation:**
- Confirm still in force
- Check for amendments since last verification

**Coverage disclaimer (required):**

```markdown
## Verification Coverage
Verified against Legalcode database as of {date}.
Jurisdictions searched: {list}
Coverage limitations: {specific gaps for this jurisdiction/source type}

For critical authorities in high-stakes matters, manual verification via
Shepard's (Lexis) or KeyCite (Westlaw) is recommended. Legalcode public
MCP can fetch law full text but not case full text; case verification is
limited to metadata and snippets unless Pro tier is used.
```

**Tier 1 status:**
- `all-verified` -- every authority confirmed current and properly cited
- `gaps-found` -- some authorities could not be fully verified (document which ones)
- `critical-failure` -- authority not found or confirmed bad law (possible hallucination)

## 3. Tier 2: Substantive Verification

**IRAC/CREAC completeness:**
- Does every analysis section follow the complete framework?
- IRAC: Issue stated precisely? Rule cited? Application element-by-element? Conclusion direct?
- CREAC: Conclusion leads? Rule favorable framing? Explanation with analogous cases? Application
  with distinguishing? Conclusion reinforced?

**Counter-argument check (Iron Law 7):**
- Does every favorable conclusion address the strongest opposing argument?
- Are counter-arguments stated fairly (not straw-manned)?
- Is the rebuttal substantive (not dismissive)?

**Factual grounding:**
- Does every factual assertion trace to MATTER-CONTEXT.md?
- Are there any invented or embellished facts?
- Are facts stated accurately (not mischaracterized to support the conclusion)?

**Purpose achievement:**
- Does the document accomplish its stated purpose?
- Does it answer the question asked?
- Are there gaps in coverage (issues identified but not addressed)?

**Tier 2 status:**
- `substantive-pass` -- analysis complete, well-supported, counter-arguments addressed
- `issues-found` -- specific deficiencies identified (list each)
- `fundamental-flaw` -- core analysis is unsound, requires major revision

## 4. Tier 3: Procedural Verification

**Deadline compliance:**
- Read DEADLINES.json for applicable filing deadlines
- Calculate days remaining
- Confirm filing can occur before deadline (Iron Law 2)
- If deadline is imminent (< 3 days), flag as URGENT

**Format compliance:**
- Page limits (per court/agency rules)
- Font and margin requirements
- Line spacing requirements
- Electronic filing format requirements (PDF, Word, specific naming)
- Required sections present (cover page, TOC, TOA, certificate of service)

**AI disclosure requirements:**
- Check jurisdiction for mandatory AI disclosure rules
- If required: verify disclosure statement is present and accurate
- If not required: note that no disclosure obligation exists for this jurisdiction

**Service requirements:**
- Identify parties to be served
- Verify service method complies with rules
- Confirm service address/email current

**Signature requirements:**
- Identify required signatures
- Verify signature blocks present
- Flag as checkpoint:human-action (actual signing is human)

**Tier 3 status:**
- `procedural-pass` -- all procedural requirements met
- `non-compliant` -- specific procedural failures identified (list each)

## 5. Verification Outcome Matrix

| Tier 1 | Tier 2 | Tier 3 | Overall | Action |
|--------|--------|--------|---------|--------|
| all-verified | substantive-pass | procedural-pass | **CLEARED** | Ready for human review |
| gaps-found | any | any | **BLOCKED** | Fix citations before proceeding |
| any | issues-found | any | **REVISE** | Return to analysis/drafting |
| any | any | non-compliant | **BLOCKED** | Fix format/procedure before filing |
| critical-failure | any | any | **CRITICAL** | Return to research -- possible hallucinated authorities |

## 6. Write Verification Report

Save to `.counsel/active/{matter-id}/workstreams/{workstream}/{task}-VERIFICATION.md`:

```markdown
# Verification Report: {document name}

## Date
{ISO date}

## Document Verified
{path to deliverable}

## Tier 1: Authority Verification
Status: {all-verified | gaps-found | critical-failure}

### Authorities Checked
| # | Citation | Previous Status | Current Status | Notes |
|---|----------|----------------|----------------|-------|

### Coverage Disclaimer
{coverage disclaimer text}

## Tier 2: Substantive Verification
Status: {substantive-pass | issues-found | fundamental-flaw}

### Findings
{list each finding with severity: Critical | Important | Suggested}

## Tier 3: Procedural Verification
Status: {procedural-pass | non-compliant}

### Checklist
- [ ] Deadline compliance: {status}
- [ ] Format compliance: {status}
- [ ] AI disclosure: {status}
- [ ] Service requirements: {status}
- [ ] Signature requirements: {status}

## OVERALL OUTCOME: {CLEARED | BLOCKED | REVISE | CRITICAL}

### Required Actions
{numbered list of actions needed, if any}
```

## 7. Update State

Update AUTHORITIES.md with fresh verification dates and any status changes.
Update STATE.md with verification outcome.

If CLEARED: proceed to review phase.
If BLOCKED/REVISE/CRITICAL: trigger the appropriate node repair strategy.

</process>

<node_repair>
When verification fails, apply the appropriate repair strategy:
- RE-RESEARCH: authority not found or bad law
- RE-ANALYZE: analysis doesn't follow from authorities
- DECOMPOSE: issue too complex for single analysis
- JURISDICTION-CHECK: wrong jurisdiction applied
- ESCALATE: novel issue, conflicting authorities, high risk

Default repair budget: 2 attempts per task before mandatory escalation.
</node_repair>

<outputs>
- Verification report in .counsel/active/{matter}/workstreams/{workstream}/{task}-VERIFICATION.md
- Updated .counsel/active/{matter}/AUTHORITIES.md
</outputs>

<references>
- LEGAL_GSD.md: Phase 5 VERIFICATION
- LEGAL_GSD.md: Verification Outcome Matrix
- LEGAL_GSD.md: Iron Laws 1, 2, 4, 7
- LEGAL_GSD.md: Node Repair
</references>
