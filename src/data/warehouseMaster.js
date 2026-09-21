import { createHttpError } from '@/utils/api';

export const WAREHOUSE_MASTER_DATA = [
  {
    _id: '1',
    code: 'TECHNO',
    name: 'TECHNO Warehouse',
    description: 'Main sorting warehouse',
    location: 'Dubai',
    country: 'UAE',
    timeZone: 'Asia/Dubai',
    isActive: true,
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
  },
  {
    _id: '2',
    code: 'JAFZA',
    name: 'JAFZA Warehouse',
    description: 'Free zone distribution center',
    location: 'Jebel Ali',
    country: 'UAE',
    timeZone: 'Asia/Dubai',
    isActive: true,
    createdAt: '2026-09-18T09:30:00.000Z',
    updatedAt: '2026-09-18T09:30:00.000Z',
  },
  {
    _id: '3',
    code: 'YOTO',
    name: 'YOTO Warehouse',
    description: 'Regional fulfillment center',
    location: 'Abu Dhabi',
    country: 'UAE',
    timeZone: 'Asia/Dubai',
    isActive: true,
    createdAt: '2026-09-18T09:00:00.000Z',
    updatedAt: '2026-09-18T09:00:00.000Z',
  },
  {
    _id: '4',
    code: 'STORE1',
    name: 'Store 1 Warehouse',
    description: 'Retail store inventory',
    location: 'Sharjah',
    country: 'UAE',
    timeZone: 'Asia/Dubai',
    isActive: false,
    createdAt: '2026-09-18T08:30:00.000Z',
    updatedAt: '2026-09-18T08:30:00.000Z',
  },
];

const cloneWarehouse = (row) => ({ ...row });

let localWarehouses = WAREHOUSE_MASTER_DATA.map(cloneWarehouse);

export const sortWarehouses = (rows = []) =>
  [...rows].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime(),
  );

export const getLocalWarehouses = () =>
  sortWarehouses(localWarehouses.map(cloneWarehouse));

export const getLocalWarehouseById = (id) => {
  const row = localWarehouses.find((item) => item._id === String(id));
  return row ? cloneWarehouse(row) : null;
};

export const addLocalWarehouse = (payload) => {
  const code = String(payload.code || '').trim().toUpperCase();
  const exists = localWarehouses.some((item) => item.code === code);

  if (exists) {
    throw createHttpError(409, `Warehouse with code ${code} already exists`);
  }

  const now = new Date().toISOString();
  const created = {
    _id: String(Date.now()),
    description: '',
    location: '',
    country: '',
    timeZone: '',
    isActive: true,
    ...payload,
    code,
    createdAt: now,
    updatedAt: now,
  };

  localWarehouses = [...localWarehouses, created];
  return cloneWarehouse(created);
};

export const updateLocalWarehouse = (id, payload) => {
  const current = localWarehouses.find((item) => item._id === String(id));

  if (!current) {
    throw createHttpError(404, `Warehouse with id ${id} not found`);
  }

  if (payload.code) {
    const code = String(payload.code).trim().toUpperCase();
    const exists = localWarehouses.some(
      (item) => item._id !== String(id) && item.code === code,
    );

    if (exists) {
      throw createHttpError(409, `Warehouse with code ${code} already exists`);
    }

    payload = { ...payload, code };
  }

  const updated = {
    ...current,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  localWarehouses = localWarehouses.map((item) =>
    item._id === String(id) ? updated : item,
  );

  return cloneWarehouse(updated);
};

export const deactivateLocalWarehouse = (id) => {
  const current = localWarehouses.find((item) => item._id === String(id));

  if (!current) {
    throw createHttpError(404, `Warehouse with id ${id} not found`);
  }

  const updated = {
    ...current,
    isActive: false,
    updatedAt: new Date().toISOString(),
  };

  localWarehouses = localWarehouses.map((item) =>
    item._id === String(id) ? updated : item,
  );

  return { message: 'Warehouse deactivated successfully' };
};
