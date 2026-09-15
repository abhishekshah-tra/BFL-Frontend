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

import RoleForm from './RoleForm';

import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from '@/services/role.service';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  isActive: true,
  isSystemRole: false,
};

export default function RolesPage() {
  const { onMenuClick } = useLayout();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadRoles = async () => {
    try {
      setLoading(true);

      const data = await getRoles();

      setRows(
        Array.isArray(data)
          ? data
          : data?.data || [],
      );

      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleAdd = () => {
    setMode('add');
    setSelectedRow(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  };

  const handleView = (row) => {
    setMode('view');
    setSelectedRow(row);

    setForm({
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
      isActive: row.isActive ?? true,
      isSystemRole: row.isSystemRole ?? false,
    });

    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setMode('edit');
    setSelectedRow(row);

    setForm({
      name: row.name || '',
      code: row.code || '',
      description: row.description || '',
      isActive: row.isActive ?? true,
      isSystemRole: row.isSystemRole ?? false,
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

      if (mode === 'add') {
        await createRole(form);
      } else {
        await updateRole(
          selectedRow._id,
          form,
        );
      }

      setDialogOpen(false);

      await loadRoles();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setSaving(true);

      await deleteRole(selectedRow._id);

      setDeleteOpen(false);

      await loadRoles();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Role Name',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 220,
    },
    {
      field: 'isSystemRole',
      headerName: 'System Role',
      width: 120,
      renderCell: (params) => (
        <StatusChip
          active={params.value}
          activeLabel="System"
          inactiveLabel="Custom"
        />
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <StatusChip active={params.value} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <RowActions
          onView={() => handleView(params.row)}
          onEdit={() => handleEdit(params.row)}
          onDelete={
            params.row.isSystemRole
              ? undefined
              : () => handleDelete(params.row)
          }
        />
      ),
    },
  ];

  return (
    <div className="page">
      <Header
        onMenuClick={onMenuClick}
        title="Roles"
        subtitle="Manage system roles"
        lastUpdated={lastUpdated}
        isRefreshing={loading}
        onRefresh={loadRoles}
      />

      <div className="page-body">
        <div className="d-flex justify-content-end">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              minWidth: 140,
              height: 42,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Add Role
          </Button>
        </div>

        <AppDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
        />
      </div>

      <AppDialog
        open={dialogOpen}
        title={
          mode === 'add'
            ? 'Add Role'
            : mode === 'edit'
              ? 'Edit Role'
              : 'View Role'
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        submitText={
          mode === 'edit'
            ? 'Update'
            : 'Save'
        }
        loading={saving}
        hideSubmit={mode === 'view'}
      >
        <RoleForm
          form={form}
          setForm={setForm}
          readOnly={mode === 'view'}
        />
      </AppDialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={saving}
        message={`Are you sure you want to delete "${selectedRow?.name}"?`}
      />
    </div>
  );
}
