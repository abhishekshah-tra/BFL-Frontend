import { BASELINE_PARAMS, TREND_DAYS } from '../data/simulationConfig'
import { compareTemplates, runSimulation } from './simulationEngine'

const WEIGHTS = [
  { id: 'sla', label: 'SLA achievement', weight: 35 },
  { id: 'throughput', label: 'Throughput vs inbound', weight: 30 },
  { id: 'queueWait', label: 'Queue & wait', weight: 20 },
  { id: 'efficiency', label: 'Sort utilisation near 85%', weight: 15 },
]

function operatingCost(params) {
  return params.operators * 420 + params.robots * 310 + params.chutes * 55
}

function pctDelta(next, base) {
  if (!base) return 0
  return ((next - base) / Math.abs(base)) * 100
}

function formatSignedPct(value, digits = 1) {
  if (!Number.isFinite(value) || Math.abs(value) < 0.05) return '—'
  const rounded = Number(value.toFixed(digits))
  const sign = rounded > 0 ? '+' : ''
  return `${sign}${rounded.toFixed(digits)}%`
}

function actionCopy(item, baseline) {
  if (item.id === 'baseline') return 'Hold the current TECHNO sorting roster.'
  const sameRoster =
    item.params.robots === baseline.params.robots &&
    item.params.operators === baseline.params.operators &&
    item.params.chutes === baseline.params.chutes
  if (item.params.volumePct !== 0 && sameRoster) {
    const sign = item.params.volumePct > 0 ? '+' : ''
    return `Keep the current roster. Incoming volume is ${sign}${item.params.volumePct}% versus today.`
  }
  const bits = []
  if (item.params.robots !== baseline.params.robots) bits.push(`robots to ${item.params.robots}`)
  if (item.params.operators !== baseline.params.operators) bits.push(`operators to ${item.params.operators} in sorting`)
  if (item.params.chutes !== baseline.params.chutes) bits.push(`chutes to ${item.params.chutes}`)
  let text = bits.length ? `Increase ${bits.join(' and ')}` : 'Hold current resources'
  if (item.params.productivityPct !== baseline.params.productivityPct) {
    text += `, with a ${item.params.productivityPct}% productivity lift`
  }
  return `${text}.`
}

function rankInsight(item, baseline) {
  if (item.id === 'baseline') {
    return {
      reason: 'Current operations',
      impact: '—',
      impactTone: 'neutral',
    }
  }

  const slaDelta = item.summary.avgSla - baseline.summary.avgSla
  const queueDelta = item.summary.peakQueue - baseline.summary.peakQueue
  const waitDelta = item.summary.avgWait - baseline.summary.avgWait
  const betterFlow = slaDelta >= 1 && queueDelta < 0 && waitDelta < 0
  const jam = queueDelta > 80 || waitDelta > 6 || slaDelta < -5

  if (item.isBest && (item.summary.bottleneckStatus === 'green' || betterFlow)) {
    return {
      reason: 'Removes bottleneck, improves SLA & throughput',
      impact: 'High',
      impactTone: 'positive',
    }
  }
  if (jam) {
    return {
      reason: 'High queue & wait, SLA drops',
      impact: 'High',
      impactTone: 'negative',
    }
  }
  if (item.summary.score > baseline.summary.score) {
    return {
      reason: 'Good balance of cost & performance',
      impact: 'Medium',
      impactTone: 'warn',
    }
  }
  return {
    reason: 'Does not beat current operations',
    impact: 'Low',
    impactTone: 'neutral',
  }
}

function firstBreach(buckets, test) {
  const hit = buckets.find((bucket) => {
    const sorting = bucket.rows.find((row) => row.processId === 'sorting')
    return sorting && test(sorting)
  })
  return hit?.timeLabel ?? buckets[Math.floor(buckets.length / 3)]?.timeLabel ?? '10:00 AM'
}

function buildAlerts(baselineRun) {
  const sorting = baselineRun.buckets.map((bucket) => bucket.rows.find((row) => row.processId === 'sorting'))
  const last = sorting[sorting.length - 1]
  const peak = Math.max(...sorting.map((row) => row.closingQueue))
  const alerts = []

  if (last.utilizationPct >= 85) {
    alerts.push({
      id: 'util',
      title: 'High Utilization',
      detail: 'Robo / Manual Sorting',
      time: firstBreach(baselineRun.buckets, (row) => row.utilizationPct >= 85),
    })
  }
  if (peak >= 400) {
    alerts.push({
      id: 'queue',
      title: 'Queue Threshold Exceeded',
      detail: 'Robo / Manual Sorting',
      time: firstBreach(baselineRun.buckets, (row) => row.closingQueue >= 400),
    })
  }
  if (last.slaPct < 86 || baselineRun.summary.avgSla < 86) {
    alerts.push({
      id: 'sla',
      title: 'SLA At Risk',
      detail: `Sorting SLA < 86%`,
      time: firstBreach(baselineRun.buckets, (row) => row.slaPct < 86),
    })
  }
  if (!alerts.length) {
    alerts.push({
      id: 'ok',
      title: 'No critical alerts',
      detail: 'Sorting is inside the healthy band for this run.',
      time: last.timeLabel,
      tone: 'ok',
    })
  }
  return alerts
}

function buildTrendSeries(params) {
  return TREND_DAYS.map((day) => {
    const run = runSimulation({
      ...params,
      volumePct: (params.volumePct || 0) + day.volumePct,
      productivityPct: (params.productivityPct || 0) + day.productivityPct,
    })
    return {
      ...day,
      throughput: run.summary.throughput,
      utilization: run.summary.avgUtil,
      peakQueue: run.summary.peakQueue,
      sla: run.summary.avgSla,
    }
  })
}

export function getScenarioBoard() {
  const compared = compareTemplates()
  const baseline = compared.find((item) => item.id === 'baseline')
  const baseCost = operatingCost(baseline.params)
  const baseSummary = baseline.summary

  const rows = compared.map((item) => {
    const cost = operatingCost(item.params)
    const costDelta = pctDelta(cost, baseCost)
    const insight = rankInsight(item, baseline)
    return {
      ...item,
      costDelta,
      costLabel: formatSignedPct(costDelta, 0),
      ...insight,
      deltas: {
        throughput: pctDelta(item.summary.throughput, baseSummary.throughput),
        peakQueue: pctDelta(item.summary.peakQueue, baseSummary.peakQueue),
        avgWait: pctDelta(item.summary.avgWait, baseSummary.avgWait),
        sla: item.summary.avgSla - baseSummary.avgSla,
      },
    }
  })

  const ranked = [...rows]
    .filter((item) => item.valid)
    .sort((a, b) => b.summary.score - a.summary.score)
    .map((item, index) => ({ ...item, rank: index + 1 }))

  const recommended = ranked[0]
  const recommendedDeltas = [
    { label: 'Throughput', value: formatSignedPct(recommended.deltas.throughput), better: recommended.deltas.throughput >= 0 },
    { label: 'Peak Queue', value: formatSignedPct(recommended.deltas.peakQueue), better: recommended.deltas.peakQueue <= 0 },
    { label: 'Avg Waiting Time', value: formatSignedPct(recommended.deltas.avgWait), better: recommended.deltas.avgWait <= 0 },
    { label: 'SLA Achievement', value: formatSignedPct(recommended.deltas.sla, 1), better: recommended.deltas.sla >= 0 },
  ]

  const kpis = [
    {
      id: 'throughput',
      label: 'Throughput',
      unit: '(Items / Day)',
      better: 'higher',
      cells: rows.map((item) => ({
        id: item.id,
        text: Math.round(item.summary.throughput).toLocaleString('en-US'),
        value: item.summary.throughput,
      })),
    },
    {
      id: 'peakQueue',
      label: 'Peak Queue',
      unit: '(Items)',
      better: 'lower',
      cells: rows.map((item) => ({
        id: item.id,
        text: Math.round(item.summary.peakQueue).toLocaleString('en-US'),
        value: item.summary.peakQueue,
        warn: item.isWorstQueue,
      })),
    },
    {
      id: 'avgWait',
      label: 'Avg Waiting Time',
      unit: '(Min)',
      better: 'lower',
      cells: rows.map((item) => ({
        id: item.id,
        text: String(Math.round(item.summary.avgWait)),
        value: item.summary.avgWait,
      })),
    },
    {
      id: 'util',
      label: 'Capacity Utilization',
      unit: '(%)',
      better: 'target',
      cells: rows.map((item) => ({
        id: item.id,
        text: `${Math.round(item.summary.avgUtil)}%`,
        value: item.summary.avgUtil,
        warn: item.summary.avgUtil >= 95,
      })),
    },
    {
      id: 'sla',
      label: 'SLA Achievement',
      unit: '(%)',
      better: 'higher',
      cells: rows.map((item) => ({
        id: item.id,
        text: `${Math.round(item.summary.avgSla)}%`,
        value: item.summary.avgSla,
        warn: item.summary.avgSla < 80,
      })),
    },
    {
      id: 'bottleneck',
      label: 'Bottleneck',
      unit: '',
      better: 'none',
      cells: rows.map((item) => ({
        id: item.id,
        text: item.summary.bottleneckLabel,
        value: item.summary.bottleneckStatus === 'green' ? 0 : 1,
        warn: item.summary.bottleneckStatus === 'red',
      })),
    },
    {
      id: 'cost',
      label: 'Resource Cost Impact',
      unit: '',
      better: 'lower',
      cells: rows.map((item) => ({
        id: item.id,
        text: item.costLabel,
        value: item.costDelta,
      })),
    },
  ].map((kpi) => {
    if (kpi.better === 'none' || kpi.better === 'target') return kpi
    const values = kpi.cells.map((cell) => cell.value)
    const best = kpi.better === 'higher' ? Math.max(...values) : Math.min(...values)
    return {
      ...kpi,
      cells: kpi.cells.map((cell) => ({ ...cell, best: cell.value === best })),
    }
  })

  const trends = buildTrendSeries(BASELINE_PARAMS)
  const lastTrend = trends[trends.length - 1]

  return {
    weights: WEIGHTS,
    columns: rows,
    kpis,
    ranked,
    recommended: {
      ...recommended,
      action: actionCopy(recommended, baseline),
      impactRows: recommendedDeltas,
    },
    alerts: buildAlerts(baseline.run),
    watch: {
      robots: baseline.params.robots,
      utilization: Math.round(lastTrend.utilization),
    },
    trends,
  }
}

export { formatSignedPct, WEIGHTS }
