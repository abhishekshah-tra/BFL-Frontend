import api from '../lib/ssrAxios';
import { OPS_TIMEFRAME_DATA } from '@/data/personas/personasData';
import { getErrorMessage, isApiUnavailable } from '@/utils/api';

const BASE = '/operations';

const DEFAULT_SCENARIOS = [
  {
    id: '1',
    title: 'Volume +30%',
    text: 'Volume +30%: Queue at Robo Sorting would grow to ~1,530 units. SLA would drop to approximately 72%. Recommend proactive rerouting before peak hours.',
  },
  {
    id: '2',
    title: 'Resource Optimization',
    text: 'Resource Optimization: Adding 2 robots and 2 operators reduces utilization to 78%, cuts queue by 45%, and improves SLA by 5%.',
  },
  {
    id: '3',
    title: 'Robo vs Manual vs Hybrid',
    text: 'Robo vs Manual vs Hybrid: Hybrid model with +2 Robots and +2 Operators delivers best throughput (+18%), lowest wait time (-24%), and highest SLA gain (+5%).',
  },
];

const EMPTY_KPIS = {
  throughput: '—',
  unit: '',
  throughputTrend: '',
  throughputTrendClass: '',
  capacity: '—',
  capacityTrend: '',
  capacityTrendClass: '',
  sla: '—',
  slaTrend: '',
  slaTrendClass: '',
  wait: '—',
  waitTrend: '',
  waitTrendClass: '',
  alerts: '—',
  throughputDetail: '',
  capacityDetail: '',
  slaDetail: '',
  alertsDetail: '',
};

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }

    console.warn(
      'Operations API unavailable, using dummy data:',
      getErrorMessage(error),
    );

    return fallback();
  }
};

const pickParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== '',
    ),
  );

const normalizeProcessRow = (row = {}) => ({
  key: row.key || '',
  label:
    row.label ||
    (row.key === 'Robo Sorting' ? 'Robo / Manual Sorting' : row.key || ''),
  workload: row.workload ?? '—',
  capacity: row.capacity ?? '—',
  util: row.util ?? '—',
  queue: row.queue ?? '—',
  wait: row.wait ?? '—',
  sla: row.sla ?? '—',
  status: row.status || '',
  statusClass: row.statusClass || '',
  rowCritical: Boolean(row.rowCritical),
  selected: Boolean(row.selected),
  workloadClass: row.workloadClass || '',
  capacityClass: row.capacityClass || '',
  utilClass: row.utilClass || '',
  queueClass: row.queueClass || '',
  waitClass: row.waitClass || '',
  slaClass: row.slaClass || '',
});

export const normalizeOpsSlice = (slice = {}) => {
  const processes = Array.isArray(slice.processes)
    ? slice.processes.map(normalizeProcessRow)
    : [];
  const focus =
    slice.focusProcess ||
    processes.find((row) => row.selected)?.key ||
    processes[0]?.key ||
    '';

  return {
    kpis: { ...EMPTY_KPIS, ...slice.kpis },
    insight: {
      subtitle: slice.insight?.subtitle || '',
      text: slice.insight?.text || '',
    },
    focusProcess: focus,
    flow: slice.flow && typeof slice.flow === 'object' ? slice.flow : {},
    processes: processes.map((row) => ({
      ...row,
      selected: row.selected || row.key === focus,
    })),
    scenarios:
      Array.isArray(slice.scenarios) && slice.scenarios.length
        ? slice.scenarios
        : DEFAULT_SCENARIOS,
  };
};

const mapWarehouseSlices = (bucket = {}) =>
  Object.fromEntries(
    Object.entries(bucket).map(([code, slice]) => [code, normalizeOpsSlice(slice)]),
  );

const warehouseCatalog = (bucket = {}) =>
  Object.keys(bucket).map((code) => ({
    code,
    name: code,
    processes: (bucket[code]?.processes || []).map((row) => ({
      key: row.key,
      label:
        row.label ||
        (row.key === 'Robo Sorting' ? 'Robo / Manual Sorting' : row.key),
    })),
  }));

export const getLocalOperationsDashboard = () => ({
  date: new Date().toISOString().slice(0, 10),
  source: { warehouses: 3, processes: 7, configurations: 0 },
  warehouses: warehouseCatalog(OPS_TIMEFRAME_DATA.today),
  today: mapWarehouseSlices(OPS_TIMEFRAME_DATA.today),
  yesterday: mapWarehouseSlices(OPS_TIMEFRAME_DATA.yesterday),
  last7: mapWarehouseSlices(OPS_TIMEFRAME_DATA.last7),
});

const isDashboard = (value) =>
  Boolean(value && typeof value === 'object' && (value.today || value.warehouses));

export const normalizeOperationsDashboard = (payload) => {
  if (!isDashboard(payload)) {
    return getLocalOperationsDashboard();
  }

  const fallback = getLocalOperationsDashboard();
  const warehouses = Array.isArray(payload.warehouses) && payload.warehouses.length
    ? payload.warehouses
    : fallback.warehouses;

  return {
    date: payload.date || fallback.date,
    source: payload.source || fallback.source,
    warehouses,
    today: mapWarehouseSlices(payload.today || {}),
    yesterday: mapWarehouseSlices(payload.yesterday || {}),
    last7: mapWarehouseSlices(payload.last7 || {}),
  };
};

export const getOperationsDashboard = async (params = {}) =>
  withFallback(
    async () => {
      const response = await api.get(BASE, { params: pickParams(params) });
      return normalizeOperationsDashboard(response.data);
    },
    getLocalOperationsDashboard,
  );
