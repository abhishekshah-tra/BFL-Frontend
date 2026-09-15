import api from '../lib/axios';

export const getUsers = async () => {
  const response = await api.get('/users');

  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(
    `/users/${id}`,
  );

  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post(
    '/users',
    payload,
  );

  return response.data;
};

export const updateUser = async (
  id,
  payload,
) => {
  const response = await api.patch(
    `/users/${id}`,
    payload,
  );

  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(
    `/users/${id}`,
  );

  return response.data;
};