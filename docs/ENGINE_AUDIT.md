# Engine audit

Audit baseline: commit `a4d85dc` before this mission's changes. Findings below describe the inspected implementation; recommendations are marked separately. This is a code review, not a claim of operational or market validation.

## What the engine implements

`src/engine/orchestrator.ts` accepts one scalar liquidity value, an array of obligations, and an array of routes. Each route has provider/rail labels, provider fee and FX-spread basis points, a fixed fee, a settlement duration, and boolean available/failed flags. Each obligation has a destination string, amount, priority, deadline in hours, and split permission.

For each obligation, `candidateRoutes` filters by route flags, settlement hours no greater than the obligation deadline, and a corridor heuristic: route IDs must start with the first two lowercase letters of the destination. Remaining routes are sorted by provider fee plus FX spread plus fixed fee, then settlement duration, then route ID. The first route is selected before treasury allocation.

`routeCost` computes `amount * (feeBps + fxBps) / 10,000 + fixedFee`, rounded to cents. No route capacity, currency conversion, quote freshness, existing reservations, capital cost, failure loss, or delay penalty is modeled.

The independent mode processes obligations by ID, chooses each individually cheapest eligible route, and subtracts every full obligation from its displayed `remaining` balance. It does not test whether any individual obligation is within liquidity. It reports `max(0, total allocations - liquidity)` as over-allocation.

The portfolio mode processes by priority (High, Medium, Low), deadline, then ID. It picks the individually cheapest route first, then allocates from the one shared liquidity balance. A permitted split consumes whatever remains; a non-splittable obligation receives zero if it does not fit. `remaining` cannot go below zero in this mode. `fundingGap` is total obligation amount minus allocated amount.

## What the application presents

The UI compares the two plans and derives its summaries and charts from engine outputs. In portfolio mode, an `EXECUTE` decision is displayed as **Reserved**; independent `EXECUTE` is shown as **Executable**; `SPLIT` is shown as **Split**; and `FUND` as **Requires funding**. The lifecycle copy says execution and settlement are not connected. The prototype disclaimer and architecture/economic-model documents state that data is synthetic and actual payments are not executed.

The “Estimated route cost” chart compares the sum of route cost on the amount each mode allocated. Its adjacent note discloses that lower cost may reflect less value routed. The chart can still visually suggest an economic advantage without presenting equal delivered amounts or comparable service outcomes.

## Mismatches and defects

1. **Independent decisions claim individual feasibility without checking it.** The explanation says an obligation is “individually feasible,” but no check compares its amount to available liquidity or any route capacity. The mode is a useful counterfactual for aggregate over-allocation only when each obligation individually fits the balance.
2. **Corridors are implicit.** `destination.slice(0, 2)` and route-ID prefixes determine eligibility. This couples business meaning to string naming and can misroute collisions or malformed IDs.
3. **Portfolio allocation is priority-first greedy, not portfolio optimisation.** It never compares complete allocations or selects a more expensive route to preserve scarce route capacity for another obligation. Route economics are chosen independently before allocation.
4. **No route capacity is represented.** Two obligations can both select the same provider/rail without a shared route limit. Provider failure, capacity exhaustion, and fallback effects are therefore not economically coordinated.
5. **The default case does not demonstrate lower portfolio cost for equal service.** Both modes select the same route per corridor. Portfolio cost is lower because only €500,000 of €560,000 is allocated. The plan prevents over-allocation, which is a control benefit, but leaves €60,000 unfunded; it has no demonstrated cost advantage.
6. **Funding-gap terminology depends on mode.** Independent mode reports excess proposed allocation over treasury liquidity; portfolio mode reports obligation amount not allocated. Both are useful but represent different quantities under one property name.
7. **Accounting states are collapsed.** `reserved` is the sum of allocations, but the engine does not model pre-existing reserved or committed funds. `EXECUTE` is the action enum for an allocation recommendation, even though no execution occurs.
8. **Partial allocation is only a monetary split.** The model does not represent separate child instructions, minimum/maximum transfer sizes, multiple routes, fees per leg, or the remaining payable balance as a distinct obligation state.
9. **Scenario JSON files are descriptive, not engine inputs.** They do not include route data and are not loaded by the UI; the live fixtures come from `src/engine/scenarios.ts`.
10. **Audit/test coverage is narrow.** Eight unit cases covered baseline over-allocation, route failure, deadline filtering, simple liquidity boundaries, split policy and invalid amount. They did not cover duplicate IDs, invalid route values, explicit corridor mismatches, route capacity, independent per-obligation affordability, arithmetic/accounting invariants across arbitrary portfolios, or route removal monotonicity.

## Economic consistency

The cost formula is internally consistent for a normalized single-currency amount when fees and spread are treated as linear basis-point estimates and the fixed fee is charged once per allocated instruction. It is not a complete all-in economic cost. The fixed fee also means a partial allocation has a different cost shape from a full payment; no child-leg model exists.

Hard eligibility checks apply before route ranking for the constraints that exist (availability, failure flag, and deadline). Liquidity is not a route eligibility condition in independent mode, and route capacity is absent in both modes. The portfolio algorithm therefore coordinates only one aggregate EUR scalar; it does not coordinate provider liquidity, currency, location, settlement window overlap, or route capacity.

## Confirmed strengths

- The route cost function is short, deterministic, and separately callable.
- The portfolio path allocates from one shared balance and does not double-allocate that scalar.
- Priority, deadline, and stable ID establish deterministic processing order.
- Route failure and settlement-deadline scenarios are editable in the UI.
- The interface and documentation distinguish this prototype from real payment execution and settlement.
- Tests derive results from the actual engine rather than hard-coded UI values.

## Recommendations, not baseline facts

- Replace prefix-derived corridor matching with explicit source/destination currencies and corridor identifiers, validated at engine boundaries.
- Represent total, pre-reserved, committed, available, allocated, and unfunded liquidity as separate values with reconciliation invariants.
- Add explicit route capacity if the improved strategy is to make trade-offs among routes. Keep any capacity units and horizon explicit.
- Compare independent, priority-greedy, and a small bounded portfolio strategy on identical service quantities. Use a transparent objective and deterministic tie-breaks; do not call a heuristic globally optimal.
- Separate `RECOMMEND`, `ALLOCATE`, `EXECUTE`, and `SETTLE` states. This browser-only prototype should emit recommendations/allocations only.
- Add adversarial, invariant, and property-style deterministic tests before expanding the UI.

## Follow-up implementation status

After this baseline audit, the engine was changed on the working branch. It now validates explicit corridors, unique IDs, finite non-negative route economics/capacity, positive deadlines and amounts, and opening reserved/committed amounts. It bounds search to eight obligations, 32 routes and four routes per corridor. Portfolio planning searches full placements against shared liquidity and route capacity, then allocates permitted partials from remaining resources. Independent mode now emits non-reserving proposals and exposes aggregate liquidity/route-capacity overcommitment. The UI uses proposal/planned language and does not label a recommendation as executable, executed or settled.

The engine still has material simplifications documented in `ARCHITECTURE.md` and `ECONOMIC_MODEL.md`: one EUR-normalized balance, one route capacity window, no currency conversion, and one modeled partial route leg. The bounded objective and partial phase order are assumptions, not a general optimality claim. Seventeen deterministic engine tests and ten written adversarial cases cover core behavior; passing them does not validate real-world data or operational controls.
