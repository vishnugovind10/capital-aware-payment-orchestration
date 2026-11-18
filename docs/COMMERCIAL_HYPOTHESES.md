# Commercial hypotheses

These are falsifiable questions for discovery, not product claims or forecasts.

| Hypothesis | Why it may be true | Evidence needed | Disconfirming result / stop condition |
|---|---|---|---|
| Some cross-border payment operators make competing funding and route decisions across separate tools. | Public payments guidance describes interoperability, operating-hour and liquidity constraints across system boundaries. | Recent buyer walkthroughs and a redacted decision trail from more than one independent operator. | Buyers already make the decision in one system with adequate controls, or the issue is too rare to prioritize. |
| Shared liquidity and route-window limits cause avoidable manual work or control exceptions. | An individual route can be feasible while concurrent demand exceeds a shared constraint. | Historical queue, exception and balance records matched to the actual decision time. | Aggregate conflicts are absent, immaterial, or already prevented by existing rules. |
| A deterministic shadow planner is acceptable before any execution integration. | Replay can be read-only and does not require initiating payments. | Named internal owner, approval path, accessible sample data and written shadow-mode acceptance criteria. | Buyers require live connectivity before evaluation or will not provide a safe historical sample. |
| A buyer would pay for an additional planning layer. | Potential value could include less manual triage or more transparent controls, if measured. | Budget owner, procurement path, competing budget priorities and a paid discovery/pilot signal. | No budget owner, no funded problem, or value is already included in an incumbent contract. |
| Route cost reduction is a viable purchase driver. | Multiple eligible routes may have different costs. | Like-for-like replay at equal funded value and service level using all-in fees and observed outcomes. | Apparent savings vanish after including repair, prefunding, FX, delay or integration costs. |
| The tool can integrate without becoming a new system of record or payment executor. | A read-only decision/evidence layer may reduce initial scope. | Architecture review, source-of-truth mapping, security review and written data contracts. | Buyers require custody, approvals, payment initiation, ledgering, or regulated services beyond feasible initial scope. |

## Validation sequence

1. Conduct problem interviews with no product pitch and ask for a recent example.
2. Map systems, owners, data rights, workflow and existing aggregate controls.
3. Obtain permissioned, minimized historical records and define equal-service comparison rules before replay.
4. Compare the proposed planner with the actual decision and outcome, including unfunded demand, cost, timeliness, repair, prefunding and reconciliation.
5. Ask the budget owner what measurable threshold and governance evidence justify a paid, bounded shadow pilot.

Do not describe an interview, historical replay, savings, reliability improvement, adoption or commercial demand as achieved until evidence exists. The simulator’s synthetic outputs are not proof of these hypotheses.
