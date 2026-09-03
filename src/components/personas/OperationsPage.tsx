'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CT_TIMEFRAME_KEY,
  OPS_TIMEFRAME_DATA,
  type ProcessName,
  type TimeframeKey,
  type WarehouseId,
} from '@/data/personas/personasData'
import { Header } from '@/components/layout/Header'
import { useLayout } from '@/components/layout/LayoutContext'
import { PersonasScope } from './PersonasScope'
import { usePersonasUI } from './PersonasUI'

/** Stable timestamp so SSR HTML matches client hydration (avoid `new Date()` in render). */
const OPS_LAST_UPDATED = new Date('2025-05-20T10:30:00+04:00')

const WAREHOUSES: WarehouseId[] = ['TECHNO', 'YOTO', 'JAFZA']
const TIMEFRAME_LABELS: Record<TimeframeKey, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7: 'Last 7 Days',
}

const FLOW_STEPS: { key: ProcessName; label: ReactNode; emoji?: string }[] = [
  { key: 'Receive', label: '1. Receive', emoji: '🚚' },
  { key: 'Checking', label: '2. Checking', emoji: '🔍' },
  { key: 'Tagging', label: '3. Tagging', emoji: '🏷️' },
  { key: 'Allocation', label: '4. Allocation', emoji: '⊞' },
  {
    key: 'Robo Sorting',
    label: (
      <>
        5. Robo / Manual
        <br />
        Sorting
      </>
    ),
  },
  { key: 'Staging', label: '6. Staging', emoji: '📦' },
  { key: 'Dispatch', label: '7. Dispatch', emoji: '🚛' },
]

const FLOW_STATUS_LABEL: Record<string, string> = {
  good: 'Good',
  'at-risk': 'At Risk',
  critical: 'Critical',
}

const SCENARIOS: Record<string, string> = {
  '1': 'Volume +30%: Queue at Robo Sorting would grow to ~1,530 units. SLA would drop to approximately 72%. Recommend proactive rerouting before peak hours.',
  '2': 'Resource Optimization: Adding 2 robots and 2 operators reduces utilization to 78%, cuts queue by 45%, and improves SLA by 5%.',
  '3': 'Robo vs Manual vs Hybrid: Hybrid model with +2 Robots and +2 Operators delivers best throughput (+18%), lowest wait time (-24%), and highest SLA gain (+5%).',
}

function isWarehouse(value: string | null): value is WarehouseId {
  return value === 'TECHNO' || value === 'YOTO' || value === 'JAFZA'
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
  )
}

function OperationsContent() {
  const searchParams = useSearchParams()
  const { showToast, showModal, navigateTo } = usePersonasUI()
  const initialWh = searchParams?.get('warehouse') ?? null
  const [warehouse, setWarehouse] = useState<WarehouseId>(
    isWarehouse(initialWh) ? initialWh : 'TECHNO',
  )
  const [timeframe, setTimeframe] = useState<TimeframeKey>('today')
  const [loading, setLoading] = useState(false)
  const [displayWh, setDisplayWh] = useState(warehouse)
  const [displayTf, setDisplayTf] = useState(timeframe)

  useEffect(() => {
    const wh = searchParams?.get('warehouse') ?? null
    if (isWarehouse(wh)) {
      setWarehouse(wh)
      setDisplayWh(wh)
    }
  }, [searchParams])

  const data = useMemo(
    () => OPS_TIMEFRAME_DATA[displayTf][displayWh],
    [displayTf, displayWh],
  )

  const fetchData = useCallback(
    (tf: TimeframeKey, wh: WarehouseId, opts: { silent?: boolean } = {}) => {
      setLoading(true)
      setWarehouse(wh)
      setTimeframe(tf)
      if (!opts.silent) {
        showToast(`Fetching Operations data – ${TIMEFRAME_LABELS[tf]}, ${wh}…`)
      }
      window.setTimeout(() => {
        setDisplayTf(tf)
        setDisplayWh(wh)
        setLoading(false)
        if (!opts.silent) {
          showToast(`Operations updated – ${TIMEFRAME_LABELS[tf]} (${wh}) loaded.`)
        }
      }, 450)
    },
    [showToast],
  )

  const openProcess = (process: ProcessName) => {
    navigateTo('process', { warehouse: displayWh, process })
  }

  return (
    <div
      id="page-operations"
      className={`page-view active${loading ? ' ops-loading' : ''}`}
    >
      <div className="page-banner green">
        2. OPERATIONS MANAGER LANDING PAGE – OPERATIONS OVERVIEW
      </div>

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
                onChange={(e) =>
                  fetchData(timeframe, e.target.value as WarehouseId)
                }
              >
                {WAREHOUSES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
            <select
              className="filter-select"
              id="ops-timeframe"
              value={TIMEFRAME_LABELS[timeframe]}
              onChange={(e) => {
                const key = CT_TIMEFRAME_KEY[e.target.value]
                if (key) fetchData(key, warehouse)
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

      <div className="kpi-row" id="ops-kpi-row">
        <div
          className="kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => showModal('Throughput', data.kpis.throughputDetail)}
        >
          <div className="kpi-icon">📦</div>
          <div className="kpi-label">Throughput</div>
          <div className="kpi-value">
            <span>{data.kpis.throughput}</span>{' '}
            <span className="kpi-value-sm">{data.kpis.unit}</span>
          </div>
          <div className={`kpi-trend ${data.kpis.throughputTrendClass}`}>
            {data.kpis.throughputTrend}
          </div>
        </div>
        <div
          className="kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => showModal('Capacity Utilization', data.kpis.capacityDetail)}
        >
          <div className="kpi-icon">📊</div>
          <div className="kpi-label">Capacity Utilization</div>
          <div className="kpi-value">{data.kpis.capacity}</div>
          <div className={`kpi-trend ${data.kpis.capacityTrendClass}`}>
            {data.kpis.capacityTrend}
          </div>
        </div>
        <div
          className="kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => showModal('SLA Achievement', data.kpis.slaDetail)}
        >
          <div className="kpi-icon">✅</div>
          <div className="kpi-label">SLA Achievement</div>
          <div className="kpi-value">{data.kpis.sla}</div>
          <div className={`kpi-trend ${data.kpis.slaTrendClass}`}>
            {data.kpis.slaTrend}
          </div>
        </div>
        <div
          className="kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => openProcess('Robo Sorting')}
        >
          <div className="kpi-icon">⏱️</div>
          <div className="kpi-label">Avg. Waiting Time</div>
          <div className="kpi-value">
            <span>{data.kpis.wait}</span> <span className="kpi-value-sm">mins</span>
          </div>
          <div className={`kpi-trend ${data.kpis.waitTrendClass}`}>
            {data.kpis.waitTrend}
          </div>
        </div>
        <div
          className="kpi-card"
          role="button"
          tabIndex={0}
          onClick={() => showModal('Active Alerts', data.kpis.alertsDetail)}
        >
          <div className="kpi-icon">🔔</div>
          <div className="kpi-label">Active Alerts</div>
          <div className="kpi-value" style={{ color: '#dc2626' }}>
            {data.kpis.alerts}
          </div>
          <div
            className="kpi-link"
            onClick={(e) => {
              e.stopPropagation()
              openProcess('Robo Sorting')
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
            const status = data.flow[step.key]
            return (
              <div key={step.key} style={{ display: 'contents' }}>
                {idx > 0 ? <span className="process-arrow">→</span> : null}
                <div className="process-step">
                  <div
                    className={`process-step-box${status === 'critical' ? ' highlight' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openProcess(step.key)}
                  >
                    <div className="step-icon">
                      {step.key === 'Robo Sorting' ? <RoboIcon /> : step.emoji}
                    </div>
                    <div className="step-label">{step.label}</div>
                    <span className={`status-pill ${status}`}>
                      {FLOW_STATUS_LABEL[status]}
                    </span>
                  </div>
                </div>
              </div>
            )
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
            {data.processes.map((row) => (
              <tr
                key={row.key}
                className={`${row.rowCritical ? 'row-critical' : ''}${
                  row.key === 'Robo Sorting' ? ' selected' : ''
                }`}
                onClick={() => openProcess(row.key as ProcessName)}
              >
                <td>
                  {row.key === 'Robo Sorting' ? 'Robo / Manual Sorting' : row.key}
                </td>
                <td className={row.workloadClass}>{row.workload}</td>
                <td className={row.capacityClass}>{row.capacity}</td>
                <td className={row.utilClass}>{row.util}</td>
                <td className={row.queueClass}>{row.queue}</td>
                <td className={row.waitClass}>{row.wait}</td>
                <td className={row.slaClass}>{row.sla}</td>
                <td>
                  <span className={`status-pill ${row.statusClass}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bottom-grid-2">
        <div className="insight-box widget-card">
          <div className="section-title">Bottleneck Insight</div>
          <div className="insight-subtitle">{data.insight.subtitle}</div>
          <div className="insight-text">{data.insight.text}</div>
          <span
            className="insight-link"
            role="button"
            tabIndex={0}
            onClick={() => openProcess('Robo Sorting')}
          >
            View Root Cause Analysis →
          </span>
        </div>
        <div className="widget-card">
          <div className="section-title">What If Scenarios</div>
          <ul className="scenario-list">
            {(['1', '2', '3'] as const).map((id) => (
              <li
                key={id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  showModal(`What If Scenario ${id}`, SCENARIOS[id], 'process')
                }
              >
                Scenario {id}:{' '}
                {id === '1'
                  ? 'Volume +30%'
                  : id === '2'
                    ? 'Resource Optimization'
                    : 'Robo vs Manual vs Hybrid'}{' '}
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
  )
}

export function OperationsPage() {
  const { onMenuClick } = useLayout()

  return (
    <div className="page">
      <Header
        lastUpdated={OPS_LAST_UPDATED}
        isRefreshing={false}
        onRefresh={() => undefined}
        onMenuClick={onMenuClick}
        title="Operations"
        subtitle="Operations manager landing page — bottlenecks, flow and process performance"
      />
      <div className="page-body">
        <PersonasScope>
          <OperationsContent />
        </PersonasScope>
      </div>
    </div>
  )
}
