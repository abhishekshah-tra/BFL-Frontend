"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Header } from "@/components/layout/Header";
import { useLayout } from "@/components/layout/LayoutContext";
import { PersonasScope } from "./PersonasScope";
import { usePersonasUI } from "./PersonasUI";
import { LiveFeedBar, TypewriterValue } from "@/components/common/TypewriterValue";
import {
  getLocalProcessDetails,
  getProcessDetails,
  normalizeProcessDetail,
} from "@/services/processDetails.service";
import { getErrorMessage } from "@/utils/api";

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

function matchProcess(processes, value) {
  if (!processes.length) return "";
  const raw = String(value || "");
  const exact = processes.find((item) => item.key === raw || item.label === raw);
  if (exact) return exact.key;

  const folded = raw.toLowerCase().replace(/^robo\s+/, "");
  const loose = processes.find((item) => {
    const key = item.key.toLowerCase();
    return key === folded || raw.toLowerCase().includes(key) || key.includes(folded);
  });

  return loose?.key || processes[0].key;
}

function parsePoints(pointsStr) {
  return String(pointsStr || "")
    .split(" ")
    .filter(Boolean)
    .map((pt) => {
      const [x, y] = pt.split(",").map(Number);
      return { x, y };
    })
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function slaAreaPath(points) {
  if (!points.length) return "";
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const last = points[points.length - 1];
  return `${line} L ${last.x} 48 L ${points[0].x} 48 Z`;
}

function buildProcessLiveFeed(warehouse, process, detail) {
  return [
    `${warehouse} · ${process} · status ${detail.status}`,
    `Queue ${detail.queue} · wait ${detail.wait} · utilization ${detail.util}%`,
    `SLA ${detail.sla}% · incoming ${detail.incoming} · capacity ${detail.processing}`,
    `Downstream impact ${detail.downstream} · ${detail.journeys}`,
  ];
}

function ProcessContent({
  dashboard,
  warehouse,
  processName,
  loading,
  streamKey,
  onWarehouseChange,
  onProcessChange,
}) {
  const { showToast, showModal } = usePersonasUI();
  const warehouses = dashboard?.warehouses || [];
  const warehouseMeta = warehouses.find((item) => item.code === warehouse);
  const processes = warehouseMeta?.processes || [];
  const detail = useMemo(() => {
    const slice = dashboard?.today?.[warehouse]?.[processName];
    return slice || normalizeProcessDetail();
  }, [dashboard, warehouse, processName]);
  const liveFeed = useMemo(
    () => buildProcessLiveFeed(warehouse || "Warehouse", detail.label || processName, detail),
    [warehouse, processName, detail],
  );
  const gaugeOffset = useMemo(
    () => 188.5 * (1 - Math.min(Math.max(detail.util, 0), 100) / 100),
    [detail.util],
  );
  const queuePoints = useMemo(() => parsePoints(detail.queueChart.points), [detail.queueChart.points]);
  const slaPoints = useMemo(() => parsePoints(detail.slaChart.points), [detail.slaChart.points]);

  return (
    <div id="page-process" className={`page-view active${loading ? " ops-loading" : ""}`}>
      <div className="proc-header-block">
        <h2>Process / Resource Details</h2>
        <div className="proc-filter-row">
          <div className="proc-filter-group">
            <div className="filter-label-wrap">
              <label htmlFor="proc-warehouse">Warehouse</label>
              <select
                className="filter-select"
                id="proc-warehouse"
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
            <div className="filter-label-wrap">
              <label htmlFor="proc-process">Process</label>
              <select
                className="filter-select"
                id="proc-process"
                value={processName}
                onChange={(e) => onProcessChange(e.target.value)}
              >
                {processes.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <span className="live-badge">● Live</span>
        </div>
      </div>

      <LiveFeedBar strings={liveFeed} streamKey={streamKey} />

      <div className="wm-top-row">
        <div className="widget-card critical-status">
          <div className="section-title">Current Status</div>
          <div className="crit-label" style={{ color: detail.statusColor }}>
            <TypewriterValue text={detail.status} speed={40} delayMs={0} streamKey={streamKey} />
          </div>
          <div className="crit-sub">
            Queue: <strong>
              <TypewriterValue text={detail.queue} speed={24} delayMs={120} streamKey={streamKey} />
            </strong>
            <br />
            Avg. Waiting Time: <strong>
              <TypewriterValue text={detail.wait} speed={24} delayMs={180} streamKey={streamKey} />
            </strong>
          </div>
        </div>

        <div className="widget-card gauge-wrap">
          <div className="section-title">Workload vs Capacity</div>
          <svg className="gauge-svg" viewBox="0 0 160 90">
            <path
              d="M 20 75 A 60 60 0 0 1 140 75"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 20 75 A 60 60 0 0 1 140 75"
              fill="none"
              stroke={detail.gaugeColor}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray="188.5"
              strokeDashoffset={gaugeOffset}
            />
            <text x="80" y="58" textAnchor="middle" fontSize="18" fontWeight="700" fill={detail.statusColor}>
              {detail.util}%
            </text>
            <text x="80" y="72" textAnchor="middle" fontSize="9" fill="#374151" fontWeight="500">
              Utilization
            </text>
          </svg>
          <div className="gauge-units-line">
            <span className="workload-red">
              <TypewriterValue text={detail.workload.toLocaleString()} speed={24} delayMs={160} streamKey={streamKey} />
            </span> /{" "}
            <span>
              <TypewriterValue text={detail.capacity.toLocaleString()} speed={24} delayMs={200} streamKey={streamKey} />
            </span> Units/hr
          </div>
        </div>

        <div className="widget-card sla-card">
          <div className="section-title">SLA Achievement</div>
          <div className="sla-value">
            <TypewriterValue text={`${detail.sla}%`} speed={36} delayMs={80} streamKey={streamKey} />
          </div>
          <svg className="sparkline-area" viewBox="0 0 140 48" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="slaAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={detail.slaChart.color} stopOpacity="0.45" />
                <stop offset="100%" stopColor={detail.slaChart.color} stopOpacity="0.12" />
              </linearGradient>
            </defs>
            {slaPoints.length ? (
              <>
                <path d={slaAreaPath(slaPoints)} fill="url(#slaAreaFill)" />
                <polyline
                  fill="none"
                  stroke={detail.slaChart.color}
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={detail.slaChart.points}
                />
                {slaPoints.map((point) => (
                  <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r="2.5" fill={detail.slaChart.color} />
                ))}
              </>
            ) : null}
          </svg>
        </div>
      </div>

      <div className="resource-breakdown-card">
        <div className="section-title">Resource Breakdown</div>
        <div className="resource-grid">
          {detail.resources.length ? detail.resources.map((res, i) => (
            <div
              key={res.label}
              className="resource-card"
              role="button"
              tabIndex={0}
              onClick={() => showModal(res.label, res.detail)}
            >
              <div className="res-label">{res.label}</div>
              <div className="res-value">
                <TypewriterValue text={res.value} speed={22} delayMs={220 + i * 70} streamKey={streamKey} />
              </div>
              <div className="res-bar-row">
                <div className="progress-bar">
                  <div className={`progress-fill ${res.bar}`} style={{ width: `${res.pct}%` }} />
                </div>
                <span className="res-pct">
                  <TypewriterValue text={`${res.pct}%`} speed={30} delayMs={280 + i * 70} streamKey={streamKey} />
                </span>
              </div>
            </div>
          )) : (
            <div className="resource-card">No resources configured for this process.</div>
          )}
        </div>
      </div>

      <div className="bottom-grid-2">
        <div className="widget-card">
          <div className="section-title">Queue Trend (Units)</div>
          <svg
            className="queue-chart-area"
            viewBox="0 0 400 165"
            preserveAspectRatio="xMidYMid meet"
            aria-label="Queue trend chart"
          >
            {detail.queueChart.yLabels.map((tick) => (
              <text
                key={`y-${tick.label}-${tick.y}`}
                x="38"
                y={tick.y}
                fontSize="10"
                fill="#000"
                textAnchor="end"
                dominantBaseline="middle"
                fontFamily="Inter,sans-serif"
              >
                {tick.label}
              </text>
            ))}
            {detail.queueChart.yLabels.map((tick) => (
              <line
                key={`grid-${tick.y}`}
                x1="44"
                y1={tick.y}
                x2="378"
                y2={tick.y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}
            {queuePoints.length ? (
              <polyline
                fill="none"
                stroke="#dc2626"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={detail.queueChart.points}
              />
            ) : null}
            {detail.queueChart.xLabels.map((tick) => (
              <text
                key={`x-${tick.label}`}
                x={tick.x}
                y="142"
                fontSize="10"
                fill="#000"
                textAnchor="middle"
                fontFamily="Inter,sans-serif"
              >
                {tick.label}
              </text>
            ))}
          </svg>
        </div>
        <div className="widget-card">
          <div className="section-title">Process Details</div>
          <ul className="proc-details-list">
            <li>
              <span>Incoming Rate</span>
              <strong>
                <TypewriterValue text={detail.incoming} speed={22} delayMs={300} streamKey={streamKey} />
              </strong>
            </li>
            <li>
              <span>Processing Capacity</span>
              <strong>
                <TypewriterValue text={detail.processing} speed={22} delayMs={340} streamKey={streamKey} />
              </strong>
            </li>
            <li>
              <span>Avg. Scan Time / Item</span>
              <strong>
                <TypewriterValue text={detail.scan} speed={24} delayMs={380} streamKey={streamKey} />
              </strong>
            </li>
            <li>
              <span>Avg. Process Time / Item</span>
              <strong>
                <TypewriterValue text={detail.proctime} speed={24} delayMs={420} streamKey={streamKey} />
              </strong>
            </li>
            <li>
              <span>Downstream Impact</span>
              <strong className={detail.downstreamClass || undefined}>
                <TypewriterValue text={detail.downstream} speed={28} delayMs={460} streamKey={streamKey} />
              </strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="bottom-grid-2">
        <div className="widget-card affected-card">
          <div className="section-title">Affected Items / Journeys</div>
          <div className="affected-sub">View items impacted by this bottleneck</div>
          <div className="affected-value">
            <TypewriterValue text={detail.journeys} speed={20} delayMs={500} cursor="▌" streamKey={streamKey} />
          </div>
          <span
            className="insight-link"
            role="button"
            tabIndex={0}
            onClick={() => showToast(`Opening Item Journey for ${detail.journeys}`)}
          >
            View Item Journey →
          </span>
        </div>
        <div className="widget-card">
          <div className="section-title">Actions</div>
          <ul className="action-list">
            {detail.actions.map((action) => (
              <li
                key={action}
                role="button"
                tabIndex={0}
                onClick={() => showToast(`Action selected: ${action}`)}
              >
                <span className="action-left">
                  <span className="action-icon">👤</span> {action}
                </span>
                <span className="action-chevron">›</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="proc-focus-block">
        <strong>Focus:</strong> Granular execution view to manage the floor
        <br />
        <strong>KPIs shown:</strong> Resource and workstation level details
      </div>
    </div>
  );
}

function ProcessShell({
  initialDashboard,
  initialWarehouse = "",
  initialProcess = "",
  fetchedAt,
  initialError = "",
  refreshNonce = 0,
  onLoadingChange,
  onLastUpdatedChange,
}) {
  const router = useRouter();
  const { showToast } = usePersonasUI();
  const [dashboard, setDashboard] = useState(
    () => initialDashboard || getLocalProcessDetails(),
  );
  const [warehouse, setWarehouse] = useState(() =>
    matchWarehouse((initialDashboard || getLocalProcessDetails()).warehouses || [], initialWarehouse),
  );
  const [processName, setProcessName] = useState(() => {
    const source = initialDashboard || getLocalProcessDetails();
    const code = matchWarehouse(source.warehouses || [], initialWarehouse);
    const processes = source.warehouses?.find((item) => item.code === code)?.processes || [];
    return matchProcess(processes, initialProcess);
  });
  const [loading, setLoading] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  const applySelection = useCallback((source, warehouseValue, processValue) => {
    const code = matchWarehouse(source.warehouses || [], warehouseValue);
    const processes = source.warehouses?.find((item) => item.code === code)?.processes || [];
    setWarehouse(code);
    setProcessName(matchProcess(processes, processValue));
  }, []);

  useEffect(() => {
    const next = initialDashboard || getLocalProcessDetails();
    setDashboard(next);
    applySelection(next, initialWarehouse, initialProcess);
    onLastUpdatedChange?.(fetchedAt ? new Date(fetchedAt) : new Date());
    if (initialError) showToast(initialError);
  }, [initialDashboard, initialWarehouse, initialProcess, fetchedAt, initialError, showToast, onLastUpdatedChange, applySelection]);

  useEffect(() => {
    if (!router.isReady) return;
    const wh = queryValue(router.query, "warehouse");
    const proc = queryValue(router.query, "process");
    if (!wh && !proc) return;
    applySelection(dashboard, wh || warehouse, proc || processName);
  }, [router.isReady, router.query]);

  const loadDashboard = useCallback(async (opts = {}) => {
    setLoading(true);
    onLoadingChange?.(true);
    const wh = opts.warehouse || warehouse;
    const proc = opts.process || processName;

    if (!opts.silent) {
      showToast(`Fetching process details – ${wh}, ${proc}…`);
    }

    try {
      const next = await getProcessDetails({ date: dashboard?.date });
      setDashboard(next);
      applySelection(next, wh, proc);
      setStreamKey((n) => n + 1);
      onLastUpdatedChange?.(new Date());
      if (!opts.silent) {
        showToast(`Process details updated – ${wh} / ${proc}.`);
      }
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to refresh process details."));
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
    }
  }, [applySelection, dashboard?.date, onLastUpdatedChange, onLoadingChange, processName, showToast, warehouse]);

  useEffect(() => {
    if (!refreshNonce) return;
    loadDashboard({ warehouse, process: processName });
    // refreshNonce is the only trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNonce]);

  return (
    <ProcessContent
      dashboard={dashboard}
      warehouse={warehouse}
      processName={processName}
      loading={loading}
      streamKey={streamKey}
      onWarehouseChange={(nextWarehouse) => {
        const processes = dashboard.warehouses?.find((item) => item.code === nextWarehouse)?.processes || [];
        const nextProcess = matchProcess(processes, processName);
        applySelection(dashboard, nextWarehouse, nextProcess);
        setStreamKey((n) => n + 1);
        showToast(`Warehouse filter: ${nextWarehouse}`);
      }}
      onProcessChange={(nextProcess) => {
        applySelection(dashboard, warehouse, nextProcess);
        setStreamKey((n) => n + 1);
        showToast(`Process filter: ${nextProcess}`);
      }}
    />
  );
}

function ProcessPage({
  initialDashboard,
  initialWarehouse = "",
  initialProcess = "",
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
        title="Process Details"
        subtitle="Warehouse manager landing page — process and resource level execution"
      />
      <div className="page-body">
        <PersonasScope>
          <ProcessShell
            initialDashboard={initialDashboard}
            initialWarehouse={initialWarehouse}
            initialProcess={initialProcess}
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

export { ProcessPage };
