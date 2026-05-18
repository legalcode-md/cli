<purpose>
IRAC/CREAC legal analysis workflow. Applies law to facts using structured legal reasoning.
This is the intellectual core of legal work. Enforces counter-argument requirement (Iron Law 7)
and ensures every assertion is grounded in verified authority and stated facts.
</purpose>

<iron_law>
Iron Law 7: COUNTER-ARGUMENT REQUIRED.
Every favorable legal conclusion must identify and address the strongest opposing argument.
One-sided analysis is not analysis.
</iron_law>

<process>

## 1. Load Matter Context

Read from `.counsel/active/{matter-id}/`:
- STATE.md -- current status
- MATTER-CONTEXT.md -- established facts
- STRATEGY.md -- issue hierarchy, selected strategy
- AUTHORITIES.md -- verified authorities
- workstreams/research/ -- research memos with findings

## 2. Select Analysis Framework

**IRAC -- for objective analysis:**
Use for: legal memoranda, opinion letters, client advisories, research memos.
Goal: predict the most likely legal outcome.

**CREAC -- for persuasive analysis:**
Use for: briefs, motions, position statements, advocacy documents.
Goal: advocate for the client's position.

The choice depends on the deliverable, not the strength of the position. If unsure, default
to IRAC -- objective analysis is always useful, advocacy analysis is only useful when advocating.

## 3. Identify Issue Hierarchy

From STRATEGY.md, classify each issue:

**Threshold issues** (must resolve first):
- Standing / locus standi
- Subject matter jurisdiction
- Personal jurisdiction
- Ripeness / mootness
- Statute of limitations

**Core issues** (determine outcome):
- Liability / breach / violation elements
- Defenses / affirmative defenses

**Secondary issues** (affect scope/remedy):
- Damages calculation
- Injunctive relief availability
- Attorney fees

Analyze in dependency order: threshold -> core -> secondary.

## 4. Identify Standard of Review and Burden

For each issue, determine:

**Standard of review** (if appellate or administrative):
- De novo
- Abuse of discretion
- Clearly erroneous
- Substantial evidence
- Arbitrary and capricious

**Burden of proof/persuasion:**
- Who bears the burden on this issue
- What quantum of proof is required (preponderance, clear and convincing, beyond reasonable doubt)
- Any burden-shifting frameworks (e.g., McDonnell Douglas)

Document these explicitly -- they control the analysis.

## 5. Apply IRAC (Objective Analysis)

For each issue, write a complete IRAC block:

```
ISSUE
  State the precise legal question.
  Frame as: "Whether [legal question] when [key facts]."

RULE
  State the governing legal rule with FULL citation to verified authority.
  List elements or factors explicitly (numbered).
  If multi-factor test: state the test name, source, and each factor.
  If elements test: state each required element.

APPLICATION
  Apply EACH element/factor to the specific facts from MATTER-CONTEXT.md.
  - For each element: state the relevant fact, apply the rule, state whether met.
  - Address the strongest counter-argument for EACH contested element.
  - Every factual assertion must trace to the stated fact pattern (no invented facts).
  - Every legal assertion must cite to verified authority from AUTHORITIES.md.

CONCLUSION
  Answer the legal question directly: "Yes/No, because..."
  State confidence level: High | Moderate | Low
  State key assumptions that could change the conclusion.
  Identify what additional facts would strengthen or weaken the conclusion.
```

## 6. Apply CREAC (Persuasive Analysis)

For each issue, write a complete CREAC block:

```
CONCLUSION
  Lead with the answer. State it affirmatively and confidently.
  "The Court should grant/deny [relief] because [reason]."

RULE
  State the governing legal rule with FULL citation, framed favorably.
  Emphasize favorable elements/factors.
  Frame the standard in terms the client's facts satisfy.

EXPLANATION
  Illustrate how courts have applied this rule in analogous cases.
  Choose cases with facts most similar to ours.
  Show the pattern: when facts X exist, courts reach conclusion Y.

APPLICATION
  Analogize to favorable cases: "Like in [case], here..."
  Distinguish unfavorable cases: "Unlike in [case], here..."
  Address the strongest counter-argument directly.
  Do not straw-man -- state the opposition's best argument honestly.

CONCLUSION
  Reinforce the answer. Connect back to the opening.
  State what relief follows from this conclusion.
```

## 7. Counter-Argument Stress Test

For EVERY favorable conclusion, complete this block:

```
COUNTER-ANALYSIS
  Strongest opposing argument: {state it fairly}
  Authority supporting opposition: {cite if available}
  Why our position prevails despite this: {substantive rebuttal}
  Risk level if opposing argument accepted: High | Moderate | Low
```

If you cannot articulate a counter-argument, the analysis is incomplete.
If the counter-argument is stronger than the primary argument, say so explicitly.

## 8. Quality Gate Check

Before finalizing, verify:
- [ ] Every factual assertion traces to MATTER-CONTEXT.md (no invented facts)
- [ ] Every legal assertion cites to verified authority in AUTHORITIES.md
- [ ] Every conclusion addresses the strongest counter-argument
- [ ] Standard of review and burden of proof stated for each issue
- [ ] Issues analyzed in dependency order (threshold first)
- [ ] Confidence levels are honest (not all "High")

If any gate fails, fix before proceeding.

## 9. Write Analysis Document

Save to `.counsel/active/{matter-id}/workstreams/analysis/{issue-slug}-analysis.md`:

```markdown
# Analysis: {Issue Title}

## Framework
{IRAC or CREAC}

## Standard of Review
{standard, with citation}

## Burden
{who bears it, what quantum}

## Analysis
{IRAC/CREAC blocks from steps 5-6}

## Counter-Analysis
{from step 7}

## Overall Assessment
Strength of position: Strong | Moderate | Weak
Key risks: {list}
Key assumptions: {list}
Recommended next steps: {list}
```

## 10. Update State

Update STATE.md with analysis completion.
Update AUTHORITIES.md with any new authorities cited.
If analysis reveals strategy should change, flag with `strategy:risk` checkpoint.

</process>

<outputs>
- Analysis document(s) in .counsel/active/{matter}/workstreams/analysis/
- Updated .counsel/active/{matter}/AUTHORITIES.md
</outputs>

<references>
- LEGAL_GSD.md: Phase 3 ANALYSIS
- LEGAL_GSD.md: Analysis Frameworks (IRAC and CREAC templates)
- LEGAL_GSD.md: Iron Law 7 (Counter-Argument Required)
- LEGAL_GSD.md: Quality Gates
- references/irac-creac.md (when created)
</references>
