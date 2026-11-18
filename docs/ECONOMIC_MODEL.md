# Economic model and assumptions

The current route cost is deliberately narrow and inspectable:

```text
estimated route cost = amount × (provider fee bps + FX spread bps) / 10,000 + fixed fee
```

The inputs are synthetic, editable assumptions. The engine ranks routes by this cost after removing routes that are unavailable, simulated as failed, or slower than the obligation deadline. Route ID is a deterministic tie-breaker.

The model does not currently estimate failure repair loss, liquidity scarcity, capital usage, expected settlement loss, missed-deadline harm, or route/provider counterparty risk. Do not read the output as a complete all-in cost, realized FX quote, savings result, route recommendation for a real payment, or investment return.

Portfolio mode reserves liquidity in priority order, then earlier deadline, then stable payment ID. A partial allocation is allowed only when `allowSplit` is true. If all obligations cannot fit, the engine leaves a funding gap visible. Transaction-level mode intentionally checks obligations independently and reports the resulting over-allocation against shared treasury liquidity.
