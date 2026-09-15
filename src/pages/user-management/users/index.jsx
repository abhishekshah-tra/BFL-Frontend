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
  deleteUser,
} from '@/services/user.service';

import { getRoles } from '@/services/role.service';

const emptyForm = {
  name: '',
  email: '',
  password: '',
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

  const handleAdd = () => {
    setMode('add');
    setSelectedRow(null);

    setForm({
      ...emptyForm,
    });

    setDialogOpen(true);
  };

  const handleView = (row) => {
    setMode('view');
    setSelectedRow(row);

    setForm({
      name: row.name || '',
      email: row.email || '',
      password: '',
      roleId:
        row.roleId?._id ||
        row.roleId ||
        row.role?._id ||
        '',
      isActive: row.isActive ?? true,
    });

    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setMode('edit');
    setSelectedRow(row);

    setForm({
      name: row.name || '',
      email: row.email || '',
      password: '',
      roleId:
        row.roleId?._id ||
        row.roleId ||
        row.role?._id ||
        '',
      isActive: row.isActive ?? true,
    });

    setDialogOpen(true);
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        roleId: form.roleId,
        isActive: form.isActive,
      };

      /*
       * Password is required only while creating
       * a new user.
       */
      if (mode === 'add') {
        payload.password = form.password;
      } else if (form.password?.trim()) {
        /*
         * Allow password update when a new
         * password is provided.
         */
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

  const roleName = (row) => {
    return (
      row.roleId?.name ||
      row.role?.name ||
      row.roleName ||
      '-'
    );
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.2,
      minWidth: 180,
    },

    {
      field: 'email',
      headerName: 'Email',
      flex: 1.5,
      minWidth: 220,
    },

    {
      field: 'role',
      headerName: 'Role',
      flex: 1,
      minWidth: 160,
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
        message={`Are you sure you want to delete "${selectedRow?.name}"?`}
      />

    </div>
  );
}