'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import AppDataGrid from '@/components/common/AppDataGrid';
import AppDialog from '@/components/common/AppDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusChip from '@/components/common/StatusChip';
import RowActions from '@/components/common/RowActions';

import { Header } from '@/components/layout/Header';
import { useLayout } from '@/components/layout/LayoutContext';

import UserForm from './UserForm';

import {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
} from '@/services/user.service';

import { getRoles } from '@/services/role.service';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  roleId: '',
  isActive: true,
};

export default function UsersPage() {
  const { onMenuClick } = useLayout();

  const [rows, setRows] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);

  const [form, setForm] = useState({
    ...emptyForm,
  });

  const [lastUpdated, setLastUpdated] = useState(
    () => new Date(),
  );

  const normalizeResponse = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    return response?.data || [];
  };

  // =========================
  // LOAD USERS
  // =========================

  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await getUsers();

      setRows(normalizeResponse(response));
      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        'Failed to load users:',
        error,
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOAD ROLES
  // =========================

  const loadRoles = async () => {
    try {
      const response = await getRoles();

      setRoles(normalizeResponse(response));
    } catch (error) {
      console.error(
        'Failed to load roles:',
        error,
      );
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  // =========================
  // ADD
  // =========================

  const handleAdd = () => {
    setMode('add');
    setSelectedRow(null);

    setForm({
      ...emptyForm,
    });

    setDialogOpen(true);
  };

  // =========================
  // GET ROLE ID
  // =========================

  const getRoleId = (row) => {
    if (!row?.roleId) {
      return '';
    }

    if (typeof row.roleId === 'string') {
      return row.roleId;
    }

    return row.roleId?._id || '';
  };

  // =========================
  // VIEW
  // =========================

  const handleView = (row) => {
    setMode('view');
    setSelectedRow(row);

    setForm({
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
      password: '',
      confirmPassword: '',
      roleId: getRoleId(row),
      isActive: row.isActive ?? true,
    });

    setDialogOpen(true);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (row) => {
    setMode('edit');
    setSelectedRow(row);

    setForm({
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      email: row.email || '',
      password: '',
      confirmPassword: '',
      roleId: getRoleId(row),
      isActive: row.isActive ?? true,
    });

    setDialogOpen(true);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async () => {
    try {
      // Password required on create
      if (
        mode === 'add' &&
        !form.password?.trim()
      ) {
        return;
      }

      // Password confirmation
      if (
        form.password &&
        form.password !== form.confirmPassword
      ) {
        return;
      }

      // Role required
      if (!form.roleId) {
        return;
      }

      setSaving(true);

      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName?.trim() || '',
        email: form.email.trim(),
        roleId: form.roleId,
        isActive: form.isActive,
      };

      // Password required on create
      if (mode === 'add') {
        payload.password = form.password;
      }

      // Password optional on edit
      if (
        mode === 'edit' &&
        form.password?.trim()
      ) {
        payload.password = form.password;
      }

      if (mode === 'add') {
        await createUser(payload);
      } else {
        await updateUser(
          selectedRow._id,
          payload,
        );
      }

      setDialogOpen(false);
      setSelectedRow(null);

      await loadUsers();
    } catch (error) {
      console.error(
        'Failed to save user:',
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // STATUS
  // =========================

  const handleStatusChange = async (row) => {
    try {
      setSaving(true);

      await updateUserStatus(
        row._id,
        !row.isActive,
      );

      await loadUsers();
    } catch (error) {
      console.error(
        'Failed to update user status:',
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CONFIRM DELETE
  // =========================

  const handleConfirmDelete = async () => {
    if (!selectedRow) {
      return;
    }

    try {
      setSaving(true);

      await deleteUser(selectedRow._id);

      setDeleteOpen(false);
      setSelectedRow(null);

      await loadUsers();
    } catch (error) {
      console.error(
        'Failed to delete user:',
        error,
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // ROLE NAME
  // =========================

  const roleName = (row) => {
    if (!row?.roleId) {
      return '-';
    }

    // Populated role
    if (
      typeof row.roleId === 'object'
    ) {
      return row.roleId?.name || '-';
    }

    // Role ID only
    const foundRole = roles.find(
      (role) => role._id === row.roleId,
    );

    return foundRole?.name || '-';
  };

  // =========================
  // COLUMNS
  // =========================

  const columns = [
    {
      field: 'firstName',
      headerName: 'First Name',
      flex: 1,
      minWidth: 140,
    },

    {
      field: 'lastName',
      headerName: 'Last Name',
      flex: 1,
      minWidth: 140,
    },

    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 220,
    },

    {
      field: 'roleId',
      headerName: 'Role',
      flex: 1.3,
      minWidth: 180,
      sortable: false,
      valueGetter: (value, row) =>
        roleName(row),
    },

    {
      field: 'isActive',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <StatusChip
          active={params.value}
        />
      ),
    },

    {
      field: 'actions',
      headerName: 'Actions',
      width: 145,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <RowActions
          onView={() =>
            handleView(params.row)
          }
          onEdit={() =>
            handleEdit(params.row)
          }
          onDelete={() =>
            handleDelete(params.row)
          }
        />
      ),
    },
  ];

  return (
    <div className="page">

      <Header
        onMenuClick={onMenuClick}
        title="Users"
        subtitle="Manage system users"
        lastUpdated={lastUpdated}
        isRefreshing={loading}
        onRefresh={loadUsers}
      />

      <div className="page-body">

        {/* Add User */}

        <div className="d-flex justify-content-end align-items-center mb-2">

          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              height: 34,
              minWidth: 105,
              px: 1.5,
              borderRadius: '6px',
              textTransform: 'none',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: '#1e1450',

              '&:hover': {
                backgroundColor: '#312a82',
              },
            }}
          >
            Add User
          </Button>

        </div>

        {/* Users Grid */}

        <AppDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
        />

      </div>

      {/* User Dialog */}

      <AppDialog
        open={dialogOpen}
        title={
          mode === 'add'
            ? 'Add User'
            : mode === 'edit'
              ? 'Edit User'
              : 'View User'
        }
        onClose={() =>
          setDialogOpen(false)
        }
        onSubmit={handleSubmit}
        submitText={
          mode === 'edit'
            ? 'Update'
            : 'Save'
        }
        loading={saving}
        hideSubmit={mode === 'view'}
      >
        <UserForm
          form={form}
          setForm={setForm}
          roles={roles}
          readOnly={mode === 'view'}
          mode={mode}
        />
      </AppDialog>

      {/* Delete Confirmation */}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() =>
          setDeleteOpen(false)
        }
        onConfirm={
          handleConfirmDelete
        }
        loading={saving}
        message={`Are you sure you want to delete "${selectedRow?.firstName || ''} ${selectedRow?.lastName || ''}"?`}
      />

    </div>
  );
}