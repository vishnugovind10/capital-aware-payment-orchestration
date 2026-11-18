# Competitive positioning and capability map

Research checked 18 November 2026. This positioning note is a short summary; named-vendor capability evidence and source links are maintained in [Competitor Deep Dive](COMPETITOR_DEEP_DIVE.md), as specifically required by the competitive-validation research scope. It does not claim that any provider lacks a capability where public evidence was not found.

## Market categories

| Category | Typical scope to validate in buyer interviews | Relationship to this demonstrator |
|---|---|---|
| Multi-provider payment orchestration | Provider connectivity, routing rules, failover, payment status and performance monitoring. | Strong adjacent category. This prototype has no connectivity, rule management, live status, provider-specific outcomes, or failover execution. |
| Cross-border payment networks and payout platforms | Payout reach, local collection/disbursement options, FX quoting, prefunding and transaction status. | Could supply route choices and evidence. This prototype does not move funds, quote live FX, or manage network balances. |
| Treasury management and liquidity tools | Cash visibility, cash forecasting, account balances, funding and liquidity positioning. | Adjacent source of liquidity state and policy. This prototype uses one scalar balance and no accounts, forecasting, or cash movement. |
| Bank and payment-system interlinking | Access rules, operating windows, interoperability, messaging and settlement arrangements. | A constraint on any eventual routing model. The app has no rail or jurisdiction integration. |
| Internal payment operations tooling | Spreadsheets, scripts, queue dashboards, approvals and incident procedures. | Plausible workaround to investigate, not an observed universal practice. |

Cross-border payment outcomes depend on interoperability, operating hours, data exchange, access arrangements and legal/regulatory conditions. Public system-level reviews identify these as coupled constraints; this makes a route-cost-only proposition incomplete. [CPMI cross-border payments programme](https://www.bis.org/committees/cpmi/cross-border-payments/overview), [2026 monitoring survey brief](https://www.bis.org/publications/cpmi-brief-13-enhancing-cross-border-payments-step-step-insights-2025-monitoring-survey), [payment-system interlinking framework](https://www.bis.org/publications/interlinking-payment-systems-and-role-application-programming-interfaces-framework-cross-border-payments).

## Narrow proposed position

Test whether an operator needs a **pre-execution portfolio planning and evidence layer** that compares payment obligations across shared funding and route-window capacities, while preserving explicit constraints and explaining unfunded demand. This is a hypothesis, not a demonstrated market gap. Payment orchestration products may already expose similar capabilities; buyer discovery must compare the workflow with the buyer’s current licensed systems and configuration.

The current demonstrator’s narrow distinction is its visible deterministic accounting and adversarial test cases, not claimed superior pricing, access, risk coverage, or operational outcomes. Its modeled provider cost and single-window capacity cannot support procurement or live routing decisions.

## Evidence gaps to close

- Which existing system owns the authoritative obligation, available balance, reservation and route-capacity data?
- Can existing route rules enforce aggregate balance and per-window caps across all relevant payment streams?
- Which hard constraints must be applied before ranking: cutoff windows, account location, currency, compliance status, minimum amounts, quote expiry, or policy approvals?
- What is the baseline for cost, on-time completion, prefunding, repair and reconciliation exceptions?
- Can a proposed portfolio plan be replayed against historical records without creating instructions?
- Who owns the control decision, integration budget, and approval to operate in shadow mode?

## Research limits

This is category-level context, not an exhaustive teardown. Named-vendor desk research remains limited to public product pages and technical materials; unknowns may be resolved by configuration, contract, or private demonstrations. The review does not establish feature absence, market size, purchase intent, or defensibility. See [Buyer Problem Analysis](BUYER_PROBLEM_ANALYSIS.md), [Demand Signals](DEMAND_SIGNALS.md), and [Strategic Verdict](STRATEGIC_VERDICT.md) for the current validation status.
