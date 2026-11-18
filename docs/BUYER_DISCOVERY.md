# Buyer discovery plan

## Buyer types to interview

| Buyer type | Operational problem to test | Current workaround to ask about | Data required | Decision maker / gatekeepers | Integration and adoption barriers | Evidence to request |
|---|---|---|---|---|---|---|
| Cross-border payout operator | Multiple obligations compete for prefunded balances and route limits. | Spreadsheet, treasury console, scheduled batches or manual queue triage. | Obligation, corridor, balance, quote/capacity, cutoff, status and repair history. | Payments operations leader; treasury, risk, compliance, engineering and procurement. | Payment-system interfaces, local account structure, data access, policy ownership and operational change. | Redacted historical batch with decision time, balances, final status and fees. |
| Payment facilitator or platform | Route choices and payout deadlines vary across corridors and providers. | Static rules, provider dashboards and exception queues. | Payment intent, eligible route set, quote lifetime, service promise and outcome. | Payments product/operations owner; platform engineering, finance, compliance. | Existing orchestration scope, merchant-specific policies, SLAs and fallback behavior. | Replayable route decision sample and documented baseline rules. |
| Treasury operations team | Cash is distributed across entities/accounts while payment demand changes during the day. | Cash forecast, bank portals, daily funding calls and manual approvals. | Account-level balances, encumbrances, cash movement timing, obligations and cutoffs. | Treasurer or liquidity-risk owner; finance systems and bank relationship owners. | System-of-record access, balance timeliness, entity/currency boundaries and approval controls. | Time-stamped cash position plus resulting shortfall or idle-cash decisions. |
| Digital-asset payment operator | Fiat and token-based legs may introduce different funding, redemption and settlement dependencies. | Separate fiat payout, custody, exchange and reconciliation tools. | Leg-by-leg balances, redemption windows, fees, operational states and reconciliation keys. | Payments/treasury lead; custody, compliance, security, finance and engineering. | Custody permissions, redemption terms, legal scope, chain/provider operational controls. | Sanitized lifecycle records for completed and failed end-to-end payments. |
| Enterprise shared-services payment team | Payment files compete for bank capacity, cutoff windows and approvals. | ERP payment runs, bank portals, file repair and manual exception handling. | Approved payment file, account, value date, bank limits, status and reconciliation. | Payments director or controller; ERP/bank integration owner, internal controls and procurement. | ERP change windows, controls evidence, auditability, bank-specific formats and support. | An anonymized payment-run timeline with exception codes and control evidence. |

## Ten discovery questions

1. Walk me through the last time several due payments competed for the same cash or route limit. What decision was difficult?
2. What system is authoritative for each obligation’s approval, amount, deadline, currency and status?
3. How do you distinguish total balance from funds already reserved, committed or unavailable?
4. Where are provider, account, corridor, cutoff and per-window capacities stored, and how fresh are they?
5. What happens today when the cheapest route has no remaining capacity or fails after planning?
6. How do teams decide whether to split, delay, re-fund or escalate an obligation?
7. Which outcome matters most: lower measured all-in cost, higher on-time completion, less idle prefunding, fewer repairs, or clearer control evidence? How is it measured?
8. Which incumbent product or internal process already coordinates competing payments? What cannot it do?
9. What would make a shadow-mode recommendation safe to review, and who can approve the data and access?
10. What anonymized historical sample could be replayed, and what result would make you stop evaluating this idea?

## Interview protocol

Ask for a recent concrete example before describing the demonstrator. Do not solicit credentials, personal payment data, customer names or confidential production exports. Record the buyer’s wording, workflow, artifacts they can share, and disconfirming evidence. No interview, buyer commitment or market validation is claimed by this document.
