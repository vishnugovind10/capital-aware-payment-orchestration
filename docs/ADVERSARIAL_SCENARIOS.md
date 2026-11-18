# Adversarial scenario validation

All amounts are synthetic EUR-equivalent values. These are deterministic planning-engine cases, not live tests or evidence of provider performance. “Actual” reports the engine output under the stated inputs. The branch limit is eight obligations.

| Case | Initial conditions and constraint | Expected control | Actual engine result | Interpretation |
|---|---|---|---|---|
| Aggregate over-allocation | Baseline: €500k available; obligations €180k, €220k, €160k; route caps suffice. | Independent checks must disclose aggregate proposal excess; portfolio total must stay within €500k. | Independent proposals €560k; overcommitment €60k. Portfolio planned €500k; unfunded €60k. | Demonstrates shared-liquidity accounting, not cost savings. |
| Cheapest individual route loses portfolio-wide | `capacity-tradeoff`: two €100k obligations; low-cost route cap €100k; alternative cap €100k; liquidity €200k; both deadlines 24h. | Independent proposal view picks the cheapest individually feasible route twice; coordinated plan fills both while respecting each cap. | Independent: €200k proposed on a €100k route, €100k capacity overcommitment, estimated cost €100. Portfolio: €100k on each route, €200k total planned, zero unfunded, estimated cost €350, zero cap excess. | The coordinated plan is feasible for the same amount and deadline, while independent routing is not. It costs more; no savings are claimed. |
| Route capacity exhaustion | One €70k obligation; only matching route capacity €30; split disabled. | No full allocation; partial only if explicitly permitted. | `UNFUNDED`, €0 planned. | Route capacity is a hard constraint. |
| Deadline incompatibility | One €70k obligation with 24h deadline; matching route settles in 30h. | Reject route. | `NO_ROUTE`, €0 planned. | Deadline is eligibility, not a weighted preference. |
| Failure and rerouting | Baseline Brazil bank route marked failed; synthetic digital fallback available, capacity sufficient and within deadline. | Exclude failed path, choose feasible fallback. | Brazil allocation moves to `br-stable`. | Simulated reroute only; no outage recovery claim. |
| Insufficient liquidity | One €70k obligation; €50 available; split disabled. | Do not exceed €50 or allocate a partial. | `UNFUNDED`, €0 planned, €50 remains. | Unused funds may result from indivisible obligation rules. |
| Partial allocation | One €70k split-enabled obligation; €50 available; route capacity €30. | Allocate no more than the tightest resource; disclose remainder. | `PARTIAL`, €30 planned, €20 remains, €40 unfunded. | A single partial leg is modeled; child-payment execution is not. |
| No feasible route | One obligation; all matching routes unavailable or failed. | Abstain. | `NO_ROUTE`, €0 planned. | No route is silently invented. |
| Competing high priorities | Two equal-priority €70k obligations, €70 liquidity, IDs `A` and `B`, same deadline. | Deterministically select by deadline then ID. | `A` receives €70; `B` receives €0. | Equal priority uses earlier deadline, then lexical ID. |
| Equal route costs | One obligation, two eligible routes with same cost and settlement time. | Stable final route-ID tie-break. | Route `a` is selected over `z`. | Repeated runs produce the same output. |

Automated tests cover these resource and decision rules, plus duplicate IDs, invalid fees, existing reservations, exact-balance allocation and portfolio accounting/capacity invariants. See `tests/orchestrator.test.ts`.
