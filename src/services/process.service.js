import api from '../lib/ssrAxios';
import {
  addLocalProcess,
  deactivateLocalProcess,
  getLocalProcessById,
  getLocalProcesses,
  sortProcesses,
  updateLocalProcess,
} from '@/data/processMaster';
import {
  getErrorMessage,
  isApiUnavailable,
  unwrapItem,
  unwrapList,
} from '@/utils/api';

const BASE = '/processmaster';

const withFallback = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    if (!isApiUnavailable(error)) {
      throw error;
    }

    console.warn(
      'Process Master API unavailable, using dummy data:',
      getErrorMessage(error),
    );

    return fallback();
  }
};

export const getProcesses = async () =>
  withFallback(
    async () => {
      const response = await api.get(BASE);
      return sortProcesses(unwrapList(response.data));
    },
    getLocalProcesses,
  );

export const getProcessById = async (id) =>
  withFallback(
    async () => {
      const response = await api.get(`${BASE}/${id}`);
      return unwrapItem(response.data);
    },
    () => {
      const row = getLocalProcessById(id);

      if (!row) {
        throw new Error(`Process with id ${id} not found`);
      }

      return row;
    },
  );

export const createProcess = async (payload) =>
  withFallback(
    async () => {
      const response = await api.post(BASE, payload);
      return unwrapItem(response.data);
    },
    () => addLocalProcess(payload),
  );

export const updateProcess = async (id, payload) =>
  withFallback(
    async () => {
      const response = await api.patch(`${BASE}/${id}`, payload);
      return unwrapItem(response.data);
    },
    () => updateLocalProcess(id, payload),
  );

export const deleteProcess = async (id) =>
  withFallback(
    async () => {
      const response = await api.delete(`${BASE}/${id}`);
      return response.data;
    },
    () => deactivateLocalProcess(id),
  );
