import api from '../lib/axios';

export const getPermissionsByRole = async (roleId) => {
  const response = await api.get(`/permissions/role/${roleId}`);
  return response.data;
};

export const assignPermission = async (payload) => {
  const response = await api.post(
    '/permissions/assign',
    payload,
  );

  return response.data;
};

export const updatePermissions = async (payload) => {
  const response = await api.patch(
    '/permissions',
    payload,
  );

  return response.data;
};