import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { Calendar, Search } from 'lucide-react'
import { Header } from '../layout/Header'
import { useLayout } from '../layout/LayoutContext'
import { Card } from '../common/StatusBadge'
import { Drawer } from '../common/Overlay'
import {
  NETWORK_DATES,
  NETWORK_VIEWS,
  formatUnits,
  getNetworkSnapshot,
} from '../../data/warehouseNetwork'

function Sparkline({ values, danger }) {
  const width = 78
  const height = 24
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const coords = values.map((value, index) => {
    const x = (index / (values.length - 1)) * width
    const y = height - 3 - ((value - min) / range) * (height - 6)
    return [x, y]
  })
  const path = coords
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const last = coords[coords.length - 1]
  const color = danger ? '#d64545' : '#2f80ed'

  return (
    <svg className="wn-spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="2.4" fill={color} />
    </svg>
  )
}

function utilTone(value) {
  if (value >= 90) return 'is-danger'
  if (value >= 80) return 'is-warn'
  return ''
}

function FlowNode({ node, selected, onSelect, extraClass }) {
  return (
    <button
      type="button"
      className={`wn-node wn-node--${node.status} wn-node--${node.kind} ${extraClass} ${selected ? 'is-selected' : ''}`.trim()}
      onClick={() => onSelect(node.id)}
      aria-pressed={selected}
    >
      {node.name}
      <span className="wn-node__meta">{node.utilization}% util</span>
    </button>
  )
}

function LogicalFlow({ nodesById, selectedId, onSelect }) {
  return (
    <div className="wn-logical" role="img" aria-label="Logical warehouse flow from YOTO to STORES with export branch from TECHNO">
      <div className="wn-logical__row">
        <FlowNode extraClass="wn-node--yoto" node={nodesById.YOTO} selected={selectedId === 'YOTO'} onSelect={onSelect} />
        <span className="wn-arrow wn-arrow--1" aria-hidden="true" />
        <FlowNode extraClass="wn-node--jafza" node={nodesById.JAFZA} selected={selectedId === 'JAFZA'} onSelect={onSelect} />
        <span className="wn-arrow wn-arrow--2" aria-hidden="true" />
        <FlowNode extraClass="wn-node--techno" node={nodesById.TECHNO} selected={selectedId === 'TECHNO'} onSelect={onSelect} />
        <span className="wn-arrow wn-arrow--3" aria-hidden="true" />
        <FlowNode extraClass="wn-node--stores" node={nodesById.STORES} selected={selectedId === 'STORES'} onSelect={onSelect} />
      </div>
      <div className="wn-logical__branch">
        <span className="wn-branch-v" aria-hidden="true" />
        <span className="wn-branch-h" aria-hidden="true" />
        <div className="wn-branch-node">
          <FlowNode extraClass="wn-node--export" node={nodesById.EXPORT} selected={selectedId === 'EXPORT'} onSelect={onSelect} />
        </div>
      </div>
    </div>
  )
}

const GEO_LAYOUT = {
  YOTO: { left: '16%', top: '48%' },
  JAFZA: { left: '38%', top: '36%' },
  TECHNO: { left: '62%', top: '28%' },
  STORES: { left: '84%', top: '46%' },
  EXPORT: { left: '62%', top: '74%' },
}

function GeographicFlow({ nodes, selectedId, onSelect }) {
  return (
    <div className="wn-geo" role="img" aria-label="Geographic warehouse network">
      <div className="wn-geo__grid" />
      <svg className="wn-geo__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M16 48 L38 36 L62 28 L84 46" fill="none" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1.6 1.2" />
        <path d="M62 28 L62 74" fill="none" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="1.6 1.2" />
      </svg>
      {nodes.map((node) => (
        <div key={node.id} className="wn-geo__node" style={GEO_LAYOUT[node.id]}>
          <FlowNode node={node} selected={selectedId === node.id} onSelect={onSelect} />
        </div>
      ))}
    </div>
  )
}

export function WarehouseNetworkPage() {
  const { onMenuClick } = useLayout()
  const router = useRouter()
  const [dateId, setDateId] = useState('2026-08-15')
  const [view, setView] = useState('logical')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('TECHNO')
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const snapshot = useMemo(() => getNetworkSnapshot(dateId), [dateId])
  const nodesById = useMemo(
    () => Object.fromEntries(snapshot.nodes.map((node) => [node.id, node])),
    [snapshot],
  )
  const warehouses = snapshot.nodes.filter((node) => node.kind === 'warehouse')
  const selected = nodesById[selectedId]
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return warehouses
    return warehouses.filter((row) =>
      `${row.name} ${row.status} ${row.role} ${row.location}`.toLowerCase().includes(term),
    )
  }, [query, warehouses])

  const refresh = () => {
    setIsRefreshing(true)
    window.setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 420)
  }

  const openNode = (id) => {
    setSelectedId(id)
    setDetailsOpen(true)
  }

  const openOperations = () => {
    if (!selected || selected.kind !== 'warehouse' || selected.id === 'STORES') {
      router.push('/item-trace')
      return
    }
    const params = new URLSearchParams({ warehouse: selected.id })
    if (selected.id === 'TECHNO') params.set('process', 'Robo Sorting')
    router.push(`/operations?${params.toString()}`)
  }

  return (
    <div className="page wn-page">
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onMenuClick={onMenuClick}
        title="Warehouse Network"
        subtitle="Live topology, workload and SLA across YOTO, JAFZA, TECHNO and stores."
      />

      <div className="page-body">
        <div className="wn-toolbar">
          <div className="wn-toolbar__left">
            <label className="wn-field">
              <Calendar size={15} aria-hidden="true" />
              <span className="wn-field__label">Date</span>
              <select value={dateId} onChange={(event) => setDateId(event.target.value)} aria-label="Network date">
                {NETWORK_DATES.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
            <label className="wn-field">
              <span className="wn-field__label">View</span>
              <select value={view} onChange={(event) => setView(event.target.value)} aria-label="Network view">
                {NETWORK_VIEWS.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="wn-toolbar__right">
            <span className="wn-refresh">Last Refresh: {snapshot.refreshLabel}</span>
            <label className="wn-search">
              <Search size={15} />
              <span className="sr-only">Search warehouses</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search warehouse"
              />
            </label>
          </div>
        </div>

        <Card className="wn-flow-card">
          {view === 'logical' ? (
            <LogicalFlow nodesById={nodesById} selectedId={selectedId} onSelect={openNode} />
          ) : (
            <GeographicFlow nodes={snapshot.nodes} selectedId={selectedId} onSelect={openNode} />
          )}
        </Card>

        <Card className="wn-table-card" title="Warehouse Summary">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Warehouse</th>
                  <th>Status</th>
                  <th>Workload</th>
                  <th>Throughput</th>
                  <th>Utilization</th>
                  <th>SLA</th>
                  <th>Trend</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const danger = row.status === 'at-risk'
                  return (
                    <tr
                      key={row.id}
                      className={selectedId === row.id ? 'is-selected' : ''}
                      onClick={() => openNode(row.id)}
                    >
                      <td><strong>{row.name}</strong></td>
                      <td>
                        <span className={`wn-status wn-status--${row.status}`}>
                          {row.status === 'at-risk' ? 'At Risk' : 'Healthy'}
                        </span>
                      </td>
                      <td>{formatUnits(row.workload)}</td>
                      <td>{formatUnits(row.throughput)}</td>
                      <td className={danger ? 'wn-metric is-danger' : ''}>
                        <span className="wn-util">
                          <span className="wn-util__track">
                            <span className={`wn-util__fill ${utilTone(row.utilization)}`} style={{ width: `${row.utilization}%` }} />
                          </span>
                          {row.utilization}%
                        </span>
                      </td>
                      <td className={danger ? 'wn-metric is-danger' : ''}>{row.sla}%</td>
                      <td>
                        <Sparkline values={row.trend} danger={danger} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="wn-hint">Click on any warehouse to view details</p>
        </Card>
      </div>

      <Drawer
        open={detailsOpen && Boolean(selected)}
        title={selected ? `${selected.name} details` : 'Warehouse details'}
        onClose={() => setDetailsOpen(false)}
        width={440}
      >
        {selected ? (
          <>
            <p className="muted" style={{ marginBottom: 12 }}>
              {selected.role} · {selected.location}
            </p>
            {selected.alert ? <div className="wn-alert">{selected.alert}</div> : null}
            <div className="wn-detail-kpis">
              <div className="wn-detail-kpi">
                <span>Workload</span>
                <strong>{formatUnits(selected.workload)}</strong>
              </div>
              <div className="wn-detail-kpi">
                <span>Throughput</span>
                <strong>{formatUnits(selected.throughput)}</strong>
              </div>
              <div className="wn-detail-kpi">
                <span>Utilization</span>
                <strong className={selected.utilization >= 90 ? 'wn-metric is-danger' : ''}>
                  {selected.utilization}%
                </strong>
              </div>
              <div className="wn-detail-kpi">
                <span>SLA</span>
                <strong className={selected.sla < 90 ? 'wn-metric is-danger' : ''}>{selected.sla}%</strong>
              </div>
            </div>
            <dl className="kv-list">
              <div className="kv-row">
                <dt>Status</dt>
                <dd>
                  <span className={`wn-status wn-status--${selected.status}`}>
                    {selected.status === 'at-risk' ? 'At Risk' : 'Healthy'}
                  </span>
                </dd>
              </div>
              <div className="kv-row">
                <dt>Top constraint</dt>
                <dd>{selected.bottleneck}</dd>
              </div>
              <div className="kv-row">
                <dt>Queue</dt>
                <dd>{selected.queueMinutes} min</dd>
              </div>
              <div className="kv-row">
                <dt>SLA window</dt>
                <dd>{selected.slaWindow}</dd>
              </div>
              {selected.people ? (
                <div className="kv-row">
                  <dt>People / robots</dt>
                  <dd>{selected.people} / {selected.robots}</dd>
                </div>
              ) : null}
            </dl>
            <div className="wn-detail-actions">
              <button type="button" className="btn btn--primary" onClick={openOperations}>
                {selected.id === 'STORES' || selected.kind === 'flow' ? 'Open item trace' : 'Open operations'}
              </button>
              <button type="button" className="btn" onClick={() => setDetailsOpen(false)}>
                Close
              </button>
            </div>
          </>
        ) : null}
      </Drawer>
    </div>
  )
}
