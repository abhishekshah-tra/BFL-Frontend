import api from '../lib/ssrAxios';
import { processData } from '@/data/personas/personasData';
import { getErrorMessage, isApiUnavailable } from '@/utils/api';

const BASE = '/process-details';
const FALLBACK_WAREHOUSES = ['TECHNO', 'YOTO', 'JAFZA'];

const STATIC_RESOURCES = [
  {
    label: 'Robots',
    value: '16 / 18 Active',
    pct: 89,
    bar: 'green',
    detail: '16 of 18 robots active. 2 offline for scheduled maintenance.',
  },
  {
    label: 'Chutes',
    value: '30 / 36 Available',
    pct: 83,
    bar: 'orange',
    detail: '30 of 36 chutes available. Chutes 35-36 on standby.',
  },
  {
    label: 'Manual Stations',
    value: '12 / 16 Active',
    pct: 75,
    bar: 'green',
    detail: '12 of 16 manual stations active.',
  },
  {
    label: 'Operators',
    value: '12 / 14 Present',
    pct: 86,
    bar: 'orange',
    detail: '12 of 14 operators present. 2 on break rotation.',
  },
];

const STATIC_ACTIONS = [
  'Add 2 Robots (Scenario 2)',
  'Add 2 Operators (Scenario 2)',
  'Increase Chutes by 4 (Scenario 2)',
];

const STATIC_QUEUE_CHART = {
  points:
    '44,66.8 74.4,66.8 104.8,75.6 135.2,54.4 165.6,40.2 196,43.8 226.4,35.85 256.8,25.25 287.2,30.55 317.6,35.85 348,41.15 378,43.8',
  xLabels: [
    { x: 44, label: '12 AM' },
    { x: 104.8, label: '4 AM' },
    { x: 165.6, label: '8 AM' },
    { x: 226.4, label: '12 PM' },
    { x: 287.2, label: '4 PM' },
    { x: 348, label: '8 PM' },
  ],
  yLabels: [
    { y: 120, label: '0' },
    { y: 93.4, label: '500' },
    { y: 66.8, label: '1K' },
    { y: 40.2, label: '1.5K' },
    { y: 13.6, label: '2K' },
  ],
};

const STATIC_SLA_POINTS =
  '0,20 14,24 28,14 42,22 56,18 70,30 84,16 98,24 112,20 126,22 140,18';

const EMPTY_DETAIL = {
  warehouse: '',
  process: '',
  label: '',
  status: '—',
  statusColor: '#374151',
  queue: '—',
  wait: '—',
  util: 0,
  workload: 0,
  capacity: 0,
  sla: 0,
  gaugeColor: '#9ca3af',
  incoming: '—',
  processing: '—',
  scan: '—',
  proctime: '—',
  downstream: '—',
  downstreamClass: '',
  journeys: '—',
  resources: [],
  actions: [],
  queueChart: { points: '', xLabels: [], yLabels: [] },
  slaChart: { points: '', color: '#9ca3af' },
};

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }

    console.warn(
      'Process details API unavailable, using dummy data:',
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

const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const normalizeProcessDetail = (detail = {}) => ({
  ...EMPTY_DETAIL,
  ...detail,
  util: asNumber(detail.util),
  workload: asNumber(detail.workload),
  capacity: asNumber(detail.capacity),
  sla: asNumber(detail.sla),
  resources: Array.isArray(detail.resources) ? detail.resources : [],
  actions: Array.isArray(detail.actions) ? detail.actions : [],
  queueChart: {
    points: detail.queueChart?.points || '',
    xLabels: Array.isArray(detail.queueChart?.xLabels) ? detail.queueChart.xLabels : [],
    yLabels: Array.isArray(detail.queueChart?.yLabels) ? detail.queueChart.yLabels : [],
  },
  slaChart: {
    points: detail.slaChart?.points || '',
    color: detail.slaChart?.color || detail.statusColor || '#9ca3af',
  },
});

const mapProcessBucket = (bucket = {}) =>
  Object.fromEntries(
    Object.entries(bucket).map(([warehouse, processes]) => [
      warehouse,
      Object.fromEntries(
        Object.entries(processes || {}).map(([key, detail]) => [
          key,
          normalizeProcessDetail(detail),
        ]),
      ),
    ]),
  );

const fallbackDetail = (key, detail) =>
  normalizeProcessDetail({
    ...detail,
    process: key,
    label: key === 'Robo Sorting' ? 'Robo / Manual Sorting' : key,
    resources: STATIC_RESOURCES,
    actions: STATIC_ACTIONS,
    queueChart: STATIC_QUEUE_CHART,
    slaChart: {
      points: STATIC_SLA_POINTS,
      color: detail.statusColor || '#dc2626',
    },
  });

const fallbackBucket = () =>
  Object.fromEntries(
    FALLBACK_WAREHOUSES.map((code) => [
      code,
      Object.fromEntries(
        Object.entries(processData).map(([key, detail]) => [key, fallbackDetail(key, detail)]),
      ),
    ]),
  );

export const getLocalProcessDetails = () => {
  const processes = Object.keys(processData).map((key) => ({
    key,
    label: key === 'Robo Sorting' ? 'Robo / Manual Sorting' : key,
  }));
  const bucket = fallbackBucket();

  return {
    date: new Date().toISOString().slice(0, 10),
    source: { warehouses: FALLBACK_WAREHOUSES.length, processes: processes.length, configurations: 0 },
    warehouses: FALLBACK_WAREHOUSES.map((code) => ({
      code,
      name: code,
      processes,
    })),
    today: bucket,
    yesterday: bucket,
    last7: bucket,
  };
};

const isDashboard = (value) =>
  Boolean(value && typeof value === 'object' && (value.today || value.warehouses));

export const normalizeProcessDetails = (payload) => {
  if (!isDashboard(payload)) {
    return getLocalProcessDetails();
  }

  const fallback = getLocalProcessDetails();

  return {
    date: payload.date || fallback.date,
    source: payload.source || fallback.source,
    warehouses:
      Array.isArray(payload.warehouses) && payload.warehouses.length
        ? payload.warehouses
        : fallback.warehouses,
    today: mapProcessBucket(payload.today || {}),
    yesterday: mapProcessBucket(payload.yesterday || {}),
    last7: mapProcessBucket(payload.last7 || {}),
  };
};

export const getProcessDetails = async (params = {}) =>
  withFallback(
    async () => {
      const response = await api.get(BASE, { params: pickParams(params) });
      return normalizeProcessDetails(response.data);
    },
    getLocalProcessDetails,
  );
