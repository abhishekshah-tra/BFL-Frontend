import { PROCESS_MASTER_DATA, normalizeSlaUnit } from '@/data/processMaster';
import { WAREHOUSE_MASTER_DATA } from '@/data/warehouseMaster';
import { createHttpError, getRefId } from '@/utils/api';

const SORTING_PROCESS_ID =
  PROCESS_MASTER_DATA.find((process) => process.code === 'SORTING')
    ?._id || '5';

export const RESOURCE_TYPE = {
  OPERATOR: 'Operator',
  ROBOT: 'Robot',
  CHUTE: 'Chute',
};

export const RESOURCE_TYPE_OPTIONS = [
  { value: RESOURCE_TYPE.OPERATOR, label: 'Operator' },
  { value: RESOURCE_TYPE.ROBOT, label: 'Robot' },
  { value: RESOURCE_TYPE.CHUTE, label: 'Chute' },
];

export const PRODUCTIVITY_UNIT = {
  ITEMS_HOUR: 'Items/Hour',
  PARCELS_HOUR: 'Parcels/Hour',
  ORDERS_HOUR: 'Orders/Hour',
};

export const PRODUCTIVITY_UNIT_OPTIONS = [
  { value: PRODUCTIVITY_UNIT.ITEMS_HOUR, label: 'Items/Hour' },
  { value: PRODUCTIVITY_UNIT.PARCELS_HOUR, label: 'Parcels/Hour' },
  { value: PRODUCTIVITY_UNIT.ORDERS_HOUR, label: 'Orders/Hour' },
];

export const toDateInputValue = (value) => {
  if (!value) return '';

  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const mapProcessConfig = (item, processes = PROCESS_MASTER_DATA) => {
  const processId = getRefId(item.processId);
  const process = processes.find((entry) => entry._id === processId);

  return {
    processId,
    enabled: item.enabled ?? true,
    capacityPerHour: item.capacityPerHour ?? process?.capacityPerHour ?? '',
    sla: item.sla ?? process?.sla ?? '',
    slaUnit: normalizeSlaUnit(item.slaUnit || process?.slaUnit),
  };
};

export const buildDefaultProcesses = (processes = PROCESS_MASTER_DATA) =>
  processes
    .filter((process) => process.isActive)
    .sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0))
    .map((process) =>
      mapProcessConfig(
        {
          processId: process._id,
          enabled: true,
          capacityPerHour: process.capacityPerHour,
          sla: process.sla,
          slaUnit: process.slaUnit,
        },
        processes,
      ),
    );

const buildDefaultResources = () => [
  {
    id: 'res-1',
    resourceType: RESOURCE_TYPE.OPERATOR,
    processId: SORTING_PROCESS_ID,
    plannedQuantity: 14,
    availableQuantity: 12,
    productivity: 200,
    unit: PRODUCTIVITY_UNIT.ITEMS_HOUR,
    isActive: true,
  },
  {
    id: 'res-2',
    resourceType: RESOURCE_TYPE.ROBOT,
    processId: SORTING_PROCESS_ID,
    plannedQuantity: 18,
    availableQuantity: 16,
    productivity: 450,
    unit: PRODUCTIVITY_UNIT.ITEMS_HOUR,
    isActive: true,
  },
  {
    id: 'res-3',
    resourceType: RESOURCE_TYPE.CHUTE,
    processId: SORTING_PROCESS_ID,
    plannedQuantity: 30,
    availableQuantity: 24,
    productivity: 120,
    unit: PRODUCTIVITY_UNIT.ITEMS_HOUR,
    isActive: true,
  },
];

const cloneConfig = (row) => ({
  ...row,
  processes: (row.processes || []).map((item) => ({ ...item })),
  resources: (row.resources || []).map((item) => ({ ...item })),
});

const INITIAL_CONFIGS = [
  {
    _id: '1',
    warehouseId: '1',
    name: 'TECHNO Default',
    effectiveFrom: '2026-08-15',
    isActive: true,
    processes: buildDefaultProcesses(),
    resources: buildDefaultResources(),
    createdAt: '2026-08-15T10:00:00.000Z',
    updatedAt: '2026-08-15T10:00:00.000Z',
  },
];

let warehouseConfigs = INITIAL_CONFIGS.map(cloneConfig);

export const emptyWarehouseConfigForm = {
  warehouseId: '',
  name: '',
  effectiveFrom: '',
  isActive: true,
  processes: [],
  resources: [],
};

export const mapWarehouseConfigToForm = (
  row,
  processes = PROCESS_MASTER_DATA,
) => {
  const savedProcesses = (row.processes?.length
    ? row.processes
    : buildDefaultProcesses(processes)
  ).map((item) => mapProcessConfig(item, processes));

  const savedIds = new Set(savedProcesses.map((item) => item.processId));
  const missing = buildDefaultProcesses(processes).filter(
    (item) => !savedIds.has(item.processId),
  );

  return {
    warehouseId: getRefId(row.warehouseId),
    name: row.name || '',
    effectiveFrom: toDateInputValue(row.effectiveFrom),
    isActive: row.isActive ?? true,
    processes: [...savedProcesses, ...missing],
    resources: (row.resources || []).map((item, index) => ({
      id: getRefId(item._id) || item.id || `res-${index}`,
      resourceType: item.resourceType || '',
      processId: getRefId(item.processId),
      plannedQuantity: item.plannedQuantity ?? '',
      availableQuantity: item.availableQuantity ?? '',
      productivity: item.productivity ?? '',
      unit: item.unit || PRODUCTIVITY_UNIT.ITEMS_HOUR,
      isActive: item.isActive ?? true,
    })),
  };
};

export const getWarehouseById = (
  warehouseId,
  warehouses = WAREHOUSE_MASTER_DATA,
) => {
  const id = getRefId(warehouseId);
  return warehouses.find((item) => getRefId(item._id) === id);
};

export const sortWarehouseConfigs = (rows = []) =>
  [...rows].sort(
    (a, b) =>
      new Date(b.createdAt || b.effectiveFrom || 0).getTime() -
      new Date(a.createdAt || a.effectiveFrom || 0).getTime(),
  );

export const getLocalWarehouseConfigs = () =>
  sortWarehouseConfigs(warehouseConfigs.map(cloneConfig));

export const getLocalWarehouseConfigById = (id) => {
  const row = warehouseConfigs.find((item) => item._id === String(id));
  return row ? cloneConfig(row) : null;
};

export const addLocalWarehouseConfig = (payload) => {
  const next = {
    _id: String(Date.now()),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload,
  };

  warehouseConfigs = [...warehouseConfigs, next];
  return cloneConfig(next);
};

export const updateLocalWarehouseConfig = (id, payload) => {
  const current = warehouseConfigs.find((item) => item._id === String(id));

  if (!current) {
    throw createHttpError(404, `Configuration with id ${id} not found`);
  }

  const updated = {
    ...current,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  warehouseConfigs = warehouseConfigs.map((row) =>
    row._id === String(id) ? updated : row,
  );

  return cloneConfig(updated);
};

export const deactivateLocalWarehouseConfig = (id) => {
  const current = warehouseConfigs.find((item) => item._id === String(id));

  if (!current) {
    throw createHttpError(404, `Configuration with id ${id} not found`);
  }

  const updated = {
    ...current,
    isActive: false,
    updatedAt: new Date().toISOString(),
  };

  warehouseConfigs = warehouseConfigs.map((row) =>
    row._id === String(id) ? updated : row,
  );

  return { message: 'Configuration deactivated successfully' };
};

export const buildWarehouseConfigPayload = (form) => ({
  warehouseId: getRefId(form.warehouseId),
  name: form.name.trim(),
  effectiveFrom: form.effectiveFrom,
  isActive: Boolean(form.isActive),
  processes: (form.processes || []).map((item) => ({
    processId: getRefId(item.processId),
    enabled: Boolean(item.enabled),
    capacityPerHour: Number(item.capacityPerHour),
    sla: Number(item.sla),
    slaUnit: item.slaUnit,
  })),
  resources: (form.resources || []).map((resource) => ({
    resourceType: resource.resourceType,
    processId: getRefId(resource.processId),
    plannedQuantity: Number(resource.plannedQuantity),
    availableQuantity: Number(resource.availableQuantity),
    productivity: Number(resource.productivity),
    unit: resource.unit,
    isActive: Boolean(resource.isActive),
  })),
});

export const validateWarehouseConfigForm = (form) => {
  if (!form.warehouseId || !form.name?.trim() || !form.effectiveFrom) {
    return 'Warehouse, configuration name, and effective from are required.';
  }

  if (!(form.processes || []).length) {
    return 'At least one process configuration is required.';
  }

  const hasIncompleteProcess = (form.processes || []).some(
    (item) =>
      !item.processId ||
      item.capacityPerHour === '' ||
      Number(item.capacityPerHour) < 0 ||
      item.sla === '' ||
      Number(item.sla) < 0 ||
      !item.slaUnit,
  );

  if (hasIncompleteProcess) {
    return 'Please complete capacity and SLA for every process.';
  }

  const hasIncompleteResource = (form.resources || []).some(
    (resource) =>
      !resource.resourceType ||
      !resource.processId ||
      resource.plannedQuantity === '' ||
      Number(resource.plannedQuantity) < 0 ||
      resource.availableQuantity === '' ||
      Number(resource.availableQuantity) < 0 ||
      resource.productivity === '' ||
      Number(resource.productivity) < 0 ||
      !resource.unit,
  );

  if (hasIncompleteResource) {
    return 'Please complete all resource fields before saving.';
  }

  return '';
};
