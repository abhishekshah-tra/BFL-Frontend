import api from '../lib/ssrAxios';
import { CT_TIMEFRAME_DATA } from '@/data/personas/personasData';
import {
  getErrorMessage,
  isApiUnavailable,
} from '@/utils/api';

const BASE = '/control-tower';

const EMPTY_KPI = {
  value: '—',
  unit: '',
  trend: '',
  trendClass: '',
  detail: '',
};

const EMPTY_RECOMMENDATION = {
  title: 'Recommendation',
  scenario: '',
  text: '',
  people: 0,
  robots: 0,
  alerts: 0,
  simulations: 0,
  peopleDetail: '',
  robotsDetail: '',
  simsDetail: '',
};

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }

    console.warn(
      'Control Tower API unavailable, using dummy data:',
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

const isPayload = (value) =>
  Boolean(value && typeof value === 'object' && value.kpis && value.warehouses);

const normalizeKpi = (kpi = {}) => ({
  ...EMPTY_KPI,
  ...kpi,
  value: kpi.value ?? EMPTY_KPI.value,
  detail: kpi.detail ?? '',
});

export const normalizeControlTowerSlice = (slice = {}) => ({
  kpis: {
    throughput: normalizeKpi(slice.kpis?.throughput),
    capacity: normalizeKpi(slice.kpis?.capacity),
    sla: normalizeKpi(slice.kpis?.sla),
    bottlenecks: normalizeKpi(slice.kpis?.bottlenecks),
    alerts: normalizeKpi(slice.kpis?.alerts),
  },
  warehouses:
    slice.warehouses && typeof slice.warehouses === 'object'
      ? slice.warehouses
      : {},
  bottlenecks: Array.isArray(slice.bottlenecks) ? slice.bottlenecks : [],
  chart: {
    ...slice.chart,
    series:
      slice.chart?.series && typeof slice.chart.series === 'object'
        ? slice.chart.series
        : {},
    xLabels: Array.isArray(slice.chart?.xLabels) ? slice.chart.xLabels : [],
  },
  recommendation: {
    ...EMPTY_RECOMMENDATION,
    ...slice.recommendation,
  },
});

export const getLocalControlTowerDashboard = () => ({
  date: new Date().toISOString().slice(0, 10),
  source: { warehouses: 3, processes: 0, configurations: 0 },
  today: normalizeControlTowerSlice(CT_TIMEFRAME_DATA.today),
  yesterday: normalizeControlTowerSlice(CT_TIMEFRAME_DATA.yesterday),
  last7: normalizeControlTowerSlice(CT_TIMEFRAME_DATA.last7),
});

export const normalizeControlTowerDashboard = (payload) => {
  if (payload?.today || payload?.yesterday || payload?.last7) {
    const fallback = getLocalControlTowerDashboard();

    return {
      date: payload.date || fallback.date,
      source: payload.source || fallback.source,
      today: normalizeControlTowerSlice(payload.today || fallback.today),
      yesterday: normalizeControlTowerSlice(
        payload.yesterday || fallback.yesterday,
      ),
      last7: normalizeControlTowerSlice(payload.last7 || fallback.last7),
    };
  }

  if (isPayload(payload)) {
    const slice = normalizeControlTowerSlice(payload);

    return {
      date: payload.date || new Date().toISOString().slice(0, 10),
      source: payload.source || null,
      today: slice,
      yesterday: slice,
      last7: slice,
    };
  }

  return getLocalControlTowerDashboard();
};

export const getControlTowerDashboard = async (params = {}) =>
  withFallback(
    async () => {
      const response = await api.get(BASE, { params: pickParams(params) });
      return normalizeControlTowerDashboard(response.data);
    },
    getLocalControlTowerDashboard,
  );
