import {
  BASE_ARRIVALS,
  BASELINE_PARAMS,
  BUCKET_COUNT,
  BUCKET_HOURS,
  BUCKET_MINUTES,
  EPSILON,
  PROCESSES,
  RESOURCE_LIMITS,
  SCENARIO_TEMPLATES,
  SLA_NEAR_RATIO,
  bucketLabel,
} from '../data/simulationConfig.js'

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

export function sanitizeParams(raw) {
  const volumePct = clamp(
    Number(raw.volumePct) || 0,
    RESOURCE_LIMITS.volumePct.min,
    RESOURCE_LIMITS.volumePct.max,
  )
  const operators = clamp(
    Math.round(Number(raw.operators)),
    RESOURCE_LIMITS.operators.min,
    RESOURCE_LIMITS.operators.max,
  )
  const robots = clamp(
    Math.round(Number(raw.robots)),
    RESOURCE_LIMITS.robots.min,
    RESOURCE_LIMITS.robots.max,
  )
  const chutes = clamp(
    Math.round(Number(raw.chutes)),
    RESOURCE_LIMITS.chutes.min,
    RESOURCE_LIMITS.chutes.max,
  )
  const productivityPct = clamp(
    Number(raw.productivityPct) || 0,
    RESOURCE_LIMITS.productivityPct.min,
    RESOURCE_LIMITS.productivityPct.max,
  )

  const errors = []
  if (robots > RESOURCE_LIMITS.robots.configured) {
    errors.push('Cannot use more robots than exist at TECHNO (18).')
  }
  if (operators < 0 || robots < 0 || chutes < 0) {
    errors.push('Resource counts cannot be negative.')
  }

  return {
    volumePct,
    operators,
    robots,
    chutes,
    productivityPct,
    valid: errors.length === 0,
    errors,
  }
}

function resourceCapacity(count, productivityPerHour, productivityFactor) {
  if (!count || !productivityPerHour) return null
  return count * productivityPerHour * BUCKET_HOURS * productivityFactor
}

export function processCapacity(process, params) {
  const productivityFactor = 1 + params.productivityPct / 100
  const operators = process.usesScenarioOperators ? params.operators : process.operators
  const robots = process.usesScenarioRobots ? params.robots : process.robots
  const chutes = process.usesScenarioChutes ? params.chutes : process.chutes

  const parts = [
    {
      id: 'station',
      label: 'Station cap',
      value: process.baseCapacityPerHour * BUCKET_HOURS * productivityFactor,
    },
  ]

  const operatorCap = resourceCapacity(operators, process.operatorProductivity, productivityFactor)
  if (operatorCap != null) {
    parts.push({ id: 'operators', label: `Operators (${operators})`, value: operatorCap })
  }
  const robotCap = resourceCapacity(robots, process.robotProductivity, productivityFactor)
  if (robotCap != null) {
    parts.push({ id: 'robots', label: `Robots (${robots})`, value: robotCap })
  }
  const chuteCap = resourceCapacity(chutes, process.chuteProductivity, productivityFactor)
  if (chuteCap != null) {
    parts.push({ id: 'chutes', label: `Chutes (${chutes})`, value: chuteCap })
  }

  const binding = parts.reduce((min, part) => (part.value < min.value ? part : min), parts[0])
  const effectiveCapacity = Math.max(EPSILON, binding.value)
  const availability = {
    operators: process.usesScenarioOperators
      ? operators / RESOURCE_LIMITS.operators.configured
      : 1,
    robots: process.usesScenarioRobots
      ? robots / RESOURCE_LIMITS.robots.configured
      : 1,
    chutes: process.usesScenarioChutes
      ? chutes / RESOURCE_LIMITS.chutes.configured
      : 1,
  }

  return {
    parts,
    binding,
    effectiveCapacity,
    operators,
    robots,
    chutes,
    productivityFactor,
    resourceAvailabilityPct: availability,
  }
}

function statusFor({ demandCapacityPct, utilizationPct, avgWaitMin, slaMin, closingQueue, openingQueue }) {
  const capacityDeficit = demandCapacityPct > 100 + 0.5
  const waitBreach = avgWaitMin > slaMin
  const queueGrowth = closingQueue > openingQueue + 1
  if (capacityDeficit || waitBreach || (utilizationPct > 90 && queueGrowth)) return 'red'
  if (utilizationPct >= 80 || avgWaitMin >= slaMin * SLA_NEAR_RATIO || demandCapacityPct >= 80) return 'amber'
  return 'green'
}

function severityFor(row) {
  let score = 0
  if (row.demandCapacityPct > 100) score += 2
  if (row.utilizationPct > 90) score += 1
  if (row.avgWaitMin > row.slaMin) score += 2
  if (row.closingQueue > row.openingQueue) score += 1
  if (row.resourceAvailabilityPct.robots < 0.95 && row.binding.id === 'robots') score += 1
  if (score >= 5) return 'CRITICAL'
  if (score >= 3) return 'HIGH'
  if (score >= 2) return 'MED'
  return 'LOW'
}

function slaPct(avgWaitMin, slaMin) {
  const ratio = avgWaitMin / Math.max(slaMin, EPSILON)
  return clamp(100 - ratio * 18, 48, 98)
}

function simulateBucket(queues, params, arrivals, timeIndex) {
  const results = []
  let upstreamProcessed = arrivals

  for (const process of PROCESSES) {
    const cap = processCapacity(process, params)
    const openingQueue = queues[process.id]
    const inbound = upstreamProcessed
    const availableWork = openingQueue + inbound
    const processed = Math.min(availableWork, cap.effectiveCapacity)
    const closingQueue = Math.max(0, openingQueue + inbound - processed)
    const demandCapacityPct = (availableWork / cap.effectiveCapacity) * 100
    const utilizationPct = (processed / cap.effectiveCapacity) * 100
    const ratePerMin = cap.effectiveCapacity / BUCKET_MINUTES
    const avgWaitMin = ((openingQueue + closingQueue) / 2) / Math.max(ratePerMin, EPSILON)
    const sla = slaPct(avgWaitMin, process.slaMin)
    const row = {
      processId: process.id,
      processName: process.name,
      timeIndex,
      timeLabel: bucketLabel(timeIndex),
      arrivals: inbound,
      openingQueue,
      availableWork,
      processed,
      closingQueue,
      effectiveCapacity: cap.effectiveCapacity,
      demandCapacityPct,
      utilizationPct,
      avgWaitMin,
      slaPct: sla,
      slaMin: process.slaMin,
      binding: cap.binding,
      capacityParts: cap.parts,
      operators: cap.operators,
      robots: cap.robots,
      chutes: cap.chutes,
      resourceAvailabilityPct: cap.resourceAvailabilityPct,
    }
    row.status = statusFor(row)
    row.severity = severityFor(row)
    results.push(row)
    queues[process.id] = closingQueue
    upstreamProcessed = processed
  }

  return results
}

function summarizeRun(buckets, params) {
  const last = buckets[buckets.length - 1]
  const sorting = buckets.map((bucket) => bucket.rows.find((row) => row.processId === 'sorting'))
  const dispatch = buckets.map((bucket) => bucket.rows.find((row) => row.processId === 'dispatch'))
  const receiving = buckets.map((bucket) => bucket.rows.find((row) => row.processId === 'receiving'))

  const throughput = dispatch.reduce((sum, row) => sum + row.processed, 0)
  const inbound = receiving.reduce((sum, row) => sum + row.arrivals, 0)
  const peakQueue = Math.max(...sorting.map((row) => row.closingQueue))
  const avgWait = sorting.reduce((sum, row) => sum + row.avgWaitMin, 0) / sorting.length
  const avgSla = sorting.reduce((sum, row) => sum + row.slaPct, 0) / sorting.length
  const avgUtil = sorting.reduce((sum, row) => sum + row.utilizationPct, 0) / sorting.length
  const bottleneck = last.rows.reduce((worst, row) => {
    const rank = { red: 3, amber: 2, green: 1 }
    if (rank[row.status] > rank[worst.status]) return row
    if (rank[row.status] === rank[worst.status] && row.closingQueue > worst.closingQueue) return row
    return worst
  }, last.rows[0])

  const slaScore = avgSla
  const throughputScore = clamp((throughput / inbound) * 100, 0, 100)
  const queueWaitScore = clamp(
    50 * (1 - peakQueue / 4000) + 50 * (1 - avgWait / 80),
    0,
    100,
  )
  const efficiencyScore = clamp(100 - Math.abs(avgUtil - 85) * 1.4, 0, 100)
  const score = 0.35 * slaScore + 0.3 * throughputScore + 0.2 * queueWaitScore + 0.15 * efficiencyScore

  const bottleneckLabel = bottleneck.status === 'green' ? 'None' : bottleneck.processName.replace('Robo / Manual ', '')

  return {
    inbound,
    throughput,
    peakQueue,
    avgWait,
    avgSla,
    avgUtil,
    bottleneckProcess: bottleneck.processName,
    bottleneckLabel,
    bottleneckStatus: bottleneck.status,
    score,
    components: {
      sla: slaScore,
      throughput: throughputScore,
      queueWait: queueWaitScore,
      efficiency: efficiencyScore,
    },
    params,
  }
}

export function runSimulation(rawParams) {
  const params = sanitizeParams(rawParams)
  const queues = Object.fromEntries(PROCESSES.map((process) => [process.id, 0]))
  const volumeFactor = 1 + params.volumePct / 100
  const buckets = []

  for (let index = 0; index < BUCKET_COUNT; index += 1) {
    const arrivals = BASE_ARRIVALS[index] * volumeFactor
    const rows = simulateBucket(queues, params, arrivals, index)
    buckets.push({
      index,
      timeLabel: bucketLabel(index),
      arrivals,
      rows,
    })
  }

  return {
    params,
    buckets,
    summary: summarizeRun(buckets, params),
    generatedAt: 'deterministic',
  }
}

export function compareTemplates() {
  return SCENARIO_TEMPLATES.map((template) => {
    const run = runSimulation(template.params)
    return {
      ...template,
      run,
      summary: run.summary,
      valid: run.params.valid,
    }
  }).map((entry, _, all) => {
    const eligible = all.filter((item) => item.valid)
    const bestScore = Math.max(...eligible.map((item) => item.summary.score))
    const worstPeak = Math.max(...eligible.map((item) => item.summary.peakQueue))
    return {
      ...entry,
      isBest: entry.valid && entry.summary.score === bestScore,
      isWorstQueue: entry.valid && entry.summary.peakQueue === worstPeak,
    }
  })
}

export { BASELINE_PARAMS, SCENARIO_TEMPLATES }
