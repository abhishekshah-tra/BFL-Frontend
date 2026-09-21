"use client";
import { useEffect, useMemo, useState } from "react";
import { CT_TIMEFRAME_KEY } from "@/data/personas/personasData";
import { Header } from "@/components/layout/Header";
import { useLayout } from "@/components/layout/LayoutContext";
import { PersonasScope } from "./PersonasScope";
import { usePersonasUI } from "./PersonasUI";
import { TypewriterFeed, TypewriterValue } from "@/components/common/TypewriterValue";
import {
  getControlTowerDashboard,
  getLocalControlTowerDashboard,
} from "@/services/controlTower.service";
import { getErrorMessage } from "@/utils/api";

const TIMEFRAME_LABELS = {
  today: "Today",
  yesterday: "Yesterday",
  last7: "Last 7 Days",
};
const CHART_STYLES = {
  YOTO: { color: "#28a745", marker: "diamond" },
  JAFZA: { color: "#0056b3", marker: "circle" },
  TECHNO: { color: "#d93025", marker: "diamond" },
};
const CHART_PALETTE = [
  { color: "#28a745", marker: "diamond" },
  { color: "#0056b3", marker: "circle" },
  { color: "#d93025", marker: "diamond" },
  { color: "#7c3aed", marker: "circle" },
  { color: "#0891b2", marker: "diamond" },
];
const BN_RANK_CLASS = ["bottleneck-rank", "bottleneck-rank orange", "bottleneck-rank green"];

function parseChartPoints(pointsStr) {
  return String(pointsStr || "")
    .split(" ")
    .filter(Boolean)
    .map((pt) => {
      const [x, y] = pt.split(",").map(Number);
      return { x, y };
    });
}

function stripHtml(html) {
  return String(html ?? "").replace(/<[^>]+>/g, "");
}

function chartLabelXs(count) {
  if (count <= 0) return [];
  const x0 = 45;
  const x1 = count > 6 ? 400 : 375;
  return Array.from({ length: count }, (_, i) =>
    Math.round(x0 + (i / Math.max(count - 1, 1)) * (x1 - x0)),
  );
}

function getChartSeries(chart, warehouseIds) {
  const series =
    chart?.series && typeof chart.series === "object" ? chart.series : {};
  const ids = (warehouseIds.length ? warehouseIds : Object.keys(series)).filter(Boolean);

  return ids.map((id, i) => {
    const points = series[id] || chart?.[id] || chart?.[String(id).toLowerCase()] || "";
    const style = CHART_STYLES[id] || CHART_PALETTE[i % CHART_PALETTE.length];
    return { id, points, ...style };
  });
}

function parseBottleneckNav(name) {
  const parts = String(name ?? "").split(/\s+[–—-]\s+/);
  const warehouse = parts.length >= 2 ? parts[parts.length - 1].trim() : "";
  const process = parts.length >= 2 ? parts.slice(0, -1).join(" - ").trim() : "";

  if (warehouse && process) {
    return { page: "process", warehouse, process };
  }
  if (warehouse) {
    return { page: "operations", warehouse };
  }
  return { page: "operations" };
}

function getRecommendationNav(rec, warehouses = {}) {
  const ids = Object.keys(warehouses);
  const haystack = `${rec?.text || ""} ${rec?.scenario || ""}`;
  const fromText = ids.find((id) => haystack.includes(id));
  const warehouse =
    fromText ||
    [...ids].sort(
      (a, b) => (warehouses[b]?.capacity || 0) - (warehouses[a]?.capacity || 0),
    )[0];

  if (!warehouse) return { page: "operations" };

  const process = warehouses[warehouse]?.bottleneck;
  return process
    ? { page: "process", warehouse, process }
    : { page: "operations", warehouse };
}

function buildLiveFeed(data) {
  const { kpis, warehouses = {}, bottlenecks = [], recommendation: rec } = data;
  const warehouseLines = Object.entries(warehouses).map(([id, wh]) =>
    `${id} ${wh.throughput} units · capacity ${wh.capacity}% · SLA ${wh.sla}${wh.bottleneck ? ` · ${wh.bottleneck}` : ""} · ${wh.status}`,
  );

  return [
    `Network throughput ${kpis.throughput.value} ${kpis.throughput.unit} · ${kpis.throughput.trend}`,
    ...warehouseLines,
    bottlenecks[0]
      ? `Bottleneck ${bottlenecks[0].name} ${bottlenecks[0].pct} · ${kpis.alerts.value} open alerts`
      : `${kpis.alerts.value} open alerts`,
    stripHtml(rec.text),
  ].filter(Boolean);
}

function ControlTowerContent({
  data,
  timeframe,
  loading,
  streamKey,
  onTimeframeChange,
  onRefresh,
}) {
  const { showModal, navigateTo } = usePersonasUI();
  const { kpis, warehouses, bottlenecks, chart, recommendation: rec } = data;
  const warehouseIds = Object.keys(warehouses || {});
  const liveFeed = useMemo(() => buildLiveFeed(data), [data]);
  const chartSeries = useMemo(
    () => getChartSeries(chart, warehouseIds),
    [chart, warehouses],
  );
  const xLabels = chart?.xLabels || [];
  const xPositions = chartLabelXs(xLabels.length);
  const recNav = getRecommendationNav(rec, warehouses);
  const throughputHeader =
    timeframe === "last7" ? "Throughput (Units/Week)" : "Throughput (Units/Day)";

  function handleTimeframeChange(label) {
    const key = CT_TIMEFRAME_KEY[label];
    if (key) onTimeframeChange(key);
  }

  function handleFilter() {
    const warehouseList = warehouseIds.length ? warehouseIds.join(", ") : "All";
    showModal(
      "Filter Options",
      `Filter by: Warehouse (All, ${warehouseList}), Status (Good, At Risk, Critical), SLA range, and Throughput threshold. Apply filters to refine the Control Tower view.`,
    );
  }

  function handleKpiClick(label, detail, nav) {
    if (nav) {
      navigateTo(nav);
      return;
    }
    showModal(label, detail);
  }

  return (
    <div id="page-control-tower" className={`page-view active${loading ? " ct-loading" : ""}`}>
      <div className="dash-header">
        <h2>Control Tower</h2>
        <div className="filters">
          <select
            className="filter-select"
            id="ct-timeframe"
            value={TIMEFRAME_LABELS[timeframe] || "Today"}
            onChange={(e) => handleTimeframeChange(e.target.value)}
          >
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 Days</option>
          </select>
          <button type="button" className="icon-btn" id="ct-refresh" title="Refresh" onClick={onRefresh}>
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

      <div className="ct-live-feed" aria-live="polite">
        <span className="ct-live-dot" aria-hidden="true" />
        <span className="ct-live-label">LIVE</span>
        <TypewriterFeed strings={liveFeed} streamKey={streamKey} />
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
            <span id="ct-kpi-throughput-val">
              <TypewriterValue text={kpis.throughput.value} speed={28} delayMs={0} streamKey={streamKey} />
            </span>{" "}
            <span className="kpi-value-sm" id="ct-kpi-throughput-unit">
              {kpis.throughput.unit}
            </span>
          </div>
          <div className={`kpi-trend ${kpis.throughput.trendClass ?? ""}`} id="ct-kpi-throughput-trend">
            <TypewriterValue text={kpis.throughput.trend} speed={18} delayMs={220} streamKey={streamKey} />
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
            <TypewriterValue text={kpis.capacity.value} speed={36} delayMs={80} streamKey={streamKey} />
          </div>
          <div className={`kpi-trend ${kpis.capacity.trendClass ?? ""}`} id="ct-kpi-capacity-trend">
            <TypewriterValue text={kpis.capacity.trend} speed={18} delayMs={280} streamKey={streamKey} />
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
            <TypewriterValue text={kpis.sla.value} speed={36} delayMs={160} streamKey={streamKey} />
          </div>
          <div className={`kpi-trend ${kpis.sla.trendClass ?? ""}`} id="ct-kpi-sla-trend">
            <TypewriterValue text={kpis.sla.trend} speed={18} delayMs={340} streamKey={streamKey} />
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
            <TypewriterValue text={kpis.bottlenecks.value} speed={50} delayMs={240} streamKey={streamKey} />
          </div>
          <div className={`kpi-trend ${kpis.bottlenecks.trendClass ?? ""}`} id="ct-kpi-bottlenecks-trend">
            <TypewriterValue text={kpis.bottlenecks.trend} speed={18} delayMs={400} streamKey={streamKey} />
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
            <TypewriterValue text={kpis.alerts.value} speed={50} delayMs={320} streamKey={streamKey} />
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
            {warehouseIds.length ? warehouseIds.map((id, i) => {
              const wh = warehouses[id];
              return (
                <tr
                  key={id}
                  data-nav="operations"
                  data-warehouse={id}
                  data-process={wh.bottleneck || undefined}
                  id={`ct-wh-${id}`}
                  onClick={() => navigateTo("operations", {
                    warehouse: id,
                    ...(wh.bottleneck ? { process: wh.bottleneck } : {}),
                  })}
                >
                  <td>
                    <strong>{id}</strong>
                  </td>
                  <td className="ct-wh-throughput">
                    <TypewriterValue text={wh.throughput} speed={24} delayMs={200 + i * 90} streamKey={streamKey} />
                  </td>
                  <td>
                    <div className="capacity-cell">
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${wh.barClass} ct-wh-bar`}
                          style={{ width: `${wh.capacity}%` }}
                        />
                      </div>
                      <span className="capacity-pct ct-wh-capacity">
                        <TypewriterValue text={`${wh.capacity}%`} speed={30} delayMs={260 + i * 90} streamKey={streamKey} />
                      </span>
                    </div>
                  </td>
                  <td className="ct-wh-sla">
                    <TypewriterValue text={wh.sla} speed={30} delayMs={300 + i * 90} streamKey={streamKey} />
                  </td>
                  <td className="ct-wh-bottleneck">
                    <TypewriterValue text={wh.bottleneck} speed={22} delayMs={340 + i * 90} streamKey={streamKey} />
                  </td>
                  <td>
                    <span className={`status-pill ${wh.statusClass} ct-wh-status`}>{wh.status}</span>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6}>No warehouse data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="bottom-grid-2">
        <div className="widget-card">
          <div className="section-title">Top 3 Bottlenecks (Across Network)</div>
          {bottlenecks.length ? bottlenecks.map((bn, i) => {
            const nav = parseBottleneckNav(bn.name);
            return (
              <div
                key={`${bn.name}-${i}`}
                className="clickable-item"
                data-nav={nav.page}
                data-process={nav.process}
                data-warehouse={nav.warehouse}
                id={`ct-bn-${i + 1}`}
                onClick={() => navigateTo(nav.page, {
                  warehouse: nav.warehouse,
                  ...(nav.process ? { process: nav.process } : {}),
                })}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <span className={BN_RANK_CLASS[i] || "bottleneck-rank"}>{i + 1}</span>
                  <span id={`ct-bn-${i + 1}-name`}>
                    <TypewriterValue text={bn.name} speed={22} delayMs={280 + i * 80} streamKey={streamKey} />
                  </span>
                </div>
                <span className="bottleneck-trend" id={`ct-bn-${i + 1}-pct`} style={{ color: bn.color }}>
                  <TypewriterValue text={bn.pct} speed={30} delayMs={360 + i * 80} streamKey={streamKey} />
                </span>
              </div>
            );
          }) : (
            <div className="clickable-item">No active bottlenecks.</div>
          )}
        </div>
        <div className="widget-card">
          <div className="chart-header">
            <div className="section-title">Throughput Trend (Units/Day)</div>
            <div className="chart-legend">
              {chartSeries.map((series) => (
                <span key={series.id}>
                  <span
                    className={`legend-marker ${series.marker}`}
                    style={{ background: series.color }}
                  />{" "}
                  {series.id}
                </span>
              ))}
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
              {chartSeries.map((series) => (
                <g key={series.id} data-series={series.color}>
                  <polyline
                    id={`ct-chart-${series.id}`}
                    fill="none"
                    stroke={series.color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={series.points}
                  />
                  {parseChartPoints(series.points).map((p, i) => (
                    <circle key={`${series.id}-${i}`} cx={p.x} cy={p.y} r="3" fill={series.color} />
                  ))}
                </g>
              ))}
            </g>
            <g id="ct-chart-xlabels">
              {xLabels.map((label, i) => (
                <text
                  key={label + i}
                  x={xPositions[i]}
                  y="185"
                  fontSize="9"
                  fill="#000"
                  textAnchor="middle"
                  fontFamily="Inter,sans-serif"
                >
                  {label}
                </text>
              ))}
            </g>
          </svg>
        </div>
      </div>

      <div className="recommendation-panel">
        <div className="rec-content">
          <div className="rec-title" id="ct-rec-title">
            {rec.title} {rec.scenario ? <span className="rec-scenario">(Based on {rec.scenario})</span> : null}
          </div>
          <div className="rec-text" id="ct-rec-text">
            <TypewriterValue className="ct-tw-block" text={rec.text} speed={18} delayMs={420} cursor="▌" streamKey={streamKey} />
          </div>
          <button
            type="button"
            className="btn-outline"
            data-nav={recNav.page}
            data-process={recNav.process}
            data-warehouse={recNav.warehouse}
            onClick={() => navigateTo(recNav.page, {
              warehouse: recNav.warehouse,
              ...(recNav.process ? { process: recNav.process } : {}),
            })}
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
                <span id="ct-rec-people-val">
                  <TypewriterValue text={rec.people} speed={40} delayMs={500} streamKey={streamKey} />
                </span>
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
                <span id="ct-rec-robots-val">
                  <TypewriterValue text={rec.robots} speed={40} delayMs={560} streamKey={streamKey} />
                </span>
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
                <TypewriterValue text={rec.alerts} speed={50} delayMs={620} streamKey={streamKey} />
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
                <TypewriterValue text={rec.simulations} speed={50} delayMs={680} streamKey={streamKey} />
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
    </div>
  );
}

function ControlTowerShell({
  initialDashboard,
  initialTimeframe = "today",
  fetchedAt,
  initialError = "",
  refreshNonce = 0,
  onLoadingChange,
  onLastUpdatedChange,
}) {
  const { showToast } = usePersonasUI();
  const [dashboard, setDashboard] = useState(
    () => initialDashboard || getLocalControlTowerDashboard(),
  );
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [loading, setLoading] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  useEffect(() => {
    setDashboard(initialDashboard || getLocalControlTowerDashboard());
    setTimeframe(initialTimeframe);
    onLastUpdatedChange?.(fetchedAt ? new Date(fetchedAt) : new Date());
    if (initialError) {
      showToast(initialError);
    }
  }, [initialDashboard, initialTimeframe, fetchedAt, initialError, showToast, onLastUpdatedChange]);

  const data = dashboard[timeframe] || dashboard.today;

  async function loadDashboard(opts = {}) {
    const key = opts.timeframe || timeframe;
    setLoading(true);
    onLoadingChange?.(true);

    if (!opts.silent) {
      showToast(`Fetching ${TIMEFRAME_LABELS[key]} data…`);
    }

    try {
      const next = await getControlTowerDashboard({
        date: dashboard?.date,
      });
      setDashboard(next);
      setTimeframe(key);
      setStreamKey((n) => n + 1);
      onLastUpdatedChange?.(new Date());
      if (!opts.silent) {
        showToast(`Control Tower updated – ${TIMEFRAME_LABELS[key]} data loaded.`);
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to refresh Control Tower."));
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }

  useEffect(() => {
    if (!refreshNonce) return;
    loadDashboard({ timeframe });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshNonce is the trigger
  }, [refreshNonce]);

  function handleTimeframeChange(key) {
    if (dashboard[key]) {
      setTimeframe(key);
      setStreamKey((n) => n + 1);
      showToast(`Control Tower updated – ${TIMEFRAME_LABELS[key]} data loaded.`);
      return;
    }
    loadDashboard({ timeframe: key });
  }

  return (
    <ControlTowerContent
      data={data}
      timeframe={timeframe}
      loading={loading}
      streamKey={streamKey}
      onTimeframeChange={handleTimeframeChange}
      onRefresh={() => loadDashboard({ timeframe })}
    />
  );
}

function ControlTowerPage({
  initialDashboard,
  initialTimeframe = "today",
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
        title="Control Tower"
        subtitle="Executive landing page — network-wide performance and recommendations"
      />
      <div className="page-body">
        <PersonasScope>
          <ControlTowerShell
            initialDashboard={initialDashboard}
            initialTimeframe={initialTimeframe}
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

export {
  ControlTowerPage
};
