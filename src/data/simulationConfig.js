/** Representative POC master data for JAFZA → TECHNO. Not live BFL production numbers. */

export const SIM_DATE = {
  id: '2026-08-15',
  label: '15 Aug 2026',
}

export const BUCKET_MINUTES = 30
export const BUCKET_HOURS = BUCKET_MINUTES / 60
export const DAY_START_MINUTES = 8 * 60
export const BUCKET_COUNT = 20
export const EPSILON = 0.0001
export const SLA_NEAR_RATIO = 0.8

export const RESOURCE_LIMITS = {
  operators: { min: 0, max: 20, configured: 14 },
  robots: { min: 0, max: 18, configured: 18 },
  chutes: { min: 0, max: 36, configured: 36 },
  volumePct: { min: -40, max: 80 },
  productivityPct: { min: -20, max: 30 },
}

export const BASELINE_PARAMS = {
  volumePct: 0,
  operators: 12,
  robots: 16,
  chutes: 24,
  productivityPct: 0,
}

export const SCENARIO_TEMPLATES = [
  {
    id: 'baseline',
    name: 'Baseline (Current)',
    shortName: 'Baseline',
    columnLabel: 'Baseline',
    columnHint: '(Current)',
    description: 'Today’s observed TECHNO sorting roster and inbound profile.',
    params: { ...BASELINE_PARAMS },
  },
  {
    id: 'volume-surge',
    name: 'Scenario 1 — Volume +30%',
    shortName: '+30% Volume',
    columnLabel: 'Scenario 1',
    columnHint: 'Volume +30%',
    description: 'Same people, robots and chutes. Only inbound volume rises.',
    params: { ...BASELINE_PARAMS, volumePct: 30 },
  },
  {
    id: 'resource-opt',
    name: 'Scenario 2 — Resources Optimized',
    shortName: 'Resource Opt',
    columnLabel: 'Scenario 2',
    columnHint: 'Resources Optimized',
    description: 'Restore offline robots and add two sorting operators.',
    params: { ...BASELINE_PARAMS, operators: 14, robots: 18 },
  },
  {
    id: 'hybrid',
    name: 'Scenario 3 — Hybrid Model',
    shortName: 'Hybrid',
    columnLabel: 'Scenario 3',
    columnHint: 'Hybrid Model',
    description: 'People + robots + extra chutes, with a modest productivity lift.',
    params: {
      volumePct: 0,
      operators: 14,
      robots: 18,
      chutes: 28,
      productivityPct: 5,
    },
  },
]

/** Seven-day TECHNO profile ending on the simulation date. Volume vs baseline. */
export const TREND_DAYS = [
  { id: '2026-08-09', label: '09 Aug', volumePct: -6, productivityPct: 1 },
  { id: '2026-08-10', label: '10 Aug', volumePct: 8, productivityPct: -1 },
  { id: '2026-08-11', label: '11 Aug', volumePct: 3, productivityPct: 0 },
  { id: '2026-08-12', label: '12 Aug', volumePct: 11, productivityPct: -2 },
  { id: '2026-08-13', label: '13 Aug', volumePct: 5, productivityPct: 0 },
  { id: '2026-08-14', label: '14 Aug', volumePct: 16, productivityPct: -3 },
  { id: '2026-08-15', label: '15 Aug', volumePct: 0, productivityPct: 0 },
]

/**
 * Baseline items arriving at TECHNO Receiving each 30-minute bucket.
 * Peak around 10:00–11:00 so the jam is visible in the demo clock.
 */
export const BASE_ARRIVALS = [
  1080, 1200, 1320, 1440, 1500, 1500, 1380, 1260, 1140, 1080,
  1020, 1140, 1260, 1380, 1320, 1200, 1080, 960, 840, 720,
]

export const PROCESSES = [
  {
    id: 'receiving',
    name: 'Receiving',
    impact: 'All Processes',
    slaMin: 20,
    baseCapacityPerHour: 3200,
    operators: 10,
    operatorProductivity: 320,
    robots: 0,
    robotProductivity: 0,
    chutes: 0,
    chuteProductivity: 0,
    usesScenarioOperators: false,
    usesScenarioRobots: false,
    usesScenarioChutes: false,
  },
  {
    id: 'checking',
    name: 'Checking',
    impact: 'Quality',
    slaMin: 25,
    baseCapacityPerHour: 2700,
    operators: 9,
    operatorProductivity: 300,
    robots: 0,
    robotProductivity: 0,
    chutes: 0,
    chuteProductivity: 0,
    usesScenarioOperators: false,
    usesScenarioRobots: false,
    usesScenarioChutes: false,
  },
  {
    id: 'tagging',
    name: 'Tagging',
    impact: 'Identification',
    slaMin: 25,
    baseCapacityPerHour: 2500,
    operators: 8,
    operatorProductivity: 312,
    robots: 0,
    robotProductivity: 0,
    chutes: 0,
    chuteProductivity: 0,
    usesScenarioOperators: false,
    usesScenarioRobots: false,
    usesScenarioChutes: false,
  },
  {
    id: 'allocation',
    name: 'Allocation',
    impact: 'Routing',
    slaMin: 20,
    baseCapacityPerHour: 2600,
    operators: 7,
    operatorProductivity: 371,
    robots: 0,
    robotProductivity: 0,
    chutes: 0,
    chuteProductivity: 0,
    usesScenarioOperators: false,
    usesScenarioRobots: false,
    usesScenarioChutes: false,
  },
  {
    id: 'sorting',
    name: 'Robo / Manual Sorting',
    impact: 'Sorting',
    slaMin: 30,
    baseCapacityPerHour: 2800,
    operators: 12,
    operatorProductivity: 175,
    robots: 16,
    robotProductivity: 131.25,
    chutes: 24,
    chuteProductivity: 100,
    usesScenarioOperators: true,
    usesScenarioRobots: true,
    usesScenarioChutes: true,
  },
  {
    id: 'staging',
    name: 'Staging',
    impact: 'Outbound',
    slaMin: 35,
    baseCapacityPerHour: 1900,
    operators: 6,
    operatorProductivity: 317,
    robots: 0,
    robotProductivity: 0,
    chutes: 8,
    chuteProductivity: 240,
    usesScenarioOperators: false,
    usesScenarioRobots: false,
    usesScenarioChutes: false,
  },
  {
    id: 'dispatch',
    name: 'Dispatch',
    impact: 'Dispatch',
    slaMin: 25,
    baseCapacityPerHour: 1800,
    operators: 6,
    operatorProductivity: 300,
    robots: 0,
    robotProductivity: 0,
    chutes: 0,
    chuteProductivity: 0,
    usesScenarioOperators: false,
    usesScenarioRobots: false,
    usesScenarioChutes: false,
  },
]

export function bucketLabel(index, model) {
  const total = (model?.dayStartMinutes ?? DAY_START_MINUTES) + index * (model?.bucketMinutes ?? BUCKET_MINUTES)
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const display = hours % 12 === 0 ? 12 : hours % 12
  return `${display}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function formatItems(value) {
  return Math.round(value).toLocaleString('en-US')
}

export const LOCAL_SIMULATION_MODEL = {
  live: false,
  warehouse: { code: 'TECHNO', name: 'TECHNO' },
  date: SIM_DATE,
  bucketMinutes: BUCKET_MINUTES,
  bucketCount: BUCKET_COUNT,
  dayStartMinutes: DAY_START_MINUTES,
  focusProcessId: 'sorting',
  inboundProcessId: 'receiving',
  outboundProcessId: 'dispatch',
  resourceLimits: RESOURCE_LIMITS,
  baselineParams: BASELINE_PARAMS,
  templates: SCENARIO_TEMPLATES,
  trendDays: TREND_DAYS,
  arrivals: BASE_ARRIVALS,
  processes: PROCESSES,
  guide: {
    simulation:
      'This replay walks one TECHNO day in 30-minute steps, from receiving to dispatch. The sliders ask “what if we change volume or the sorting roster?” Press play to watch the queue. These starting numbers are the sample plan, used when the live warehouse API is unavailable.',
    scenarios:
      'Four plans for TECHNO. Baseline is the current roster. Volume +30% keeps the same people and machines but makes the morning busier. The resource plan fills missing robots and operators. Hybrid adds chutes and a small speed-up. The highest score is the plan that protects service and still gets the work out.',
  },
}
