"use client";
import { useEffect, useRef, useState } from "react";
import {
  CT_TIMEFRAME_DATA,
  CT_TIMEFRAME_KEY
} from "@/data/personas/personasData";
import { Header } from "@/components/layout/Header";
import { useLayout } from "@/components/layout/LayoutContext";
import { PersonasScope } from "./PersonasScope";
import { usePersonasUI } from "./PersonasUI";
const CT_LAST_UPDATED = /* @__PURE__ */ new Date("2025-05-20T10:30:00+04:00");
const TIMEFRAME_LABELS = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 Days"
};
const WAREHOUSES = ["YOTO", "JAFZA", "TECHNO"];
const CHART_X = [45, 111, 177, 243, 309, 375];
const BN_RANK_CLASS = ["bottleneck-rank", "bottleneck-rank orange", "bottleneck-rank green"];
const BN_NAV = [
  { page: "process", warehouse: "TECHNO", process: "Robo Sorting" },
  { page: "operations", warehouse: "JAFZA" },
  { page: "operations", warehouse: "YOTO" }
];
function parseChartPoints(pointsStr) {
  return pointsStr.split(" ").filter(Boolean).map((pt) => {
    const [x, y] = pt.split(",").map(Number);
    return { x, y };
  });
}
function ControlTowerContent() {
  const { showToast, showModal, navigateTo } = usePersonasUI();
  const [timeframe, setTimeframe] = useState("today");
  const [loading, setLoading] = useState(false);
  const fetchTimer = useRef(null);
  const data = CT_TIMEFRAME_DATA[timeframe];
  const { kpis, warehouses, bottlenecks, chart, recommendation: rec } = data;
  useEffect(() => {
    return () => {
      if (fetchTimer.current != null) window.clearTimeout(fetchTimer.current);
    };
  }, []);
  function fetchControlTowerData(key, opts = {}) {
    if (fetchTimer.current != null) window.clearTimeout(fetchTimer.current);
    setLoading(true);
    if (!opts.silent) {
      showToast(`Fetching ${TIMEFRAME_LABELS[key]} data\u2026`);
    }
    fetchTimer.current = window.setTimeout(() => {
      setTimeframe(key);
      setLoading(false);
      if (!opts.silent) {
        showToast(`Control Tower updated \u2013 ${TIMEFRAME_LABELS[key]} data loaded.`);
      }
      fetchTimer.current = null;
    }, 450);
  }
  function handleTimeframeChange(label) {
    const key = CT_TIMEFRAME_KEY[label];
    if (key) fetchControlTowerData(key);
  }
  function handleRefresh() {
    fetchControlTowerData(timeframe, { silent: true });
    showToast(
      `Dashboard refreshed \u2013 ${TIMEFRAME_LABELS[timeframe]} data updated as of ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}`
    );
  }
  function handleFilter() {
    showModal(
      "Filter Options",
      "Filter by: Warehouse (All, YOTO, JAFZA, TECHNO), Status (Good, At Risk, Critical), SLA range, and Throughput threshold. Apply filters to refine the Control Tower view."
    );
  }
  function handleKpiClick(label, detail, nav) {
    if (nav) {
      navigateTo(nav);
      return;
    }
    showModal(label, detail);
  }
  const throughputHeader = timeframe === "last7" ? "Throughput (Units/Week)" : "Throughput (Units/Day)";
  const yotoPts = parseChartPoints(chart.yoto);
  const jafzaPts = parseChartPoints(chart.jafza);
  const technoPts = parseChartPoints(chart.techno);
  return <div id="page-control-tower" className={`page-view active${loading ? " ct-loading" : ""}`}>
      <div className="page-banner blue">1. EXECUTIVE LANDING PAGE – CONTROL TOWER</div>
      <div className="dash-header">
        <h2>Control Tower</h2>
        <div className="filters">
          <select
    className="filter-select"
    id="ct-timeframe"
    defaultValue="Today"
    onChange={(e) => handleTimeframeChange(e.target.value)}
  >
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 Days</option>
          </select>
          <button type="button" className="icon-btn" id="ct-refresh" title="Refresh" onClick={handleRefresh}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <button type="button" className="icon-btn" id="ct-filter" title="Filter" onClick={handleFilter}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="kpi-row" id="ct-kpi-row">
        <div
    className="kpi-card"
    id="ct-kpi-throughput"
    data-detail={kpis.throughput.detail}
    onClick={() => handleKpiClick("Total Throughput", kpis.throughput.detail)}
  >
          <div className="kpi-icon">📦</div>
          <div className="kpi-label">Total Throughput</div>
          <div className="kpi-value">
            <span id="ct-kpi-throughput-val">{kpis.throughput.value}</span>{" "}
            <span className="kpi-value-sm" id="ct-kpi-throughput-unit">
              {kpis.throughput.unit}
            </span>
          </div>
          <div className={`kpi-trend ${kpis.throughput.trendClass ?? ""}`} id="ct-kpi-throughput-trend">
            {kpis.throughput.trend}
          </div>
        </div>
        <div
    className="kpi-card"
    id="ct-kpi-capacity"
    data-detail={kpis.capacity.detail}
    onClick={() => handleKpiClick("Capacity Utilization", kpis.capacity.detail)}
  >
          <div className="kpi-icon">📊</div>
          <div className="kpi-label">Capacity Utilization</div>
          <div className="kpi-value" id="ct-kpi-capacity-val">
            {kpis.capacity.value}
          </div>
          <div className={`kpi-trend ${kpis.capacity.trendClass ?? ""}`} id="ct-kpi-capacity-trend">
            {kpis.capacity.trend}
          </div>
        </div>
        <div
    className="kpi-card"
    id="ct-kpi-sla"
    data-detail={kpis.sla.detail}
    onClick={() => handleKpiClick("SLA Achievement", kpis.sla.detail)}
  >
          <div className="kpi-icon">✅</div>
          <div className="kpi-label">SLA Achievement</div>
          <div className="kpi-value" id="ct-kpi-sla-val">
            {kpis.sla.value}
          </div>
          <div className={`kpi-trend ${kpis.sla.trendClass ?? ""}`} id="ct-kpi-sla-trend">
            {kpis.sla.trend}
          </div>
        </div>
        <div
    className="kpi-card"
    id="ct-kpi-bottlenecks"
    data-nav="operations"
    data-detail={kpis.bottlenecks.detail}
    onClick={() => handleKpiClick("Active Bottlenecks", kpis.bottlenecks.detail, "operations")}
  >
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-label">Active Bottlenecks</div>
          <div className="kpi-value" id="ct-kpi-bottlenecks-val">
            {kpis.bottlenecks.value}
          </div>
          <div className={`kpi-trend ${kpis.bottlenecks.trendClass ?? ""}`} id="ct-kpi-bottlenecks-trend">
            {kpis.bottlenecks.trend}
          </div>
        </div>
        <div
    className="kpi-card"
    id="ct-kpi-alerts"
    data-detail={kpis.alerts.detail}
    onClick={() => handleKpiClick("Alerts", kpis.alerts.detail)}
  >
          <div className="kpi-icon">🔔</div>
          <div className="kpi-label">Alerts</div>
          <div className="kpi-value" style={{ color: "#dc2626" }} id="ct-kpi-alerts-val">
            {kpis.alerts.value}
          </div>
          <div
    className="kpi-link"
    data-nav="operations"
    onClick={(e) => {
      e.stopPropagation();
      navigateTo("operations");
    }}
  >
            View all
          </div>
        </div>
      </div>

      <div className="warehouse-card">
        <div className="section-header-row">
          <div className="section-title">Warehouse Overview</div>
          <span className="view-all-link" data-nav="operations" onClick={() => navigateTo("operations")}>
            View all warehouses →
          </span>
        </div>
        <table className="data-table" id="warehouse-table" style={{ marginBottom: 0, border: "none", boxShadow: "none" }}>
          <thead>
            <tr>
              <th>Warehouse</th>
              <th>{throughputHeader}</th>
              <th>Capacity Utilization</th>
              <th>SLA</th>
              <th>Top Bottleneck</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="ct-warehouse-tbody">
            {WAREHOUSES.map((id) => {
    const wh = warehouses[id];
    return <tr
      key={id}
      data-nav="operations"
      data-warehouse={id}
      data-process={id === "TECHNO" ? "Robo Sorting" : void 0}
      id={`ct-wh-${id}`}
      onClick={() => navigateTo("operations", {
        warehouse: id,
        ...id === "TECHNO" ? { process: "Robo Sorting" } : {}
      })}
    >
                  <td>
                    <strong>{id}</strong>
                  </td>
                  <td className="ct-wh-throughput">{wh.throughput}</td>
                  <td>
                    <div className="capacity-cell">
                      <div className="progress-bar">
                        <div
      className={`progress-fill ${wh.barClass} ct-wh-bar`}
      style={{ width: `${wh.capacity}%` }}
    />
                      </div>
                      <span className="capacity-pct ct-wh-capacity">{wh.capacity}%</span>
                    </div>
                  </td>
                  <td className="ct-wh-sla">{wh.sla}</td>
                  <td className="ct-wh-bottleneck">{wh.bottleneck}</td>
                  <td>
                    <span className={`status-pill ${wh.statusClass} ct-wh-status`}>{wh.status}</span>
                  </td>
                </tr>;
  })}
          </tbody>
        </table>
      </div>

      <div className="bottom-grid-2">
        <div className="widget-card">
          <div className="section-title">Top 3 Bottlenecks (Across Network)</div>
          {bottlenecks.map((bn, i) => {
    const nav = BN_NAV[i];
    return <div
      key={i}
      className="clickable-item"
      data-nav={nav.page}
      data-process={"process" in nav ? nav.process : void 0}
      data-warehouse={nav.warehouse}
      id={`ct-bn-${i + 1}`}
      onClick={() => navigateTo(nav.page, {
        warehouse: nav.warehouse,
        ..."process" in nav ? { process: nav.process } : {}
      })}
    >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className={BN_RANK_CLASS[i]}>{i + 1}</span>
                  <span id={`ct-bn-${i + 1}-name`}>{bn.name}</span>
                </div>
                <span className="bottleneck-trend" id={`ct-bn-${i + 1}-pct`} style={{ color: bn.color }}>
                  {bn.pct}
                </span>
              </div>;
  })}
        </div>
        <div className="widget-card">
          <div className="chart-header">
            <div className="section-title">Throughput Trend (Units/Day)</div>
            <div className="chart-legend">
              <span>
                <span className="legend-marker diamond" style={{ background: "#28a745" }} /> YOTO
              </span>
              <span>
                <span className="legend-marker circle" style={{ background: "#0056b3" }} /> JAFZA
              </span>
              <span>
                <span className="legend-marker diamond" style={{ background: "#d93025" }} /> TECHNO
              </span>
            </div>
          </div>
          <svg
    className="chart-area-lg"
    id="ct-throughput-chart"
    viewBox="0 0 420 200"
    preserveAspectRatio="xMidYMid meet"
    aria-label="Throughput trend chart"
  >
            <text x="34" y="168" fontSize="9" fill="#000" textAnchor="end" fontFamily="Inter,sans-serif">
              0
            </text>
            <text x="34" y="132" fontSize="9" fill="#000" textAnchor="end" fontFamily="Inter,sans-serif">
              5K
            </text>
            <text x="34" y="96" fontSize="9" fill="#000" textAnchor="end" fontFamily="Inter,sans-serif">
              10K
            </text>
            <text x="34" y="60" fontSize="9" fill="#000" textAnchor="end" fontFamily="Inter,sans-serif">
              15K
            </text>
            <text x="34" y="24" fontSize="9" fill="#000" textAnchor="end" fontFamily="Inter,sans-serif">
              20K
            </text>
            <line x1="42" y1="165" x2="400" y2="165" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="42" y1="129" x2="400" y2="129" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="42" y1="93" x2="400" y2="93" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="42" y1="57" x2="400" y2="57" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="42" y1="21" x2="400" y2="21" stroke="#e5e7eb" strokeWidth="1" />
            <g id="ct-chart-lines">
              <polyline
    id="ct-chart-yoto"
    fill="none"
    stroke="#28a745"
    strokeWidth="2"
    strokeLinejoin="round"
    strokeLinecap="round"
    points={chart.yoto}
  />
              <polyline
    id="ct-chart-jafza"
    fill="none"
    stroke="#0056b3"
    strokeWidth="2"
    strokeLinejoin="round"
    strokeLinecap="round"
    points={chart.jafza}
  />
              <polyline
    id="ct-chart-techno"
    fill="none"
    stroke="#d93025"
    strokeWidth="2"
    strokeLinejoin="round"
    strokeLinecap="round"
    points={chart.techno}
  />
              <g data-series="#28a745">
                {yotoPts.map((p, i) => <circle key={`yoto-${i}`} cx={p.x} cy={p.y} r="3" fill="#28a745" />)}
              </g>
              <g data-series="#0056b3">
                {jafzaPts.map((p, i) => <circle key={`jafza-${i}`} cx={p.x} cy={p.y} r="3" fill="#0056b3" />)}
              </g>
              <g data-series="#d93025">
                {technoPts.map((p, i) => <circle key={`techno-${i}`} cx={p.x} cy={p.y} r="3" fill="#d93025" />)}
              </g>
            </g>
            <g id="ct-chart-xlabels">
              {chart.xLabels.map((label, i) => <text
    key={label + i}
    x={CHART_X[i]}
    y="185"
    fontSize="9"
    fill="#000"
    textAnchor="middle"
    fontFamily="Inter,sans-serif"
  >
                  {label}
                </text>)}
            </g>
          </svg>
        </div>
      </div>

      <div className="recommendation-panel">
        <div className="rec-content">
          <div className="rec-title" id="ct-rec-title">
            {rec.title} <span className="rec-scenario">(Based on {rec.scenario})</span>
          </div>
          <div className="rec-text" id="ct-rec-text" dangerouslySetInnerHTML={{ __html: rec.text }} />
          <button
    type="button"
    className="btn-outline"
    data-nav="process"
    data-process="Robo Sorting"
    data-warehouse="TECHNO"
    onClick={() => navigateTo("process", { process: "Robo Sorting", warehouse: "TECHNO" })}
  >
            View Recommendation
          </button>
        </div>
        <div className="rec-stats-wrap">
          <div className="rec-stat-card">
            <div
    className="rec-stat"
    data-detail={rec.peopleDetail}
    id="ct-rec-people"
    onClick={(e) => {
      e.stopPropagation();
      showModal("Total People", rec.peopleDetail);
    }}
  >
              <div className="rs-label">Total People</div>
              <div className="rs-value">
                <span id="ct-rec-people-val">{rec.people}</span>
              </div>
            </div>
            <div
    className="rec-stat"
    data-detail={rec.robotsDetail}
    id="ct-rec-robots"
    onClick={(e) => {
      e.stopPropagation();
      showModal("Total Robots", rec.robotsDetail);
    }}
  >
              <div className="rs-label">Total Robots</div>
              <div className="rs-value">
                <span id="ct-rec-robots-val">{rec.robots}</span>
              </div>
            </div>
          </div>
          <div className="rec-stat-card">
            <div
    className="rec-stat"
    data-nav="operations"
    id="ct-rec-alerts"
    onClick={(e) => {
      e.stopPropagation();
      navigateTo("operations");
    }}
  >
              <div className="rs-label">Open Alerts</div>
              <div className="rs-circle orange" id="ct-rec-alerts-val">
                {rec.alerts}
              </div>
            </div>
            <div
    className="rec-stat"
    data-detail={rec.simsDetail}
    id="ct-rec-sims"
    onClick={(e) => {
      e.stopPropagation();
      showModal("Simulations Run", rec.simsDetail);
    }}
  >
              <div className="rs-label">Simulations Run</div>
              <div className="rs-circle blue" id="ct-rec-sims-val">
                {rec.simulations}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-focus-block">
        <strong>Focus:</strong> Strategic performance, risks, and recommendations
        <br />
        <strong>KPIs shown:</strong> High level and comparative across warehouses
      </div>
    </div>;
}
function ControlTowerPage() {
  const { onMenuClick } = useLayout();
  return <div className="page">
      <Header
    lastUpdated={CT_LAST_UPDATED}
    isRefreshing={false}
    onRefresh={() => void 0}
    onMenuClick={onMenuClick}
    title="Control Tower"
    subtitle="Executive landing page — network-wide performance and recommendations"
  />
      <div className="page-body">
        <PersonasScope>
          <ControlTowerContent />
        </PersonasScope>
      </div>
    </div>;
}
export {
  ControlTowerPage
};
