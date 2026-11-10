# 2. Escrowless Milestone Settlement via PayPal Invoicing API v2

Date: 2026-11-05
Status: Accepted

## Context
Traditional freelance platforms (e.g. Upwork, Fiverr) operate custodial escrow accounts where they take client funds upfront and hold them in pooled bank accounts. This incurs severe regulatory liabilities (money transmission licensing, KYC/AML audits, multi-jurisdictional banking compliance), heavy fee overheads (10-20%), and user distrust ("platform holds my money hostage"). We need a model that guarantees trust without holding custody of user funds.

## Decision
We adopted an **escrowless, milestone-gated payment coordination architecture** powered by the **PayPal Invoicing API v2**:
1. No funds are deposited into PACTFLOW accounts. PACTFLOW never acts as a custodial escrow agent.
2. When a milestone deliverable is verified by AI and approved by the client, PACTFLOW programmatically creates and delivers an official PayPal Sandbox / Live Invoice directly to the client.
3. The client pays via PayPal's trusted, PCI-compliant hosted checkout interface directly to the freelancer's PayPal merchant wallet.
4. PayPal's authoritative webhook (`INVOICING.INVOICE.PAID`) signals PACTFLOW to mark the milestone complete and anchor the transaction hash into the Trust Ledger.

## Alternatives Considered
1. **Custodial Escrow Account**:
   - *Rejected*: Requires banking charters, massive legal liabilities, high capital reserve requirements, and FinCEN regulation.
2. **Direct Stripe Custom Connect / Charges**:
   - *Rejected*: Complex tax reporting and merchant of record liability. PayPal Invoicing provides out-of-the-box dispute resolution, buyer/seller protection, and global brand recognition for international freelancers.

## Consequences
- **Positive**:
  - Zero regulatory liability as a money transmitter.
  - Transparent direct settlement between client and freelancer.
  - Robust dispute resolution supported directly by PayPal's merchant network.
- **Negative**:
  - Client must complete a checkout action per milestone rather than an automated escrow release (counterbalanced by instant one-click hosted invoice links).
