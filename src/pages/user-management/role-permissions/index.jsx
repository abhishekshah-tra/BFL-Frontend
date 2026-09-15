'use client';

import { useEffect, useMemo, useState } from 'react';
import './styles/permission.module.css';
import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';

import { Header } from '@/components/layout/Header';
import { useLayout } from '@/components/layout/LayoutContext';

import CommonSelect from '@/components/common/CommonSelect';
import PermissionMatrix from './PermissionMatrix.jsx';

import { getRoles } from '@/services/role.service';
import { getScreens } from '@/services/screen.service';
import { getActions } from '@/services/action.service';

import {
  getRolePermissions,
  saveRolePermissions,
} from '@/services/permission.service';

export default function PermissionsPage() {
  const { onMenuClick } = useLayout();

  const [roles, setRoles] = useState([]);
  const [screens, setScreens] = useState([]);
  const [actions, setActions] = useState([]);

  const [selectedRole, setSelectedRole] = useState('');

  const [permissions, setPermissions] = useState({});

  const [loadingMasterData, setLoadingMasterData] =
    useState(false);

  const [loadingPermissions, setLoadingPermissions] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const [lastUpdated, setLastUpdated] = useState(
    () => new Date(),
  );

  const loading =
    loadingMasterData || loadingPermissions;

  const normalizeResponse = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    return response?.data || [];
  };

  const loadMasterData = async () => {
    try {
      setLoadingMasterData(true);

      const [
        rolesResponse,
        screensResponse,
        actionsResponse,
      ] = await Promise.all([
        getRoles(),
        getScreens(),
        getActions(),
      ]);

      const roleData =
        normalizeResponse(rolesResponse);

      const screenData =
        normalizeResponse(screensResponse);

      const actionData =
        normalizeResponse(actionsResponse);

      setRoles(roleData);
      setScreens(screenData);
      setActions(actionData);

      setSelectedRole((currentRole) => {
        const roleExists = roleData.some(
          (role) => role._id === currentRole,
        );

        if (currentRole && roleExists) {
          return currentRole;
        }

        return roleData[0]?._id || '';
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        'Failed to load permission master data:',
        error,
      );
    } finally {
      setLoadingMasterData(false);
    }
  };

  const loadPermissions = async (roleId) => {
    if (!roleId) {
      setPermissions({});
      return;
    }

    try {
      setLoadingPermissions(true);

      const response =
        await getRolePermissions(roleId);

      const data = normalizeResponse(response);

      const permissionMap = {};

      data.forEach((permission) => {
        const screenId =
          permission.screenId?._id ||
          permission.screenId;

        const actionId =
          permission.actionId?._id ||
          permission.actionId;

        if (!screenId || !actionId) {
          return;
        }

        if (!permissionMap[screenId]) {
          permissionMap[screenId] = {};
        }

        permissionMap[screenId][actionId] = true;
      });

      setPermissions(permissionMap);
    } catch (error) {
      console.error(
        'Failed to load role permissions:',
        error,
      );

      setPermissions({});
    } finally {
      setLoadingPermissions(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      loadPermissions(selectedRole);
    } else {
      setPermissions({});
    }
  }, [selectedRole]);

  const roleOptions = useMemo(
    () =>
      roles.map((role) => ({
        value: role._id,
        label: role.name,
      })),
    [roles],
  );

  const handlePermissionChange = (
    screenId,
    actionId,
    checked,
  ) => {
    setPermissions((previous) => ({
      ...previous,

      [screenId]: {
        ...(previous[screenId] || {}),
        [actionId]: checked,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedRole || saving) {
      return;
    }

    try {
      setSaving(true);

      const payload = [];

      Object.entries(permissions).forEach(
        ([screenId, screenPermissions]) => {
          Object.entries(screenPermissions).forEach(
            ([actionId, allowed]) => {
              if (allowed === true) {
                payload.push({
                  screenId,
                  actionId,
                });
              }
            },
          );
        },
      );

      await saveRolePermissions(
        selectedRole,
        payload,
      );

      await loadPermissions(selectedRole);

      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        'Failed to save permissions:',
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (loading || saving) {
      return;
    }

    await loadMasterData();

    if (selectedRole) {
      await loadPermissions(selectedRole);
    }

    setLastUpdated(new Date());
  };

  return (
    <div className="page">

      <Header
        onMenuClick={onMenuClick}
        title="Permissions"
        subtitle="Manage role-based screen permissions"
        lastUpdated={lastUpdated}
        isRefreshing={loading}
        onRefresh={handleRefresh}
      />

      <div className="page-body">

        {/* Compact Toolbar */}
        <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-2">

          <div
            style={{
              width: '280px',
              maxWidth: '100%',
            }}
          >
            <CommonSelect
              label="Role"
              name="role"
              value={selectedRole}
              onChange={(event) =>
                setSelectedRole(
                  event.target.value,
                )
              }
              options={roleOptions}
              required
              placeholder="Select Role"
              disabled={
                loadingMasterData ||
                saving
              }
            />
          </div>

          <div className="d-flex align-items-center gap-2">

            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={
                loading ||
                saving
              }
              sx={{
                height: 34,
                px: 1.5,
                borderRadius: '6px',
                textTransform: 'none',
                fontSize: '12px',
                fontWeight: 500,
                minWidth: 88,
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={
                !selectedRole ||
                loading ||
                saving
              }
              sx={{
                height: 34,
                px: 1.5,
                borderRadius: '6px',
                textTransform: 'none',
                fontSize: '12px',
                fontWeight: 600,
                minWidth: 135,
                backgroundColor: '#1e1450',

                '&:hover': {
                  backgroundColor: '#312a82',
                },
              }}
            >
              {saving
                ? 'Saving...'
                : 'Save Permissions'}
            </Button>

          </div>
        </div>

        {/* Permission Matrix */}
        <div className="w-100">

          <div
            className="bg-white border rounded-2 overflow-hidden"
            style={{
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <PermissionMatrix
              screens={screens}
              actions={actions}
              permissions={permissions}
              onChange={
                handlePermissionChange
              }
              loading={loading}
            />
          </div>

        </div>

      </div>
    </div>
  );
}