import api from '../lib/ssrAxios';
import {
  addLocalWarehouseConfig,
  deactivateLocalWarehouseConfig,
  getLocalWarehouseConfigById,
  getLocalWarehouseConfigs,
  sortWarehouseConfigs,
  updateLocalWarehouseConfig,
} from '@/data/warehouseConfiguration';
import {
  getErrorMessage,
  isApiUnavailable,
  unwrapItem,
  unwrapList,
} from '@/utils/api';

const BASE = '/configuration';

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }

    console.warn(
      'Configuration API unavailable, using dummy data:',
      getErrorMessage(error),
    );

    return fallback();
  }
};

export const getWarehouseConfigs = async () =>
  withFallback(
    async () => {
      const response = await api.get(BASE);
      return sortWarehouseConfigs(unwrapList(response.data));
    },
    getLocalWarehouseConfigs,
  );

export const getWarehouseConfigById = async (id) =>
  withFallback(
    async () => {
      const response = await api.get(`${BASE}/${id}`);
      return unwrapItem(response.data);
    },
    () => {
      const row = getLocalWarehouseConfigById(id);

      if (!row) {
        throw new Error(`Configuration with id ${id} not found`);
      }

      return row;
    },
  );

export const createWarehouseConfig = async (payload) =>
  withFallback(
    async () => {
      const response = await api.post(BASE, payload);
      return unwrapItem(response.data);
    },
    () => addLocalWarehouseConfig(payload),
  );

export const updateWarehouseConfig = async (id, payload) =>
  withFallback(
    async () => {
      const response = await api.patch(`${BASE}/${id}`, payload);
      return unwrapItem(response.data);
    },
    () => updateLocalWarehouseConfig(id, payload),
  );

export const deleteWarehouseConfig = async (id) =>
  withFallback(
    async () => {
      const response = await api.delete(`${BASE}/${id}`);
      return response.data;
    },
    () => deactivateLocalWarehouseConfig(id),
  );
