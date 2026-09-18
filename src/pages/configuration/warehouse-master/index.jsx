'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

import AppDataGrid from '@/components/common/AppDataGrid';
import AppDialog from '@/components/common/AppDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusChip from '@/components/common/StatusChip';
import RowActions from '@/components/common/RowActions';
import { Header } from '@/components/layout/Header';
import { useLayout } from '@/components/layout/LayoutContext';

import { WAREHOUSE_MASTER_DATA } from '@/data/warehouseMaster';

import WarehouseForm from './WarehouseForm';

const emptyForm = {
  code: '',
  name: '',
  description: '',
  location: '',
  country: '',
  timeZone: '',
  isActive: true,
};

export default function WarehouseMasterPage() {
  const { onMenuClick } = useLayout();

  const [rows, setRows] = useState(WAREHOUSE_MASTER_DATA);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setLoading(false);
    }, 300);
  };

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
      code: row.code || '',
      name: row.name || '',
      description: row.description || '',
      location: row.location || '',
      country: row.country || '',
      timeZone: row.timeZone || '',
      isActive: row.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setMode('edit');
    setSelectedRow(row);
    setForm({
      code: row.code || '',
      name: row.name || '',
      description: row.description || '',
      location: row.location || '',
      country: row.country || '',
      timeZone: row.timeZone || '',
      isActive: row.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleSubmit = () => {
    if (!form.code?.trim() || !form.name?.trim()) {
      return;
    }

    setSaving(true);

    setTimeout(() => {
      if (mode === 'add') {
        setRows((previous) => [
          ...previous,
          {
            _id: String(Date.now()),
            ...form,
            code: form.code.trim().toUpperCase(),
            name: form.name.trim(),
          },
        ]);
      } else if (mode === 'edit' && selectedRow) {
        setRows((previous) =>
          previous.map((row) =>
            row._id === selectedRow._id
              ? {
                  ...row,
                  ...form,
                  code: form.code.trim().toUpperCase(),
                  name: form.name.trim(),
                }
              : row,
          ),
        );
      }

      setDialogOpen(false);
      setLastUpdated(new Date());
      setSaving(false);
    }, 200);
  };

  const handleConfirmDelete = () => {
    setSaving(true);

    setTimeout(() => {
      setRows((previous) =>
        previous.filter((row) => row._id !== selectedRow?._id),
      );
      setDeleteOpen(false);
      setLastUpdated(new Date());
      setSaving(false);
    }, 200);
  };

  const columns = [
    {
      field: 'code',
      headerName: 'Warehouse Code',
      flex: 1,
      minWidth: 140,
    },
    {
      field: 'name',
      headerName: 'Warehouse Name',
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'location',
      headerName: 'Location',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'country',
      headerName: 'Country',
      flex: 0.8,
      minWidth: 110,
    },
    {
      field: 'timeZone',
      headerName: 'Time Zone',
      flex: 1,
      minWidth: 140,
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
        title="Warehouse Master"
        subtitle="Manage warehouse locations and details"
        lastUpdated={lastUpdated}
        isRefreshing={loading}
        onRefresh={handleRefresh}
      />

      <div className="page-body">
        <div className="d-flex justify-content-end align-items-center py-2">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              minWidth: 120,
              height: 36,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#222',
              },
            }}
          >
            Add Warehouse
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
            ? 'Add Warehouse'
            : mode === 'edit'
              ? 'Edit Warehouse'
              : 'View Warehouse'
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        submitText={mode === 'edit' ? 'Update' : 'Save'}
        loading={saving}
        hideSubmit={mode === 'view'}
      >
        <WarehouseForm
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
