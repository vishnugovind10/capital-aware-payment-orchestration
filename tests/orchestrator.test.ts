import { describe, expect, it } from "vitest";
import { comparePlans, planPayments, validateScenario, type Scenario } from "../src/engine/orchestrator";
import { initialScenario, scenarios } from "../src/engine/scenarios";

const scenario = (overrides: Partial<Scenario> = {}): Scenario => ({
  totalLiquidity: 100, reservedLiquidity: 0, committedLiquidity: 0, obligations: [{ id: "A", destination: "A", corridor: "EUR-A", amount: 70, priority: "High", deadlineHours: 24, allowSplit: false }],
  routes: [{ id: "r1", provider: "p", rail: "wire", corridor: "EUR-A", capacityEUR: 100, feeBps: 10, fxBps: 0, fixedFee: 1, settlementHours: 1, available: true, failed: false }],
  ...overrides,
});

describe("capital-aware payment planning", () => {
  it("shows independent proposals can overcommit aggregate treasury while portfolio allocations reconcile", () => {
    const { independent, portfolio } = comparePlans(initialScenario);
    expect(independent.decisions.reduce((n, d) => n + d.amount, 0)).toBe(560_000);
    expect(independent.overcommitment).toBe(60_000);
    expect(independent.allocatedLiquidity).toBe(0);
    expect(portfolio.allocatedLiquidity).toBeLessThanOrEqual(portfolio.availableLiquidity);
    expect(portfolio.remainingAvailableLiquidity).toBe(0);
    expect(portfolio.unfundedAmount).toBe(60_000);
  });
  it("optimizes across route capacity instead of choosing the cheapest route for each payment", () => {
    const s = scenario({ totalLiquidity: 200, obligations: [
      { id: "A", destination: "A", corridor: "EUR-A", amount: 100, priority: "High", deadlineHours: 24, allowSplit: false },
      { id: "B", destination: "A", corridor: "EUR-A", amount: 100, priority: "High", deadlineHours: 24, allowSplit: false },
    ], routes: [
      { id: "cheap-limited", provider: "p", rail: "x", corridor: "EUR-A", capacityEUR: 100, feeBps: 1, fxBps: 0, fixedFee: 0, settlementHours: 1, available: true, failed: false },
      { id: "costlier-shared", provider: "q", rail: "y", corridor: "EUR-A", capacityEUR: 200, feeBps: 20, fxBps: 0, fixedFee: 0, settlementHours: 1, available: true, failed: false },
    ] });
    const p = planPayments(s, "portfolio");
    expect(p.allocatedLiquidity).toBe(200);
    expect(p.routeUsage["cheap-limited"]).toBe(100);
    expect(p.routeUsage["costlier-shared"]).toBe(100);
  });
  it("demonstrates a feasible same-value portfolio where independent low-cost proposals exceed route capacity", () => {
    const { independent, portfolio } = comparePlans(scenarios["capacity-tradeoff"]);
    expect(independent.decisions.reduce((n, d) => n + d.amount, 0)).toBe(200_000);
    expect(independent.routeUsage["br-limited-low-cost"]).toBe(200_000);
    expect(independent.overcommitment).toBe(100_000);
    expect(portfolio.allocatedLiquidity).toBe(200_000);
    expect(portfolio.routeUsage["br-limited-low-cost"]).toBe(100_000);
    expect(portfolio.routeUsage["br-shared-capacity"]).toBe(100_000);
    expect(independent.totalCost).toBe(100);
    expect(portfolio.totalCost).toBe(350);
    expect(portfolio.fullyFundedCount).toBe(2);
    expect(portfolio.partiallyFundedCount).toBe(0);
    expect(portfolio.unfundedAmount).toBe(0);
    expect(portfolio.deadlineCompliantCount).toBe(2);
    expect(portfolio.liquidityUtilizationPercent).toBe(100);
    expect(portfolio.decisions.every(d => d.trace?.some(line => line.includes("selected")))).toBe(true);
  });
  it("uses deadline-compatible fallback and rejects exhausted capacity", () => {
    const s = scenario({ routes: [
      { ...scenario().routes[0], id: "limited", capacityEUR: 30, settlementHours: 1 },
      { ...scenario().routes[0], id: "too-slow", capacityEUR: 100, settlementHours: 30 },
    ] });
    expect(planPayments(s, "portfolio").decisions[0].action).toBe("UNFUNDED");
    expect(planPayments(s, "portfolio").allocatedLiquidity).toBe(0);
  });
  it("reroutes around a failed route and records rejected alternatives", () => {
    const p = planPayments(scenarios["route-failure"], "portfolio");
    const d = p.decisions.find(item => item.obligationId === "PAY-001")!;
    expect(d.routeId).toBe("br-stable");
    expect(d.trace?.some(line => line === "br-bank: failed")).toBe(true);
  });
  it("does not use routes from a different explicit corridor", () => {
    const s = scenario({ obligations: [{ ...scenario().obligations[0], corridor: "EUR-B" }] });
    expect(planPayments(s, "portfolio").decisions[0].action).toBe("NO_ROUTE");
  });
  it("allocates a permitted partial amount only within both liquidity and route limits", () => {
    const s = scenario({ totalLiquidity: 50, obligations: [{ ...scenario().obligations[0], allowSplit: true }], routes: [{ ...scenario().routes[0], capacityEUR: 30 }] });
    const p = planPayments(s, "portfolio");
    expect(p.decisions[0].action).toBe("PARTIAL");
    expect(p.allocatedLiquidity).toBe(30);
    expect(p.remainingAvailableLiquidity).toBe(20);
    expect(p.unfundedAmount).toBe(40);
  });
  it("leaves partial-capable liquidity unallocated when an obligation forbids splitting", () => {
    const s = scenario({ totalLiquidity: 50 });
    const p = planPayments(s, "portfolio");
    expect(p.decisions[0].action).toBe("UNFUNDED");
    expect(p.allocatedLiquidity).toBe(0);
    expect(p.remainingAvailableLiquidity).toBe(50);
    expect(p.unfundedAmount).toBe(70);
  });
  it("uses stable obligation IDs when equal high priorities compete", () => {
    const s = scenario({ totalLiquidity: 70, obligations: [
      { ...scenario().obligations[0], id: "B", priority: "High" },
      { ...scenario().obligations[0], id: "A", priority: "High" },
    ] });
    const p = planPayments(s, "portfolio");
    expect(p.decisions.find(d => d.obligationId === "A")?.amount).toBe(70);
    expect(p.decisions.find(d => d.obligationId === "B")?.amount).toBe(0);
  });
  it("uses stable route-id tie breaking for equal cost", () => {
    const s = scenario({ routes: [
      { ...scenario().routes[0], id: "z" }, { ...scenario().routes[0], id: "a" },
    ] });
    expect(planPayments(s, "portfolio").decisions[0].routeId).toBe("a");
  });
  it("accounts for existing reservations and commitments", () => {
    const p = planPayments(scenario({ reservedLiquidity: 20, committedLiquidity: 10 }), "portfolio");
    expect(p.availableLiquidity).toBe(70);
    expect(p.allocatedLiquidity).toBe(70);
    expect(p.remainingAvailableLiquidity).toBe(0);
  });
  it("rejects duplicate IDs, over-reservation and invalid route economics", () => {
    const base = scenario();
    expect(() => validateScenario({ ...base, reservedLiquidity: 90, committedLiquidity: 20 })).toThrow(/exceed/);
    expect(() => validateScenario({ ...base, obligations: [base.obligations[0], base.obligations[0]] })).toThrow(/unique/);
    expect(() => validateScenario({ ...base, routes: [{ ...base.routes[0], feeBps: -1 }] })).toThrow(/Invalid feeBps/);
    expect(() => validateScenario({ ...base, totalLiquidity: Number.NaN })).toThrow(/liquidity/);
    expect(() => validateScenario({ ...base, obligations: [{ ...base.obligations[0], amount: -1 }] })).toThrow(/Invalid amount/);
    expect(() => validateScenario({ ...base, obligations: [{ ...base.obligations[0], amount: 0 }] })).toThrow(/Invalid amount/);
  });
  it("preserves accounting and capacity invariants for every returned portfolio plan", () => {
    for (const s of [initialScenario, scenarios["liquidity-shortfall"], scenarios["route-failure"], scenario({ totalLiquidity: 35 })]) {
      const p = planPayments(s, "portfolio");
      expect(p.allocatedLiquidity).toBeCloseTo(p.decisions.reduce((n, d) => n + d.amount, 0), 6);
      expect(p.allocatedLiquidity).toBeLessThanOrEqual(p.availableLiquidity + 0.005);
      expect(p.remainingAvailableLiquidity).toBeGreaterThanOrEqual(-0.005);
      for (const route of s.routes) expect(p.routeUsage[route.id] ?? 0).toBeLessThanOrEqual(route.capacityEUR + 0.005);
    }
  });
  it("permits exact-balance funding and reports no feasible route when all choices fail", () => {
    expect(planPayments(scenario({ totalLiquidity: 70 }), "portfolio").allocatedLiquidity).toBe(70);
    const s = scenario({ routes: scenario().routes.map(r => ({ ...r, available: false })) });
    expect(planPayments(s, "portfolio").decisions[0].action).toBe("NO_ROUTE");
  });
  it("does not create route feasibility when an eligible route is removed", () => {
    const base = scenario({ routes: [
      ...scenario().routes,
      { ...scenario().routes[0], id: "r2", capacityEUR: 100, feeBps: 20 },
    ] });
    const without = { ...base, routes: base.routes.filter(r => r.id !== "r1") };
    expect(planPayments(base, "portfolio").decisions[0].action).toBe("ALLOCATE");
    expect(planPayments(without, "portfolio").decisions[0].action).toBe("ALLOCATE");
    const none = { ...without, routes: [] };
    expect(planPayments(none, "portfolio").decisions[0].action).toBe("NO_ROUTE");
  });
  it("never selects unavailable, failed or deadline-incompatible routes", () => {
    const base = scenario();
    for (const route of [
      { ...base.routes[0], available: false },
      { ...base.routes[0], failed: true },
      { ...base.routes[0], settlementHours: 25 },
    ]) {
      const p = planPayments({ ...base, routes: [route] }, "portfolio");
      expect(p.decisions[0].routeId).toBeUndefined();
      expect(p.decisions[0].action).toBe("NO_ROUTE");
    }
  });
  it("returns identical output for identical input", () => {
    const s = scenarios["capacity-tradeoff"];
    expect(planPayments(s, "portfolio")).toEqual(planPayments(s, "portfolio"));
  });
});
