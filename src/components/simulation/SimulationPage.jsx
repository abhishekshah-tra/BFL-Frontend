import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  AlertTriangle,
  FastForward,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
} from 'lucide-react'
import { Header } from '../layout/Header'
import { useLayout } from '../layout/LayoutContext'
import { Card } from '../common/StatusBadge'
import {
  BASELINE_PARAMS,
  RESOURCE_LIMITS,
  SCENARIO_TEMPLATES,
  SIM_DATE,
  bucketLabel,
  formatItems,
} from '../../data/simulationConfig'
import { compareTemplates, runSimulation, sanitizeParams } from '../../lib/simulationEngine'
import { LiveFeedBar, TypewriterValue } from '../common/TypewriterValue'

const SPEEDS = [0.5, 1, 2, 4]
const PARAM_FIELDS = [
  {
    key: 'volumePct',
    label: 'Volume (Incoming)',
    unit: '% vs baseline',
    impact: 'All processes',
    hint: 'Scales JAFZA → TECHNO receiving arrivals.',
  },
  {
    key: 'operators',
    label: 'Operators (Sorting)',
    unit: 'Nos',
    impact: 'Sorting',
    hint: `Max ${RESOURCE_LIMITS.operators.max}. Baseline ${BASELINE_PARAMS.operators}.`,
  },
  {
    key: 'robots',
    label: 'Robots (Sorting)',
    unit: 'Nos',
    impact: 'Sorting',
    hint: `Cannot exceed ${RESOURCE_LIMITS.robots.configured} robots on site.`,
  },
  {
    key: 'chutes',
    label: 'Active Chutes',
    unit: 'Nos',
    impact: 'Sorting',
    hint: `Configured lanes: ${RESOURCE_LIMITS.chutes.configured}.`,
  },
  {
    key: 'productivityPct',
    label: 'Processing Productivity',
    unit: '% vs baseline',
    impact: 'Sorting pipe',
    hint: 'Multiplies every station and resource rate.',
  },
]

function statusLabel(status) {
  if (status === 'red') return 'Jammed'
  if (status === 'amber') return 'Tight'
  return 'Fine'
}

function formatPct(value) {
  return `${Math.round(value)}%`
}

function formatWait(value) {
  return `${Math.round(value)} min`
}

function QueueSpark({ buckets, processId, cursor }) {
  const values = buckets.map((bucket) => {
    const row = bucket.rows.find((item) => item.processId === processId)
    return row ? row.closingQueue : 0
  })
  const max = Math.max(...values, 1)
  const width = 220
  const height = 36
  const coords = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width
    const y = height - 4 - (value / max) * (height - 8)
    return [x, y]
  })
  const path = coords
    .map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ')
  const cursorX = (cursor / Math.max(values.length - 1, 1)) * width

  return (
    <svg className="sim-spark" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <path d={path} fill="none" stroke="#2f80ed" strokeWidth="2" />
      <line x1={cursorX} x2={cursorX} y1="0" y2={height} stroke="#d64545" strokeWidth="1.5" />
    </svg>
  )
}

export function SimulationPage() {
  const { onMenuClick } = useLayout()
  const router = useRouter()
  const [templateId, setTemplateId] = useState('volume-surge')
  const [draft, setDraft] = useState({ ...SCENARIO_TEMPLATES[1].params })
  const [scenarioName, setScenarioName] = useState(SCENARIO_TEMPLATES[1].name)
  const [run, setRun] = useState(() => runSimulation(SCENARIO_TEMPLATES[1].params))
  const [cursor, setCursor] = useState(5)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [selectedProcess, setSelectedProcess] = useState('sorting')
  const [lastUpdated, setLastUpdated] = useState(() => new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const comparison = useMemo(() => compareTemplates(), [])
  const params = sanitizeParams(draft)
  const bucket = run.buckets[cursor]
  const selectedRow = bucket.rows.find((row) => row.processId === selectedProcess) ?? bucket.rows[4]
  const bottleneck = bucket.rows.reduce((worst, row) => (
    row.closingQueue > worst.closingQueue ? row : worst
  ), bucket.rows[0])
  const streamKey = lastUpdated.getTime()
  const liveFeed = useMemo(() => ([
    `${scenarioName} · ${SIM_DATE.label} · ${run.summary.bottleneckStatus === 'green' ? 'flow clear' : `jam at ${run.summary.bottleneckLabel}`}`,
    `Day throughput ${formatItems(run.summary.throughput)} · peak sort queue ${formatItems(run.summary.peakQueue)}`,
    `Avg wait ${formatWait(run.summary.avgWait)} · SLA ${formatPct(run.summary.avgSla)} · util ${formatPct(run.summary.avgUtil)}`,
    `Score ${run.summary.score.toFixed(1)} · inbound ${formatItems(run.summary.inbound)}`,
  ]), [scenarioName, run.summary])

  useEffect(() => {
    if (!playing) return undefined
    const timer = window.setInterval(() => {
      setCursor((index) => {
        if (index >= run.buckets.length - 1) {
          setPlaying(false)
          return index
        }
        return index + 1
      })
    }, 700 / speed)
    return () => window.clearInterval(timer)
  }, [playing, speed, run.buckets.length])

  useEffect(() => {
    const next = sanitizeParams(draft)
    if (!next.valid) return undefined
    const timer = window.setTimeout(() => {
      setRun(runSimulation(next))
    }, 80)
    return () => window.clearTimeout(timer)
  }, [draft])

  const applyRun = (nextParams, name, nextTemplateId) => {
    const computed = runSimulation(nextParams)
    setRun(computed)
    setDraft({ ...computed.params })
    if (name) setScenarioName(name)
    if (nextTemplateId) setTemplateId(nextTemplateId)
    setLastUpdated(new Date())
    setPlaying(false)
  }

  const applyTemplate = (template) => {
    applyRun(template.params, template.name, template.id)
  }

  useEffect(() => {
    if (!router.isReady) return undefined
    const id = router.query.template
    if (typeof id !== 'string') return undefined
    const template = SCENARIO_TEMPLATES.find((item) => item.id === id)
    if (!template) return undefined
    applyTemplate(template)
    return undefined
  }, [router.isReady, router.query.template])

  const updateField = (key, value) => {
    setTemplateId('custom')
    setDraft((current) => ({ ...current, [key]: Number(value) }))
  }

  const refresh = () => {
    setIsRefreshing(true)
    window.setTimeout(() => {
      applyRun(draft, scenarioName, templateId)
      setIsRefreshing(false)
    }, 280)
  }

  return (
    <div className="page sim-page">
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onMenuClick={onMenuClick}
        title="Simulation"
        subtitle="Deterministic 30-minute calculator from JAFZA handoff through TECHNO’s seven stations. Same inputs always replay the same run."
      />

      <div className="page-body">
        <div className="sim-banner">
          <span className="sim-poc">Representative POC Data</span>
          <span>Handoff rule: TECHNO Receiving arrivals = JAFZA outbound this bucket. Downstream arrivals = upstream processed this bucket. Leftover queue carries to the next 30 minutes.</span>
        </div>

        <LiveFeedBar strings={liveFeed} streamKey={streamKey} />

        <div className="sim-presets" role="list">
          {SCENARIO_TEMPLATES.map((template) => {
            const compared = comparison.find((item) => item.id === template.id)
            const active = templateId === template.id
            return (
              <button
                key={template.id}
                type="button"
                role="listitem"
                className={`sim-preset ${active ? 'is-active' : ''} ${compared?.isBest ? 'is-best' : ''}`}
                onClick={() => applyTemplate(template)}
              >
                <span className="sim-preset__name">{template.shortName}</span>
                <span className="sim-preset__meta">
                  Peak sort queue {formatItems(compared?.summary.peakQueue ?? 0)}
                  {compared?.isBest ? ' · recommended' : ''}
                </span>
              </button>
            )
          })}
        </div>

        <div className="sim-layout">
          <Card className="sim-builder" title="Define scenario parameters">
            <div className="sim-builder__head">
              <label className="sim-name">
                <span>Scenario name</span>
                <input
                  value={scenarioName}
                  onChange={(event) => setScenarioName(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="text-link"
                onClick={() => applyTemplate(SCENARIO_TEMPLATES[0])}
              >
                <RotateCcw size={14} /> Reset
              </button>
            </div>

            <div className="sim-knobs">
              {PARAM_FIELDS.map((field) => {
                const limits = RESOURCE_LIMITS[field.key]
                const current = BASELINE_PARAMS[field.key]
                const next = draft[field.key]
                const displayCurrent = field.key.includes('Pct') ? `${current}%` : current
                const rangeMax = limits.max
                const rangeMin = limits.min
                return (
                  <div key={field.key} className="sim-knob">
                    <div className="sim-knob__top">
                      <strong>{field.label}</strong>
                      <span>{field.impact}</span>
                    </div>
                    <div className="sim-knob__values">
                      <span>Current {displayCurrent}</span>
                      <span className="sim-knob__new">
                        New {field.key.includes('Pct') ? `${next}%` : next}
                      </span>
                      <span className="muted">{field.unit}</span>
                    </div>
                    <input
                      type="range"
                      min={rangeMin}
                      max={rangeMax}
                      step={field.key.includes('Pct') ? 1 : 1}
                      value={next}
                      aria-label={field.label}
                      onChange={(event) => updateField(field.key, event.target.value)}
                    />
                    <p className="sim-knob__hint">{field.hint}</p>
                  </div>
                )
              })}
            </div>

            {params.errors.length ? (
              <div className="sim-error">
                <AlertTriangle size={16} />
                {params.errors.join(' ')}
              </div>
            ) : null}

            <button
              type="button"
              className="btn btn--primary sim-run"
              disabled={!params.valid}
              onClick={() => applyRun(params, scenarioName, templateId)}
            >
              Run simulation
            </button>
          </Card>

          <div className="sim-main">
            <Card className="sim-player">
              <div className="sim-player__bar">
                <div>
                  <p className="sim-player__kicker">Playback · {SIM_DATE.label}</p>
                  <h3>Simulation time {bucket.timeLabel}</h3>
                </div>
                <label className="wn-field">
                  <span className="wn-field__label">Bucket</span>
                  <select
                    value={cursor}
                    aria-label="Time bucket"
                    onChange={(event) => {
                      setPlaying(false)
                      setCursor(Number(event.target.value))
                    }}
                  >
                    {run.buckets.map((item) => (
                      <option key={item.index} value={item.index}>
                        {item.timeLabel}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="sim-controls">
                <button type="button" className="icon-btn icon-btn--bordered" aria-label="Reset to start" onClick={() => { setPlaying(false); setCursor(0) }}>
                  <SkipBack size={16} />
                </button>
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => setPlaying((value) => !value)}
                >
                  {playing ? <Pause size={16} /> : <Play size={16} />}
                  {playing ? 'Pause' : 'Play'}
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn--bordered"
                  aria-label="Next bucket"
                  onClick={() => setCursor((index) => Math.min(run.buckets.length - 1, index + 1))}
                >
                  <SkipForward size={16} />
                </button>
                <label className="sim-speed">
                  <FastForward size={14} />
                  Speed
                  <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} aria-label="Playback speed">
                    {SPEEDS.map((value) => (
                      <option key={value} value={value}>{value}x</option>
                    ))}
                  </select>
                </label>
                <div className="sim-clock">{bucket.timeLabel}</div>
              </div>

              <input
                className="sim-scrub"
                type="range"
                min={0}
                max={run.buckets.length - 1}
                value={cursor}
                aria-label="Scrub simulation time"
                onChange={(event) => {
                  setPlaying(false)
                  setCursor(Number(event.target.value))
                }}
              />

              <div className="sim-flow" role="list">
                {bucket.rows.map((row) => (
                  <button
                    key={row.processId}
                    type="button"
                    role="listitem"
                    className={`sim-station sim-station--${row.status} ${selectedProcess === row.processId ? 'is-selected' : ''}`}
                    onClick={() => setSelectedProcess(row.processId)}
                  >
                    <span className="sim-station__name">{row.processName}</span>
                    <span className={`sim-station__status sim-station__status--${row.status}`}>
                      {statusLabel(row.status)}
                    </span>
                    <span className="sim-station__queue">
                      Queue <TypewriterValue text={formatItems(row.closingQueue)} speed={18} streamKey={streamKey} instant={playing} />
                    </span>
                    <span className="sim-station__bar" aria-hidden="true">
                      <span style={{ height: `${Math.min(100, row.demandCapacityPct)}%` }} />
                    </span>
                  </button>
                ))}
              </div>
            </Card>

            <div className="sim-kpis">
              <div className="metric">
                <div className="metric__label">Inbound this bucket</div>
                <div className="metric__value">
                  <TypewriterValue text={formatItems(bucket.arrivals)} speed={18} delayMs={0} streamKey={streamKey} instant={playing} />
                </div>
              </div>
              <div className="metric">
                <div className="metric__label">Dispatched this bucket</div>
                <div className="metric__value">
                  <TypewriterValue text={formatItems(bucket.rows[6].processed)} speed={18} delayMs={40} streamKey={streamKey} instant={playing} />
                </div>
              </div>
              <div className="metric">
                <div className="metric__label">Sorting queue</div>
                <div className={`metric__value ${bottleneck.processId === 'sorting' ? 'is-danger' : ''}`}>
                  <TypewriterValue text={formatItems(bucket.rows[4].closingQueue)} speed={18} delayMs={80} streamKey={streamKey} instant={playing} />
                </div>
              </div>
              <div className="metric">
                <div className="metric__label">Sorting wait</div>
                <div className="metric__value">
                  <TypewriterValue text={formatWait(bucket.rows[4].avgWaitMin)} speed={20} delayMs={120} streamKey={streamKey} instant={playing} />
                </div>
              </div>
              <div className="metric">
                <div className="metric__label">Sorting SLA</div>
                <div className={`metric__value ${bucket.rows[4].slaPct < 80 ? 'is-danger' : ''}`}>
                  <TypewriterValue text={formatPct(bucket.rows[4].slaPct)} speed={22} delayMs={160} streamKey={streamKey} instant={playing} />
                </div>
              </div>
              <div className="metric">
                <div className="metric__label">Day throughput</div>
                <div className="metric__value">
                  <TypewriterValue text={formatItems(run.summary.throughput)} speed={18} delayMs={200} streamKey={streamKey} instant={playing} />
                </div>
              </div>
            </div>

            <Card
              className="sim-table-card"
              title="Process results"
              footer="Processed = min(opening queue + arrivals, effective capacity). Utilization uses capacity actually used. Demand/Capacity can exceed 100%."
            >
              <div className="sim-table-meta">
                <span>Jam this slice: <strong>{bottleneck.processName}</strong> ({statusLabel(bottleneck.status)})</span>
                <span>Sorting queue over the day <QueueSpark buckets={run.buckets} processId="sorting" cursor={cursor} /></span>
              </div>
              <div className="table-wrap">
                <table className="data-table sim-table">
                  <thead>
                    <tr>
                      <th>Process</th>
                      <th>Incoming</th>
                      <th>Capacity</th>
                      <th>Processed</th>
                      <th>Queue</th>
                      <th>Wait</th>
                      <th>Demand/Cap</th>
                      <th>Utilisation</th>
                      <th>SLA</th>
                      <th>Binding limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucket.rows.map((row) => (
                      <tr
                        key={row.processId}
                        className={`${selectedProcess === row.processId ? 'is-selected' : ''} ${row.status === 'red' ? 'sim-row--red' : ''}`}
                        onClick={() => setSelectedProcess(row.processId)}
                      >
                        <td>
                          <strong>{row.processName}</strong>
                        </td>
                        <td>{formatItems(row.arrivals)}</td>
                        <td>{formatItems(row.effectiveCapacity)}</td>
                        <td>{formatItems(row.processed)}</td>
                        <td>{formatItems(row.closingQueue)}</td>
                        <td>{formatWait(row.avgWaitMin)}</td>
                        <td>{formatPct(row.demandCapacityPct)}</td>
                        <td>{formatPct(row.utilizationPct)}</td>
                        <td>{formatPct(row.slaPct)}</td>
                        <td>{row.binding.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        <div className="sim-bottom">
          <Card className="sim-formula" title={`${selectedRow.processName} — why this number`}>
            <p className="muted">
              Transparent calculator. No random luck. Binding constraint is the smallest valid capacity.
            </p>
            <dl className="kv-list">
              <div className="kv-row">
                <dt>Available work</dt>
                <dd>
                  <TypewriterValue
                    text={`${formatItems(selectedRow.openingQueue)} opening + ${formatItems(selectedRow.arrivals)} arrivals = ${formatItems(selectedRow.availableWork)}`}
                    speed={14}
                    delayMs={80}
                    streamKey={`${streamKey}:${selectedProcess}`}
                    instant={playing}
                  />
                </dd>
              </div>
              {selectedRow.capacityParts.map((part) => (
                <div className="kv-row" key={part.id}>
                  <dt>{part.label}</dt>
                  <dd>
                    <TypewriterValue
                      text={`${formatItems(part.value)}${part.id === selectedRow.binding.id ? ' · binding' : ''}`}
                      speed={16}
                      delayMs={120}
                      streamKey={`${streamKey}:${selectedProcess}`}
                      instant={playing}
                    />
                  </dd>
                </div>
              ))}
              <div className="kv-row">
                <dt>Processed</dt>
                <dd>
                  <TypewriterValue
                    text={`min(${formatItems(selectedRow.availableWork)}, ${formatItems(selectedRow.effectiveCapacity)}) = ${formatItems(selectedRow.processed)}`}
                    speed={14}
                    delayMs={160}
                    streamKey={`${streamKey}:${selectedProcess}`}
                    instant={playing}
                  />
                </dd>
              </div>
              <div className="kv-row">
                <dt>Closing queue</dt>
                <dd>
                  <TypewriterValue
                    text={`${formatItems(selectedRow.closingQueue)} carried into ${bucketLabel(Math.min(run.buckets.length - 1, cursor + 1))}`}
                    speed={14}
                    delayMs={200}
                    streamKey={`${streamKey}:${selectedProcess}`}
                    instant={playing}
                  />
                </dd>
              </div>
              <div className="kv-row">
                <dt>Wait approx.</dt>
                <dd>
                  <TypewriterValue
                    text={`(opening + closing) / 2 ÷ process rate = ${formatWait(selectedRow.avgWaitMin)}`}
                    speed={14}
                    delayMs={240}
                    streamKey={`${streamKey}:${selectedProcess}`}
                    instant={playing}
                  />
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="sim-compare" title="Four-plan scorecard">
            <p className="muted">
              Score = 35% SLA + 30% throughput + 20% queue/wait + 15% resource efficiency.{' '}
              <button type="button" className="text-link" onClick={() => router.push('/scenarios')}>
                Open full scenario comparison
              </button>
            </p>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Throughput</th>
                    <th>Peak queue</th>
                    <th>Avg wait</th>
                    <th>SLA</th>
                    <th>Sort util</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((item) => (
                    <tr
                      key={item.id}
                      className={`${item.id === templateId ? 'is-selected' : ''} ${item.isBest ? 'sim-row--best' : ''} ${item.isWorstQueue ? 'sim-row--worst' : ''}`}
                      onClick={() => applyTemplate(item)}
                    >
                      <td>
                        <strong>{item.shortName}</strong>
                        {item.isBest ? ' · best' : ''}
                        {item.isWorstQueue ? ' · worst queue' : ''}
                      </td>
                      <td>
                        <TypewriterValue text={formatItems(item.summary.throughput)} speed={18} delayMs={80} streamKey={streamKey} />
                      </td>
                      <td>
                        <TypewriterValue text={formatItems(item.summary.peakQueue)} speed={18} delayMs={120} streamKey={streamKey} />
                      </td>
                      <td>
                        <TypewriterValue text={formatWait(item.summary.avgWait)} speed={20} delayMs={160} streamKey={streamKey} />
                      </td>
                      <td>
                        <TypewriterValue text={formatPct(item.summary.avgSla)} speed={20} delayMs={200} streamKey={streamKey} />
                      </td>
                      <td>
                        <TypewriterValue text={formatPct(item.summary.avgUtil)} speed={20} delayMs={240} streamKey={streamKey} />
                      </td>
                      <td>
                        <TypewriterValue text={item.summary.score.toFixed(1)} speed={24} delayMs={280} streamKey={streamKey} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <p className="sim-footnote">
          <Gauge size={14} /> <SlidersHorizontal size={14} /> Values are simulated from scenario inputs and 30-minute bucket progression. They are representative POC figures, not live BFL production extracts.
        </p>
      </div>
    </div>
  )
}
