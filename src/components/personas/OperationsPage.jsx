"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { CT_TIMEFRAME_KEY } from "@/data/personas/personasData";
import { Header } from "@/components/layout/Header";
import { useLayout } from "@/components/layout/LayoutContext";
import { PersonasScope } from "./PersonasScope";
import { usePersonasUI } from "./PersonasUI";
import { LiveFeedBar, TypewriterValue } from "@/components/common/TypewriterValue";
import {
  getLocalOperationsDashboard,
  getOperationsDashboard,
  normalizeOpsSlice,
} from "@/services/operations.service";
import { getErrorMessage } from "@/utils/api";

const TIMEFRAME_LABELS = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 Days",
};
const FLOW_STATUS_LABEL = {
  good: "Good",
  "at-risk": "At Risk",
  critical: "Critical",
};

function queryValue(query, key) {
  const value = query[key];
  return typeof value === "string" ? value : "";
}

function matchWarehouse(warehouses, value) {
  if (!warehouses.length) return "";
  const found = warehouses.find(
    (item) => item.code.toLowerCase() === String(value || "").toLowerCase(),
  );
  return found?.code || warehouses[0].code;
}

function stepIcon(name) {
  const label = String(name || "").toLowerCase();
  if (label.includes("sort")) return "robo";
  if (label.includes("receiv")) return "🚚";
  if (label.includes("check") || label.includes("count")) return "🔍";
  if (label.includes("tag")) return "🏷️";
  if (label.includes("alloc")) return "⊕";
  if (label.includes("stag")) return "📦";
  if (label.includes("dispatch") || label.includes("ship")) return "🚛";
  return "⚙️";
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
  return (
    <svg
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
    </svg>
  );
}

function OperationsContent({
  dashboard,
  warehouse,
  timeframe,
  loading,
  streamKey,
  onWarehouseChange,
  onTimeframeChange,
}) {
  const { showModal, navigateTo } = usePersonasUI();
  const warehouses = dashboard?.warehouses || [];
  const data = useMemo(() => {
    const slice = dashboard?.[timeframe]?.[warehouse];
    return slice || normalizeOpsSlice();
  }, [dashboard, timeframe, warehouse]);
  const liveFeed = useMemo(() => buildOpsLiveFeed(warehouse || "Warehouse", data), [warehouse, data]);
  const focusProcess = data.focusProcess;

  const openProcess = (process) => {
    if (!process) return;
    navigateTo("process", { warehouse, process });
  };

  return (
    <div id="page-operations" className={`page-view active${loading ? " ops-loading" : ""}`}>
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
                onChange={(e) => onWarehouseChange(e.target.value)}
              >
                {warehouses.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.code}
                  </option>
                ))}
              </select>
            </div>
            <select
              className="filter-select"
              id="ops-timeframe"
              value={TIMEFRAME_LABELS[timeframe]}
              onChange={(e) => {
                const key = CT_TIMEFRAME_KEY[e.target.value];
                if (key) onTimeframeChange(key);
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
          onClick={() => openProcess(focusProcess)}
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
              openProcess(focusProcess);
            }}
          >
            View all
          </div>
        </div>
      </div>

      <div className="process-flow-card">
        <div className="section-title">Process Flow Performance</div>
        <div className="process-flow" id="process-flow">
          {data.processes.length ? data.processes.map((step, idx) => {
            const status = data.flow[step.key] || step.statusClass;
            const icon = stepIcon(step.key);
            return (
              <div key={step.key} style={{ display: "contents" }}>
                {idx > 0 ? <span className="process-arrow">→</span> : null}
                <div className="process-step">
                  <div
                    className={`process-step-box${status === "critical" ? " highlight" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProcess(step.key)}
                  >
                    <div className="step-icon">
                      {icon === "robo" ? <RoboIcon /> : icon}
                    </div>
                    <div className="step-label">
                      {idx + 1}. {step.label}
                    </div>
                    <span className={`status-pill ${status}`}>
                      {FLOW_STATUS_LABEL[status] || step.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="process-step">No process flow configured.</div>
          )}
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
            {data.processes.length ? data.processes.map((row, i) => (
              <tr
                key={row.key}
                className={`${row.rowCritical ? "row-critical" : ""}${row.selected ? " selected" : ""}`}
                onClick={() => openProcess(row.key)}
              >
                <td>{row.label}</td>
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
              </tr>
            )) : (
              <tr>
                <td colSpan={8}>No process data available.</td>
              </tr>
            )}
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
            onClick={() => openProcess(focusProcess)}
          >
            View Root Cause Analysis →
          </span>
        </div>
        <div className="widget-card">
          <div className="section-title">What If Scenarios</div>
          <ul className="scenario-list">
            {data.scenarios.map((scenario) => (
              <li
                key={scenario.id}
                role="button"
                tabIndex={0}
                onClick={() => showModal(scenario.title, scenario.text, "process")}
              >
                Scenario {scenario.id}: {scenario.title}{" "}
                <span className="scenario-chevron">›</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ops-focus-block">
        <strong>Focus:</strong> Understand operations, bottlenecks and options
        <br />
        <strong>KPIs shown:</strong> Process level with workload, capacity and SLA
      </div>
    </div>
  );
}

function OperationsShell({
  initialDashboard,
  initialTimeframe = "today",
  initialWarehouse = "",
  fetchedAt,
  initialError = "",
  refreshNonce = 0,
  onLoadingChange,
  onLastUpdatedChange,
}) {
  const router = useRouter();
  const { showToast } = usePersonasUI();
  const [dashboard, setDashboard] = useState(
    () => initialDashboard || getLocalOperationsDashboard(),
  );
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [warehouse, setWarehouse] = useState(() =>
    matchWarehouse((initialDashboard || getLocalOperationsDashboard()).warehouses || [], initialWarehouse),
  );
  const [loading, setLoading] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  useEffect(() => {
    const next = initialDashboard || getLocalOperationsDashboard();
    setDashboard(next);
    setTimeframe(initialTimeframe);
    setWarehouse(matchWarehouse(next.warehouses || [], initialWarehouse));
    onLastUpdatedChange?.(fetchedAt ? new Date(fetchedAt) : new Date());
    if (initialError) showToast(initialError);
  }, [initialDashboard, initialTimeframe, initialWarehouse, fetchedAt, initialError, showToast, onLastUpdatedChange]);

  useEffect(() => {
    if (!router.isReady) return;
    const wh = queryValue(router.query, "warehouse");
    if (!wh) return;
    setWarehouse(matchWarehouse(dashboard.warehouses || [], wh));
  }, [router.isReady, router.query, dashboard.warehouses]);

  const loadDashboard = useCallback(async (opts = {}) => {
    setLoading(true);
    onLoadingChange?.(true);
    const key = opts.timeframe || timeframe;
    const wh = opts.warehouse || warehouse;

    if (!opts.silent) {
      showToast(`Fetching Operations data – ${TIMEFRAME_LABELS[key]}, ${wh}…`);
    }

    try {
      const next = await getOperationsDashboard({ date: dashboard?.date });
      setDashboard(next);
      setTimeframe(key);
      setWarehouse(matchWarehouse(next.warehouses || [], wh));
      setStreamKey((n) => n + 1);
      onLastUpdatedChange?.(new Date());
      if (!opts.silent) {
        showToast(`Operations updated – ${TIMEFRAME_LABELS[key]} (${wh}) loaded.`);
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to refresh Operations."));
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }, [dashboard?.date, onLastUpdatedChange, onLoadingChange, showToast, timeframe, warehouse]);

  useEffect(() => {
    if (!refreshNonce) return;
    loadDashboard({ timeframe, warehouse });
    // refreshNonce is the only trigger; loadDashboard closes over the latest filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNonce]);

  function handleTimeframeChange(key) {
    if (dashboard?.[key]?.[warehouse]) {
      setTimeframe(key);
      setStreamKey((n) => n + 1);
      showToast(`Operations updated – ${TIMEFRAME_LABELS[key]} (${warehouse}) loaded.`);
      return;
    }
    loadDashboard({ timeframe: key, warehouse });
  }

  return (
    <OperationsContent
      dashboard={dashboard}
      warehouse={warehouse}
      timeframe={timeframe}
      loading={loading}
      streamKey={streamKey}
      onWarehouseChange={(next) => {
        setWarehouse(next);
        setStreamKey((n) => n + 1);
        showToast(`Operations updated – ${TIMEFRAME_LABELS[timeframe]} (${next}) loaded.`);
      }}
      onTimeframeChange={handleTimeframeChange}
    />
  );
}

function OperationsPage({
  initialDashboard,
  initialTimeframe = "today",
  initialWarehouse = "",
  fetchedAt,
  initialError = "",
}) {
  const { onMenuClick } = useLayout();
  const [lastUpdated, setLastUpdated] = useState(
    () => (fetchedAt ? new Date(fetchedAt) : new Date()),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);

  useEffect(() => {
    setLastUpdated(fetchedAt ? new Date(fetchedAt) : new Date());
  }, [fetchedAt]);

  return (
    <div className="page">
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={() => setRefreshNonce((n) => n + 1)}
        onMenuClick={onMenuClick}
        title="Operations"
        subtitle="Operations manager landing page — bottlenecks, flow and process performance"
      />
      <div className="page-body">
        <PersonasScope>
          <OperationsShell
            initialDashboard={initialDashboard}
            initialTimeframe={initialTimeframe}
            initialWarehouse={initialWarehouse}
            fetchedAt={fetchedAt}
            initialError={initialError}
            refreshNonce={refreshNonce}
            onLoadingChange={setIsRefreshing}
            onLastUpdatedChange={setLastUpdated}
          />
        </PersonasScope>
      </div>
    </div>
  );
}

export { OperationsPage };
