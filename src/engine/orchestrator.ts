export type Priority = "High" | "Medium" | "Low";
export type Obligation = {
  id: string;
  destination: string;
  amount: number;
  priority: Priority;
  deadlineHours: number;
  allowSplit: boolean;
};
export type Route = {
  id: string;
  provider: string;
  rail: string;
  feeBps: number;
  fxBps: number;
  fixedFee: number;
  settlementHours: number;
  available: boolean;
  failed: boolean;
};
export type Scenario = {
  liquidity: number;
  obligations: Obligation[];
  routes: Route[];
};
export type PaymentDecision = {
  obligationId: string;
  action: "EXECUTE" | "SPLIT" | "FUND" | "DEFER" | "NO_ROUTE";
  routeId?: string;
  amount: number;
  cost: number;
  liquidityAfter: number;
  explanation: string;
};
export type Plan = {
  mode: "independent" | "portfolio";
  decisions: PaymentDecision[];
  totalCost: number;
  obligationsTotal: number;
  reserved: number;
  remaining: number;
  fundingGap: number;
  feasibleCount: number;
  deferredCount: number;
};

const priorityOrder: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
export function routeCost(route: Route, amount: number): number {
  return (
    Math.round(
      ((amount * (route.feeBps + route.fxBps)) / 10_000 + route.fixedFee) * 100,
    ) / 100
  );
}
function candidateRoutes(s: Scenario, obligation: Obligation): Route[] {
  return s.routes
    .filter(
      (r) =>
        r.available &&
        !r.failed &&
        r.settlementHours <= obligation.deadlineHours &&
        r.id.startsWith(obligation.destination.toLowerCase().slice(0, 2)),
    )
    .sort(
      (a, b) =>
        routeCost(a, obligation.amount) - routeCost(b, obligation.amount) ||
        a.settlementHours - b.settlementHours ||
        a.id.localeCompare(b.id),
    );
}

/** Transaction mode intentionally ignores portfolio reservations to expose aggregate overcommitment. */
export function planPayments(s: Scenario, mode: Plan["mode"]): Plan {
  if (!Number.isFinite(s.liquidity) || s.liquidity < 0)
    throw new Error("Liquidity must be a non-negative number");
  const obligations = [...s.obligations].sort((a, b) =>
    mode === "portfolio"
      ? priorityOrder[a.priority] - priorityOrder[b.priority] ||
        a.deadlineHours - b.deadlineHours ||
        a.id.localeCompare(b.id)
      : a.id.localeCompare(b.id),
  );
  let remaining = s.liquidity;
  const decisions: PaymentDecision[] = [];
  for (const o of obligations) {
    if (!Number.isFinite(o.amount) || o.amount <= 0)
      throw new Error(`Invalid amount for ${o.id}`);
    const routes = candidateRoutes(s, o);
    if (routes.length === 0) {
      decisions.push({
        obligationId: o.id,
        action: "NO_ROUTE",
        amount: 0,
        cost: 0,
        liquidityAfter: remaining,
        explanation: "No available route meets the settlement deadline.",
      });
      continue;
    }
    const route = routes[0];
    if (mode === "independent") {
      remaining -= o.amount;
      decisions.push({
        obligationId: o.id,
        action: "EXECUTE",
        routeId: route.id,
        amount: o.amount,
        cost: routeCost(route, o.amount),
        liquidityAfter: remaining,
        explanation:
          "Individually feasible; this decision does not reserve shared treasury liquidity.",
      });
      continue;
    }
    const alloc = Math.min(o.amount, remaining);
    if (alloc <= 0) {
      decisions.push({
        obligationId: o.id,
        action: "FUND",
        routeId: route.id,
        amount: 0,
        cost: 0,
        liquidityAfter: remaining,
        explanation: `Requires €${Math.round(o.amount).toLocaleString()} additional liquidity.`,
      });
    } else if (alloc < o.amount && o.allowSplit) {
      const cost = routeCost(route, alloc);
      remaining -= alloc;
      decisions.push({
        obligationId: o.id,
        action: "SPLIT",
        routeId: route.id,
        amount: alloc,
        cost,
        liquidityAfter: remaining,
        explanation: `Partially reserved; €${Math.round(o.amount - alloc).toLocaleString()} still needs funding.`,
      });
    } else if (alloc < o.amount) {
      decisions.push({
        obligationId: o.id,
        action: "FUND",
        routeId: route.id,
        amount: 0,
        cost: 0,
        liquidityAfter: remaining,
        explanation: `Cannot reserve a partial payment; requires €${Math.round(o.amount - remaining).toLocaleString()} additional liquidity.`,
      });
    } else {
      const cost = routeCost(route, o.amount);
      remaining -= o.amount;
      decisions.push({
        obligationId: o.id,
        action: "EXECUTE",
        routeId: route.id,
        amount: o.amount,
        cost,
        liquidityAfter: remaining,
        explanation:
          "Route meets the deadline and full amount was reserved from shared liquidity.",
      });
    }
  }
  const reserved = decisions.reduce((sum, d) => sum + d.amount, 0);
  const obligationsTotal = s.obligations.reduce((sum, o) => sum + o.amount, 0);
  return {
    mode,
    decisions,
    totalCost: decisions.reduce((sum, d) => sum + d.cost, 0),
    obligationsTotal,
    reserved,
    remaining,
    fundingGap:
      mode === "independent"
        ? Math.max(0, reserved - s.liquidity)
        : Math.max(0, obligationsTotal - reserved),
    feasibleCount: decisions.filter((d) => d.action === "EXECUTE").length,
    deferredCount: decisions.filter(
      (d) =>
        d.action === "FUND" || d.action === "DEFER" || d.action === "NO_ROUTE",
    ).length,
  };
}

export function comparePlans(s: Scenario) {
  return {
    independent: planPayments(s, "independent"),
    portfolio: planPayments(s, "portfolio"),
  };
}
