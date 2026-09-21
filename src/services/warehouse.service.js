import api from '../lib/ssrAxios';
import {
  addLocalWarehouse,
  deactivateLocalWarehouse,
  getLocalWarehouseById,
  getLocalWarehouses,
  sortWarehouses,
  updateLocalWarehouse,
} from '@/data/warehouseMaster';
import {
  getErrorMessage,
  isApiUnavailable,
  unwrapItem,
  unwrapList,
} from '@/utils/api';

const BASE = '/warehousemaster';

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }

    console.warn(
      'Warehouse Master API unavailable, using dummy data:',
      getErrorMessage(error),
    );

    return fallback();
  }
};

export const getWarehouses = async () =>
  withFallback(
    async () => {
      const response = await api.get(BASE);
      return sortWarehouses(unwrapList(response.data));
    },
    getLocalWarehouses,
  );

export const getWarehouseById = async (id) =>
  withFallback(
    async () => {
      const response = await api.get(`${BASE}/${id}`);
      return unwrapItem(response.data);
    },
    () => {
      const row = getLocalWarehouseById(id);

      if (!row) {
        throw new Error(`Warehouse with id ${id} not found`);
      }

      return row;
    },
  );

export const createWarehouse = async (payload) =>
  withFallback(
    async () => {
      const response = await api.post(BASE, payload);
      return unwrapItem(response.data);
    },
    () => addLocalWarehouse(payload),
  );

export const updateWarehouse = async (id, payload) =>
  withFallback(
    async () => {
      const response = await api.patch(`${BASE}/${id}`, payload);
      return unwrapItem(response.data);
    },
    () => updateLocalWarehouse(id, payload),
  );

export const deleteWarehouse = async (id) =>
  withFallback(
    async () => {
      const response = await api.delete(`${BASE}/${id}`);
      return response.data;
    },
    () => deactivateLocalWarehouse(id),
  );
