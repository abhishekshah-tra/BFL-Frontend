import { useMemo, useState } from 'react'
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
import { TrendChart } from './TrendChart'

const VIEWS = [
  { id: 'compare', label: 'Comparison', hint: 'KPI table', icon: GitCompare },
  { id: 'recommend', label: 'Recommendation', hint: 'Weighted score', icon: Trophy },
  { id: 'trends', label: 'KPI Trends', hint: 'Alerts & watch', icon: BarChart3 },
]

function ImpactBadge({ impact, tone }) {
  if (impact === '—') return <span className="sc-impact sc-impact--none">—</span>
  return <span className={`sc-impact sc-impact--${tone}`}>{impact}</span>
}

function RankingTable({ ranked, selectedId, onSelect }) {
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
          {ranked.map((item) => (
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
                {Math.round(item.summary.score)}
              </td>
              <td>{item.rank}</td>
              <td>{item.reason}</td>
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

function RecommendedCard({ recommended, onApply }) {
  return (
    <aside className="sc-reco">
      <p className="sc-reco__kicker">Recommended Scenario</p>
      <h3>{recommended.name.replace(' — ', ' – ')}</h3>
      <p className="sc-reco__action">{recommended.action}</p>
      <p className="sc-reco__impact-title">Expected Impact vs Baseline</p>
      <ul className="sc-reco__impacts">
        {recommended.impactRows.map((row) => (
          <li key={row.label}>
            <span>{row.label}</span>
            <strong className={row.better ? 'is-good' : 'is-bad'}>{row.value}</strong>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn--primary sc-reco__apply" onClick={() => onApply(recommended.id)}>
        Apply Scenario for Detailed View
      </button>
    </aside>
  )
}

export function ScenariosPage() {
  const { onMenuClick } = useLayout()
  const router = useRouter()
  const board = useMemo(() => getScenarioBoard(), [])
  const [view, setView] = useState('compare')
  const [selectedId, setSelectedId] = useState(board.recommended.id)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const selected = board.columns.find((item) => item.id === selectedId) ?? board.recommended
  const trendLabels = board.trends.map((day) => day.label)

  const refresh = () => {
    setIsRefreshing(true)
    window.setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 280)
  }

  const applyScenario = (id) => {
    router.push(`/simulation?template=${id}`)
  }

  return (
    <div className="page sc-page">
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onMenuClick={onMenuClick}
        title="Scenarios"
        subtitle="Compare TECHNO what-if plans, rank them on a weighted score, then watch seven-day KPI pressure and alerts."
      />

      <div className="page-body sc-shell">
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
                              {cell.text}
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
                  <RankingTable ranked={board.ranked} selectedId={selectedId} onSelect={setSelectedId} />
                </Card>
                <RecommendedCard recommended={board.recommended} onApply={applyScenario} />
              </div>
            </div>
          ) : null}

          {view === 'recommend' ? (
            <div className="sc-split">
              <Card className="sc-card" title="Recommendation (Weighted Score)">
                <p className="sc-lead">Scenario Ranking</p>
                <RankingTable ranked={board.ranked} selectedId={selectedId} onSelect={setSelectedId} />
                <dl className="kv-list sc-why">
                  <div className="kv-row">
                    <dt>Selected plan</dt>
                    <dd>{selected.name}</dd>
                  </div>
                  <div className="kv-row">
                    <dt>Weighted score</dt>
                    <dd>{Math.round(selected.summary.score)} / 100 · rank {board.ranked.find((item) => item.id === selected.id)?.rank}</dd>
                  </div>
                  <div className="kv-row">
                    <dt>Why this rank</dt>
                    <dd>{selected.reason}</dd>
                  </div>
                  <div className="kv-row">
                    <dt>Sorting constraint</dt>
                    <dd>{selected.summary.bottleneckLabel}</dd>
                  </div>
                </dl>
              </Card>
              <RecommendedCard recommended={board.recommended} onApply={applyScenario} />
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
                          <span>{alert.detail}</span>
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
                      <dt>Robots (Sorting)</dt>
                      <dd>{board.watch.robots}</dd>
                    </div>
                    <div className="kv-row">
                      <dt>Utilization</dt>
                      <dd>{board.watch.utilization}%</dd>
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
            Figures come from the same 30-minute TECHNO calculator used in Simulation. Score = 35% SLA + 30% throughput + 20% queue/wait + 15% utilisation near 85%.
          </p>
        </div>
      </div>
    </div>
  )
}
