# Competitor deep dive

**Research date: 18 November 2026.** This is a public-document review, not a product teardown or vendor confirmation. `Verified` means explicit public evidence of the named behavior; `Partial` means adjacent functionality is documented; `Not found` means no supporting evidence was located in the sampled public material; `Unknown` means the public material does not support a reliable determination. `Not found` is not proof of product absence. Links below are official vendor product or technical materials unless identified otherwise.

## Product baseline being compared

Capital-Aware Payment Orchestration is a browser-only synthetic demonstrator. It compares independently proposed routes with a deterministic portfolio planner over EUR-equivalent obligations. The planner shares one synthetic liquidity pool and per-route planning-window caps, applies High/Medium/Low funding priorities and deadlines, searches full-payment placements for at most eight obligations, then greedily places allowed partial amounts. It does not execute, reserve, settle, reconcile, connect to providers, or model multi-currency accounts, live quotes, time-varying balance/capacity, or operational losses. It demonstrates aggregate feasibility/control in a constructed case, not savings or buyer demand. See [README](../README.md), [engine audit](ENGINE_AUDIT.md), and [economic model](ECONOMIC_MODEL.md).

## Capability matrix

Columns: **Route** payment/rail selection; **Optim.** fees, FX, speed or reliability; **Liquidity** balance/position visibility; **Shared** competing obligations against common balances; **Capacity** provider/route limits; **Priority** obligation ranking; **Portfolio** joint planning; **Partial** splitting or partial allocation; **Windows** deadlines/cutoffs/settlement; **Trace** decision rationale; **Sim.** pre-execution comparison; **Recon.** reconciliation to outcomes. Statuses are `V` Verified, `P` Partial, `NF` Not found, `U` Unknown.

| Product | Route | Optim. | Liquidity | Shared | Capacity | Priority | Portfolio | Partial | Windows | Trace | Sim. | Recon. |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Capital-Aware demonstrator | P | P | V | V | V | V | P | P | P | V | V | NF |
| Modern Treasury Payments | V | P | V | P | U | P | U | P | V | P | P | V |
| Kyriba Payments Hub / liquidity products | V | P | V | V | U | P | P | U | P | P | V | V |
| TIS Enterprise Payment Optimization | V | P | V | P | U | P | U | U | P | P | P | V |
| Airwallex Global Payouts / Treasury | V | V | V | P | U | U | U | P | P | P | P | V |
| Nium Payouts | V | V | P | U | P | P | U | U | V | P | U | P |
| Thunes network / SmartX Treasury | V | P | P | U | U | U | U | U | P | U | U | P |
| Form3 Payments Processing Gateway | V | P | U | U | U | P | U | U | P | P | P | P |
| Currencycloud API | V | P | V | U | U | U | U | P | P | P | U | V |
| Banking Circle | V | P | V | P | U | U | U | U | V | P | U | P |

Matrix statuses refer to the specific public product material reviewed, not a complete vendor evaluation. In particular, “route optimization” may be within one provider’s network and is not evidence of optimization across providers. “Partial” in the demonstrator means synthetic bounded modeling, not a production-grade capability.

## Vendor evidence and limits

### Modern Treasury — payments orchestration and lifecycle

Its [Payments overview](https://docs.moderntreasury.com/payments/docs/overview), [making payments](https://docs.moderntreasury.com/payments/docs/making-payments), [stablecoin orchestration](https://docs.moderntreasury.com/payments/docs/orchestration), [daily limits](https://docs.moderntreasury.com/payments/docs/daily-limits), and [reconciliation rules](https://docs.moderntreasury.com/payments/docs/defining-reconciliation-rules) document a common payment API across rails, payment statuses/webhooks, operational validation, shared daily account limits, multi-leg flows and reconciliation. These support route/lifecycle/reconciliation capabilities. They do not publicly establish a cross-provider, multi-obligation optimizer that jointly allocates a treasury portfolio under shared available funds and provider caps; that point remains **Unknown**.

### Kyriba — TMS, liquidity and payments hub

Kyriba describes cash positions across banks, entities and currencies, forecasting and scenario analysis in its [treasury product](https://www.kyriba.com/products/treasury/) and [liquidity fact sheet](https://www.kyriba.com/resources/fact-sheets/kyribas-liquidity-management-solutions/). Its [payments hub guide](https://www.kyriba.com/resources/insights/15-minute-guide-to-payments-hubs/) describes multi-bank payment routing by configured business rules and liquidity visibility; its [payments network](https://www.kyriba.com/resources/fact-sheets/payments-network/) documents workflow, controls, status and audit. This is strong adjacent overlap. Public material reviewed does not specify the exact constrained portfolio solver or route-capacity allocation semantics; these are **Unknown**, not established gaps.

### TIS — Enterprise Payment Optimization

TIS positions [EPO](https://tispayments.com/company/faqs/) as multi-bank, multi-system and multi-entity payment/liquidity workflow infrastructure. Its [cash forecasting brochure](https://tispayments.com/wp-content/uploads/Final-Cash-Forecasting-Brochure-1-19-22.pdf) and [cash insights fact sheet](https://insights.tispayments.com/hubfs/Content%20Files/EN%20pdf/00%20New%20Content%20Library/2022/Factsheets/18%20-%20Cash%20Insights%20%2B%20Reporting/Cash%20Insights%20Factsheet.pdf) document cash positioning, forecasts and reporting. This makes TIS a close adjacent platform. A portfolio optimizer with explicit competing route caps and explainable allocations was not established from reviewed public materials (**Unknown**).

### Airwallex — global accounts and payouts

Airwallex documents [global payout routes, multicurrency wallets, FX, batch APIs and auto-routing](https://www.airwallex.com/en-uk/platform-api-and-embedded-finance/payouts?topics=accounts_payable) and [platform payout flows](https://www.airwallex.com/docs/payments-for-platforms/overview). This verifies in-network routing and related liquidity/reconciliation infrastructure; platform fund splits are not evidence of splitting a single obligation among competing routes. Cross-provider portfolio allocation is **Unknown**.

### Nium — payout network and internal rail selection

Nium’s [payout documentation](https://docs.nium.com/docs/payouts), [rail preference](https://preview.docs.nium.com/docs/payouts/transfer-money/payout-rail-preference), [EUR to SEPA guide](https://preview.docs.nium.com/docs/payouts/country-and-regional-guides/eur-payments-to-sepa), [Singapore guide](https://preview.docs.nium.com/docs/payouts/country-and-regional-guides/sgd-payments-to-singapore), and [delivery-time estimates](https://preview.docs.nium.com/docs/payouts/transfer-money/estimated-delivery-time) describe internal route choice informed by cost/coverage/speed, client preferences, fallbacks, cutoffs and rail-specific behavior. This makes single-payment route optimization and timing materially commoditized within a provider’s network. Public evidence of joint allocation across several customers’ obligations and external providers was not found (**Unknown**).

### Thunes — network reach and treasury tools

Thunes describes its [Direct Global Network and SmartX Treasury](https://www.thunes.com/industries/payment-service-providers/) as payout connectivity with pricing and liquidity tools; its [money transfer API](https://docs.thunes.com/money-transfer/v2/) documents route/payer selection. This is evidence of network-level routing, but not of an explainable cross-provider portfolio allocator. The exact joint-planning capability remains **Unknown**.

### Form3 — payment processing gateway

Form3 describes a [single API across payment schemes with customer-configured intelligent routing](https://www.form3.tech/payments-processing-gateway). This supports scheme/on-us route selection and configured rules. Reviewed public material does not show shared treasury liquidity optimization across obligations; applicability as a full TMS alternative is limited.

### Currencycloud — API-based FX and payments

Its [integration overview](https://developer.currencycloud.com/guides/integration-guides/overview/), [simple payments guide](https://developer.currencycloud.com/guides/integration-guides/make-simple-payments/), and [payments overview](https://support.currencycloud.com/hc/en-gb/articles/360017498439-Payments-overview) document currency balances, transfers, FX, payment initiation, rail choices and reconciliation. The guides require balance/FX preparation for a payment. They do not establish cross-provider portfolio planning (**Unknown**).

### Banking Circle — bank and payment infrastructure

Banking Circle documents multicurrency accounts, cash pooling/liquidity services, cross-border payment methods and [currency cutoffs](https://www.bankingcircle.com/currencies-and-cut-off-times/) in its [payments overview](https://www.bankingcircle.com/payments/). These capabilities directly address liquidity and timing inside its infrastructure. Public evidence reviewed does not establish external-provider portfolio allocation (**Unknown**).

## Research scope and confidence

Confidence is **high** for listed, explicit product capabilities and **medium/low** for capability absences because the review samples public pages and docs, not private demonstrations, contracts, configuration, or vendor interviews. Sources were accessed 18 November 2026; pages can change. No vendor has been asked to confirm the matrix. See [differentiation assessment](DIFFERENTIATION_ASSESSMENT.md) for interpretation.
