# Pilot specification: read-only historical replay

## Objective and scope

Test whether a portfolio planner improves an operationally meaningful outcome over the buyer's actual current decisions. Do not execute or reserve payments. Start with one workflow, one or two corridors, two or three eligible routes when available, and a buyer-approved bounded historical period. Use the same payment population and decision-time information for the incumbent baseline and planner. A 4–8 week extract may be proposed as a practical starting point, subject to data volume and event frequency; it is not a claim that the period is statistically sufficient.

## Minimum data

- Pseudonymous obligation ID; amount and currency; origin/destination or corridor; priority class and the policy defining it; deadline and promised service.
- Decision timestamp; available balance by relevant account/currency/entity; existing reservations, commitments and their release times.
- Eligible providers/routes at that decision time and exclusion reasons; route capacity/limit and window; quote and FX snapshot, fees, timestamp, expiry and applicable conditions.
- Actual selected route and decision; amount funded, split/partial status; initiation, acceptance, settlement and return/failure timestamps/status.
- Repair, retry, manual intervention and reconciliation exception categories, timestamps and (where measured) labor time/cost.
- Relevant prefunding transfers/position data and the treasury-approved funding/carry rate if opportunity cost is to be estimated.

Use data minimization: no names, account numbers, beneficiary details, free-text payment purpose, credentials, or unnecessary personal data. Buyer should pseudonymize identifiers and approve handling, retention, access and deletion before transfer. If route capacity or quote snapshots do not exist at decision time, mark them missing; do not reconstruct with hindsight.

## Replay method

1. Agree the workflow, eligibility rules, priority order, service requirements, outcome definitions and success thresholds before inspecting results.
2. Build a chronological event replay from actual decision-time inputs. Maintain liquidity and capacity consumption through each decision; do not reuse the same balance or route capacity across payments. Exclude later quotes, outcomes and information unavailable at that decision.
3. Reproduce the incumbent choice and then run the planner on the identical obligation set, available liquidity, route eligibility, costs and constraints. Record every mismatch and reason.
4. Compare at equal funded value and equivalent priority/deadline/service. Report tradeoffs when equal service is impossible; do not report lower fee as a win if obligations become less funded, later or riskier.
5. Segment by corridor, priority, constraint-binding event, route, and exception type. Show missing-data coverage and sensitivity to uncertain estimates. Independently review a sample of inputs and traces with buyer operators.

## Metrics and data needs

| Metric | Calculation | Required evidence |
|---|---|---|
| Funded value / obligations served | Value and count funded fully/partially/unfunded by priority, with equal cohort. | Obligation, actual allocated/funded amounts, priority. |
| On-time completion | Share and value settled by agreed deadline; report separately from initiation/acceptance. | Deadline and settlement timestamps/status. |
| Measured payment cost | Fees and realized FX cost on comparable funded value; state what is included/excluded. | Time-valid quote, fee schedule, execution FX and actual charges. |
| Prefunding and idle liquidity | Peak and time-weighted required funds; idle balance by agreed definition/time interval. | Timestamped balances, commitments, funding movements. |
| Unfunded/delayed obligations | Amount/count and duration; no assumed penalty unless buyer documents it. | Obligation, funding and settlement timeline. |
| Failures and repairs | Failure/return/retry rate and direct measured cost; separate cause categories. | Provider statuses, repair logs, retry events, charges. |
| Manual intervention | Count and measured labor time/cost per exception or workflow. | Ticket/time records or validated time study. |
| Reconciliation exceptions | Count/value unresolved or mismatched by close and resolution time. | Ledger/payment records and reconciliation logs. |
| Capacity and liquidity violations | Number/value of decisions exceeding available balance, encumbrance or valid route limits under the agreed rule. | Decision-time balance/commitments and authoritative capacity records. |

Historical records can measure executed cost, timestamps, outcomes and logged interventions. Labor cost may be estimated using buyer-approved rates if time is measured. Funding opportunity cost needs a buyer-approved marginal funding rate and duration. Late-loss, failure expected-loss, switching cost or reputational impact without recorded evidence is speculative and should remain a sensitivity, not a headline benefit.

## Success criteria and commercial structure

There are no defensible universal numeric thresholds. Before the replay, buyer and supplier must agree minimum data coverage, service non-inferiority or improvement, acceptable exception rates, evaluation window, economic hurdle, and stop conditions. A lower modeled cost alone is insufficient.

Recommended bounded engagement: paid discovery or fixed-scope technical evaluation if the buyer authorizes it; then a read-only replay, followed only if useful by shadow mode that compares recommendations without execution. No price or willingness to pay is asserted. The buyer supplies policy, permissioned pseudonymized data, source-system context and operator review. The supplier supplies a documented data map, deterministic replay, traceable results, security/data-handling plan, limitations and a final report. End with an explicit go/no-go decision: stop, extend validation, or scope an integration/business case. Do not move to live execution within this pilot.
