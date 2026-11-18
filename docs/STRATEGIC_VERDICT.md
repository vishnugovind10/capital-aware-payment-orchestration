# Strategic verdict

**Recommendation: C — Better positioned as a feature or module within an existing infrastructure platform.** Confidence: **moderate-low** because this is a public-source review with no buyer interviews, vendor demos or historical data. This is a provisional strategic assessment, not a market-size or investment claim.

## Evidence

Payment routing, route selection, cutoffs, account visibility, payment workflows, audit trails, forecasting and reconciliation already appear across products from Modern Treasury, Kyriba, TIS, Airwallex, Nium, Thunes, Form3, Currencycloud and Banking Circle. Several platforms combine multiple adjacent capabilities. Nium, Airwallex and Thunes document provider-network routing; Kyriba and TIS are particularly close on treasury/payment workflow; Modern Treasury documents API orchestration, limits and reconciliation. See the [competitor matrix](COMPETITOR_DEEP_DIVE.md).

The precise proposed combination—joint allocation of competing obligations across shared liquidity and external-provider capacities, with an explainable pre-execution decision—was not verified in the public materials reviewed. That may be a documentation limitation or proprietary capability, not a confirmed gap. One active Gulf Air TMS tender confirms adjacent procurement interest, but not demand for this planner. No public evidence reviewed establishes buyers with repeated binding capacity conflicts, quantified losses, or willingness to purchase a separate product.

## Strongest argument for and against

- **For:** if a multi-provider payment operator repeatedly faces binding shared funding or route limits, a vendor-neutral read-only planner could surface feasible portfolio choices across systems that route one payment at a time. The demonstrator represents this control distinction clearly.
- **Against:** incumbents already own balance, routing, workflow and execution context and could add portfolio rules or optimization; provider-internal routing already weakens the novelty. Current prototype uses one synthetic EUR-normalized pool, static scenario caps and bounded search and provides no measured outcome or integration.

**Biggest competitive threat:** an incumbent TMS/payment hub plus its routing configuration and provider auto-routing already solves the buyer’s workflow adequately.

**Biggest technical limitation:** no reliable decision-time cross-entity/currency balances, provider capacity/quotes, temporal settlement model or production-grade global optimizer; without these, a replay result may not represent operational decisions.

**Biggest commercial uncertainty:** whether any reachable operator experiences this exact recurring cross-provider constraint, has data and authority to evaluate it, and controls a budget separate from incumbent platform spend.

## Single most important experiment

Secure one operator-approved, pseudonymized historical dataset and replay a real constrained workflow against the incumbent decisions, using decision-time balances, valid routes/capacities, equal service and measured outcomes. Pre-agree success criteria and data handling. The pilot design is in [Pilot Specification](PILOT_SPECIFICATION.md). If no buyer can produce such a workflow/data set or the incumbent already handles it, the standalone thesis should be stopped or reframed as an incumbent feature.

## Three next actions

1. Conduct focused discovery with treasury/payment operations owners at multi-provider PSPs/operators; seek a recent real incident, frequency, current system, decision rights and data owner. Do not count general interest as demand.
2. Ask two or three adjacent platform vendors or implementation specialists to demonstrate how they handle competing obligations under shared balances and provider caps; confirm whether public-document unknowns are actual gaps.
3. Only after a buyer and dataset are secured, run the read-only replay and decide whether to pursue an embedded module, integration partnership or stop.

## Evidence still missing

No buyer interviews, user observation, vendor confirmation, verified feature-gap proof, permissioned historical dataset, quantitative outcome, procurement fit for this product, security approval, pilot sponsor, budget, purchase intent, or willingness-to-pay evidence. The project currently supports a credible technical control demonstration, not a validated commercial opportunity or claimed savings.
