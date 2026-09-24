import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  AlertTriangle,
  BarChart3,
  GitCompare,
  LayoutList,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react'
import { Header } from '../layout/Header'
import { useLayout } from '../layout/LayoutContext'
import { Card } from '../common/StatusBadge'
import { getScenarioBoard } from '../../lib/scenarioBoard'
import {
  getLocalSimulationDashboard,
  getSimulationDashboard,
  matchSimulationWarehouse,
} from '../../services/simulation.service'
import { getErrorMessage } from '../../utils/api'
import { TrendChart } from './TrendChart'
import { LiveFeedBar, TypewriterValue } from '../common/TypewriterValue'

const VIEWS = [
  { id: 'compare', label: 'Comparison', hint: 'KPI table', icon: GitCompare },
  { id: 'recommend', label: 'Recommendation', hint: 'Weighted score', icon: Trophy },
  { id: 'trends', label: 'KPI Trends', hint: 'Alerts & watch', icon: BarChart3 },
]

function ImpactBadge({ impact, tone }) {
  if (impact === '—') return <span className="sc-impact sc-impact--none">—</span>
  return <span className={`sc-impact sc-impact--${tone}`}>{impact}</span>
}

function RankingTable({ ranked, selectedId, onSelect, streamKey }) {
  return (
    <div className="table-wrap">
      <table className="data-table sc-rank-table">
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Score (0–100)</th>
            <th>Rank</th>
            <th>Reason (Key)</th>
            <th>Impact</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((item, i) => (
            <tr
              key={item.id}
              className={`${item.id === selectedId ? 'is-selected' : ''} ${item.isBest ? 'sc-row--best' : ''} ${item.impactTone === 'negative' ? 'sc-row--worst' : ''}`}
              onClick={() => onSelect(item.id)}
            >
              <td>
                <strong>{item.columnLabel}</strong>
                <span className="sc-sub">{item.columnHint.replace(/[()]/g, '')}</span>
              </td>
              <td className={item.impactTone === 'negative' ? 'sc-metric is-bad' : item.isBest ? 'sc-metric is-good' : ''}>
                <TypewriterValue text={Math.round(item.summary.score)} speed={28} delayMs={80 + i * 60} streamKey={streamKey} />
              </td>
              <td>
                <TypewriterValue text={item.rank} speed={40} delayMs={120 + i * 60} streamKey={streamKey} />
              </td>
              <td>
                <TypewriterValue text={item.reason} speed={16} delayMs={160 + i * 60} streamKey={streamKey} />
              </td>
              <td>
                <ImpactBadge impact={item.impact} tone={item.impactTone} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RecommendedCard({ recommended, onApply, streamKey }) {
  return (
    <aside className="sc-reco">
      <p className="sc-reco__kicker">Recommended Scenario</p>
      <h3>{recommended.name.replace(' — ', ' – ')}</h3>
      <p className="sc-reco__action">
        <TypewriterValue className="ct-tw-block" text={recommended.action} speed={16} delayMs={200} cursor="▌" streamKey={streamKey} />
      </p>
      <p className="sc-reco__impact-title">Expected Impact vs Baseline</p>
      <ul className="sc-reco__impacts">
        {recommended.impactRows.map((row, i) => (
          <li key={row.label}>
            <span>{row.label}</span>
            <strong className={row.better ? 'is-good' : 'is-bad'}>
              <TypewriterValue text={row.value} speed={22} delayMs={280 + i * 70} streamKey={streamKey} />
            </strong>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn--primary sc-reco__apply" onClick={() => onApply(recommended.id)}>
        Apply Scenario for Detailed View
      </button>
    </aside>
  )
}

export function ScenariosPage({
  initialDashboard,
  initialWarehouse = '',
  fetchedAt,
  initialError = '',
}) {
  const { onMenuClick } = useLayout()
  const router = useRouter()
  const [dashboard, setDashboard] = useState(
    () => initialDashboard || getLocalSimulationDashboard(),
  )
  const [warehouse, setWarehouse] = useState(() =>
    matchSimulationWarehouse(initialDashboard || getLocalSimulationDashboard(), initialWarehouse),
  )
  const model = dashboard?.models?.[warehouse] || Object.values(dashboard?.models || {})[0]
  const board = useMemo(() => getScenarioBoard(model), [model])
  const [view, setView] = useState('compare')
  const [selectedId, setSelectedId] = useState(board.recommended.id)
  const [lastUpdated, setLastUpdated] = useState(() => (fetchedAt ? new Date(fetchedAt) : new Date()))
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setSelectedId(board.recommended.id)
  }, [warehouse, board.recommended.id])

  const selected = board.columns.find((item) => item.id === selectedId) ?? board.recommended
  const trendLabels = board.trends.map((day) => day.label)
  const streamKey = `${lastUpdated.getTime()}:${view}:${selectedId}`
  const liveFeed = useMemo(() => ([
    `Recommended ${board.recommended.columnLabel} · score ${Math.round(board.recommended.summary.score)}`,
    board.recommended.action,
    ...board.recommended.impactRows.map((row) => `${row.label} ${row.value}`),
    ...board.alerts.map((alert) => `${alert.title} · ${alert.detail}`),
  ]), [board])

  const refresh = async () => {
    setIsRefreshing(true)
    try {
      const next = await getSimulationDashboard({ date: dashboard?.date })
      setDashboard(next)
      setWarehouse(matchSimulationWarehouse(next, warehouse))
      setLastUpdated(new Date())
    } catch (error) {
      console.warn(getErrorMessage(error, 'Failed to refresh scenarios.'))
    } finally {
      setIsRefreshing(false)
    }
  }

  const applyScenario = (id) => {
    router.push(`/simulation?template=${id}&warehouse=${warehouse}`)
  }

  return (
    <div className="page sc-page">
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onMenuClick={onMenuClick}
        title="Scenarios"
        subtitle={`Compare four ${board.warehouseName} plans built from today’s real staffing, then see which one scores best.`}
      />

      <div className="page-body">
        <div className="sim-banner">
          <span className="sim-poc">{model?.live ? 'Live plan' : 'Sample plan'}</span>
          <span>
            {board.guide?.scenarios}
            {initialError ? ` ${initialError}` : ''}
          </span>
          <label className="sim-warehouse">
            Warehouse
            <select
              className="filter-select"
              aria-label="Scenario warehouse"
              value={warehouse}
              onChange={(event) => {
                const code = event.target.value
                setWarehouse(code)
                router.replace(
                  { pathname: '/scenarios', query: { warehouse: code } },
                  undefined,
                  { shallow: true },
                )
              }}
            >
              {(dashboard.warehouses || []).map((item) => (
                <option key={item.code} value={item.code}>{item.code}</option>
              ))}
            </select>
          </label>
        </div>
        <LiveFeedBar strings={liveFeed} streamKey={streamKey} />
        <div className="sc-shell">
        <nav className="sc-rail" aria-label="Scenario views">
          <p className="sc-rail__title">Scenario workspace</p>
          {VIEWS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                className={`sc-rail__link ${view === item.id ? 'is-active' : ''}`}
                onClick={() => setView(item.id)}
              >
                <Icon size={16} />
                <span>
                  <strong>{item.label}</strong>
                  <em>{item.hint}</em>
                </span>
              </button>
            )
          })}
          <div className="sc-rail__weights">
            <p>Score weights</p>
            {board.weights.map((weight) => (
              <div key={weight.id}>
                <span>{weight.label}</span>
                <strong>{weight.weight}%</strong>
              </div>
            ))}
          </div>
        </nav>

        <div className="sc-stage">
          {view === 'compare' ? (
            <div className="sc-split">
              <Card className="sc-card" title="Scenario Comparison">
                <p className="sc-lead">Compare Scenarios</p>
                <div className="table-wrap">
                  <table className="data-table sc-compare-table">
                    <thead>
                      <tr>
                        <th>KPI</th>
                        {board.columns.map((column) => (
                          <th key={column.id} className={column.isBest ? 'is-best' : ''}>
                            {column.columnLabel}
                            <span>{column.columnHint}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {board.kpis.map((kpi) => (
                        <tr key={kpi.id}>
                          <th>
                            {kpi.label}
                            {kpi.unit ? <span>{kpi.unit}</span> : null}
                          </th>
                          {kpi.cells.map((cell) => (
                            <td
                              key={cell.id}
                              className={`${cell.id === board.recommended.id ? 'is-pick' : ''} ${cell.warn ? 'is-bad' : ''} ${cell.best ? 'is-good' : ''}`}
                            >
                              <TypewriterValue text={cell.text} speed={18} delayMs={60} streamKey={streamKey} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="sc-stack">
                <Card className="sc-card" title="Recommendation (Weighted Score)">
                  <p className="sc-lead">Scenario Ranking</p>
                  <RankingTable ranked={board.ranked} selectedId={selectedId} onSelect={setSelectedId} streamKey={streamKey} />
                </Card>
                <RecommendedCard recommended={board.recommended} onApply={applyScenario} streamKey={streamKey} />
              </div>
            </div>
          ) : null}

          {view === 'recommend' ? (
            <div className="sc-split">
              <Card className="sc-card" title="Recommendation (Weighted Score)">
                <p className="sc-lead">Scenario Ranking</p>
                <RankingTable ranked={board.ranked} selectedId={selectedId} onSelect={setSelectedId} streamKey={streamKey} />
                <dl className="kv-list sc-why">
                  <div className="kv-row">
                    <dt>Selected plan</dt>
                    <dd>
                      <TypewriterValue text={selected.name} speed={18} delayMs={80} streamKey={streamKey} />
                    </dd>
                  </div>
                  <div className="kv-row">
                    <dt>Weighted score</dt>
                    <dd>
                      <TypewriterValue
                        text={`${Math.round(selected.summary.score)} / 100 · rank ${board.ranked.find((item) => item.id === selected.id)?.rank}`}
                        speed={16}
                        delayMs={140}
                        streamKey={streamKey}
                      />
                    </dd>
                  </div>
                  <div className="kv-row">
                    <dt>Why this rank</dt>
                    <dd>
                      <TypewriterValue text={selected.reason} speed={16} delayMs={200} cursor="▌" streamKey={streamKey} />
                    </dd>
                  </div>
                  <div className="kv-row">
                    <dt>{board.focusName} constraint</dt>
                    <dd>
                      <TypewriterValue text={selected.summary.bottleneckLabel} speed={20} delayMs={260} streamKey={streamKey} />
                    </dd>
                  </div>
                </dl>
              </Card>
              <RecommendedCard recommended={board.recommended} onApply={applyScenario} streamKey={streamKey} />
            </div>
          ) : null}

          {view === 'trends' ? (
            <div className="sc-split sc-split--trends">
              <Card className="sc-card" title="KPI Trends & Alerts">
                <p className="sc-lead">KPI Trends (Last 7 Days)</p>
                <div className="sc-charts">
                  <TrendChart
                    title="Throughput"
                    values={board.trends.map((day) => day.throughput)}
                    labels={trendLabels}
                    color="#2f80ed"
                  />
                  <TrendChart
                    title="Utilization (%)"
                    values={board.trends.map((day) => day.utilization)}
                    labels={trendLabels}
                    color="#2f80ed"
                    formatTick={(value) => `${Math.round(value)}%`}
                  />
                  <TrendChart
                    title="Queue (Peak Items)"
                    values={board.trends.map((day) => day.peakQueue)}
                    labels={trendLabels}
                    color="#d64545"
                  />
                  <TrendChart
                    title="SLA Achievement (%)"
                    values={board.trends.map((day) => day.sla)}
                    labels={trendLabels}
                    color="#2f80ed"
                    formatTick={(value) => `${Math.round(value)}%`}
                  />
                </div>
              </Card>

              <div className="sc-stack">
                <Card className="sc-card" title="Alerts">
                  <ul className="sc-alerts">
                    {board.alerts.map((alert) => (
                      <li key={alert.id} className={alert.tone === 'ok' ? 'is-ok' : ''}>
                        <AlertTriangle size={16} />
                        <div>
                          <strong>{alert.title}</strong>
                          <span>
                            <TypewriterValue className="ct-tw-block" text={alert.detail} speed={16} delayMs={180} streamKey={streamKey} />
                          </span>
                        </div>
                        <time>{alert.time}</time>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="text-link sc-alerts__all" onClick={() => router.push('/alerts')}>
                    View All Alerts
                  </button>
                </Card>

                <Card className="sc-card" title="Parameter Watch (Selected)">
                  <dl className="kv-list">
                    <div className="kv-row">
                      <dt>Robots ({board.focusName})</dt>
                      <dd>
                        <TypewriterValue text={board.watch.robots} speed={28} delayMs={120} streamKey={streamKey} />
                      </dd>
                    </div>
                    <div className="kv-row">
                      <dt>Utilization</dt>
                      <dd>
                        <TypewriterValue text={`${board.watch.utilization}%`} speed={28} delayMs={180} streamKey={streamKey} />
                      </dd>
                    </div>
                  </dl>
                  <button type="button" className="text-link" onClick={() => applyScenario(selectedId)}>
                    View Impact
                  </button>
                </Card>
              </div>
            </div>
          ) : null}

          <p className="sc-footnote">
            <LayoutList size={14} /> <SlidersHorizontal size={14} />
            Same calculator as Simulation, using the real roster at {board.warehouseName}. Score = 35% on-time service + 30% work completed + 20% queue and wait + 15% staying near a healthy 85% busy. The seven-day lines wobble around today’s baseline; they are not a saved history.
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
