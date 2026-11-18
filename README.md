# Capital-Aware Payment Orchestration

**An economic execution and liquidity coordination layer for programmable payments.**

CapitalFlow is a working, browser-based reference demonstrator for comparing transaction-level route selection with portfolio-aware payment planning. It makes shared-liquidity reservations, route constraints and funding gaps visible across concurrent obligations.

> **Research prototype. All balances, payment obligations, route quotes, provider names, costs, deadlines and outcomes are synthetic. No real payments are executed and no external systems are connected.**

## Run locally

Node.js 22.12+ is required.

```bash
npm install
npm run dev
```

Open the local URL Vite prints. The app is a static client-side build and is ready for Vercel.

```bash
npm test
npm run build
npm run preview
```

## Try the Orchestration Lab

The initial scenario has €500,000 of synthetic EUR liquidity and three obligations totaling €560,000: Brazil (€180,000), Singapore (€220,000) and Mexico (€160,000).

- **Transaction-level** evaluates each instruction without consuming shared liquidity, making aggregate over-allocation visible.
- **Portfolio-aware** orders obligations by priority, deadline and ID, then reserves treasury capacity once. Partial reservation is used only when enabled for that obligation.
- Route availability, simulated failure, provider fee, FX spread, settlement time, amount, deadline and priority are editable.
- Charts and summary figures derive from the same deterministic engine output.

An independent plan can allocate more than the treasury holds; its “Over-allocation” reports the excess. A portfolio plan reserves no more than available liquidity and reports the unpaid amount as “Unfunded”. A permitted partial payment is shown as a split and does not imply that either portion was executed.

## Economic model

For an eligible route:

```text
estimated route cost = amount × (provider fee bps + FX spread bps) / 10,000 + fixed fee
```

Hard route constraints (availability, simulated failure and deadline) apply before cost ranking. The lowest-cost route wins; there are no hidden score weights. See [economic model](docs/ECONOMIC_MODEL.md), [architecture](docs/ARCHITECTURE.md), [product thesis](docs/PRODUCT_THESIS.md), [market evidence](docs/MARKET_EVIDENCE.md), [validation plan](docs/VALIDATION_PLAN.md) and [repository lineage](docs/REPOSITORY_LINEAGE.md).

The model does **not** yet include real-time FX, currencies beyond normalized EUR funding requirements, route-liquidity capacities, counterparty risk, failure repair loss, cost of capital, delay penalties or actual settlement/reconciliation. The output is not a complete all-in cost or a real route recommendation.

## Architecture

```text
React + Vite interface
        ↓
Deterministic TypeScript engine
        ↓
Synthetic scenario fixtures
```

The UI and engine run in the browser. No backend, database, authentication, wallet, blockchain, bank or provider connection is required. Decision, reservation, execution, settlement and reconciliation remain distinct concepts; only decision and simulated reservation are represented by this version.

## Technical lineage

The [lineage document](docs/REPOSITORY_LINEAGE.md) records what was inspected and what is conceptual only. PayFlow Control Plane was inspected as the primary implementation reference. The new engine reimplements a narrow subset of ideas; it does not import code or claim a tested integration. Related repositories are independent work, not a shared runtime or deployed product.

## Commercial validation

The initial customer hypothesis is cross-border payment fintechs and stablecoin payment infrastructure providers. A first pilot should compare shadow-mode plans against historical data for one corridor, with a documented incumbent baseline. No savings, adoption, security or operational improvement claims are made until measured.

## License

MIT. See [LICENSE](LICENSE).
