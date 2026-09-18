import api from '../lib/axios';

export const getRolePermissions = async (roleId) => {
  const response = await api.get(
    `/permissions/role/${roleId}`,
  );

  return response.data;
};

export const saveRolePermissions = async (
  roleId,
  permissions,
) => {
  const response = await api.put(
    `/permissions/role/${roleId}`,
    {
      permissions,
    },
  );

  return response.data;
};