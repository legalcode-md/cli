<purpose>
Peer review workflow for legal work product. Reviews across six dimensions: accuracy,
completeness, persuasiveness, risk, clarity, and adverse authority duty. Enforces no
performative agreement -- the reviewer must state whether they agree with the legal
conclusion, not just the writing quality.
</purpose>

<process>

## 1. Load Review Context

Read from `.counsel/active/{matter-id}/`:
- STATE.md -- current status
- MATTER-CONTEXT.md -- facts and issues
- STRATEGY.md -- legal strategy context
- AUTHORITIES.md -- verified authorities
- The specific deliverable to review
- The verification report (from verify.md workflow)

The reviewer receives: document, matter context, strategy, relevant authorities.
Verification must have passed (CLEARED) before peer review begins.

## 2. Dimension 1: Accuracy

Review every legal statement for correctness:

- Are legal rules stated accurately?
- Are case holdings characterized correctly (not misrepresented)?
- Are statutory provisions quoted or paraphrased accurately?
- Are procedural rules correctly identified?
- Are factual statements accurate against MATTER-CONTEXT.md?

Flag each issue: `Critical` | `Important` | `Suggested`

## 3. Dimension 2: Completeness

Review for coverage gaps:

- Are all relevant legal issues addressed?
- Are all elements/factors of each test analyzed?
- For contracts: are all material terms covered?
- For briefs: are all necessary arguments presented?
- Are there obvious issues that should have been identified but were not?
- Does the document fulfill its stated purpose?

Flag each gap: `Critical` (dispositive issue missing) | `Important` (meaningful gap) |
`Suggested` (nice to have)

## 4. Dimension 3: Persuasiveness

For advocacy documents only (briefs, motions, position statements):

- Would this convince the target tribunal?
- Is the argument structure logical and compelling?
- Are the strongest arguments presented first (or in proper strategic order)?
- Is the tone appropriate for the tribunal?
- Are analogies effective?
- Are unfavorable precedents distinguished effectively?

For non-advocacy documents (memos, opinions): skip this dimension.

## 5. Dimension 4: Risk Assessment

- Are risks properly identified and communicated?
- Is risk language appropriately calibrated (not overstating or understating)?
- Are qualification/limitation clauses present where needed?
- For opinion letters: are assumptions clearly stated?
- For contracts: are risk allocation provisions adequate?
- Is the client adequately informed of downside scenarios?

## 6. Dimension 5: Clarity

- Is the writing clear, precise, and unambiguous?
- Are defined terms used consistently?
- Are sentences readable (no unnecessarily convoluted constructions)?
- Is the document organized logically?
- Can the intended reader (attorney, client, court) follow the reasoning?
- Are section headings descriptive and accurate?

## 7. Dimension 6: Adverse Authority Duty

Professional responsibility check (Rule 3.3 / equivalent):

- Has the attorney's duty to disclose adverse authority been considered?
- For filings: is there controlling adverse authority not cited?
- Has a search for adverse authority been conducted?
- If adverse authority exists: is it disclosed and addressed?

This dimension applies to all court filings and is a professional obligation, not optional.

## 8. Counter-Argument Stress Test

The reviewer specifically attacks the weakest points:

For each major conclusion in the document:
1. Identify the weakest link in the reasoning chain
2. Construct the strongest possible counter-argument
3. Assess whether the document's treatment of this counter-argument is adequate
4. If inadequate: provide specific language or analysis to strengthen

This is NOT a rubber stamp. The reviewer must independently evaluate the legal reasoning.

## 9. Citation Spot-Check

Independently verify a random sample of citations:
- Select 3-5 citations (or 20% of total, whichever is greater)
- Re-verify via `legalcode-search-agent`
- Confirm the cited authority supports the proposition stated
- Confirm citation format compliance

If any spot-check citation fails, escalate to full re-verification (return to verify.md).

## 10. Reviewer's Conclusion

The reviewer MUST state:

```markdown
## Reviewer's Assessment

### Agreement with Legal Conclusions
{For each major conclusion: AGREE / DISAGREE / QUALIFIED AGREEMENT}
{If disagree: state why and what the correct conclusion is}

### Overall Recommendation
{APPROVE | APPROVE WITH CHANGES | REVISE AND RESUBMIT | REJECT}

### Feedback Summary
Critical issues: {count}
Important issues: {count}
Suggestions: {count}
```

**No performative agreement.** "Looks good" is not a review. The reviewer must engage with
the substance and state whether the legal conclusions are correct.

## 11. Write Review Report

Save categorized feedback:

```markdown
# Peer Review: {document name}

## Reviewer
COUNSEL AI Review Agent

## Date
{ISO date}

## Dimension Scores
| Dimension | Status | Issues |
|-----------|--------|--------|
| Accuracy | {Pass/Issues} | {count} |
| Completeness | {Pass/Issues} | {count} |
| Persuasiveness | {Pass/N-A/Issues} | {count} |
| Risk | {Pass/Issues} | {count} |
| Clarity | {Pass/Issues} | {count} |
| Adverse Authority | {Pass/Issues} | {count} |

## Critical Issues (must fix)
{numbered list}

## Important Issues (should fix)
{numbered list}

## Suggestions (consider)
{numbered list}

## Counter-Argument Stress Test Results
{findings from step 8}

## Citation Spot-Check Results
{findings from step 9}

## Reviewer's Assessment
{from step 10}
```

## 12. Update State

If APPROVE: update STATE.md, proceed to delivery preparation.
If APPROVE WITH CHANGES: apply changes, re-verify changed sections only.
If REVISE AND RESUBMIT: return to drafting with specific feedback.
If REJECT: escalate -- fundamental issues require strategy review.

</process>

<outputs>
- Review report in .counsel/active/{matter}/workstreams/{workstream}/{task}-REVIEW.md
- Updated deliverable (if approved with changes)
</outputs>

<references>
- LEGAL_GSD.md: Phase 6 REVIEW
- LEGAL_GSD.md: Review Dimensions
- LEGAL_GSD.md: Review Protocol
- LEGAL_GSD.md: Iron Law 7 (Counter-Argument Required)
</references>
