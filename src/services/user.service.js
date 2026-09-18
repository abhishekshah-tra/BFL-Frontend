import api from '../lib/axios';

// Get all users
export const getUsers = async () => {
  const response = await api.get('/users');

  return response.data;
};

// Get active users
export const getActiveUsers = async () => {
  const response = await api.get('/users/active');

  return response.data;
};

// Get inactive users
export const getInactiveUsers = async () => {
  const response = await api.get('/users/inactive');

  return response.data;
};

// Get user by ID
export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);

  return response.data;
};

// Create user
export const createUser = async (payload) => {
  const response = await api.post(
    '/users',
    payload,
  );

  return response.data;
};

// Update user
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

// Update user status
export const updateUserStatus = async (
  id,
  isActive,
) => {
  const response = await api.patch(
    `/users/${id}/status`,
    {
      isActive,
    },
  );

  return response.data;
};

// Activate user
export const activateUser = async (id) => {
  const response = await api.patch(
    `/users/${id}/activate`,
  );

  return response.data;
};

// Deactivate user
export const deactivateUser = async (id) => {
  const response = await api.patch(
    `/users/${id}/deactivate`,
  );

  return response.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(
    `/users/${id}`,
  );

  return response.data;
};