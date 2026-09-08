"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  processData
} from "@/data/personas/personasData";
import { Header } from "@/components/layout/Header";
import { useLayout } from "@/components/layout/LayoutContext";
import { PersonasScope } from "./PersonasScope";
import { usePersonasUI } from "./PersonasUI";
const PROC_LAST_UPDATED = /* @__PURE__ */ new Date("2025-05-20T10:30:00+04:00");
const WAREHOUSES = ["TECHNO", "YOTO", "JAFZA"];
const PROCESSES = [
  { value: "Robo Sorting", label: "Robo / Manual Sorting" },
  { value: "Receive", label: "Receive" },
  { value: "Checking", label: "Checking" },
  { value: "Tagging", label: "Tagging" },
  { value: "Allocation", label: "Allocation" },
  { value: "Staging", label: "Staging" },
  { value: "Dispatch", label: "Dispatch" }
];
const RESOURCES = [
  {
    label: "Robots",
    value: "16 / 18 Active",
    pct: 89,
    bar: "green",
    detail: "16 of 18 robots active. 2 offline for scheduled maintenance."
  },
  {
    label: "Chutes",
    value: "30 / 36 Available",
    pct: 83,
    bar: "orange",
    detail: "30 of 36 chutes available. Chutes 35-36 on standby."
  },
  {
    label: "Manual Stations",
    value: "12 / 16 Active",
    pct: 75,
    bar: "green",
    detail: "12 of 16 manual stations active."
  },
  {
    label: "Operators",
    value: "12 / 14 Present",
    pct: 86,
    bar: "orange",
    detail: "12 of 14 operators present. 2 on break rotation."
  }
];
const ACTIONS = [
  "Add 2 Robots (Scenario 2)",
  "Add 2 Operators (Scenario 2)",
  "Increase Chutes by 4 (Scenario 2)"
];
function isWarehouse(value) {
  return value === "TECHNO" || value === "YOTO" || value === "JAFZA";
}
function isProcess(value) {
  return !!value && value in processData;
}
function queryValue(query, key) {
  const value = query[key];
  return typeof value === "string" ? value : null;
}

function ProcessContent() {
  const router = useRouter();
  const { showToast, showModal } = usePersonasUI();
  const [warehouse, setWarehouse] = useState(() => {
    const wh = queryValue(router.query, "warehouse");
    return isWarehouse(wh) ? wh : "TECHNO";
  });
  const [process, setProcess] = useState(() => {
    const p = queryValue(router.query, "process");
    return isProcess(p) ? p : "Robo Sorting";
  });
  useEffect(() => {
    if (!router.isReady) return;
    const wh = queryValue(router.query, "warehouse");
    const p = queryValue(router.query, "process");
    if (isWarehouse(wh)) setWarehouse(wh);
    if (isProcess(p)) setProcess(p);
  }, [router.isReady, router.query]);
  const detail = processData[process];
  const gaugeOffset = useMemo(
    () => 188.5 * (1 - detail.util / 100),
    [detail.util]
  );
  return <div id="page-process" className="page-view active">
      <div className="page-banner orange">
        3. WAREHOUSE MANAGER LANDING PAGE – PROCESS / RESOURCE DETAILS
      </div>

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
    onChange={(e) => {
      setWarehouse(e.target.value);
      showToast(`Warehouse filter: ${e.target.value}`);
    }}
  >
                {WAREHOUSES.map((w) => <option key={w} value={w}>
                    {w}
                  </option>)}
              </select>
            </div>
            <div className="filter-label-wrap">
              <label htmlFor="proc-process">Process</label>
              <select
    className="filter-select"
    id="proc-process"
    value={process}
    onChange={(e) => {
      const next = e.target.value;
      setProcess(next);
      showToast(`Process filter: ${next}`);
    }}
  >
                {PROCESSES.map((p) => <option key={p.value} value={p.value}>
                    {p.label}
                  </option>)}
              </select>
            </div>
          </div>
          <span className="live-badge">● Live</span>
        </div>
      </div>

      <div className="wm-top-row">
        <div className="widget-card critical-status">
          <div className="section-title">Current Status</div>
          <div className="crit-label" style={{ color: detail.statusColor }}>
            {detail.status}
          </div>
          <div className="crit-sub">
            Queue: <strong>{detail.queue}</strong>
            <br />
            Avg. Waiting Time: <strong>{detail.wait}</strong>
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
            <text
    x="80"
    y="58"
    textAnchor="middle"
    fontSize="18"
    fontWeight="700"
    fill={detail.statusColor}
  >
              {detail.util}%
            </text>
            <text
    x="80"
    y="72"
    textAnchor="middle"
    fontSize="9"
    fill="#374151"
    fontWeight="500"
  >
              Utilization
            </text>
          </svg>
          <div className="gauge-units-line">
            <span className="workload-red">{detail.workload.toLocaleString()}</span> /{" "}
            <span>{detail.capacity.toLocaleString()}</span> Units/hr
          </div>
        </div>

        <div className="widget-card sla-card">
          <div className="section-title">SLA Achievement</div>
          <div className="sla-value">{detail.sla}%</div>
          <svg
    className="sparkline-area"
    viewBox="0 0 140 48"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
            <defs>
              <linearGradient id="slaAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#fee2e2" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
    d="M 0 42 L 0 20 L 14 24 L 28 14 L 42 22 L 56 18 L 70 30 L 84 16 L 98 24 L 112 20 L 126 22 L 140 18 L 140 42 Z"
    fill="url(#slaAreaFill)"
  />
            <polyline
    fill="none"
    stroke="#dc2626"
    strokeWidth="1.8"
    strokeLinejoin="round"
    strokeLinecap="round"
    points="0,20 14,24 28,14 42,22 56,18 70,30 84,16 98,24 112,20 126,22 140,18"
  />
            {[0, 14, 28, 42, 56, 70, 84, 98, 112, 126, 140].map((cx, i) => {
    const cy = [20, 24, 14, 22, 18, 30, 16, 24, 20, 22, 18][i];
    return <circle key={cx} cx={cx} cy={cy} r="2.5" fill="#dc2626" />;
  })}
          </svg>
        </div>
      </div>

      <div className="resource-breakdown-card">
        <div className="section-title">Resource Breakdown</div>
        <div className="resource-grid">
          {RESOURCES.map((res) => <div
    key={res.label}
    className="resource-card"
    role="button"
    tabIndex={0}
    onClick={() => showModal(res.label, res.detail)}
  >
              <div className="res-label">{res.label}</div>
              <div className="res-value">{res.value}</div>
              <div className="res-bar-row">
                <div className="progress-bar">
                  <div
    className={`progress-fill ${res.bar}`}
    style={{ width: `${res.pct}%` }}
  />
                </div>
                <span className="res-pct">{res.pct}%</span>
              </div>
            </div>)}
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
            <text x="38" y="120" fontSize="10" fill="#000" textAnchor="end" dominantBaseline="middle" fontFamily="Inter,sans-serif">0</text>
            <text x="38" y="93.4" fontSize="10" fill="#000" textAnchor="end" dominantBaseline="middle" fontFamily="Inter,sans-serif">500</text>
            <text x="38" y="66.8" fontSize="10" fill="#000" textAnchor="end" dominantBaseline="middle" fontFamily="Inter,sans-serif">1K</text>
            <text x="38" y="40.2" fontSize="10" fill="#000" textAnchor="end" dominantBaseline="middle" fontFamily="Inter,sans-serif">1.5K</text>
            <text x="38" y="13.6" fontSize="10" fill="#000" textAnchor="end" dominantBaseline="middle" fontFamily="Inter,sans-serif">2K</text>
            <line x1="44" y1="120" x2="378" y2="120" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="44" y1="93.4" x2="378" y2="93.4" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="44" y1="66.8" x2="378" y2="66.8" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="44" y1="40.2" x2="378" y2="40.2" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="44" y1="13.6" x2="378" y2="13.6" stroke="#e5e7eb" strokeWidth="1" />
            <polyline
    fill="none"
    stroke="#dc2626"
    strokeWidth="2"
    strokeLinejoin="round"
    strokeLinecap="round"
    points="44,66.8 74.4,66.8 104.8,75.6 135.2,54.4 165.6,40.2 196,43.8 226.4,35.85 256.8,25.25 287.2,30.55 317.6,35.85 348,41.15 378,43.8"
  />
            <text x="44" y="142" fontSize="10" fill="#000" textAnchor="middle" fontFamily="Inter,sans-serif">12 AM</text>
            <text x="104.8" y="142" fontSize="10" fill="#000" textAnchor="middle" fontFamily="Inter,sans-serif">4 AM</text>
            <text x="165.6" y="142" fontSize="10" fill="#000" textAnchor="middle" fontFamily="Inter,sans-serif">8 AM</text>
            <text x="226.4" y="142" fontSize="10" fill="#000" textAnchor="middle" fontFamily="Inter,sans-serif">12 PM</text>
            <text x="287.2" y="142" fontSize="10" fill="#000" textAnchor="middle" fontFamily="Inter,sans-serif">4 PM</text>
            <text x="348" y="142" fontSize="10" fill="#000" textAnchor="middle" fontFamily="Inter,sans-serif">8 PM</text>
          </svg>
        </div>
        <div className="widget-card">
          <div className="section-title">Process Details</div>
          <ul className="proc-details-list">
            <li>
              <span>Incoming Rate</span>
              <strong>{detail.incoming}</strong>
            </li>
            <li>
              <span>Processing Capacity</span>
              <strong>{detail.processing}</strong>
            </li>
            <li>
              <span>Avg. Scan Time / Item</span>
              <strong>{detail.scan}</strong>
            </li>
            <li>
              <span>Avg. Process Time / Item</span>
              <strong>{detail.proctime}</strong>
            </li>
            <li>
              <span>Downstream Impact</span>
              <strong className={detail.downstreamClass || void 0}>
                {detail.downstream}
              </strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="bottom-grid-2">
        <div className="widget-card affected-card">
          <div className="section-title">Affected Items / Journeys</div>
          <div className="affected-sub">View items impacted by this bottleneck</div>
          <div className="affected-value">{detail.journeys}</div>
          <span
    className="insight-link"
    role="button"
    tabIndex={0}
    onClick={() => showToast("Opening Item Journey for 125 affected journeys (4,860 units)")}
  >
            View Item Journey →
          </span>
        </div>
        <div className="widget-card">
          <div className="section-title">Actions</div>
          <ul className="action-list">
            {ACTIONS.map((action) => <li
    key={action}
    role="button"
    tabIndex={0}
    onClick={() => showToast(`Action selected: ${action}`)}
  >
                <span className="action-left">
                  <span className="action-icon">👤</span> {action}
                </span>
                <span className="action-chevron">›</span>
              </li>)}
          </ul>
        </div>
      </div>

      <div className="proc-focus-block">
        <strong>Focus:</strong> Granular execution view to manage the floor
        <br />
        <strong>KPIs shown:</strong> Resource and workstation level details
      </div>
    </div>;
}
function ProcessPage() {
  const { onMenuClick } = useLayout();
  return <div className="page">
      <Header
    lastUpdated={PROC_LAST_UPDATED}
    isRefreshing={false}
    onRefresh={() => void 0}
    onMenuClick={onMenuClick}
    title="Process Details"
    subtitle="Warehouse manager landing page — process and resource level execution"
  />
      <div className="page-body">
        <PersonasScope>
          <ProcessContent />
        </PersonasScope>
      </div>
    </div>;
}
export {
  ProcessPage
};
