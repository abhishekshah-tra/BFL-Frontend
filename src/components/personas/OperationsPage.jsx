"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  CT_TIMEFRAME_KEY,
  OPS_TIMEFRAME_DATA
} from "@/data/personas/personasData";
import { Header } from "@/components/layout/Header";
import { useLayout } from "@/components/layout/LayoutContext";
import { PersonasScope } from "./PersonasScope";
import { usePersonasUI } from "./PersonasUI";
import { LiveFeedBar, TypewriterValue } from "@/components/common/TypewriterValue";
const OPS_LAST_UPDATED = /* @__PURE__ */ new Date("2025-05-20T10:30:00+04:00");
const WAREHOUSES = ["TECHNO", "YOTO", "JAFZA"];
const TIMEFRAME_LABELS = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 Days"
};
const FLOW_STEPS = [
  { key: "Receive", label: "1. Receive", emoji: "\u{1F69A}" },
  { key: "Checking", label: "2. Checking", emoji: "\u{1F50D}" },
  { key: "Tagging", label: "3. Tagging", emoji: "\u{1F3F7}\uFE0F" },
  { key: "Allocation", label: "4. Allocation", emoji: "\u229E" },
  {
    key: "Robo Sorting",
    label: <>
        5. Robo / Manual
        <br />
        Sorting
      </>
  },
  { key: "Staging", label: "6. Staging", emoji: "\u{1F4E6}" },
  { key: "Dispatch", label: "7. Dispatch", emoji: "\u{1F69B}" }
];
const FLOW_STATUS_LABEL = {
  good: "Good",
  "at-risk": "At Risk",
  critical: "Critical"
};
const SCENARIOS = {
  "1": "Volume +30%: Queue at Robo Sorting would grow to ~1,530 units. SLA would drop to approximately 72%. Recommend proactive rerouting before peak hours.",
  "2": "Resource Optimization: Adding 2 robots and 2 operators reduces utilization to 78%, cuts queue by 45%, and improves SLA by 5%.",
  "3": "Robo vs Manual vs Hybrid: Hybrid model with +2 Robots and +2 Operators delivers best throughput (+18%), lowest wait time (-24%), and highest SLA gain (+5%)."
};
function isWarehouse(value) {
  return value === "TECHNO" || value === "YOTO" || value === "JAFZA";
}
function buildOpsLiveFeed(warehouse, data) {
  const critical = data.processes.filter((row) => row.status === "Critical").length;
  return [
    `${warehouse} throughput ${data.kpis.throughput} ${data.kpis.unit} · ${data.kpis.throughputTrend}`,
    `Capacity ${data.kpis.capacity} · SLA ${data.kpis.sla} · wait ${data.kpis.wait} mins · ${data.kpis.alerts} alerts`,
    `${data.insight.subtitle} · ${data.insight.text}`,
    `${critical} critical process${critical === 1 ? "" : "es"} on the floor`,
  ];
}
function RoboIcon() {
  return <svg
    className="step-icon-svg"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
      <rect x="16" y="40" width="16" height="3" rx="1.5" fill="currentColor" />
      <rect x="20" y="36" width="8" height="4" rx="1" fill="currentColor" />
      <path d="M24 36V26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="26" r="2.5" fill="currentColor" />
      <path d="M24 26L14 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="14" cy="16" r="2.5" fill="currentColor" />
      <path d="M14 16L20 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="8" r="2" fill="currentColor" />
      <path d="M18 8V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M22 8V4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 4H23" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>;
}
function queryValue(query, key) {
  const value = query[key];
  return typeof value === "string" ? value : null;
}

function OperationsContent() {
  const router = useRouter();
  const { showToast, showModal, navigateTo } = usePersonasUI();
  const initialWh = queryValue(router.query, "warehouse");
  const [warehouse, setWarehouse] = useState(
    isWarehouse(initialWh) ? initialWh : "TECHNO"
  );
  const [timeframe, setTimeframe] = useState("today");
  const [loading, setLoading] = useState(false);
  const [displayWh, setDisplayWh] = useState(warehouse);
  const [displayTf, setDisplayTf] = useState(timeframe);
  useEffect(() => {
    if (!router.isReady) return;
    const wh = queryValue(router.query, "warehouse");
    if (isWarehouse(wh)) {
      setWarehouse(wh);
      setDisplayWh(wh);
    }
  }, [router.isReady, router.query]);
  const data = useMemo(
    () => OPS_TIMEFRAME_DATA[displayTf][displayWh],
    [displayTf, displayWh]
  );
  const streamKey = `${displayTf}:${displayWh}`;
  const liveFeed = useMemo(() => buildOpsLiveFeed(displayWh, data), [displayWh, data]);
  const fetchData = useCallback(
    (tf, wh, opts = {}) => {
      setLoading(true);
      setWarehouse(wh);
      setTimeframe(tf);
      if (!opts.silent) {
        showToast(`Fetching Operations data \u2013 ${TIMEFRAME_LABELS[tf]}, ${wh}\u2026`);
      }
      window.setTimeout(() => {
        setDisplayTf(tf);
        setDisplayWh(wh);
        setLoading(false);
        if (!opts.silent) {
          showToast(`Operations updated \u2013 ${TIMEFRAME_LABELS[tf]} (${wh}) loaded.`);
        }
      }, 450);
    },
    [showToast]
  );
  const openProcess = (process) => {
    navigateTo("process", { warehouse: displayWh, process });
  };
  return <div
    id="page-operations"
    className={`page-view active${loading ? " ops-loading" : ""}`}
  >
      {/* <div className="page-banner green">
        2. OPERATIONS MANAGER LANDING PAGE – OPERATIONS OVERVIEW
      </div> */}

      <div className="ops-header-block">
        <h2>Operations Overview</h2>
        <div className="ops-filter-row">
          <div className="ops-filter-group">
            <div className="filter-label-wrap">
              <label htmlFor="ops-warehouse">Warehouse</label>
            <select
              className="filter-select"
              id="ops-warehouse"
              value={warehouse}
              onChange={(e) => fetchData(timeframe, e.target.value)}
            >
                {WAREHOUSES.map((w) => <option key={w} value={w}>
                    {w}
                  </option>)}
              </select>
            </div>
            <select
    className="filter-select"
    id="ops-timeframe"
    value={TIMEFRAME_LABELS[timeframe]}
    onChange={(e) => {
      const key = CT_TIMEFRAME_KEY[e.target.value];
      if (key) fetchData(key, warehouse);
    }}
  >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <span className="live-badge">● Live</span>
        </div>
      </div>

      <LiveFeedBar strings={liveFeed} streamKey={streamKey} />

      <div className="kpi-row" id="ops-kpi-row">
        <div
    className="kpi-card"
    role="button"
    tabIndex={0}
    onClick={() => showModal("Throughput", data.kpis.throughputDetail)}
  >
          <div className="kpi-icon">📦</div>
          <div className="kpi-label">Throughput</div>
          <div className="kpi-value">
            <span>
              <TypewriterValue text={data.kpis.throughput} speed={28} delayMs={0} streamKey={streamKey} />
            </span>{" "}
            <span className="kpi-value-sm">{data.kpis.unit}</span>
          </div>
          <div className={`kpi-trend ${data.kpis.throughputTrendClass}`}>
            <TypewriterValue text={data.kpis.throughputTrend} speed={18} delayMs={180} streamKey={streamKey} />
          </div>
        </div>
        <div
    className="kpi-card"
    role="button"
    tabIndex={0}
    onClick={() => showModal("Capacity Utilization", data.kpis.capacityDetail)}
  >
          <div className="kpi-icon">📊</div>
          <div className="kpi-label">Capacity Utilization</div>
          <div className="kpi-value">
            <TypewriterValue text={data.kpis.capacity} speed={36} delayMs={80} streamKey={streamKey} />
          </div>
          <div className={`kpi-trend ${data.kpis.capacityTrendClass}`}>
            <TypewriterValue text={data.kpis.capacityTrend} speed={18} delayMs={240} streamKey={streamKey} />
          </div>
        </div>
        <div
    className="kpi-card"
    role="button"
    tabIndex={0}
    onClick={() => showModal("SLA Achievement", data.kpis.slaDetail)}
  >
          <div className="kpi-icon">✅</div>
          <div className="kpi-label">SLA Achievement</div>
          <div className="kpi-value">
            <TypewriterValue text={data.kpis.sla} speed={36} delayMs={160} streamKey={streamKey} />
          </div>
          <div className={`kpi-trend ${data.kpis.slaTrendClass}`}>
            <TypewriterValue text={data.kpis.slaTrend} speed={18} delayMs={300} streamKey={streamKey} />
          </div>
        </div>
        <div
    className="kpi-card"
    role="button"
    tabIndex={0}
    onClick={() => openProcess("Robo Sorting")}
  >
          <div className="kpi-icon">⏱️</div>
          <div className="kpi-label">Avg. Waiting Time</div>
          <div className="kpi-value">
            <span>
              <TypewriterValue text={data.kpis.wait} speed={40} delayMs={220} streamKey={streamKey} />
            </span>{" "}
            <span className="kpi-value-sm">mins</span>
          </div>
          <div className={`kpi-trend ${data.kpis.waitTrendClass}`}>
            <TypewriterValue text={data.kpis.waitTrend} speed={18} delayMs={360} streamKey={streamKey} />
          </div>
        </div>
        <div
    className="kpi-card"
    role="button"
    tabIndex={0}
    onClick={() => showModal("Active Alerts", data.kpis.alertsDetail)}
  >
          <div className="kpi-icon">🔔</div>
          <div className="kpi-label">Active Alerts</div>
          <div className="kpi-value" style={{ color: "#dc2626" }}>
            <TypewriterValue text={data.kpis.alerts} speed={50} delayMs={280} streamKey={streamKey} />
          </div>
          <div
    className="kpi-link"
    onClick={(e) => {
      e.stopPropagation();
      openProcess("Robo Sorting");
    }}
  >
            View all
          </div>
        </div>
      </div>

      <div className="process-flow-card">
        <div className="section-title">Process Flow Performance</div>
        <div className="process-flow" id="process-flow">
          {FLOW_STEPS.map((step, idx) => {
    const status = data.flow[step.key];
    return <div key={step.key} style={{ display: "contents" }}>
                {idx > 0 ? <span className="process-arrow">→</span> : null}
                <div className="process-step">
                  <div
      className={`process-step-box${status === "critical" ? " highlight" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => openProcess(step.key)}
    >
                    <div className="step-icon">
                      {step.key === "Robo Sorting" ? <RoboIcon /> : step.emoji}
                    </div>
                    <div className="step-label">{step.label}</div>
                    <span className={`status-pill ${status}`}>
                      {FLOW_STATUS_LABEL[status]}
                    </span>
                  </div>
                </div>
              </div>;
  })}
        </div>
      </div>

      <div className="process-table-card">
        <table className="data-table ops-table" id="process-table">
          <thead>
            <tr>
              <th>Process</th>
              <th>Workload (Units/hr)</th>
              <th>Capacity (Units/hr)</th>
              <th>Utilization</th>
              <th>Queue (Units)</th>
              <th>Avg. Wait (mins)</th>
              <th>SLA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.processes.map((row, i) => <tr
    key={row.key}
    className={`${row.rowCritical ? "row-critical" : ""}${row.key === "Robo Sorting" ? " selected" : ""}`}
    onClick={() => openProcess(row.key)}
  >
                <td>
                  {row.key === "Robo Sorting" ? "Robo / Manual Sorting" : row.key}
                </td>
                <td className={row.workloadClass}>
                  <TypewriterValue text={row.workload} speed={22} delayMs={200 + i * 40} streamKey={streamKey} />
                </td>
                <td className={row.capacityClass}>
                  <TypewriterValue text={row.capacity} speed={22} delayMs={220 + i * 40} streamKey={streamKey} />
                </td>
                <td className={row.utilClass}>
                  <TypewriterValue text={row.util} speed={24} delayMs={240 + i * 40} streamKey={streamKey} />
                </td>
                <td className={row.queueClass}>
                  <TypewriterValue text={row.queue} speed={22} delayMs={260 + i * 40} streamKey={streamKey} />
                </td>
                <td className={row.waitClass}>
                  <TypewriterValue text={row.wait} speed={24} delayMs={280 + i * 40} streamKey={streamKey} />
                </td>
                <td className={row.slaClass}>
                  <TypewriterValue text={row.sla} speed={24} delayMs={300 + i * 40} streamKey={streamKey} />
                </td>
                <td>
                  <span className={`status-pill ${row.statusClass}`}>{row.status}</span>
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>

      <div className="bottom-grid-2">
        <div className="insight-box widget-card">
          <div className="section-title">Bottleneck Insight</div>
          <div className="insight-subtitle">
            <TypewriterValue text={data.insight.subtitle} speed={22} delayMs={360} streamKey={streamKey} />
          </div>
          <div className="insight-text">
            <TypewriterValue className="ct-tw-block" text={data.insight.text} speed={16} delayMs={420} cursor="▌" streamKey={streamKey} />
          </div>
          <span
    className="insight-link"
    role="button"
    tabIndex={0}
    onClick={() => openProcess("Robo Sorting")}
  >
            View Root Cause Analysis →
          </span>
        </div>
        <div className="widget-card">
          <div className="section-title">What If Scenarios</div>
          <ul className="scenario-list">
            {["1", "2", "3"].map((id) => <li
    key={id}
    role="button"
    tabIndex={0}
    onClick={() => showModal(`What If Scenario ${id}`, SCENARIOS[id], "process")}
  >
                Scenario {id}:{" "}
                {id === "1" ? "Volume +30%" : id === "2" ? "Resource Optimization" : "Robo vs Manual vs Hybrid"}{" "}
                <span className="scenario-chevron">›</span>
              </li>)}
          </ul>
        </div>
      </div>

      <div className="ops-focus-block">
        <strong>Focus:</strong> Understand operations, bottlenecks and options
        <br />
        <strong>KPIs shown:</strong> Process level with workload, capacity and SLA
      </div>
    </div>;
}
function OperationsPage() {
  const { onMenuClick } = useLayout();
  return <div className="page">
      <Header
    lastUpdated={OPS_LAST_UPDATED}
    isRefreshing={false}
    onRefresh={() => void 0}
    onMenuClick={onMenuClick}
    title="Operations"
    subtitle="Operations manager landing page — bottlenecks, flow and process performance"
  />
      <div className="page-body">
        <PersonasScope>
          <OperationsContent />
        </PersonasScope>
      </div>
    </div>;
}
export {
  OperationsPage
};
