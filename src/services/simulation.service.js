import api from '../lib/ssrAxios';
import { LOCAL_SIMULATION_MODEL } from '@/data/simulationConfig';
import { getErrorMessage, isApiUnavailable } from '@/utils/api';

const BASE = '/simulation';

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (!isApiUnavailable(error)) throw error;
    console.warn('Simulation API unavailable, using sample plan:', getErrorMessage(error));
    return fallback();
  }
};

const pickParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

const normalizeModel = (model = {}) => {
  const fallback = LOCAL_SIMULATION_MODEL;
  return {
    ...fallback,
    ...model,
    live: Boolean(model.live),
    warehouse: model.warehouse?.code ? model.warehouse : fallback.warehouse,
    date: model.date?.label ? model.date : fallback.date,
    resourceLimits: model.resourceLimits || fallback.resourceLimits,
    baselineParams: model.baselineParams || fallback.baselineParams,
    templates: Array.isArray(model.templates) && model.templates.length ? model.templates : fallback.templates,
    trendDays: Array.isArray(model.trendDays) && model.trendDays.length ? model.trendDays : fallback.trendDays,
    arrivals: Array.isArray(model.arrivals) && model.arrivals.length ? model.arrivals : fallback.arrivals,
    processes: Array.isArray(model.processes) && model.processes.length ? model.processes : fallback.processes,
    guide: {
      simulation: model.guide?.simulation || fallback.guide.simulation,
      scenarios: model.guide?.scenarios || fallback.guide.scenarios,
    },
  };
};

export const getLocalSimulationDashboard = () => ({
  date: LOCAL_SIMULATION_MODEL.date.id,
  source: { warehouses: 1, processes: LOCAL_SIMULATION_MODEL.processes.length, configurations: 0 },
  warehouses: [LOCAL_SIMULATION_MODEL.warehouse],
  models: {
    [LOCAL_SIMULATION_MODEL.warehouse.code]: normalizeModel(LOCAL_SIMULATION_MODEL),
  },
});

export const normalizeSimulationDashboard = (payload) => {
  if (!payload?.models || typeof payload.models !== 'object') {
    return getLocalSimulationDashboard();
  }

  const models = Object.fromEntries(
    Object.entries(payload.models).map(([code, model]) => [code, normalizeModel(model)]),
  );
  const warehouses = Array.isArray(payload.warehouses) && payload.warehouses.length
    ? payload.warehouses
    : Object.values(models).map((model) => model.warehouse);

  return {
    date: payload.date || getLocalSimulationDashboard().date,
    source: payload.source || null,
    warehouses,
    models,
  };
};

export const matchSimulationWarehouse = (dashboard, value) => {
  const warehouses = dashboard?.warehouses || [];
  const found = warehouses.find(
    (item) => item.code.toLowerCase() === String(value || '').toLowerCase(),
  );
  return found?.code || warehouses[0]?.code || '';
};

export const getSimulationDashboard = async (params = {}) =>
  withFallback(
    async () => {
      const response = await api.get(BASE, { params: pickParams(params) });
      return normalizeSimulationDashboard(response.data);
    },
    getLocalSimulationDashboard,
  );
