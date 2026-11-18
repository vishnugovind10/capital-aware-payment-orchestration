import { describe, expect, it } from "vitest";
import { comparePlans, planPayments } from "../src/engine/orchestrator";
import { initialScenario, scenarios } from "../src/engine/scenarios";

describe("portfolio payment planning", () => {
  it("exposes the independent aggregate over-allocation in the default scenario", () => {
    const { independent, portfolio } = comparePlans(initialScenario);
    expect(independent.reserved).toBe(560_000);
    expect(independent.fundingGap).toBe(60_000);
    expect(independent.remaining).toBe(-60_000);
    expect(portfolio.reserved).toBe(500_000);
    expect(portfolio.fundingGap).toBe(60_000);
    expect(portfolio.remaining).toBe(0);
  });
  it("does not reserve more liquidity than the portfolio has", () => {
    const plan = planPayments(scenarios["liquidity-shortfall"], "portfolio");
    expect(plan.reserved).toBeLessThanOrEqual(
      scenarios["liquidity-shortfall"].liquidity,
    );
    expect(plan.fundingGap).toBe(140_000);
  });
  it("reroutes when a route is unavailable after failure", () => {
    const plan = planPayments(scenarios["route-failure"], "portfolio");
    expect(
      plan.decisions.find((d) => d.obligationId === "PAY-001")?.routeId,
    ).toBe("br-stable");
  });
  it("abstains from a route that cannot meet the deadline", () => {
    const scenario = {
      ...initialScenario,
      obligations: initialScenario.obligations.map((o) =>
        o.id === "PAY-002" ? { ...o, deadlineHours: 2 } : o,
      ),
    };
    expect(
      planPayments(scenario, "portfolio").decisions.find(
        (d) => d.obligationId === "PAY-002",
      )?.action,
    ).toBe("NO_ROUTE");
  });
  it("handles full liquidity cleanly when obligations fit exactly", () => {
    const scenario = { ...initialScenario, liquidity: 560_000 };
    const plan = planPayments(scenario, "portfolio");
    expect(plan.reserved).toBe(560_000);
    expect(plan.fundingGap).toBe(0);
  });
  it("keeps excess balance visible when partial reservation is prohibited", () => {
    const scenario = {
      ...initialScenario,
      liquidity: 480_000,
      obligations: initialScenario.obligations.map((o) =>
        o.id === "PAY-002" ? { ...o, allowSplit: false } : o,
      ),
    };
    const plan = planPayments(scenario, "portfolio");
    expect(plan.reserved).toBe(340_000);
    expect(plan.remaining).toBe(140_000);
    expect(plan.fundingGap).toBe(220_000);
  });
  it("reports no route when every corridor route is unavailable", () => {
    const scenario = {
      ...initialScenario,
      routes: initialScenario.routes.map((r) =>
        r.id.startsWith("br-") ? { ...r, available: false } : r,
      ),
    };
    expect(
      planPayments(scenario, "portfolio").decisions.find(
        (d) => d.obligationId === "PAY-001",
      )?.action,
    ).toBe("NO_ROUTE");
  });
  it("rejects invalid obligations instead of producing a plan", () => {
    const scenario = {
      ...initialScenario,
      obligations: [{ ...initialScenario.obligations[0], amount: 0 }],
    };
    expect(() => planPayments(scenario, "portfolio")).toThrow(/Invalid amount/);
  });
});
