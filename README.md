# Capital-Aware Payment Orchestration

**A synthetic reference demonstrator for portfolio-aware payment planning.**

CapitalFlow compares independent payment proposals with a bounded portfolio planner. The engine makes shared liquidity, explicit EUR-normalized corridors, deadlines, route capacity and modeled route costs visible before a payment decision.

> Research prototype. Balances, obligations and route quotes are synthetic. No payment is initiated, reserved in an external ledger, executed, settled, reconciled, or connected to a provider or bank.

## Run locally

Node.js 22.12+ is required.

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Demonstrator

The baseline has €500,000 total synthetic liquidity, no opening reservations, and three obligations totaling €560,000. Routes are explicitly assigned to EUR-normalized corridors and have a maximum EUR-equivalent capacity for the scenario planning window.

- **Independent proposals** pick each obligation’s least-cost individually feasible route without consuming shared liquidity or route capacity. Their aggregate can overcommit; proposals are not allocations.
- **Portfolio plan** searches full-payment placements across at most eight obligations, then uses remaining balance/capacity for permitted partial allocations. It respects shared liquidity and per-route capacity.
- The objective is lexicographic: maximize funded value in priority order (High, Medium, Low), then full-payment count by priority, then minimize modeled route cost. Stable IDs break remaining ties.
- Route eligibility requires matching explicit corridor, availability, no simulated failure, and settlement time within the obligation deadline.

The baseline shows the value of aggregate control: independent proposals total €560,000 against €500,000 available; portfolio allocations cap at €500,000 and disclose €60,000 unfunded. This is not evidence of savings. Costs differ when amounts funded differ.

## Model boundaries

Amounts represent EUR-equivalent funding needs. The engine does not convert currencies or represent jurisdictional accounts, time-varying balances, capacity sharing across planning windows, quote freshness, per-leg split costs, credit, capital cost, delay/failure losses, compliance, permissions, actual reservations, execution, settlement, or reconciliation. A route capacity is a scenario-level planning-window limit, not a live provider commitment. Cost is a linear estimate: `amount × (fee bps + FX bps) / 10,000 + fixed fee`.

See [architecture](docs/ARCHITECTURE.md), [economic model](docs/ECONOMIC_MODEL.md), [engine audit](docs/ENGINE_AUDIT.md), [adversarial scenarios](docs/ADVERSARIAL_SCENARIOS.md), [competitive positioning](docs/COMPETITIVE_POSITIONING.md), [named competitor research](docs/COMPETITOR_DEEP_DIVE.md), [differentiation assessment](docs/DIFFERENTIATION_ASSESSMENT.md), [buyer problem analysis](docs/BUYER_PROBLEM_ANALYSIS.md), [demand signals](docs/DEMAND_SIGNALS.md), [pilot specification](docs/PILOT_SPECIFICATION.md), [strategic verdict](docs/STRATEGIC_VERDICT.md), [buyer discovery](docs/BUYER_DISCOVERY.md), [commercial hypotheses](docs/COMMERCIAL_HYPOTHESES.md), and [dependency security review](docs/SECURITY_REVIEW.md). Market evidence and validation plan remain supporting documents.

## Architecture

```text
React + Vite interface
        ↓
Deterministic TypeScript planning engine
        ↓
Synthetic scenario fixtures
```

The app runs in the browser. There is no backend, database, identity system, wallet, chain, bank, or payment-provider connection. Recommendation and local simulated planning are the only represented lifecycle steps.

## Technical lineage

The [lineage document](docs/REPOSITORY_LINEAGE.md) records inspected technical references and boundaries. Related repositories are independent work; there is no shared runtime or tested integration.

## License

MIT. See [LICENSE](LICENSE).
