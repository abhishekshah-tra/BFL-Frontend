import api from '../lib/axios';

export const getActions = async () => {
  const response = await api.get('/actions');
  return response.data;
};

export const getActionById = async (id) => {
  const response = await api.get(`/actions/${id}`);
  return response.data;
};

export const createAction = async (payload) => {
  const response = await api.post('/actions', payload);
  return response.data;
};

export const updateAction = async (id, payload) => {
  const response = await api.patch(`/actions/${id}`, payload);
  return response.data;
};

export const deleteAction = async (id) => {
  const response = await api.delete(`/actions/${id}`);
  return response.data;
};