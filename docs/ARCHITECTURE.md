# Architecture

The Vite-hosted React client calls a deterministic TypeScript planning engine with synthetic fixtures. Inputs remain in local browser state and are not persisted or sent to a server.

```text
Obligations + EUR-normalized opening balance + explicit route quotes/caps
                              ↓
Validate IDs, amounts, priorities, corridors, fees and limits
                              ↓
Match corridor + availability + failure + deadline eligibility
                              ↓
Independent non-reserving proposals | bounded portfolio planner
                              ↓
Per-obligation trace + funding gap + route usage + modeled cost
```

## Engine behavior

`src/engine/orchestrator.ts` validates at most eight obligations and 32 routes, with no more than four routes per corridor. The independent view checks each payment against the opening available balance and a route’s individual capacity, chooses the lowest-cost feasible route, but does not consume shared resources. Its proposals can therefore overcommit liquidity or corridor capacity; aggregate excess is exposed.

The portfolio planner exhaustively searches full-payment route placements within the stated bounds. It maximizes funded value in High, Medium, Low order, then full-payment count by priority, then minimizes modeled cost. Deadline, corridor, failed/unavailable route, treasury balance and route capacity are hard constraints. After the full-placement search, it allocates remaining resources to eligible split-permitted obligations in priority/deadline/ID order. Stable IDs and route IDs provide deterministic ties. This bounded search is not a general optimizer and is not called globally optimal beyond this declared objective and input limit.

Opening available liquidity equals total liquidity less opening reserved and committed liquidity. Portfolio planned allocations plus remaining available liquidity reconcile to that opening available value, within cent rounding. Route capacity is consumed once across the plan. “Planned allocation” is local simulation output and does not reserve an external resource.

## Boundaries

- No real payment execution, provider connection, bank data, wallet, chain RPC, authentication, database or API.
- Amounts are EUR-normalized equivalents; the model does not convert currency or segment cash by account, entity, location or time bucket.
- Route capacity is a single scenario planning-window amount, not live provider capacity.
- Cost includes configured fee basis points, FX-spread basis points and one fixed charge per modeled allocation. Splits do not create separate child-leg fees.
- Failure loss, capital cost, taxes, deadline harm, quote freshness, counterparty risk, compliance and reconciliation are not modeled.
- This is a research demonstrator, not a production treasury system, live recommendation, assurance, or savings claim.
