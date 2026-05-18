# Checkpoint Protocol

Legal work requires more human checkpoints than code. Ethical rules require attorney supervision. AI prepares, human decides.

---

## Checkpoint Types

| Type | Frequency | Description |
|------|-----------|-------------|
| `checkpoint:human-review` | 70% | AI completed the work; human reviews for accuracy and judgment |
| `checkpoint:strategy-decision` | 15% | Fork in legal strategy requiring client/attorney judgment |
| `checkpoint:filing-approval` | 10% | Document ready to file; human must approve before submission |
| `checkpoint:privilege-review` | 4% | Potential privilege issue flagged; requires attorney assessment |
| `checkpoint:human-action` | 1% | Unavoidable manual step (wet-ink signature, court appearance, notarization, actual filing) |

---

## When to Use Each Type

### human-review
The default checkpoint. Use after any phase that produces a deliverable or analysis:
- After research memos are drafted.
- After IRAC/CREAC analysis is complete.
- After document drafting.
- After verification runs.

### strategy-decision
Use at forks in legal strategy that require judgment:
- Litigation vs. settlement vs. ADR path selection.
- Risk tolerance decisions affecting approach.
- Whether to pursue alternative theories.
- Client instructions needed on direction.

### filing-approval
Use before any document leaves the firm:
- Court filings (motions, briefs, pleadings).
- Regulatory submissions.
- Formal responses to opposing counsel.
- Contract execution.

### privilege-review
Use when privilege status is uncertain:
- Communications involving both legal and business content.
- Documents with potential work-product protection.
- Situations where disclosure could waive privilege.
- Joint-defense or common-interest communications.

### human-action
Use for steps AI cannot perform:
- Wet-ink signatures and notarization.
- Court appearances and oral arguments.
- Actual e-filing or physical filing.
- Service of process.
- Client meetings and depositions.

---

## Checkpoint Principles

1. **AI prepares, human decides** -- AI does the heavy lifting (research, drafting, verification), human exercises professional judgment.

2. **AI sets up the review environment** -- Present the document with relevant context, highlighted issues, and verification results. Do not just hand over a document; provide the information needed to review it efficiently.

3. **Never auto-approve substantive legal decisions** -- Strategy forks, risk tolerance, settlement authority all require human judgment.

4. **Privilege decisions are always human** -- AI flags potential issues, attorney makes the call.

5. **Attention forcing in autonomous mode** -- Even in autonomous mode, checkpoints present specific questions the attorney must answer (not just approve/reject). Frame the checkpoint as a decision with options and tradeoffs, not a yes/no gate.

---

## Mode-Specific Behavior

| Mode | Checkpoints Triggered |
|------|----------------------|
| `interactive` | All checkpoint types at every gate |
| `supervised` | `strategy-decision` + `filing-approval` + `privilege-review` + `human-action` |
| `autonomous` | `filing-approval` + `privilege-review` + `human-action` + attention-forcing questions |

Safety rails enforced regardless of mode:
- `privilege_guard` -- Never auto-approve privilege decisions.
- `filing_approval` -- Never auto-file without human approval.
- `citation_hallucination_detection` -- Always verify authorities.
- `attention_forcing` -- Present specific questions at key decision points.
