import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  GitBranch,
  Layers3,
  Plus,
  RotateCcw,
  ShieldCheck,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";
import {
  comparePlans,
  type Obligation,
  type Priority,
  type Scenario,
} from "./engine/orchestrator";
import { initialScenario, scenarios } from "./engine/scenarios";

const money = (n: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
const actionLabel: Record<string, string> = {
  PROPOSE: "Independent proposal",
  ALLOCATE: "Planned allocation",
  PARTIAL: "Partial allocation",
  UNFUNDED: "Requires funding",
  NO_ROUTE: "No feasible route",
};
const displayAction = (action: string, mode: "portfolio" | "independent") =>
  action === "PROPOSE" && mode === "independent"
    ? "Proposal · no reservation"
    : (actionLabel[action] ?? actionLabel.NO_ROUTE);

export default function App() {
  const [scenario, setScenario] = useState<Scenario>(() =>
    structuredClone(initialScenario),
  );
  const [activeMode, setActiveMode] = useState<"portfolio" | "independent">(
    "portfolio",
  );
  const [activePage, setActivePage] = useState("Overview");
  const [notice, setNotice] = useState("");
  const plans = useMemo(() => comparePlans(scenario), [scenario]);
  const selected = plans[activeMode];
  const actions = () =>
    setNotice(
      `Recalculated from current inputs at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
    );
  const changeObligation = (id: string, changes: Partial<Obligation>) =>
    setScenario((s) => ({
      ...s,
      obligations: s.obligations.map((o) =>
        o.id === id ? { ...o, ...changes } : o,
      ),
    }));
  const addObligation = () =>
    setScenario((s) => ({
      ...s,
      obligations: [
        ...s.obligations,
        {
          id: `PAY-${String(s.obligations.length + 1).padStart(3, "0")}`,
          destination: "Brazil",
          corridor: "EUR-BRL",
          amount: 50000,
          priority: "Low",
          deadlineHours: 48,
          allowSplit: false,
        },
      ],
    }));
  const updateRoute = (
    id: string,
    changes: Partial<Scenario["routes"][number]>,
  ) =>
    setScenario((s) => ({
      ...s,
      routes: s.routes.map((r) => (r.id === id ? { ...r, ...changes } : r)),
    }));
  const obligationsTotal = scenario.obligations.reduce(
    (a, o) => a + o.amount,
    0,
  );
  const nav = [
    "Overview",
    "Orchestration Lab",
    "Architecture",
    "Evidence",
    "Foundations",
  ];

  return (
    <div className="shell">
      <header className="topbar">
        <a
          className="brand"
          href="#top"
          onClick={() => setActivePage("Overview")}
        >
          <span className="brand-mark">
            <span />
            <span />
          </span>
          CAPITALFLOW
        </a>
        <nav>
          {nav.map((n) => (
            <a
              key={n}
              className={activePage === n ? "active" : ""}
              href={`#${n.toLowerCase().replaceAll(" ", "-")}`}
              onClick={() => setActivePage(n)}
            >
              {n}
            </a>
          ))}
        </nav>
        <a
          className="top-cta"
          href="#orchestration-lab"
          onClick={() => setActivePage("Orchestration Lab")}
        >
          Open demonstrator <ArrowRight size={15} />
        </a>
      </header>
      <main id="top">
        <section className="hero" id="overview">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              PAYMENT EXECUTION INTELLIGENCE
            </div>
            <h1>
              Payment execution is becoming programmable.
              <br />
              <em>Treasury coordination is still fragmented.</em>
            </h1>
            <p>
              Evaluate payment routes against liquidity, concurrent obligations
              and settlement constraints. Make the portfolio visible before
              money moves.
            </p>
            <div className="hero-actions">
              <a
                className="primary-button"
                href="#orchestration-lab"
                onClick={() => setActivePage("Orchestration Lab")}
              >
                Explore the orchestration lab <ArrowRight size={16} />
              </a>
              <a href="#architecture" className="text-link">
                View architecture <ArrowDownRight size={15} />
              </a>
            </div>
          </div>
          <div className="hero-figure">
            <div className="figure-head">
              <span>ILLUSTRATIVE TREASURY POSITION</span>
              <span className="live-dot">SYNTHETIC</span>
            </div>
            <div className="figure-main">
              <div>
                <small>Available liquidity</small>
                <strong>{money(plans.portfolio.availableLiquidity)}</strong>
              </div>
              <div className="figure-line" />
              <div>
                <small>Payment obligations</small>
                <strong>{money(obligationsTotal)}</strong>
              </div>
            </div>
            <div className="figure-foot">
              <span>
                <CircleAlert size={15} />
                Funding gap
              </span>
              <b
                className={
                  Math.max(0, obligationsTotal - plans.portfolio.availableLiquidity) > 0
                    ? "gap"
                    : ""
                }
              >
                {money(Math.max(0, obligationsTotal - plans.portfolio.availableLiquidity))}
              </b>
            </div>
            <div className="figure-caption">
              Total {money(scenario.totalLiquidity)} · opening reserved {money(scenario.reservedLiquidity)} · committed {money(scenario.committedLiquidity)}. Plans are local recommendations only.
            </div>
          </div>
        </section>

        <section className="lab-section" id="orchestration-lab">
          <div className="section-heading">
            <div>
              <div className="eyebrow">INTERACTIVE DEMONSTRATOR</div>
              <h2>Orchestration Lab</h2>
              <p>
                Edit the synthetic scenario. Every result recalculates from the
                inputs below.
              </p>
            </div>
            <div className="scenario-control">
              <label htmlFor="scenario-select">Load scenario</label>
              <select
                id="scenario-select"
                onChange={(e) =>
                  setScenario(structuredClone(scenarios[e.target.value]))
                }
                defaultValue="baseline"
              >
                <option value="baseline">Baseline · €500k</option>
                <option value="capacity-tradeoff">Route capacity trade-off · €200k</option>
                <option value="liquidity-shortfall">
                  Liquidity stress · €420k
                </option>
                <option value="route-failure">Route failure</option>
                <option value="concurrent-obligations">
                  Concurrent obligations
                </option>
              </select>
            </div>
          </div>
          <div className="toolbar">
            <div
              className="mode-control"
              role="group"
              aria-label="Routing mode"
            >
              <button
                onClick={() => setActiveMode("independent")}
                className={activeMode === "independent" ? "selected" : ""}
              >
                Transaction-level
              </button>
              <button
                onClick={() => setActiveMode("portfolio")}
                className={activeMode === "portfolio" ? "selected" : ""}
              >
                Portfolio-aware
              </button>
            </div>
            <span className="toolbar-caption">
              {activeMode === "portfolio"
                ? "Shared liquidity and route limits coordinated"
                : "Independent proposals · shared limits not reserved"}
            </span>
            <button className="recalc" onClick={actions}>
              <RotateCcw size={14} /> Recalculate
            </button>
          </div>
          <div className="lab-grid">
            <div className="input-panel">
              <div className="panel-title">
                <h3>
                  <WalletCards size={17} /> Treasury & obligations
                </h3>
                <span className="synthetic-tag">SYNTHETIC</span>
              </div>
              <label className="field-label" htmlFor="liquidity">
                Total liquidity · EUR normalized
              </label>
              <div className="money-input">
                <span>€</span>
                <input
                  id="liquidity"
                  type="number"
                  min="0"
                  step="10000"
                  value={scenario.totalLiquidity}
                  onChange={(e) =>
                    setScenario((s) => ({
                      ...s,
                      totalLiquidity: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                />
              </div>
              <div className="table-head">
                <span>Obligation</span>
                <span>Amount</span>
                <span>Priority</span>
                <span>Deadline</span>
              </div>
              {scenario.obligations.map((o) => (
                <React.Fragment key={o.id}>
                  <div className="obligation-row">
                    <div className="market">
                      <b>{o.destination}</b>
                      <small>{o.id}</small>
                    </div>
                    <input
                      aria-label={`${o.destination} amount`}
                      type="number"
                      min="1"
                      step="10000"
                      value={o.amount}
                      onChange={(e) =>
                        changeObligation(o.id, {
                          amount: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                    <select
                      aria-label={`${o.destination} priority`}
                      value={o.priority}
                      onChange={(e) =>
                        changeObligation(o.id, {
                          priority: e.target.value as Priority,
                        })
                      }
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <select
                      aria-label={`${o.destination} deadline`}
                      value={o.deadlineHours}
                      onChange={(e) =>
                        changeObligation(o.id, {
                          deadlineHours: Number(e.target.value),
                        })
                      }
                    >
                      <option value={12}>12h</option>
                      <option value={24}>24h</option>
                      <option value={48}>48h</option>
                    </select>
                  </div>
                  <label className="split-option">
                    <input
                      type="checkbox"
                      checked={o.allowSplit}
                      onChange={(e) =>
                        changeObligation(o.id, { allowSplit: e.target.checked })
                      }
                    />{" "}
                    Allow partial reservation
                  </label>
                </React.Fragment>
              ))}
              <button className="add-row" onClick={addObligation}>
                <Plus size={14} /> Add obligation
              </button>
              <div className="obligation-total">
                <span>Total obligations</span>
                <b>{money(obligationsTotal)}</b>
              </div>
              <div className="routes-heading">
                <SlidersHorizontal size={14} /> ROUTES & QUOTES
              </div>
              {scenario.routes.map((r) => (
                <div
                  className={`route-row ${!r.available || r.failed ? "muted" : ""}`}
                  key={r.id}
                >
                  <span className="route-check">
                    <input
                      type="checkbox"
                      checked={r.available}
                      onChange={(e) =>
                        updateRoute(r.id, { available: e.target.checked })
                      }
                      aria-label={`Enable ${r.provider} ${r.rail}`}
                    />
                  </span>
                  <div className="route-name">
                    <b>{r.provider}</b>
                    <small>{r.rail} · {r.corridor} · cap {money(r.capacityEUR)} / plan</small>
                  </div>
                  <label>
                    Fee{" "}
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={r.feeBps}
                      onChange={(e) =>
                        updateRoute(r.id, {
                          feeBps: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                    <small>bps</small>
                  </label>
                  <label>
                    FX{" "}
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={r.fxBps}
                      onChange={(e) =>
                        updateRoute(r.id, {
                          fxBps: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                    <small>bps</small>
                  </label>
                  <label>
                    Time{" "}
                    <select
                      value={r.settlementHours}
                      onChange={(e) =>
                        updateRoute(r.id, {
                          settlementHours: Number(e.target.value),
                        })
                      }
                    >
                      <option value={3}>3h</option>
                      <option value={4}>4h</option>
                      <option value={5}>5h</option>
                      <option value={18}>18h</option>
                      <option value={20}>20h</option>
                      <option value={30}>30h</option>
                    </select>
                  </label>
                  <button
                    className={`fail-button ${r.failed ? "is-failed" : ""}`}
                    onClick={() => updateRoute(r.id, { failed: !r.failed })}
                  >
                    {r.failed ? "Failed" : "Simulate failure"}
                  </button>
                </div>
              ))}
            </div>

            <div className="results-panel">
              <div className="panel-title results-title">
                <h3>
                  <Activity size={17} /> Decision comparison
                </h3>
                <span>PER OBLIGATION</span>
              </div>
              <div className="comparison-head">
                <span>Obligation</span>
                <span>Transaction-level</span>
                <span>Portfolio-aware</span>
                <span>Current plan</span>
              </div>
              {scenario.obligations.map((o) => {
                const ind = plans.independent.decisions.find(
                  (d) => d.obligationId === o.id,
                );
                const port = plans.portfolio.decisions.find(
                  (d) => d.obligationId === o.id,
                );
                const d = activeMode === "portfolio" ? port : ind;
                return (
                  <div className="decision-row" key={o.id}>
                    <div className="market">
                      <b>{o.destination}</b>
                      <small>{o.id}</small>
                    </div>
                    <div className="decision-cell">
                      <b>{ind?.routeId ?? "—"}</b>
                      <small>
                        {ind?.action === "PROPOSE"
                          ? money(ind.cost) + " estimated cost"
                          : ind?.explanation}
                      </small>
                    </div>
                    <div className="decision-cell">
                      <b>{port?.routeId ?? "—"}</b>
                      <small>
                        {port?.action === "ALLOCATE" || port?.action === "PARTIAL"
                          ? money(port.cost) + " estimated cost"
                          : port?.explanation}
                      </small>
                    </div>
                    <div className="status-cell">
                      <span className={`status ${d?.action?.toLowerCase()}`}>
                        {displayAction(d?.action ?? "NO_ROUTE", activeMode)}
                      </span>
                      <small>
                        {d?.amount ? money(d.amount) + (activeMode === "independent" ? " proposed" : " planned") : ""}
                      </small>
                      {d?.trace?.length ? (
                        <details className="decision-trace">
                          <summary>Decision trace</summary>
                          <ul>{d.trace.map((line) => <li key={line}>{line}</li>)}</ul>
                        </details>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div className="summary-row">
                <div>
                  <small>Obligations</small>
                  <b>{money(obligationsTotal)}</b>
                </div>
                <div>
                  <small>
                    {activeMode === "portfolio"
                      ? "Planned allocation"
                      : "Proposed total"}
                  </small>
                  <b>{money(activeMode === "portfolio" ? selected.allocatedLiquidity : selected.proposedAmount)}</b>
                </div>
                <div>
                  <small>
                    {activeMode === "portfolio"
                      ? "Remaining"
                      : "Unreserved balance"}
                  </small>
                  <b className={selected.remainingAvailableLiquidity < 0 ? "gap" : ""}>
                    {money(selected.remainingAvailableLiquidity)}
                  </b>
                </div>
                <div>
                  <small>
                    {activeMode === "portfolio" ? "Unfunded" : "Aggregate overcommitment"}
                  </small>
                  <b className={selected.unfundedAmount || selected.overcommitment ? "gap" : ""}>
                    {money(activeMode === "portfolio" ? selected.unfundedAmount : selected.overcommitment)}
                  </b>
                </div>
              </div>
              <div className="explanation">
                <CircleAlert size={17} />
                <span>
                  {activeMode === "portfolio"
                    ? `${selected.feasibleCount} full obligations planned. The bounded portfolio search respects shared treasury liquidity and each route's plan-window capacity. No payment is initiated.`
                    : `Independent proposals total ${money(plans.independent.decisions.reduce((sum, item) => sum + item.amount, 0))}; they do not consume shared limits. Aggregate overcommitment is ${money(plans.independent.overcommitment)}.`}
                </span>
              </div>
              <div className="model-note">
                {selected.fullyFundedCount} full · {selected.partiallyFundedCount} partial · {selected.deadlineCompliantCount} deadline-compliant · {selected.liquidityUtilizationPercent}% {activeMode === "portfolio" ? "available liquidity allocated" : "opening liquidity proposed"}
              </div>
              {activeMode === "independent" && selected.overcommitment > 0 ? (
                <div className="model-note">
                  Excess: {money(selected.liquidityOvercommitment)} liquidity · {money(selected.routeCapacityOvercommitment)} route capacity.
                </div>
              ) : null}
            </div>
          </div>
          <div className="viz-grid">
            <div className="viz-block allocation">
              <div className="viz-title">
                <h3>Liquidity allocation</h3>
                <span>PORTFOLIO-AWARE</span>
              </div>
              <div className="allocation-chart">
                {scenario.obligations.map((o) => {
                  const d = plans.portfolio.decisions.find(
                    (x) => x.obligationId === o.id,
                  );
                  const width = Math.max(
                    0,
                    Math.min(
                      100,
                      ((d?.amount ?? 0) / Math.max(plans.portfolio.availableLiquidity, 1)) *
                        100,
                    ),
                  );
                  return (
                    <div className="allocation-line" key={o.id}>
                      <span>{o.destination}</span>
                      <div className="bar-track">
                        <div className="bar" style={{ width: `${width}%` }} />
                      </div>
                      <b>{money(d?.amount ?? 0)}</b>
                    </div>
                  );
                })}
                <div className="allocation-line">
                  <span>Unallocated</span>
                  <div className="bar-track">
                    <div
                      className="bar unallocated"
                      style={{
                        width: `${Math.max(0, Math.min(100, (selected.remainingAvailableLiquidity / Math.max(plans.portfolio.availableLiquidity, 1)) * 100))}%`,
                      }}
                    />
                  </div>
                  <b>{money(selected.remainingAvailableLiquidity)}</b>
                </div>
                <div className="axis">
                  <span>€0</span>
                  <span>{money(plans.portfolio.availableLiquidity / 2)}</span>
                  <span>{money(plans.portfolio.availableLiquidity)}</span>
                </div>
              </div>
            </div>
            <div className="viz-block cost-block">
              <div className="viz-title">
                <h3>Estimated route cost</h3>
                <span>FEES + FX SPREAD</span>
              </div>
              <div className="cost-line">
                <span>Transaction-level</span>
                <div className="cost-track">
                  <div
                    style={{
                      width: `${Math.min(100, (plans.independent.totalCost / Math.max(plans.independent.totalCost, plans.portfolio.totalCost, 1)) * 100)}%`,
                    }}
                  />
                </div>
                <b>{money(plans.independent.totalCost)}</b>
              </div>
              <div className="cost-line active">
                <span>Portfolio-aware</span>
                <div className="cost-track">
                  <div
                    style={{
                      width: `${Math.min(100, (plans.portfolio.totalCost / Math.max(plans.independent.totalCost, plans.portfolio.totalCost, 1)) * 100)}%`,
                    }}
                  />
                </div>
                <b>{money(plans.portfolio.totalCost)}</b>
              </div>
              <p>
                Cost is calculated on each plan’s allocated amount. A lower
                total can mean less value is planned; compare it with allocated
                amount and funding gap. Repair, capital and delay costs are
                excluded.
              </p>
            </div>
            <div className="viz-block timeline">
              <div className="viz-title">
                <h3>Decision lifecycle</h3>
                <span>ILLUSTRATIVE</span>
              </div>
              <div className="timeline-step">
                <span className="step-icon">
                  <Check size={12} />
                </span>
                <div>
                  <b>Evaluate constraints</b>
                  <small>Currency · deadline · route availability</small>
                </div>
                <small>01</small>
              </div>
              <div className="timeline-step">
                <span className="step-icon">
                  <Check size={12} />
                </span>
                <div>
                  <b>Plan shared liquidity allocation</b>
                  <small>
                    {money(selected.allocatedLiquidity)} allocated in current plan
                  </small>
                </div>
                <small>02</small>
              </div>
              <div className="timeline-step pending">
                <span className="step-icon">
                  <Clock3 size={12} />
                </span>
                <div>
                  <b>Execution and settlement</b>
                  <small>Not connected in this demonstrator</small>
                </div>
                <small>03</small>
              </div>
            </div>
          </div>
          <div className="notice-line">
            {notice && <span>{notice}</span>}
            <span>
              Prototype output is an estimate; decisions are recalculated from
              synthetic inputs only.
            </span>
          </div>
        </section>

        <section className="architecture-section" id="architecture">
          <div className="section-heading">
            <div>
              <div className="eyebrow">SYSTEM DESIGN</div>
              <h2>From obligation to reconciled state.</h2>
              <p>
                The demonstrator separates a decision from the downstream
                movement and verification of money.
              </p>
            </div>
            <div className="section-index">01 — 05</div>
          </div>
          <div className="flow-list">
            {[
              [
                "01",
                "Obligation",
                "Normalise approved payment instructions, beneficiary, corridor, deadline and cost boundary.",
              ],
              [
                "02",
                "Treasury state",
                "Read available balances and existing commitments from connected sources. Synthetic in this demo.",
              ],
              [
                "03",
                "Constraint evaluation",
                "Reject routes that miss deadlines or fail configured route and evidence requirements.",
              ],
              [
                "04",
                "Economic route optimisation",
                "Compare explicit provider fees and FX costs after hard constraints; allocate shared liquidity in the plan.",
              ],
              [
                "05",
                "Settlement & reconciliation",
                "Track provider execution separately, then match observed settlement to the original obligation. Not connected here.",
              ],
            ].map(([n, title, copy]) => (
              <div className="flow-item" key={n}>
                <span>{n}</span>
                <b>{title}</b>
                <p>{copy}</p>
                <ArrowRight size={16} />
              </div>
            ))}
          </div>
          <div className="boundary-note">
            <ShieldCheck size={18} />
            <p>
              <b>Decision ≠ execution ≠ settlement.</b> This is a local
              deterministic simulation. It does not connect to banks, payment
              providers, wallets or blockchain networks.
            </p>
          </div>
        </section>

        <section className="evidence-section" id="evidence">
          <div className="section-heading">
            <div>
              <div className="eyebrow">MARKET EVIDENCE</div>
              <h2>
                Operational friction is documented.
                <br />
                <em>The product gap remains a hypothesis.</em>
              </h2>
            </div>
            <div className="section-index">EVIDENCE / 2026</div>
          </div>
          <div className="evidence-grid">
            <article>
              <div className="source-type">CROSS-BORDER PAYMENTS · SYSTEM LEVEL</div>
              <h3>
                Interoperability and operating windows shape liquidity planning.
              </h3>
              <p>
                Public cross-border payment work identifies system access,
                operating hours, interoperability and data exchange as coupled
                design constraints. This is system-level context, not buyer
                evidence for this demonstrator.
              </p>
              <a
                href="https://www.bis.org/committees/cpmi/cross-border-payments/overview"
                target="_blank"
                rel="noreferrer"
              >
                Read the programme overview <ArrowRight size={14} />
              </a>
            </article>
            <article>
              <div className="source-type">JURISDICTION MONITORING · 2026</div>
              <h3>Payment-system conditions vary across jurisdictions.</h3>
              <p>
                A survey spanning 82 jurisdictions tracks differences in
                interlinking, access, operating hours and message standards. It
                does not measure demand for a separate portfolio planner.
              </p>
              <a
                href="https://www.bis.org/publications/cpmi-brief-13-enhancing-cross-border-payments-step-step-insights-2025-monitoring-survey"
                target="_blank"
                rel="noreferrer"
              >
                Read the monitoring brief <ArrowRight size={14} />
              </a>
            </article>
            <article>
              <div className="source-type">DATA INTEROPERABILITY · 2024</div>
              <h3>
                Data rules affect payment speed, risk controls and privacy.
              </h3>
              <p>
                International recommendations describe the need to align
                cross-border payment data frameworks while preserving privacy
                and financial-crime controls.
              </p>
              <a
                href="https://www.fsb.org/2024/12/recommendations-to-promote-alignment-and-interoperability-across-data-frameworks-related-to-cross-border-payments-final-report/"
                target="_blank"
                rel="noreferrer"
              >
                Read the recommendations <ArrowRight size={14} />
              </a>
            </article>
          </div>
          <div className="pilot-note">
            <div>
              <span>PRODUCT SCOPE</span>
              <b>
                Existing orchestration and treasury systems may already solve
                this workflow.
              </b>
              <small>
                Whether a separate portfolio planner is useful remains a buyer
                discovery question. No customer research or purchase intent is
                claimed.
              </small>
            </div>
            <a
              href="#foundations"
              target="_blank"
              rel="noreferrer"
            >
              Read positioning notes <ArrowRight size={14} />
            </a>
          </div>
          <div className="hypothesis-band">
            <span>WHAT IS ESTABLISHED</span>
            <p>
              Businesses report cross-border cost, FX and reconciliation
              friction; payment systems involve distinct operational boundaries.
            </p>
            <span>WHAT MUST BE VALIDATED</span>
            <p>
              Whether a buyer will adopt a separate portfolio-aware layer, share
              route data, and pay for measured improvements.
            </p>
          </div>
        </section>

        <section className="foundations-section" id="foundations">
          <div className="section-heading">
            <div>
              <div className="eyebrow">TECHNICAL FOUNDATIONS</div>
              <h2>
                Built from related work.
                <br />
                <em>Not presented as an integrated system.</em>
              </h2>
              <p>
                These independent public repositories inform the design. No
                source has been imported from them into this prototype.
              </p>
            </div>
            <div className="section-index">LINEAGE</div>
          </div>
          <div className="foundation-list">
            {[
              [
                "payflow-control-plane",
                "Route economics, hard eligibility gates, synthetic payment lifecycle and concurrent reservations. Primary implementation reference; concepts adapted, code not copied.",
              ],
              [
                "temporal-liquidity-risk",
                "Timing and synchronisation constraints around liquidity demand. Conceptual reference only; source access not verified locally.",
              ],
              [
                "institutional-settlement-state-machine",
                "Explicit settlement state, invariant and reconciliation patterns. Conceptual reference only.",
              ],
              [
                "agentic-financial-consequence",
                "Compares authorised intent with observed financial consequences and settlement evidence. Conceptual reference only.",
              ],
              [
                "agent-trust-probe",
                "Delegated authority and aggregate exposure controls; adjacent input, not the core proposition.",
              ],
              [
                "agentic-finops-ledger",
                "Cost attribution and reconciliation patterns. Not accessed locally; reference status to be confirmed.",
              ],
              [
                "FXRisk",
                "FX risk reference. Repository source not present locally; not reused.",
              ],
              [
                "TWAPexecution",
                "Time-weighted execution reference. Repository source not present locally; not reused.",
              ],
            ].map(([repo, copy]) => (
              <a
                className="foundation-row"
                href={`https://github.com/vishnugovind10/${repo}`}
                target="_blank"
                rel="noreferrer"
                key={repo}
              >
                <GitBranch size={15} />
                <b>{repo}</b>
                <span>{copy}</span>
                <ArrowUpRight size={15} />
              </a>
            ))}
          </div>
          <div className="commercial-band">
            <div>
              <span>INITIAL CUSTOMER HYPOTHESIS</span>
              <h3>
                Cross-border payment fintechs and stablecoin payment
                infrastructure providers.
              </h3>
            </div>
            <p>
              Start with one corridor and historical data in shadow mode.
              Compare route cost, on-time settlement, liquidity use and
              reconciliation exceptions against a documented baseline. No
              savings or operating outcomes are claimed before measurement.
            </p>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="#top">
          <span className="brand-mark">
            <span />
            <span />
          </span>
          CAPITALFLOW
        </a>
        <span>Research prototype · synthetic data · no real payments</span>
        <a
          href="https://github.com/vishnugovind10/capital-aware-payment-orchestration"
          target="_blank"
          rel="noreferrer"
        >
          <BookOpen size={14} /> GitHub repository
        </a>
      </footer>
    </div>
  );
}
