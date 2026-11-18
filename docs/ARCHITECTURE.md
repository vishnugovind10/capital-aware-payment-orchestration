# Architecture

The demonstrator is a Vite-hosted React application. Its pure TypeScript engine runs in the browser, so the same build can be deployed to Vercel without a separate service.

```text
Synthetic obligations + treasury input + synthetic route quotes
                         ↓
           Hard route availability/deadline filters
                         ↓
               Explicit fee + FX cost
                         ↓
      Independent comparison / portfolio reservation
                         ↓
       Explainable plan, funding gap and visual outputs
```

`src/engine/orchestrator.ts` contains deterministic evaluation. It filters routes that are disabled, failed, or too slow for a payment deadline, then chooses the lowest explicit fee-plus-FX cost route. Portfolio mode orders obligations by priority, deadline and stable ID, and reserves available treasury capacity once. Splitting is only applied where an obligation permits a partial reservation. Independent mode evaluates each obligation without consuming shared liquidity and reports the aggregate over-allocation.

The web UI (`src/App.tsx`) derives summary values and charts directly from the two engine plans. The values are not separately hard-coded into visualisations. Inputs are local state and are not persisted or sent to a server.

## Boundaries

- No real payment execution, provider connections, bank data, wallet, chain RPC, authentication, database or API.
- No currency conversion calculation: obligation amounts are represented in EUR as normalized synthetic funding requirements.
- Cost includes only configured provider bps, FX bps and fixed fees. Failure loss, capital cost, taxes and deadline penalties are not modelled.
- The route fixture is corridor-labeled, not evidence of actual provider availability or quote quality.
- This is a product demonstrator, not an operational treasury system, investment advice, audit assurance or savings claim.
