import api from '../lib/axios';

export const getScreens = async () => {
  const response = await api.get('/screens');
  return response.data;
};

export const getScreenById = async (id) => {
  const response = await api.get(`/screens/${id}`);
  return response.data;
};

export const createScreen = async (payload) => {
  const response = await api.post('/screens', payload);
  return response.data;
};

export const updateScreen = async (id, payload) => {
  const response = await api.patch(`/screens/${id}`, payload);
  return response.data;
};

export const deleteScreen = async (id) => {
  const response = await api.delete(`/screens/${id}`);
  return response.data;
};