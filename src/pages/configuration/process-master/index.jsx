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

import {
  PROCESS_MASTER_DATA,
  formatProcessSla,
} from '@/data/processMaster';

import ProcessForm from './ProcessForm';

const emptyForm = {
  code: '',
  name: '',
  description: '',
  sequence: '',
  capacityPerHour: '',
  sla: '',
  slaUnit: 'Minutes',
  isActive: true,
};

export default function ProcessMasterPage() {
  const { onMenuClick } = useLayout();

  const [rows, setRows] = useState(PROCESS_MASTER_DATA);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const mapRowToForm = (row) => ({
    code: row.code || '',
    name: row.name || '',
    description: row.description || '',
    sequence: row.sequence ?? '',
    capacityPerHour: row.capacityPerHour ?? '',
    sla: row.sla ?? '',
    slaUnit: row.slaUnit || 'Minutes',
    isActive: row.isActive ?? true,
  });

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
    setForm({
      ...emptyForm,
      sequence: rows.length + 1,
    });
    setDialogOpen(true);
  };

  const handleView = (row) => {
    setMode('view');
    setSelectedRow(row);
    setForm(mapRowToForm(row));
    setDialogOpen(true);
  };

  const handleEdit = (row) => {
    setMode('edit');
    setSelectedRow(row);
    setForm(mapRowToForm(row));
    setDialogOpen(true);
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setDeleteOpen(true);
  };

  const handleSubmit = () => {
    if (
      !form.code?.trim() ||
      !form.name?.trim() ||
      form.sequence === '' ||
      form.capacityPerHour === '' ||
      form.sla === '' ||
      !form.slaUnit
    ) {
      return;
    }

    setSaving(true);

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      sequence: Number(form.sequence) || 0,
      capacityPerHour: Number(form.capacityPerHour) || 0,
      sla: Number(form.sla) || 0,
    };

    setTimeout(() => {
      if (mode === 'add') {
        setRows((previous) =>
          [...previous, { _id: String(Date.now()), ...payload }].sort(
            (a, b) => a.sequence - b.sequence,
          ),
        );
      } else if (mode === 'edit' && selectedRow) {
        setRows((previous) =>
          previous
            .map((row) =>
              row._id === selectedRow._id
                ? { ...row, ...payload }
                : row,
            )
            .sort((a, b) => a.sequence - b.sequence),
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
      headerName: 'Code',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'name',
      headerName: 'Process',
      flex: 1.2,
      minWidth: 140,
    },
    {
      field: 'sequence',
      headerName: 'Sequence',
      width: 110,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'capacityPerHour',
      headerName: 'Capacity/hr',
      flex: 1,
      minWidth: 120,
      align: 'right',
      headerAlign: 'right',
      valueFormatter: (value) =>
        value != null ? Number(value).toLocaleString() : '-',
    },
    {
      field: 'sla',
      headerName: 'SLA',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (_value, row) => formatProcessSla(row.sla, row.slaUnit),
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

  const dialogTitle =
    mode === 'add'
      ? 'Process Details'
      : mode === 'edit'
        ? 'Edit Process'
        : 'View Process';

  return (
    <div className="page">
      <Header
        onMenuClick={onMenuClick}
        title="Process Master"
        subtitle="Warehouse process recipe — steps, capacity and SLA"
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
            Add Process
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
        title={dialogTitle}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        submitText="Save"
        loading={saving}
        hideSubmit={mode === 'view'}
      >
        <ProcessForm
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
