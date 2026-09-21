import { createHttpError } from '@/utils/api';

export const SLA_UNIT = {
  MIN: 'MIN',
  HOUR: 'HOUR',
  DAYS: 'DAYS',
};

export const SLA_UNIT_OPTIONS = [
  { value: SLA_UNIT.MIN, label: 'Minutes' },
  { value: SLA_UNIT.HOUR, label: 'Hours' },
  { value: SLA_UNIT.DAYS, label: 'Days' },
];

export const PROCESS_MASTER_DATA = [
  {
    _id: '1',
    code: 'RECEIVING',
    name: 'Receiving',
    description: 'Parcels enter warehouse',
    sequence: 1,
    capacityPerHour: 3200,
    sla: 30,
    slaUnit: SLA_UNIT.MIN,
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    _id: '2',
    code: 'CHECKING',
    name: 'Checking',
    description: 'Quality and document verification',
    sequence: 2,
    capacityPerHour: 2900,
    sla: 30,
    slaUnit: SLA_UNIT.MIN,
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    _id: '3',
    code: 'TAGGING',
    name: 'Tagging',
    description: 'Label and barcode tagging',
    sequence: 3,
    capacityPerHour: 2700,
    sla: 30,
    slaUnit: SLA_UNIT.MIN,
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    _id: '4',
    code: 'ALLOCATION',
    name: 'Allocation',
    description: 'Assign destination and route',
    sequence: 4,
    capacityPerHour: 3000,
    sla: 15,
    slaUnit: SLA_UNIT.MIN,
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    _id: '5',
    code: 'SORTING',
    name: 'Sorting',
    description: 'Sort parcels by destination',
    sequence: 5,
    capacityPerHour: 2400,
    sla: 45,
    slaUnit: SLA_UNIT.MIN,
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    _id: '6',
    code: 'STAGING',
    name: 'Staging',
    description: 'Prepare parcels for dispatch',
    sequence: 6,
    capacityPerHour: 2700,
    sla: 1,
    slaUnit: SLA_UNIT.HOUR,
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    _id: '7',
    code: 'DISPATCH',
    name: 'Dispatch',
    description: 'Final outbound shipment',
    sequence: 7,
    capacityPerHour: 2800,
    sla: 1,
    slaUnit: SLA_UNIT.HOUR,
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
];

const cloneProcess = (row) => ({ ...row });

let localProcesses = PROCESS_MASTER_DATA.map(cloneProcess);

export const normalizeSlaUnit = (unit) => {
  const value = String(unit || '').toUpperCase();

  if (value === SLA_UNIT.HOUR || value === 'HOURS') return SLA_UNIT.HOUR;
  if (value === SLA_UNIT.DAYS || value === 'DAY') return SLA_UNIT.DAYS;

  return SLA_UNIT.MIN;
};

export const formatProcessSla = (sla, unit) => {
  if (sla == null || sla === '') return '-';

  const normalized = normalizeSlaUnit(unit);
  const suffix =
    normalized === SLA_UNIT.HOUR
      ? 'h'
      : normalized === SLA_UNIT.DAYS
        ? 'd'
        : 'm';

  return `${sla}${suffix}`;
};

export const sortProcesses = (rows = []) =>
  [...rows].sort((a, b) => {
    const sequenceDiff = (Number(a.sequence) || 0) - (Number(b.sequence) || 0);

    if (sequenceDiff !== 0) return sequenceDiff;

    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

export const getLocalProcesses = () =>
  sortProcesses(localProcesses.map(cloneProcess));

export const getLocalProcessById = (id) => {
  const row = localProcesses.find((item) => item._id === String(id));
  return row ? cloneProcess(row) : null;
};

export const addLocalProcess = (payload) => {
  const code = String(payload.code || '').trim().toUpperCase();
  const exists = localProcesses.some((item) => item.code === code);

  if (exists) {
    throw createHttpError(409, `Process with code ${code} already exists`);
  }

  const now = new Date().toISOString();
  const created = {
    _id: String(Date.now()),
    description: '',
    isActive: true,
    ...payload,
    code,
    createdAt: now,
    updatedAt: now,
  };

  localProcesses = [...localProcesses, created];
  return cloneProcess(created);
};

export const updateLocalProcess = (id, payload) => {
  const current = localProcesses.find((item) => item._id === String(id));

  if (!current) {
    throw createHttpError(404, `Process with id ${id} not found`);
  }

  if (payload.code) {
    const code = String(payload.code).trim().toUpperCase();
    const exists = localProcesses.some(
      (item) => item._id !== String(id) && item.code === code,
    );

    if (exists) {
      throw createHttpError(409, `Process with code ${code} already exists`);
    }

    payload = { ...payload, code };
  }

  const updated = {
    ...current,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  localProcesses = localProcesses.map((item) =>
    item._id === String(id) ? updated : item,
  );

  return cloneProcess(updated);
};

export const deactivateLocalProcess = (id) => {
  const current = localProcesses.find((item) => item._id === String(id));

  if (!current) {
    throw createHttpError(404, `Process with id ${id} not found`);
  }

  const updated = {
    ...current,
    isActive: false,
    updatedAt: new Date().toISOString(),
  };

  localProcesses = localProcesses.map((item) =>
    item._id === String(id) ? updated : item,
  );

  return { message: 'Process deactivated successfully' };
};
