# COUNSEL: Legal GSD Framework

A phase-based workflow framework for AI-assisted legal work, integrating with the Legalcode search API and the skills library (see `skills/TOC.md` for current count).

---

## Table of Contents

- [Design Principles](#design-principles)
- [Core Architecture](#core-architecture)
- [Interactive Questioning System](#interactive-questioning-system)
- [The Ten Phases](#the-ten-phases)
  - [Phase 0: INTAKE](#phase-0-intake)
  - [Phase 1: STRATEGY](#phase-1-strategy)
  - [Phase 2: RESEARCH](#phase-2-research)
  - [Phase 3: ANALYSIS](#phase-3-analysis)
  - [Phase 4: DRAFTING](#phase-4-drafting)
  - [Phase 5: VERIFICATION](#phase-5-verification)
  - [Phase 6: REVIEW](#phase-6-review)
  - [Phase 7: FILING / DELIVERY](#phase-7-filing--delivery)
  - [Phase 8: MONITOR](#phase-8-monitor)
  - [Phase 9: CLOSE](#phase-9-close)
- [Matter Type Routing](#matter-type-routing)
- [Iron Laws](#iron-laws)
- [Checkpoint System](#checkpoint-system)
- [Deviation Rules](#deviation-rules)
- [Node Repair](#node-repair)
- [Skill Gateway Architecture](#skill-gateway-architecture)
- [Skill Inventory](#skill-inventory)
- [MCP Tool Integration](#mcp-tool-integration)
- [Session Continuity Protocol](#session-continuity-protocol)
- [Configuration](#configuration)
- [Analysis Frameworks](#analysis-frameworks)
- [Known Gaps and Limitations](#known-gaps-and-limitations)

---

## Design Principles

1. **Goal-backward verification** -- Verify what must be TRUE, what must EXIST, what must be WIRED. Task completion is not goal achievement.
2. **File-based state persistence** -- All state is Markdown/JSON in `.counsel/`. Enables git tracking, session restoration, and human readability.
3. **Atomic work units** -- One commit per task. Git log reads like a case file changelog.
4. **Context budget management** -- Plans target ~30-50% context usage. Orchestrator stays lean, delegates to subagents.
5. **Deviation rule hierarchy** -- Auto-fix mechanical issues, STOP for substantive changes. Clear escalation path.
6. **Questioning as extraction** -- Intake is collaborative thinking, not checkbox filling.
7. **Fresh-context dispatch** -- Orchestrator reads state from disk, assembles focused prompt, spawns fresh subagent, persists results. Never accumulates stale context.
8. **Iron laws are non-negotiable** -- Cannot be rationalized away. If there is even a 1% chance a rule applies, it applies.
9. **No placeholders** -- "TBD," "implement later," "[INSERT]" are completion blockers. Work is either done or not done.
10. **Jurisdictional parameterization** -- Single reasoning system, jurisdiction as config. Never assume which law applies.
11. **Proportionality** -- Research depth, discovery scope, and analysis detail must match the stakes, complexity, and resources of the matter.

---

## Core Architecture

### Hierarchy

```
Matter
  -> Engagement (conflict check, ethical screening, jurisdiction, privilege classification)
    -> Workstreams (research, drafting, filings, discovery, negotiation...)
      -> Tasks (atomic units of legal work)
        -> Deliverables (memos, briefs, contracts, filings, opinions...)
```

### Multi-Matter Directory Structure

COUNSEL supports multiple active matters. The top-level structure:

```
.counsel/
  matters.json              -- Matter registry (id, name, type, status, path)
  active/
    2024-0142-smith/        -- Each matter gets its own directory
      MATTER.md             -- Matter identity (parties, jurisdiction, type -- rarely changes)
      STATE.md              -- Living status (< 80 lines, updated frequently)
      STRATEGY.md           -- Legal strategy with decision points and risk assessment
      DEADLINES.json        -- Machine-readable deadline tracker
      AUTHORITIES.md        -- Verified authorities registry
      HANDOFF.json          -- Structured pause state (ephemeral -- deleted on resume)
      config.json           -- Framework config (matter type, jurisdiction, mode)
      engagement/
        CONFLICT.md         -- Conflict check results and analysis
        SCOPE.md            -- Engagement scope, budget, team
        PRIVILEGE.md        -- Privilege classification and handling instructions
      workstreams/
        01-research/
        02-drafting/
        ...
      authorities/          -- Full text snapshots of cited authorities
      timeline/             -- Chronological event entries (YYYY-MM-DD-entry.md)
      documents/
        index.md            -- Key document registry with significance notes
      deliverables/         -- Final work product with version history
      sessions/
        YYYYMMDD-report.md  -- Session reports
  archive/                  -- Closed matters moved here
```

### Related Matters

Matters can reference each other via `related_matters` in config.json:

```json
{
  "related_matters": [
    { "id": "2024-0143", "relationship": "appeal_of", "path": "../2024-0143-smith-appeal/" },
    { "id": "2024-0200", "relationship": "spawned_from", "path": "../2024-0200-acme-regulatory/" }
  ]
}
```

---

## Interactive Questioning System

Adapted from GSD's domain-aware questioning and Superpowers' one-at-a-time discipline. Legal intake is collaborative extraction of legally relevant facts, not form-filling.

### Legal Domain Probes

When specific topics arise, COUNSEL generates targeted follow-up probes:

| Client mentions | COUNSEL probes |
|---|---|
| "fired" / "terminated" | At-will or contract? Length of employment? Protected class? Retaliation timeline? Written performance issues? |
| "contract" / "agreement" | Written or oral? Choice-of-law clause? Breach alleged or anticipated? Damages type? |
| "injured" / "accident" | When and where? Medical treatment? Witnesses? Insurance? Comparative negligence jurisdiction? |
| "business" / "company" | Entity type? Formation state? Members/shareholders? Operating agreement? Regulated industry? |
| "property" / "real estate" | Residential or commercial? Ownership structure? Liens? Zoning? Title insurance? |
| "will" / "estate" | Existing estate plan? Family situation? Taxable estate threshold? Trusts? Powers of attorney? |
| "patent" / "trademark" / "copyright" | Existing registrations? Prior art? Use in commerce dates? International filing? |
| Deadline-sensitive matter | Critical dates, tolling arguments, extension possibilities, jurisdiction-specific filing rules |
| Dispute with identifiable parties | Party identification, relationships, power dynamics, joinder issues, standing |
| Risk/exposure questions | Risk tolerance, exposure quantification, insurance coverage, indemnification |
| Structuring a deal or entity | Tax implications, governance preferences, succession, regulatory requirements |

### Three Questioning Modes

**Mode 1: Interactive Discussion** (default for new matters)
One question at a time. Multiple-choice for factual questions, open narrative for circumstances. Classify the matter domain, surface legal gray areas as selectable topics, deep-dive each area. Always extract timeline first (dates determine limitation periods), map parties, and separate facts from goals.

**Mode 2: Assumptions Mode** (for document-rich matters)
Read available documents, form structured assumptions with evidence citations, present grouped by area with confidence levels. Ask only: "Are these assumptions correct?" Targeted correction where assumptions are wrong. Result: ~2-4 interactions vs ~15-20 in interview mode.

**Mode 3: Strategy Discussion** (for path selection)
Present legal paths with pros/cons for client decision: probability assessments, cost/timeline/risk tradeoffs, jurisdiction-specific procedural considerations, settlement vs. litigation calculus.

### Questioning Output Format

All questioning produces `MATTER-CONTEXT.md` with these sections:

- Matter Boundary
- Established Facts
- Legal Issues Identified
- Parties
- Timeline
- Document Inventory
- Client Preferences
- Open Questions
- Jurisdictional
- Deferred Matters

---

## The Ten Phases

### Phase 0: INTAKE

**Command:** `/counsel:intake`

The most critical phase. Legal intake is mandatory and has professional responsibility implications. Skipping conflict checks or missing limitation periods is malpractice.

#### Flow

1. **Matter classification** -- What type of work? (litigation, transactional, regulatory, advisory, ADR, administrative, hybrid)
2. **Jurisdiction identification** -- Which jurisdiction(s)? Affects every downstream decision.
3. **Conflict screening** -- Parties, related entities, adverse parties. The actual conflict search against a firm's database is a `checkpoint:human-action`. COUNSEL generates a structured conflict check questionnaire and documents the results.
4. **Privilege classification** -- What communications/documents are privileged? What level of confidentiality?
5. **Limitation period check** -- THE FIRST THING: identify any hard deadlines that constrain everything.
6. **Fact pattern extraction** -- Collaborative questioning using the Interactive Questioning System.
7. **Legal issue spotting** -- Preliminary identification of legal issues from the facts.
8. **Scope definition** -- What are we doing, what are we NOT doing, what's the budget/timeline.
9. **Risk assessment** -- Initial risk matrix (probability x impact).
10. **Engagement formalization** -- Fee arrangements, engagement letter terms. All artifacts committed.

#### Hard Gates

- Cannot proceed without jurisdiction identified
- Cannot proceed without limitation periods checked
- Cannot proceed without conflict screen completed
- Cannot proceed without privilege classification set

#### Outputs

- `.counsel/active/{matter}/MATTER.md` -- Matter context document
- `.counsel/active/{matter}/MATTER-CONTEXT.md` -- Full questioning output
- `.counsel/active/{matter}/engagement/CONFLICT.md` -- Conflict check results
- `.counsel/active/{matter}/engagement/SCOPE.md` -- Engagement scope
- `.counsel/active/{matter}/engagement/PRIVILEGE.md` -- Privilege handling instructions
- `.counsel/active/{matter}/DEADLINES.json` -- Initial deadline register
- `.counsel/active/{matter}/config.json` -- Framework configuration

---

### Phase 1: STRATEGY

**Command:** `/counsel:strategize`

Develops the legal strategy before any work begins. Explicit decision trees for legal paths.

#### Flow

1. **Issue analysis** -- Apply IRAC framework to each identified legal issue.
2. **Authority survey** -- Quick research to assess strength of position on each issue.
3. **Path mapping** -- Identify all possible legal paths (e.g., litigation vs. settlement vs. ADR).
4. **Risk-reward analysis** -- Expected value calculations: probability of success x expected recovery - costs.
5. **Strategy selection** -- Recommended path with alternatives documented.
6. **Workstream planning** -- Break strategy into parallel workstreams (research, drafting, filings, etc.).
7. **Milestone definition** -- Key milestones with deliverables and deadlines.
8. **Resource allocation** -- What expertise is needed at each stage.

#### Proportionality Assessment

Before setting research depth and analysis scope, evaluate:
- **Stakes** -- Amount in controversy, non-monetary consequences, precedential value
- **Complexity** -- Number of issues, jurisdictions, parties
- **Resources** -- Budget, timeline, available expertise

#### Decision Checkpoint Types

| Type | Frequency | Description |
|------|-----------|-------------|
| `strategy:fork` | Frequent | Multiple viable legal paths; requires analysis and selection |
| `strategy:risk` | Moderate | Risk tolerance decision that affects approach |
| `strategy:escalate` | Rare | Requires senior review or client decision |

#### Output

- `.counsel/active/{matter}/STRATEGY.md` -- Living strategy document

---

### Phase 2: RESEARCH

**Command:** `/counsel:research`

Systematic legal research using IRAC/CREAC methodology.

#### Research Depths

| Level | Name | Duration | Output | When |
|-------|------|----------|--------|------|
| 1 | Quick Check | 5-15 min | Inline analysis | Confirming a known rule or citation |
| 2 | Standard Research | 30-60 min | Research Memo | Standard issue analysis |
| 3 | Deep Dive | 2+ hours | Comprehensive Memo with full authority chain | Novel issues, multi-jurisdiction, high stakes |

Selection follows the proportionality assessment from Phase 1.

#### Research Methodology (Enforced)

1. **Frame the issue precisely** -- One legal question per research thread.
2. **Identify jurisdiction and governing law** -- Cannot research without knowing which law applies.
3. **Find primary authority** -- Statutes -> Regulations -> Binding case law (in that order).
4. **Validate authorities** -- Every cited case must be verified as good law via available databases.
5. **Find secondary authority** -- Treatises, law reviews, Restatements (for interpretation guidance).
6. **Apply IRAC/CREAC analysis** -- Structured analytical framework, not stream-of-consciousness.
7. **Document the research trail** -- What was searched, what was found, what was ruled out.
8. **Register all authorities** -- Every cited authority added to `AUTHORITIES.md` with verification status.

#### Authority Verification Statuses

| Status | Meaning |
|--------|---------|
| `verified` | Retrieved from authoritative source, confirmed current and good law |
| `cited-unverified` | Referenced but not yet independently verified |
| `negative-treatment` | Authority has been distinguished, criticized, or overruled |
| `superseded` | Statute amended or repealed since cited version |
| `not-found` | Authority could not be located -- CRITICAL: likely hallucinated |

#### Research Delegation

- Delegates to `legalcode-search-agent` for all Legalcode MCP searches (see [MCP Tool Integration](#mcp-tool-integration)).
- Spawns parallel research subagents for independent legal issues.
- Each subagent receives: specific legal question, jurisdiction, known authorities, scope constraints.
- Search agent returns structured evidence packages with sourceRef, snippet, citation, confidence.

#### Outputs

- Research memo(s) in `.counsel/active/{matter}/workstreams/research/`
- Updated `.counsel/active/{matter}/AUTHORITIES.md`

#### Authority Registry Format

```markdown
## Authorities

### Cases

| Citation | Jurisdiction | Status | Verified | Source | Proposition | Notes |
|----------|-------------|--------|----------|--------|-------------|-------|
| Smith v. Jones, 500 U.S. 1 (2020) | US-SCOTUS | verified | 2026-04-13 | Legalcode | Standard for... | Good law |
| Doe v. Roe, 100 F.3d 50 (2d Cir. 2019) | US-2d-Cir | negative-treatment | 2026-04-13 | Legalcode | Previously held... | Distinguished |

### Statutes

| Citation | Jurisdiction | Status | Verified | Source | Relevant Provision | Notes |
|----------|-------------|--------|----------|--------|--------------------|-------|
| 28 U.S.C. ss 1332 | US-Federal | verified | 2026-04-13 | Legalcode | Diversity jurisdiction | Current version |
```

---

### Phase 3: ANALYSIS

**Command:** `/counsel:analyze`

Applies law to facts using structured legal reasoning. The intellectual core of legal work.

See [Analysis Frameworks](#analysis-frameworks) for full IRAC/CREAC templates.

#### Multi-Issue Analysis

Chains multiple IRAC/CREAC blocks with explicit:

- **Issue hierarchy** -- Which issues are threshold (must win to proceed) vs. alternative. Standing, ripeness, and jurisdictional issues are always threshold.
- **Burden allocation** -- Who has the burden of proof/persuasion on each issue.
- **Standard of review** -- What standard applies (preponderance, clear and convincing, beyond reasonable doubt, de novo, abuse of discretion).

#### Counter-Analysis Requirement

> For every favorable conclusion, identify the strongest counter-argument. Legal analysis that only presents one side is advocacy cosplaying as analysis. If the counter-argument is strong, say so.

#### Quality Gates

- Every factual assertion must trace to the fact pattern (no invented facts)
- Every legal assertion must cite to verified authority
- Every conclusion must address the strongest counter-argument
- Analysis must identify the standard of review and burden of proof

#### Outputs

- Analysis document(s) in `.counsel/active/{matter}/workstreams/analysis/`
- Updated `.counsel/active/{matter}/AUTHORITIES.md`

---

### Phase 4: DRAFTING

**Command:** `/counsel:draft`

Produces legal documents from analysis.

#### Document Types and Workflows

| Type | Workflow | Key Quality Gates |
|------|----------|-------------------|
| Legal Memo | Research -> IRAC Analysis -> Draft -> Cite-check -> Peer Review | Every citation verified; counter-analysis included |
| Brief/Motion | Research -> CREAC Analysis -> Draft -> Cite-check -> Rules compliance | Jurisdiction-specific formatting; TOA accurate |
| Contract | Template -> Customize -> Negotiate -> Finalize | Defined terms consistent; cross-refs valid; no orphaned clauses |
| Opinion Letter | Research -> Analysis -> Draft -> Senior Review -> Client Review | Risk language precise; qualifications clear; not overbroad |
| Filing | Draft -> Procedural compliance check -> Signature -> File | Correct court; correct format; deadline met; service requirements |
| Settlement Agreement | Negotiation -> Term sheet -> Draft -> Party review -> Execution | All terms from negotiation captured; release language precise |

#### Drafting Rules (Enforced)

1. **Template-first** -- Always start from precedent or template, never blank page. The `skills/` collection includes many drafting templates (see `skills/TOC.md`).
2. **Defined terms consistency** -- Every defined term used consistently throughout; automated cross-check.
3. **Cross-reference integrity** -- All internal references (sections, exhibits, schedules) verified. Fully automated.
4. **Citation format compliance** -- Bluebook, OSCOLA, or jurisdiction-specific format. Fully automated.
5. **No placeholder content** -- "[INSERT]", "TBD", "[PARTY NAME]" are completion blockers.

#### Drafting Subagent Protocol

- Each document section assigned to a subagent with: section scope, relevant analysis, precedent/template, style guide.
- Sections assembled by orchestrator with consistency review.
- Parallel drafting for independent sections; sequential for dependent ones.

#### Outputs

- Draft documents in `.counsel/active/{matter}/deliverables/`
- Updated `.counsel/active/{matter}/AUTHORITIES.md`

---

### Phase 5: VERIFICATION

**Command:** `/counsel:verify`

The most legally-critical phase. Goal-backward verification with legal-specific quality gates.

#### Three-Tier Verification

**Tier 1: Authority Verification**

- Every cited case: still good law? correct citation format? pin-cite accurate?
- Every cited statute: current version? not amended/repealed?
- Every cited regulation: still in force? correct CFR/equivalent citation?
- Coverage disclaimer: "Verified against Legalcode database (22 jurisdictions) as of [date]. Coverage limitations: [list gaps for this jurisdiction/source type]. For critical authorities in high-stakes matters, manual verification via Shepard's (Lexis) or KeyCite (Westlaw) is recommended. Legalcode public MCP can fetch law full text but not case full text; case verification is limited to metadata and snippets unless Pro tier is used."
- Status: `all-verified` | `gaps-found` | `critical-failure`

**Tier 2: Substantive Verification**

- Does the analysis follow IRAC/CREAC structure completely?
- Does every conclusion address counter-arguments?
- Are factual assertions grounded in the stated facts (no embellishment)?
- Does the document accomplish its stated purpose?
- Status: `substantive-pass` | `issues-found` | `fundamental-flaw`

**Tier 3: Procedural Verification**

- Filing deadline compliance (is there still time?)
- Format compliance (page limits, font, margins, electronic filing requirements)
- AI disclosure requirements (check jurisdiction-specific rules)
- Service requirements met
- Signature requirements met
- Status: `procedural-pass` | `non-compliant`

#### Verification Outcome Matrix

| Tier 1 | Tier 2 | Tier 3 | Overall | Action |
|--------|--------|--------|---------|--------|
| all-verified | substantive-pass | procedural-pass | `CLEARED` | Ready for human review |
| gaps-found | any | any | `BLOCKED` | Fix citations before proceeding |
| any | issues-found | any | `REVISE` | Return to analysis/drafting |
| any | any | non-compliant | `BLOCKED` | Fix format/procedure before filing |
| critical-failure | any | any | `CRITICAL` | Return to research -- possible hallucinated authorities |

#### Outputs

- Verification report in `.counsel/active/{matter}/workstreams/<workstream>/<task>-VERIFICATION.md`
- Updated authority statuses in `.counsel/active/{matter}/AUTHORITIES.md`

---

### Phase 6: REVIEW

**Command:** `/counsel:review`

Peer review adapted for legal work.

#### Review Dimensions

1. **Accuracy** -- Are all legal statements correct and properly supported?
2. **Completeness** -- Are all relevant issues addressed? Any gaps?
3. **Persuasiveness** (for advocacy documents) -- Would this convince the tribunal?
4. **Risk Assessment** -- Are risks properly identified and communicated?
5. **Clarity** -- Is the writing clear, precise, and unambiguous?
6. **Adverse Authority Duty** -- Has the attorney's duty to disclose adverse authority been considered? (Rule 3.3)

#### Review Protocol

- Reviewer receives: document, matter context, strategy, relevant authorities.
- Feedback categorized: `Critical` (must fix) | `Important` (should fix) | `Suggested` (consider).
- Counter-argument stress test: reviewer specifically attacks the weakest points.
- Citation spot-check: reviewer independently verifies a random sample of citations.
- No performative agreement. Reviewer must state whether they agree with the legal conclusion, not just the writing quality.

#### Outputs

- Review report with categorized feedback
- Updated deliverable after review fixes

---

### Phase 7: FILING / DELIVERY

**Command:** `/counsel:deliver`

AI-assisted preparation with `checkpoint:human-action` for actual filing/delivery. COUNSEL cannot file documents with courts or deliver to opposing parties.

#### Per Document Type

| Type | AI Preparation | Human Action |
|------|---------------|--------------|
| Court filing | Format compliance, cite-check, deadline verification | Actual e-filing or physical filing + service |
| Contract | Consistency check, defined term audit, cross-ref verification | Execution and delivery |
| Legal memo | Citation verification, quality review | Client delivery |
| Opinion letter | Qualification language review, privilege marking | Formal delivery |
| Regulatory filing | Format compliance, completeness check | Agency submission |

#### AI Disclosure Requirements

Several jurisdictions now require disclosure of AI usage in court filings. COUNSEL checks whether a disclosure statement is required and generates the language for attorney review.

#### Pre-Delivery Checklist

- [ ] Fresh verification passed (Phase 5)
- [ ] Peer review completed (Phase 6)
- [ ] All citations verified current
- [ ] Format compliance confirmed for destination
- [ ] Deadline confirmed (filing before deadline)
- [ ] Service requirements planned
- [ ] Privilege markings applied where needed
- [ ] AI disclosure statement included (if required by jurisdiction)
- [ ] Client approval obtained (where required)
- [ ] `checkpoint:filing-approval` -- Human approves before submission

---

### Phase 8: MONITOR

**Command:** `/counsel:monitor`

Post-delivery monitoring. Unique to legal work where matters don't end at delivery.

#### Implementation

COUNSEL monitoring is **poll-based**, not continuously running. The user runs `/counsel:monitor` periodically, or sets up scheduled monitoring via the `schedule` skill (CronCreate). On each invocation:

1. Read `DEADLINES.json` -- surface any deadlines within configured warning intervals.
2. Read `AUTHORITIES.md` -- for each cited authority, run a search via `legalcode-search-agent` to check for recent treatment changes.
3. Check jurisdiction-specific regulatory sources for changes.
4. Present findings as a status report with action items.

#### Monitoring Workstreams

| Workstream | Method | Frequency |
|------------|--------|-----------|
| Deadline monitoring | Parse `DEADLINES.json`, calculate days remaining | Every invocation |
| Authority monitoring | Re-search cited cases via `legalcode-search-agent` | Weekly or on-demand |
| Regulatory monitoring | Search for legislative changes via `search_laws` | Monthly or on-demand |
| Obligation monitoring | Check contractual milestones against timeline | Per schedule in `DEADLINES.json` |

#### Scheduled Monitoring

For matters requiring ongoing monitoring:

```
/schedule create --name "Smith v. Acme Monitor" --cron "0 9 * * 1" --prompt "/counsel:monitor --matter 2024-0142"
```

#### Outputs

- Monitor report in `.counsel/active/{matter}/sessions/YYYYMMDD-monitor.md`
- Updated `DEADLINES.json` with new status annotations

---

### Phase 9: CLOSE

**Command:** `/counsel:close`

Matter closure and knowledge capture.

#### Flow

1. **Outcome documentation** -- What happened? Win/loss/settlement/deal closed?
2. **Lessons learned** -- What worked, what didn't, what would we do differently?
3. **Knowledge capture** -- Precedent documents indexed for future use.
4. **Authority registry update** -- Mark which authorities were persuasive to the tribunal.
5. **Timeline archive** -- Complete chronological record preserved.
6. **File retention** -- Retention schedule applied per jurisdiction and matter type.
7. **Statistics** -- Duration, cost, complexity metrics for future matter estimation.

#### Outputs

- `.counsel/active/{matter}/CLOSE.md` -- Outcome and lessons learned
- Matter directory moved to `.counsel/archive/`

---

## Matter Type Routing

At intake, the matter type triggers a preconfigured workstream template. These are templates, not rigid sequences -- workstreams can be added, removed, or reordered based on the specific matter.

### Litigation

```
intake -> strategy -> [research <-> analysis] -> drafting(pleadings) -> filing ->
  [discovery: preservation -> collection -> review -> production] ->
  [settlement evaluation: damages calc -> risk assessment -> negotiation] ->
  drafting(dispositive motions) -> verify -> review -> filing ->
  [trial prep: exhibits -> witnesses -> expert challenges -> jury instructions] ->
  trial -> post-trial -> monitor(appeal deadlines) -> close
```

### Appeals

```
intake -> strategy(standard of review analysis) -> research(record review) ->
  analysis(error identification) -> drafting(notice of appeal) -> filing ->
  [briefing: opening brief -> response -> reply] ->
  verify -> review -> filing -> [oral argument prep] ->
  monitor(decision) -> close
```

### Transactional

```
intake -> strategy -> [due diligence] -> [research <-> analysis] ->
  drafting(term sheet) -> negotiation -> drafting(definitive agreements) ->
  verify -> review -> [closing: conditions -> regulatory approvals -> execution] ->
  delivery -> monitor(obligations) -> close
```

### Regulatory

```
intake -> strategy -> [compliance assessment] -> research ->
  analysis(gap analysis) -> drafting(policies/filings) -> verify -> review ->
  filing -> monitor(regulatory changes) -> close
```

### Advisory

```
intake -> strategy -> research -> analysis(IRAC) -> drafting(memo/opinion) ->
  verify -> review -> delivery -> close
```

### ADR (Alternative Dispute Resolution)

```
intake -> strategy -> [research <-> analysis] -> drafting(position statement) ->
  verify -> review -> [mediation/arbitration proceeding] ->
  drafting(settlement/award) -> delivery -> close
```

### Administrative

```
intake -> strategy -> research -> analysis -> drafting(response) ->
  verify -> review -> filing -> [hearing] ->
  monitor(agency decision) -> [judicial review if needed] -> close
```

### IP (Intellectual Property)

```
intake -> strategy(prosecution vs. enforcement vs. licensing) ->
  [prior art/clearance search] -> research -> analysis ->
  drafting(application/response/license) -> verify -> review ->
  filing -> monitor(office actions/renewals) -> close
```

### Class Action / Mass Tort

```
intake -> strategy(certification analysis) -> research(class definition) ->
  analysis(commonality/typicality/adequacy) -> drafting(certification motion) ->
  verify -> review -> filing -> [certification hearing] ->
  [if certified: notice -> discovery -> settlement/trial] ->
  [settlement: fairness hearing -> claims administration] -> close
```

### Investigation Response

```
intake -> strategy(cooperation vs. contest) ->
  [preservation: legal hold -> document collection] ->
  research(regulatory framework) -> analysis(exposure assessment) ->
  [witness preparation] -> drafting(response/production) ->
  verify -> review -> delivery -> monitor(agency action) -> close
```

---

## Iron Laws

Non-negotiable rules. Cannot be rationalized away.

### 1. NO LEGAL CONCLUSION WITHOUT VERIFIED AUTHORITY

Every legal statement must cite to verified primary authority. Conclusions without citations are deleted and restarted. "I believe the law is..." without a citation is a hallucination.

**Anti-rationalizations:**
- "This is well-established law" -- Cite it then.
- "Everyone knows this rule" -- Cite it then.
- "I'll add citations later" -- No. Citation-first, like TDD is test-first.
- "The client just needs a quick answer" -- Quick answers with wrong law are malpractice.

### 2. NO FILING WITHOUT DEADLINE CHECK

Before any filing, verify the deadline has not passed and calculate remaining time. A late filing is worse than no filing.

**Anti-rationalizations:**
- "We have plenty of time" -- Calculate the date. Confirm it.
- "The deadline is obvious" -- State it explicitly with its source.
- "I'll check before we actually file" -- Check now. Deadlines constrain strategy.

### 3. NO WORK WITHOUT CONFLICT CHECK

Cannot proceed past intake without documented conflict screening. Professional responsibility requires it. Conflicts must also be monitored ongoing -- new parties, corporate changes, and new client matters can create conflicts mid-matter.

**Anti-rationalizations:**
- "This is a simple matter" -- Simple matters still have adverse parties.
- "We already know there's no conflict" -- Document the check anyway.
- "The conflict check can wait" -- It cannot. It gates everything.

### 4. NO DELIVERABLE WITHOUT FRESH VERIFICATION

Verification from yesterday doesn't count. Every deliverable passes a fresh verification run before marking complete.

### 5. NO PRIVILEGE WAIVER

Never include privileged information in non-privileged communications. When in doubt, treat as privileged and flag for human review.

### 6. NO JURISDICTION ASSUMPTION

Never assume which law applies. Jurisdiction must be explicitly identified and documented. Different jurisdictions = different rules = different outcomes.

### 7. COUNTER-ARGUMENT REQUIRED

Every favorable legal conclusion must identify and address the strongest opposing argument. One-sided analysis is not analysis.

---

## Checkpoint System

Legal work requires MORE human checkpoints than code, not fewer. The ethical rules require attorney supervision. 100% of legal judgments are human decisions -- the percentages below describe checkpoint types, not automation rates.

| Type | Frequency | Description |
|------|-----------|-------------|
| `checkpoint:human-review` | 70% | AI completed the work; human reviews for accuracy and judgment |
| `checkpoint:strategy-decision` | 15% | Fork in legal strategy requiring client/attorney judgment |
| `checkpoint:filing-approval` | 10% | Document ready to file; human must approve before submission |
| `checkpoint:privilege-review` | 4% | Potential privilege issue flagged; requires attorney assessment |
| `checkpoint:human-action` | 1% | Unavoidable manual step (wet-ink signature, court appearance, notarization, actual filing) |

### Checkpoint Principles

1. **AI prepares, human decides** -- AI does the heavy lifting (research, drafting, verification), human exercises professional judgment.
2. **AI sets up the review environment** -- AI presents the document with relevant context, highlighted issues, and verification results.
3. **Never auto-approve substantive legal decisions** -- Strategy forks, risk tolerance, settlement authority all require human judgment.
4. **Privilege decisions are always human** -- AI flags potential issues, attorney makes the call.
5. **Attention forcing in autonomous mode** -- Even in autonomous mode, checkpoints present specific questions the attorney must answer (not just approve/reject).

---

## Deviation Rules

| Priority | Rule | Trigger | Action |
|----------|------|---------|--------|
| 5 (highest) | Privilege Risk | Document may waive privilege | **STOP** -- requires privilege review |
| 4 | Substantive Change | Changes legal position or strategy | **STOP** -- requires strategy review |
| 3 | Citation Error | Unverified or negative-treatment citation | **REVIEW** -- flag for human review with suggested replacement |
| 2 | Missing Element | Required document section absent | **REVIEW** -- draft from analysis, present for human approval |
| 1 (lowest) | Format Violation | Fails procedural/format requirements | Auto-fix: reformat (purely mechanical) |

**Priority resolution:** Higher-priority rules always win. If a format fix would change substantive content, STOP and escalate.

**What remains auto-fix:** Only purely mechanical operations -- reformatting (margins, fonts, page numbers), citation format conversion, cross-reference number updates.

---

## Node Repair

When a legal task fails verification:

| Strategy | When | Action |
|----------|------|--------|
| `RE-RESEARCH` | Authority not found or bad law | Research the issue again with different search terms/sources |
| `RE-ANALYZE` | Analysis doesn't follow from authorities | Redo IRAC/CREAC with the verified authorities |
| `DECOMPOSE` | Issue too complex for single analysis | Break into sub-issues, analyze each independently |
| `JURISDICTION-CHECK` | Wrong jurisdiction applied | Verify correct governing law, re-research under correct jurisdiction |
| `ESCALATE` | Novel issue, conflicting authorities, high risk | Flag for senior attorney/specialist review |

**Default repair budget:** 2 attempts per task before mandatory escalation.

**Repair flow:**
1. Diagnose why verification failed (don't guess -- read the verification report).
2. Select the appropriate repair strategy.
3. Execute the repair.
4. Re-verify.
5. If repair budget exhausted: ESCALATE.

---

## Skill Gateway Architecture

COUNSEL routes to domain-specific skills in `skills/` based on the current phase, jurisdiction, and matter type.

- The skills library spans multiple jurisdictions (see `skills/TOC.md` for the current registry).
- When both a general skill and a jurisdiction-specific variant exist, prefer the jurisdiction-specific one; fall back to the general skill if no variant covers the matter's jurisdiction.
- The `legalcode-search-agent` handles all legal research delegation to Legalcode MCP tools.
- Skills chain naturally: research feeds analysis feeds drafting.

### Phase-to-Skill Routing

| Phase | Primary Skills |
|-------|---------------|
| INTAKE | `matter-intake`, `jurisdiction-routing` |
| STRATEGY | `legal-analysis`, `negotiation-strategy` |
| RESEARCH | `legal-research` -> `legalcode-search-agent` |
| ANALYSIS | `legal-analysis`, domain-specific skills |
| DRAFTING | `document-drafting` + template skills from `skills/` |
| VERIFICATION | `authority-verification`, `procedural-compliance` |
| REVIEW | `peer-review` |
| FILING | `procedural-compliance`, `deadline-management` |
| MONITOR | `deadline-management` |
| CLOSE | `matter-closing` |

**Cross-phase skills (always active):** `privilege-guard`, `deadline-management`, `authority-verification`

---

## Skill Inventory

Core COUNSEL skills (planned -- to be implemented as SKILL.md files following the template at `skills/SKILL.md`).

| # | Skill | Type | Description |
|---|-------|------|-------------|
| 1 | `using-counsel` | Meta | Framework bootstrap -- loads matter context, routes to applicable skills |
| 2 | `matter-intake` | Process | Structured intake with conflict check, jurisdiction, privilege, limitations |
| 3 | `legal-research` | Process | IRAC/CREAC research methodology with authority verification |
| 4 | `legal-analysis` | Process | Structured application of law to facts with counter-argument requirement |
| 5 | `document-drafting` | Process | Template-first drafting with cross-reference and citation enforcement |
| 6 | `authority-verification` | Quality | Citation checking -- every authority verified as current good law |
| 7 | `deadline-management` | Safety | Rules-based deadline calculation with jurisdiction-specific rules |
| 8 | `privilege-guard` | Safety | Privilege classification and protection throughout the workflow |
| 9 | `jurisdiction-routing` | Reference | Parameterized jurisdiction handling |
| 10 | `procedural-compliance` | Quality | Filing format, page limits, service requirements per court/agency |
| 11 | `contract-review` | Domain | Clause extraction, risk flagging, defined-term consistency |
| 12 | `discovery-management` | Domain | EDRM-aligned workflow for eDiscovery/disclosure |
| 13 | `due-diligence` | Domain | Structured DD checklist with risk categorization |
| 14 | `systematic-debugging` | Process | Root cause investigation for legal issues |
| 15 | `peer-review` | Quality | Legal peer review with substantive challenge requirement |
| 16 | `matter-closing` | Process | Knowledge capture, outcome documentation, file retention |
| 17 | `timeline-builder` | Domain | Chronology construction. Integrates with `legalcode-case-timeline-generator` |
| 18 | `negotiation-strategy` | Process | BATNA/WATNA analysis, concession tracking, deal point matrices |
| 19 | `damages-calculation` | Domain | Economic damages modeling, lost profits, present value calculations |
| 20 | `settlement-valuation` | Domain | Expected value analysis, litigation cost estimation, risk-adjusted valuation |
| 21 | `client-communication` | Process | Status updates, adverse development notifications, strategy letters |
| 22 | `witness-management` | Domain | Witness identification, statement cataloging, deposition preparation |
| 23 | `regulatory-monitoring` | Domain | Ongoing regulatory change tracking via Legalcode search |
| 24 | `judge-analytics` | Domain | Research decision-maker's prior rulings and tendencies via Legalcode |

---

## MCP Tool Integration

All legal research is delegated to the `legalcode-search-agent` subagent (defined at `.claude/agents/legalcode-search-agent.md`). Skills never call MCP tools directly.

### Tool Flow

```
COUNSEL Phase
  -> Invokes skill (e.g., legal-research)
    -> Delegates to legalcode-search-agent (subagent)
      -> Calls MCP tools (search_laws, search_cases, etc.)
      -> Returns structured evidence package
    -> Skill integrates evidence into analysis
    -> Writes to .counsel/active/{matter}/
    -> Updates AUTHORITIES.md
```

### Search Agent Evidence Package Format

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
   ...

## Coverage Analysis
- gaps: [areas where no authorities found]
- conflicts: [contradictory authorities identified]
- uncertainties: [areas where law is unsettled]
- recommended_fetches: [sources worth retrieving in full]
```

### Legalcode Coverage

Source availability varies by jurisdiction. Always call `get_facets` before searching an unfamiliar jurisdiction to discover valid filter values. Call `list_jurisdictions` to see current coverage.

---

## Session Continuity Protocol

How COUNSEL maintains "where are we now" across sessions.

### CLAUDE.md Integration (Minimal Bootstrap)

Add to the project's `CLAUDE.md` (~15 lines). CLAUDE.md is a **pointer, not a container** -- it tells a new session where to look without containing state.

```markdown
## COUNSEL Framework

### Active Matters
See `.counsel/matters.json` for matter registry.
To resume a matter: read `.counsel/active/{matter-id}/STATE.md`

### Commands
- `/counsel:resume` -- Resume work on a matter (reads STATE.md + HANDOFF.json)
- `/counsel:pause` -- Save work state for later resumption
- `/counsel:status` -- Show all active matters with deadlines
- `/counsel:monitor` -- Surface approaching deadlines and authority changes

### Legal Research
Delegate legal research to the legalcode-search-agent subagent.
Do not call mcp__legalcode__* tools directly.
```

### STATE.md (Living Status -- under 80 lines)

The single entry point for any session. Read first in every workflow. Updated after every significant action.

```markdown
---
counsel_version: 1.0
matter_id: 2024-0142
matter_type: litigation
phase: discovery
status: active
last_updated: "2026-04-13T10:00:00Z"
---

# Matter Status: Smith v. Acme Corp

## Current Phase
**Discovery** -- Document production in progress

## Immediate Deadlines
- 2026-04-20: Plaintiff's document production due
- 2026-05-01: Defendant's interrogatory responses due
- 2026-06-15: Discovery cutoff

## Session Continuity
Last session: 2026-04-12
Stopped at: Reviewing privilege log, flagged 12 entries for challenge
Resume: Start with completing privilege log review (entries 200-340 remaining)
```

### HANDOFF.json (Ephemeral Pause State)

Created by `/counsel:pause`. Consumed and deleted by `/counsel:resume`.

```json
{
  "version": "1.0",
  "timestamp": "2026-04-12T16:30:00Z",
  "matter_id": "2024-0142",
  "phase": "discovery",
  "current_task": "Privilege log review",
  "task_progress": "entries 1-199 of 340 reviewed, 12 flagged for challenge",
  "next_action": "Continue privilege log review from entry 200",
  "context_notes": "Pattern of over-designation in privilege log. Focus on entries marked 'attorney-client' that appear to be business communications with in-house counsel CC'd."
}
```

### Resume Protocol (`/counsel:resume`)

1. Read `.counsel/matters.json` -- identify active matters
2. If single active matter: proceed. If multiple: ask which one.
3. Read `STATE.md` -- current phase, deadlines, open issues.
4. Check for `HANDOFF.json` -- if exists, parse and present resume point, DELETE after use.
5. Check `DEADLINES.json` -- surface any deadlines within 7 days.
6. Present status summary and offer contextual next actions.

### Graduated Detail Principle

- **STATE.md** (always loaded): Current status, deadlines, resume point. Under 80 lines.
- **MATTER.md** (loaded on resume): Static identity. Rarely changes.
- **timeline/ entries** (loaded on demand): Dated entries for chronological record.
- **research/ memos** (loaded on demand): Each legal issue gets its own file.
- **Session reports** (never auto-loaded): Historical record queried when needed.

---

## Configuration

```json
{
  "matter_type": "litigation|transactional|regulatory|advisory|adr|administrative|appeals|ip|class_action|investigation",
  "jurisdiction": {
    "primary": "US-NY",
    "secondary": ["US-DE", "EU"],
    "legal_system": "common_law|civil_law|hybrid"
  },
  "mode": "interactive|supervised|autonomous",
  "research_depth": "quick|standard|deep",
  "citation_format": "bluebook|oscola|jurisdiction_default"
}
```

### Operating Modes

| Mode | Description | Human Involvement |
|------|-------------|-------------------|
| `interactive` | Confirms at every gate. Default for new matters. | Every checkpoint |
| `supervised` | Auto-proceeds through research/analysis, stops for strategy/filing/privilege. | Strategy + filing + privilege checkpoints |
| `autonomous` | Auto-proceeds through most phases, stops for privilege, filing, and attention-forcing questions. | Privilege + filing + mandatory attention-forcing checkpoints |

**Safety rails (always enforced regardless of mode):**
- `privilege_guard` -- Never auto-approve privilege decisions
- `filing_approval` -- Never auto-file without human approval
- `citation_hallucination_detection` -- Always verify authorities
- `attention_forcing` -- Even in autonomous mode, present specific questions at key decision points

---

## Analysis Frameworks

### IRAC -- For Objective Analysis

Use for: legal memoranda, opinion letters, client advisories, research memos.

```
ISSUE
  State the precise legal question. Frame as: "Whether [legal question] when [key facts]."

RULE
  State the governing legal rule with full citation. List elements/factors explicitly.

APPLICATION
  Apply each element/factor to the specific facts. Address the strongest counter-argument.

CONCLUSION
  Answer the legal question directly. State confidence level and key assumptions.
```

### CREAC -- For Persuasive Analysis

Use for: briefs, motions, position statements, advocacy documents.

```
CONCLUSION
  Lead with the answer. State it affirmatively and confidently.

RULE
  State the governing legal rule with full citation, framed favorably to your position.

EXPLANATION
  Illustrate how courts have applied this rule in analogous cases with similar facts.

APPLICATION
  Analogize to favorable cases, distinguish unfavorable ones, address the strongest counter-argument.

CONCLUSION
  Reinforce the answer. Connect back to the opening conclusion.
```

---

## Known Gaps and Limitations

- **Conflict screening requires human action** -- COUNSEL generates conflict check questionnaires but has no database to screen against. Actual screening is a `checkpoint:human-action`.
- **Case full text requires Legalcode Pro tier** -- Public MCP fetches law document text only. Case verification is limited to metadata and snippets unless Pro tier is used.
- **Filing and delivery are human actions** -- COUNSEL prepares filings and calculates deadlines, but the human files. Court e-filing, wet-ink signatures, notarization, and service of process are all `checkpoint:human-action`.
- **No emergency fast-track routing** -- TROs, emergency injunctions, and urgent regulatory responses currently follow the same phase pacing as standard matters.
