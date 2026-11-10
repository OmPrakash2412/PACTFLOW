# 3. AI Evidence Inspector with Dual-Acceptance and Human-in-the-Loop Gate

Date: 2026-11-05
Status: Accepted

## Context
Freelancers and clients frequently clash over subjective requirements ("make it look modern", "optimize performance") and incomplete deliverables. Fully automated AI approval is dangerous because AI models can hallucinate, be fooled by prompt injections, or fail to understand nuanced domain constraints. Conversely, purely manual client approval enables bad-faith clients to withhold payments indefinitely.

## Decision
We established a **Dual-Acceptance Agreement lifecycle** paired with an **Advisory AI Evidence Inspector** and **Human-in-the-Loop decision gate**:
1. **Dual Acceptance**: Neither party is bound until BOTH client and freelancer accept the exact cryptographic hash of the agreement and its acceptance criteria. Any edits produce a new version (`v2`, `v3`) requiring re-acceptance.
2. **Objective Evidence Inspector**: Powered by Google Gemini (`gemini-2.0-flash`), the Evidence Inspector parses submitted artifacts (Git commits, file URLs, demo endpoints, test reports) and issues a per-criterion falsifiable audit report with explicit verdicts (`satisfied`, `uncertain`, `missing`, `unable_to_verify`).
3. **Advisory, Not Autonomous**: The AI NEVER executes payment release on its own. It serves as an impartial, fact-based technical auditor to inform the human client's decision.
4. **Anti-Hallucination & Anti-Injection Defense**: The agent strictly treats all submission input as untrusted data, neutralizes prompt injection vectors, and enforces that visual assets (screenshots) cannot prove dynamic backend integrity.

## Alternatives Considered
1. **Fully Autonomous AI Payment Release**:
   - *Rejected*: High risk of financial loss if AI is jailbroken or hallucinates pass status.
2. **Standard Subjective Client Approval Button**:
   - *Rejected*: Leads to scope creep, disputes, and subjective rejection of valid work.

## Consequences
- **Positive**:
  - Eliminates ambiguity with falsifiable milestone criteria.
  - Neutralizes prompt injection attempts while maintaining audit clarity.
  - Empowers clients with instant technical analysis while preserving human authority.
- **Negative**:
  - Requires fallback heuristics if the LLM provider experiences latency or outages (implemented via deterministic rule-based evaluator).

