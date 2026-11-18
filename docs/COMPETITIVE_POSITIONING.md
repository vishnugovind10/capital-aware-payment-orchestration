# Competitive positioning and capability map

Research checked 18 November 2026. This note uses provider categories and deliberately omits commercial names under this repository’s publication privacy boundary. It does not claim that any category lacks a capability unless that limitation is explicitly described here. Public infrastructure research is cited; vendor-specific feature claims and share/pricing estimates are excluded.

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

This is category-level desk research, not an exhaustive product comparison. It does not establish feature absence, market size, purchase intent, or defensibility. Vendor materials surfaced during research are not reproduced or linked in order to honor the no-company-identifiers constraint. Independent buyer evidence and public product documentation review under an explicitly permitted disclosure scope are next steps.
