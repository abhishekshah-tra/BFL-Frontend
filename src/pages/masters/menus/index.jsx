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

import MenuForm from './MenuForm';

import {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
} from '@/services/menu.service';

const emptyForm = {
  name: '',
  code: '',
  parentId: '',
  route: '',
  icon: '',
  sortOrder: 0,
  isActive: true,
};

export default function MenusPage() {
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

  const loadMenus = async () => {
    try {
      setLoading(true);

      const data = await getMenus();

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
    loadMenus();
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
      parentId: row.parentId?._id || row.parentId || '',
      route: row.route || '',
      icon: row.icon || '',
      sortOrder: row.sortOrder ?? 0,
      isActive: row.isActive ?? true,
    });

    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setMode('edit');
    setSelectedRow(row);

    setForm({
      name: row.name || '',
      code: row.code || '',
      parentId: row.parentId?._id || row.parentId || '',
      route: row.route || '',
      icon: row.icon || '',
      sortOrder: row.sortOrder ?? 0,
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
        ...form,
        parentId: form.parentId || null,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (mode === 'add') {
        await createMenu(payload);
      } else {
        await updateMenu(
          selectedRow._id,
          payload,
        );
      }

      setDialogOpen(false);

      await loadMenus();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setSaving(true);

      await deleteMenu(selectedRow._id);

      setDeleteOpen(false);

      await loadMenus();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Menu Name',
      flex: 1,
      minWidth: 170,
    },
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 140,
    },
    {
      field: 'parentId',
      headerName: 'Parent Menu',
      flex: 1,
      minWidth: 160,
      valueGetter: (value) => {
        if (!value) return '-';

        if (typeof value === 'object') {
          return value.name || '-';
        }

        return '-';
      },
    },
    {
      field: 'route',
      headerName: 'Route',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'sortOrder',
      headerName: 'Order',
      width: 90,
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
          onDelete={() => handleDelete(params.row)}
        />
      ),
    },
  ];

  return (
    <div className="page">
      <Header
        onMenuClick={onMenuClick}
        title="Menus"
        subtitle="Manage application menus"
        lastUpdated={lastUpdated}
        isRefreshing={loading}
        onRefresh={loadMenus}
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
            Add Menu
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
            ? 'Add Menu'
            : mode === 'edit'
              ? 'Edit Menu'
              : 'View Menu'
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
        <MenuForm
          form={form}
          setForm={setForm}
          menus={rows}
          selectedRow={selectedRow}
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
