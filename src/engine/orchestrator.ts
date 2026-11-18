export type Priority = "High" | "Medium" | "Low";
export type Obligation = {
  id: string;
  destination: string;
  corridor: string;
  amount: number;
  priority: Priority;
  deadlineHours: number;
  allowSplit: boolean;
};
export type Route = {
  id: string;
  provider: string;
  rail: string;
  corridor: string;
  capacityEUR: number;
  feeBps: number;
  fxBps: number;
  fixedFee: number;
  settlementHours: number;
  available: boolean;
  failed: boolean;
};
export type Scenario = {
  totalLiquidity: number;
  reservedLiquidity: number;
  committedLiquidity: number;
  obligations: Obligation[];
  routes: Route[];
};
export type PaymentDecision = {
  obligationId: string;
  action: "PROPOSE" | "ALLOCATE" | "PARTIAL" | "UNFUNDED" | "NO_ROUTE";
  routeId?: string;
  amount: number;
  cost: number;
  liquidityAfter: number;
  explanation: string;
  trace?: string[];
};
export type Plan = {
  mode: "independent" | "portfolio";
  decisions: PaymentDecision[];
  totalCost: number;
  obligationsTotal: number;
  totalLiquidity: number;
  openingReservedLiquidity: number;
  openingCommittedLiquidity: number;
  allocatedLiquidity: number;
  proposedAmount: number;
  remainingAvailableLiquidity: number;
  unfundedAmount: number;
  feasibleCount: number;
  deferredCount: number;
  fullyFundedCount: number;
  partiallyFundedCount: number;
  unfundedObligationCount: number;
  deadlineCompliantCount: number;
  liquidityUtilizationPercent: number;
  availableLiquidity: number;
  routeUsage: Record<string, number>;
  routeCapacityUtilizationPercent: Record<string, number>;
  overcommitment: number;
  liquidityOvercommitment: number;
  routeCapacityOvercommitment: number;
};

const priorities: Priority[] = ["High", "Medium", "Low"];
const rank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const near = (a: number, b: number) => Math.abs(a - b) < 0.005;

export function validateScenario(s: Scenario): number {
  const finiteNonNegative = (v: number) => Number.isFinite(v) && v >= 0;
  if (!finiteNonNegative(s.totalLiquidity)) throw new Error("Total liquidity must be non-negative");
  for (const [name, value] of [["reserved liquidity", s.reservedLiquidity], ["committed liquidity", s.committedLiquidity]] as const) {
    if (!finiteNonNegative(value)) throw new Error(`${name} must be non-negative`);
  }
  const available = round(s.totalLiquidity - s.reservedLiquidity - s.committedLiquidity);
  if (available < 0) throw new Error("Reserved and committed liquidity exceed total liquidity");
  const obligationIds = new Set<string>();
  if (s.obligations.length > 8) throw new Error("At most 8 obligations are supported per scenario");
  if (s.routes.length > 32) throw new Error("At most 32 routes are supported per scenario");
  for (const o of s.obligations) {
    if (!o.id.trim() || obligationIds.has(o.id)) throw new Error(`Obligation IDs must be non-empty and unique: ${o.id}`);
    obligationIds.add(o.id);
    if (!o.destination.trim()) throw new Error(`Destination is required for ${o.id}`);
    if (!o.corridor.trim()) throw new Error(`Corridor is required for ${o.id}`);
    if (!Number.isFinite(o.amount) || o.amount <= 0) throw new Error(`Invalid amount for ${o.id}`);
    if (!priorities.includes(o.priority)) throw new Error(`Invalid priority for ${o.id}`);
    if (!Number.isFinite(o.deadlineHours) || o.deadlineHours <= 0) throw new Error(`Invalid deadline for ${o.id}`);
    if (typeof o.allowSplit !== "boolean") throw new Error(`Invalid split policy for ${o.id}`);
  }
  const routeIds = new Set<string>();
  const routesPerCorridor = new Map<string, number>();
  for (const r of s.routes) {
    if (!r.id.trim() || routeIds.has(r.id)) throw new Error(`Route IDs must be non-empty and unique: ${r.id}`);
    routeIds.add(r.id);
    if (!r.provider.trim() || !r.rail.trim()) throw new Error(`Provider and rail labels are required for route ${r.id}`);
    if (typeof r.available !== "boolean" || typeof r.failed !== "boolean") throw new Error(`Invalid availability state for route ${r.id}`);
    routesPerCorridor.set(r.corridor, (routesPerCorridor.get(r.corridor) ?? 0) + 1);
    if (routesPerCorridor.get(r.corridor)! > 4) throw new Error(`At most 4 routes per corridor are supported: ${r.corridor}`);
    if (!r.corridor.trim()) throw new Error(`Corridor is required for route ${r.id}`);
    for (const [name, value] of [["capacity", r.capacityEUR], ["feeBps", r.feeBps], ["fxBps", r.fxBps], ["fixed fee", r.fixedFee], ["settlement time", r.settlementHours]] as const) {
      if (!finiteNonNegative(value)) throw new Error(`Invalid ${name} for route ${r.id}`);
    }
  }
  return available;
}

export function routeCost(route: Route, amount: number): number {
  return round((amount * (route.feeBps + route.fxBps)) / 10_000 + route.fixedFee);
}
function candidates(s: Scenario, o: Obligation): Route[] {
  return s.routes.filter(r => r.corridor === o.corridor && r.available && !r.failed && r.settlementHours <= o.deadlineHours)
    .sort((a, b) => routeCost(a, o.amount) - routeCost(b, o.amount) || a.settlementHours - b.settlementHours || a.id.localeCompare(b.id));
}
function ordered(s: Scenario) {
  return [...s.obligations].sort((a, b) => rank[a.priority] - rank[b.priority] || a.deadlineHours - b.deadlineHours || a.id.localeCompare(b.id));
}

/** Independent proposals intentionally ignore aggregate use; they are not reservations or executable instructions. */
export function planPayments(s: Scenario, mode: Plan["mode"]): Plan {
  const available = validateScenario(s);
  const obligations = mode === "portfolio" ? ordered(s) : [...s.obligations].sort((a, b) => a.id.localeCompare(b.id));
  const eligible = new Map(obligations.map(o => [o.id, candidates(s, o)]));
  const decisions: PaymentDecision[] = [];
  const routeUsage: Record<string, number> = {};
  if (mode === "independent") {
    for (const o of obligations) {
      const route = eligible.get(o.id)!.find(r => o.amount <= available && o.amount <= r.capacityEUR);
      decisions.push(route ? { obligationId: o.id, action: "PROPOSE", routeId: route.id, amount: o.amount, cost: routeCost(route, o.amount), liquidityAfter: available,
        explanation: "Individually fits the starting balance and route limit; shared use is not reserved in this comparison." }
        : { obligationId: o.id, action: eligible.get(o.id)!.length ? "UNFUNDED" : "NO_ROUTE", amount: 0, cost: 0, liquidityAfter: available,
          explanation: eligible.get(o.id)!.length ? "No eligible route and starting balance can fund the full obligation." : "No available corridor route meets the deadline." });
    }
    const proposed = decisions.reduce((sum, d) => sum + d.amount, 0);
    for (const d of decisions) if (d.routeId) routeUsage[d.routeId] = (routeUsage[d.routeId] ?? 0) + d.amount;
    return summarize(mode, decisions, s, available, routeUsage);
  }

  // Enumerate full-payment placements (at most 5^8 branches), then use leftover
  // capacity for allowed partials. Priority is lexicographic; ties minimize cost.
  let best: PaymentDecision[] | undefined;
  let bestUsage: Record<string, number> = {};
  const usage: Record<string, number> = {};
  const chosen: (PaymentDecision | undefined)[] = Array(obligations.length).fill(undefined);
  const compare = (a: PaymentDecision[], b: PaymentDecision[]) => {
    for (const p of priorities) {
      const av = a.filter(d => obligations.find(o => o.id === d.obligationId)!.priority === p).reduce((n, d) => n + d.amount, 0);
      const bv = b.filter(d => obligations.find(o => o.id === d.obligationId)!.priority === p).reduce((n, d) => n + d.amount, 0);
      if (!near(av, bv)) return av > bv ? 1 : -1;
    }
    for (const p of priorities) {
      const av = a.filter(d => obligations.find(o => o.id === d.obligationId)!.priority === p && near(d.amount, obligations.find(o => o.id === d.obligationId)!.amount)).length;
      const bv = b.filter(d => obligations.find(o => o.id === d.obligationId)!.priority === p && near(d.amount, obligations.find(o => o.id === d.obligationId)!.amount)).length;
      if (av !== bv) return av > bv ? 1 : -1;
    }
    const ac = a.reduce((n, d) => n + d.cost, 0), bc = b.reduce((n, d) => n + d.cost, 0);
    if (!near(ac, bc)) return ac < bc ? 1 : -1;
    for (const o of obligations) {
      const av = a.find(d => d.obligationId === o.id)!;
      const bv = b.find(d => d.obligationId === o.id)!;
      if (!near(av.amount, bv.amount)) return av.amount > bv.amount ? 1 : -1;
      if (av.routeId !== bv.routeId) return (av.routeId ?? "") < (bv.routeId ?? "") ? 1 : -1;
    }
    return 0;
  };
  const visit = (i: number, funds: number) => {
    if (i === obligations.length) {
      const leafUsage = { ...usage }, leaf = [...chosen];
      let remaining = funds;
      for (let j = 0; j < obligations.length; j++) {
        const o = obligations[j];
        if (leaf[j] || !o.allowSplit || remaining <= 0.005) continue;
        const route = eligible.get(o.id)!.filter(r => (leafUsage[r.id] ?? 0) < r.capacityEUR)
          .sort((a, b) => routeCost(a, Math.min(o.amount, remaining, a.capacityEUR - (leafUsage[a.id] ?? 0))) - routeCost(b, Math.min(o.amount, remaining, b.capacityEUR - (leafUsage[b.id] ?? 0))) || a.id.localeCompare(b.id))[0];
        if (!route) continue;
        const amount = round(Math.min(o.amount, remaining, route.capacityEUR - (leafUsage[route.id] ?? 0)));
        if (amount > 0.005) {
          leaf[j] = { obligationId: o.id, action: "PARTIAL", routeId: route.id, amount, cost: routeCost(route, amount), liquidityAfter: 0, explanation: "Partial amount fits remaining treasury and route capacity; no transfer is initiated." };
          leafUsage[route.id] = (leafUsage[route.id] ?? 0) + amount; remaining -= amount;
        }
      }
      const completed = obligations.map((o, j) => leaf[j] ?? { obligationId: o.id, action: eligible.get(o.id)!.length ? "UNFUNDED" : "NO_ROUTE", amount: 0, cost: 0, liquidityAfter: remaining, explanation: eligible.get(o.id)!.length ? "Insufficient shared liquidity or route capacity." : "No available corridor route meets the deadline." } as PaymentDecision);
      if (!best || compare(completed, best) > 0) { best = completed; bestUsage = leafUsage; }
      return;
    }
    const o = obligations[i];
    chosen[i] = undefined;
    visit(i + 1, funds);
    if (o.amount > funds + 0.005) return;
    for (const r of eligible.get(o.id)!) {
      if (o.amount > r.capacityEUR - (usage[r.id] ?? 0) + 0.005) continue;
      usage[r.id] = (usage[r.id] ?? 0) + o.amount;
      chosen[i] = { obligationId: o.id, action: "ALLOCATE", routeId: r.id, amount: o.amount, cost: routeCost(r, o.amount), liquidityAfter: 0, explanation: "Full amount fits shared liquidity, deadline, corridor and route capacity; no transfer is initiated." };
      visit(i + 1, funds - o.amount);
      usage[r.id] -= o.amount;
      if (usage[r.id] < 0.005) delete usage[r.id];
    }
    chosen[i] = undefined;
  };
  visit(0, available);
  decisions.push(...(best ?? []));
  let remaining = available;
  for (let i = 0; i < decisions.length; i++) { remaining = round(remaining - decisions[i].amount); decisions[i].liquidityAfter = remaining; }
  return summarize(mode, decisions, s, available, bestUsage);
}

function summarize(mode: Plan["mode"], decisions: PaymentDecision[], s: Scenario, available: number, routeUsage: Record<string, number>): Plan {
  const proposed = decisions.reduce((n, d) => n + d.amount, 0);
  const allocatedLiquidity = mode === "portfolio" ? proposed : 0;
  const obligationsTotal = s.obligations.reduce((n, o) => n + o.amount, 0);
  const liquidityOvercommitment = mode === "independent" ? round(Math.max(0, proposed - available)) : 0;
  const routeCapacityOvercommitment = mode === "independent" ? round(Object.entries(routeUsage).reduce((sum, [id, amount]) => sum + Math.max(0, amount - s.routes.find(r => r.id === id)!.capacityEUR), 0)) : 0;
  for (const d of decisions) {
    const o = s.obligations.find(item => item.id === d.obligationId)!;
    const parts = s.routes.map(r => {
      if (r.corridor !== o.corridor) return `${r.id}: corridor mismatch`;
      if (!r.available) return `${r.id}: unavailable`;
      if (r.failed) return `${r.id}: failed`;
      if (r.settlementHours > o.deadlineHours) return `${r.id}: ${r.settlementHours}h exceeds ${o.deadlineHours}h deadline`;
      const used = routeUsage[r.id] ?? 0;
      if (r.id === d.routeId) return `${r.id}: selected (${round(used)}/${r.capacityEUR} EUR capacity used)`;
      const routeRemainder = round(r.capacityEUR - used);
      if (mode === "portfolio" && routeRemainder + 0.005 < o.amount && !(o.allowSplit && routeRemainder > 0.005)) return `${r.id}: only ${routeRemainder} capacity remains for ${o.amount} required`;
      if (mode === "portfolio" && used + 0.005 >= r.capacityEUR) return `${r.id}: capacity exhausted by this plan`;
      return `${r.id}: eligible alternative; estimated full cost ${routeCost(r, o.amount)}`;
    });
    const outcome = d.amount === 0 ? d.explanation : `${d.action === "PARTIAL" ? "Partial" : mode === "independent" ? "Proposed" : "Planned"} ${d.amount} of ${o.amount} EUR-equivalent; modeled cost ${d.cost}.`;
    const resourceEffect = mode === "portfolio" && d.amount > 0 ? `Consumes ${d.amount} shared EUR liquidity; ${d.liquidityAfter} remains after this plan item.` : mode === "independent" && d.amount > 0 ? "Does not consume shared liquidity or route capacity." : "No liquidity allocated.";
    d.trace = [outcome, resourceEffect, ...parts];
  }
  return { mode, decisions, totalCost: round(decisions.reduce((n, d) => n + d.cost, 0)), obligationsTotal,
    totalLiquidity: s.totalLiquidity, openingReservedLiquidity: s.reservedLiquidity, openingCommittedLiquidity: s.committedLiquidity,
    allocatedLiquidity, proposedAmount: mode === "independent" ? proposed : 0,
    remainingAvailableLiquidity: round(available - allocatedLiquidity), unfundedAmount: round(Math.max(0, obligationsTotal - proposed)),
    feasibleCount: decisions.filter(d => d.action === "ALLOCATE" || d.action === "PROPOSE").length,
    deferredCount: decisions.filter(d => d.action === "UNFUNDED" || d.action === "NO_ROUTE").length,
    fullyFundedCount: decisions.filter(d => d.action === "ALLOCATE" || d.action === "PROPOSE").length,
    partiallyFundedCount: decisions.filter(d => d.action === "PARTIAL").length,
    unfundedObligationCount: decisions.filter(d => d.action === "UNFUNDED" || d.action === "NO_ROUTE").length,
    deadlineCompliantCount: decisions.filter(d => d.amount > 0 && s.routes.some(r => r.id === d.routeId && r.settlementHours <= s.obligations.find(o => o.id === d.obligationId)!.deadlineHours)).length,
    liquidityUtilizationPercent: available > 0 ? round(((mode === "portfolio" ? allocatedLiquidity : proposed) / available) * 100) : 0,
    availableLiquidity: available, routeUsage,
    routeCapacityUtilizationPercent: Object.fromEntries(s.routes.map(r => [r.id, r.capacityEUR > 0 ? round(((routeUsage[r.id] ?? 0) / r.capacityEUR) * 100) : 0])),
    overcommitment: Math.max(liquidityOvercommitment, routeCapacityOvercommitment), liquidityOvercommitment, routeCapacityOvercommitment };
}

export function comparePlans(s: Scenario) { return { independent: planPayments(s, "independent"), portfolio: planPayments(s, "portfolio") }; }
