import api from '../lib/axios';

export const getMenus = async () => {
  const response = await api.get('/menus');
  return response.data;
};

export const getMenuById = async (id) => {
  const response = await api.get(`/menus/${id}`);
  return response.data;
};

export const createMenu = async (payload) => {
  const response = await api.post('/menus', payload);
  return response.data;
};

export const updateMenu = async (id, payload) => {
  const response = await api.patch(`/menus/${id}`, payload);
  return response.data;
};

export const deleteMenu = async (id) => {
  const response = await api.delete(`/menus/${id}`);
  return response.data;
};