<purpose>
Filing and delivery preparation workflow. Prepares legal documents for submission or delivery
with a pre-delivery checklist. All actual filing, signing, and delivery are
checkpoint:human-action -- COUNSEL cannot file documents with courts or deliver to parties.
</purpose>

<process>

## 1. Load Matter Context

Read from `.counsel/active/{matter-id}/`:
- STATE.md -- current status
- DEADLINES.json -- filing deadlines
- config.json -- jurisdiction
- The deliverable to file/deliver
- The verification report (must be CLEARED)
- The review report (must be APPROVE or APPROVE WITH CHANGES, changes applied)

## 2. Confirm Prerequisites

Both verification and review must be complete:
- [ ] Verification status: CLEARED
- [ ] Review status: APPROVE or APPROVE WITH CHANGES (changes applied)

If either is missing or failed, STOP. Cannot proceed to delivery.

## 3. Identify Delivery Type

| Type | AI Preparation | Human Action |
|------|---------------|--------------|
| Court filing | Format compliance, cite-check, deadline verification | E-filing or physical filing + service |
| Contract | Consistency check, defined term audit, cross-ref verification | Execution and delivery |
| Legal memo | Citation verification, quality review | Client delivery |
| Opinion letter | Qualification language review, privilege marking | Formal delivery |
| Regulatory filing | Format compliance, completeness check | Agency submission |

## 4. Pre-Delivery Checklist

Execute each item. Document pass/fail for each:

```markdown
## Pre-Delivery Checklist

- [ ] Fresh verification passed (Phase 5): {date of verification, status}
- [ ] Peer review completed (Phase 6): {date of review, outcome}
- [ ] All citations verified current: {count verified, any gaps}
- [ ] Format compliance confirmed for destination:
      - Court/agency: {name}
      - Format requirements: {list}
      - Compliance status: {pass/fail with details}
- [ ] Deadline confirmed:
      - Filing deadline: {date}
      - Days remaining: {count}
      - Status: {on track / urgent / critical}
- [ ] Service requirements planned:
      - Parties to serve: {list}
      - Service method: {method per rules}
      - Service addresses confirmed: {yes/no}
- [ ] Privilege markings applied where needed: {status}
- [ ] AI disclosure statement: {included / not required / required but missing}
- [ ] Client approval obtained: {yes / not required / pending}
```

If any item fails, STOP and resolve before proceeding.

## 5. AI Disclosure Check

Check whether the jurisdiction requires disclosure of AI usage:

- Research jurisdiction-specific AI disclosure rules for the target court/agency
- If required: verify disclosure statement is present in the document
- Draft the disclosure language for attorney review if not already included
- If not required: document that no disclosure obligation exists

Example disclosure language (varies by jurisdiction):
"Generative artificial intelligence tools were used to assist in the preparation of this
[document type]. All legal research, analysis, and conclusions have been reviewed and
verified by the undersigned attorney."

## 6. Deadline Verification (Final)

Iron Law 2: NO FILING WITHOUT DEADLINE CHECK.

```markdown
## Final Deadline Check

Filing deadline: {date}
Current date: {today}
Days remaining: {count}
Source of deadline: {statute, court order, contract, etc.}

Risk assessment:
- If < 1 day: CRITICAL -- consider requesting extension
- If < 3 days: URGENT -- file today if possible
- If < 7 days: WATCH -- proceed but monitor
- If > 7 days: STANDARD -- on track
```

## 7. Prepare Filing Package

Assemble all documents for the human filer:

```markdown
## Filing Package

### Primary Document
- File: {path}
- Format: {PDF/Word/etc.}
- Pages: {count}

### Attachments/Exhibits
{numbered list with file paths}

### Required Cover Sheets
{list any required by court/agency}

### Certificate of Service
{draft for attorney to sign}

### Filing Instructions
- Destination: {court/agency/party name}
- Method: {e-filing system name / physical filing / email / mail}
- Account/case number: {number}
- Filing fee: {amount, if applicable}

### Service Instructions
{for each party to be served: name, method, address/email}
```

## 8. checkpoint:filing-approval

**checkpoint:human-action** -- Present the complete filing package to the attorney.

Present:
- Filing summary (what is being filed, where, when)
- Pre-delivery checklist results (all items)
- AI disclosure status
- Deadline status
- Any flagged issues or concerns
- Specific questions requiring attorney judgment

The attorney must approve before any submission occurs.

## 9. Post-Approval Actions

After human confirms filing:
- Record filing date and method in DEADLINES.json (mark deadline as met)
- Record in timeline/ with a dated entry
- Update documents/index.md with final version
- Update STATE.md with delivery status

If filing generates response deadlines (e.g., opposing party has 30 days to respond),
register those in DEADLINES.json immediately.

## 10. Update State

```markdown
## Delivery Record

Document: {name}
Filed/Delivered: {date}
Method: {method}
Destination: {recipient}
Confirmation: {pending human confirmation}

Response deadlines triggered:
- {deadline description}: {date}
```

Update STATE.md phase as appropriate (may move to monitor if this was the final delivery).

</process>

<outputs>
- Filing package assembled in .counsel/active/{matter}/deliverables/
- Updated .counsel/active/{matter}/DEADLINES.json
- Updated .counsel/active/{matter}/STATE.md
- Timeline entry in .counsel/active/{matter}/timeline/
</outputs>

<references>
- LEGAL_GSD.md: Phase 7 FILING / DELIVERY
- LEGAL_GSD.md: Pre-Delivery Checklist
- LEGAL_GSD.md: AI Disclosure Requirements
- LEGAL_GSD.md: Iron Law 2 (No Filing Without Deadline Check)
- LEGAL_GSD.md: Checkpoint System (checkpoint:filing-approval, checkpoint:human-action)
</references>
