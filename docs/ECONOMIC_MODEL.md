# Economic model and assumptions

## Cost

```text
estimated route cost = amount × (fee bps + FX spread bps) / 10,000 + fixed fee
```

Inputs are synthetic. Cost is rounded to cents per allocation. Basis points are applied to EUR-normalized obligation amounts; the model does not perform FX conversion. Fixed cost is charged once to a partial allocation, not once per hypothetical child instruction. It is not an all-in cost.

## Constraints and objective

Eligibility requires matching explicit corridor, route enabled, not marked failed, and settlement hours no greater than the obligation deadline. Portfolio placements also require sufficient remaining EUR liquidity and route capacity. Opening available funds equal total less opening reservations and commitments.

The bounded planner supports up to eight obligations, 32 routes, and four routes per corridor. Its deterministic objective is lexicographic: maximize funded value by High, Medium, Low priority; maximize full-payment count in that priority order; minimize modeled route cost; break ties by stable IDs. It searches full placements and then allocates any remaining resources to permitted partials in priority/deadline/ID order. The bound and partial-allocation phase order are product assumptions; this is not a proof of globally optimal payment outcomes.

Independent proposals are a counterfactual: they each fit the initial balance and route cap individually, but do not consume shared liquidity or capacity. Their displayed aggregate overcommitment is a control diagnostic, not a plan to execute.

## Excluded economics

The engine does not estimate prefunding opportunity cost, duration of capital use, expected failure/repair cost, cutoff misses, late-payment harm, real-time FX, quote expiry, route/provider risk, compliance, tax, or reconciliation labor. A lower cost total can simply mean less value was funded. Comparisons must disclose funded amount and service outcome; equal-service cost evidence requires historical data and a more complete cost model.
