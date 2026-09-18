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
import { PROCESS_MASTER_DATA } from '@/data/processMaster';

import WarehouseConfigForm, {
  createEmptyResource,
} from './WarehouseConfigForm';

const SORTING_PROCESS_ID =
  PROCESS_MASTER_DATA.find((process) => process.code === 'SORTING')
    ?._id || '5';

const buildDefaultProcesses = () =>
  PROCESS_MASTER_DATA.filter((process) => process.isActive)
    .sort((a, b) => a.sequence - b.sequence)
    .map((process) => ({
      processId: process._id,
      enabled: true,
    }));

const buildDefaultResources = () => [
  {
    id: 'res-1',
    resourceType: 'Operator',
    processId: SORTING_PROCESS_ID,
    plannedQuantity: 14,
    availableQuantity: 12,
    productivity: 200,
    unit: 'Items/Hour',
    isActive: true,
  },
  {
    id: 'res-2',
    resourceType: 'Robot',
    processId: SORTING_PROCESS_ID,
    plannedQuantity: 18,
    availableQuantity: 16,
    productivity: 450,
    unit: 'Items/Hour',
    isActive: true,
  },
  {
    id: 'res-3',
    resourceType: 'Chute',
    processId: SORTING_PROCESS_ID,
    plannedQuantity: 30,
    availableQuantity: 24,
    productivity: 120,
    unit: 'Items/Hour',
    isActive: true,
  },
];

const DUMMY_CONFIGS = [
  {
    _id: '1',
    warehouseId: '1',
    name: 'TECHNO Default',
    effectiveFrom: '2026-08-15',
    isActive: true,
    processes: buildDefaultProcesses(),
    resources: buildDefaultResources(),
  },
];

const emptyForm = {
  warehouseId: '',
  name: '',
  effectiveFrom: '',
  isActive: true,
  processes: buildDefaultProcesses(),
  resources: [],
};

export default function WarehouseConfigurationPage() {
  const { onMenuClick } = useLayout();

  const [rows, setRows] = useState(DUMMY_CONFIGS);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const getWarehouse = (warehouseId) =>
    WAREHOUSE_MASTER_DATA.find((item) => item._id === warehouseId);

  const mapRowToForm = (row) => ({
    warehouseId: row.warehouseId || '',
    name: row.name || '',
    effectiveFrom: row.effectiveFrom || '',
    isActive: row.isActive ?? true,
    processes: row.processes?.length
      ? row.processes.map((item) => ({ ...item }))
      : buildDefaultProcesses(),
    resources: row.resources?.length
      ? row.resources.map((item) => ({ ...item }))
      : [],
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
      processes: buildDefaultProcesses(),
      resources: [createEmptyResource()],
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
      !form.warehouseId ||
      !form.name?.trim() ||
      !form.effectiveFrom
    ) {
      return;
    }

    const hasIncompleteResource = (form.resources || []).some(
      (resource) =>
        !resource.resourceType ||
        !resource.processId ||
        resource.plannedQuantity === '' ||
        resource.availableQuantity === '' ||
        resource.productivity === '' ||
        !resource.unit,
    );

    if (hasIncompleteResource) {
      return;
    }

    setSaving(true);

    const warehouse = getWarehouse(form.warehouseId);
    const resources = (form.resources || []).map((resource) => ({
      ...resource,
      plannedQuantity: Number(resource.plannedQuantity),
      availableQuantity: Number(resource.availableQuantity),
      productivity: Number(resource.productivity),
    }));

    const payload = {
      ...form,
      name: form.name.trim(),
      warehouseCode: warehouse?.code || '',
      enabledCount: form.processes.filter((item) => item.enabled).length,
      processCount: form.processes.length,
      resources,
      resourceCount: resources.filter((item) => item.isActive).length,
    };

    setTimeout(() => {
      if (mode === 'add') {
        setRows((previous) => [
          ...previous,
          { _id: String(Date.now()), ...payload },
        ]);
      } else if (mode === 'edit' && selectedRow) {
        setRows((previous) =>
          previous.map((row) =>
            row._id === selectedRow._id
              ? { ...row, ...payload }
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
      field: 'name',
      headerName: 'Configuration Name',
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: 'warehouseId',
      headerName: 'Warehouse',
      flex: 1,
      minWidth: 140,
      valueGetter: (value) => {
        const warehouse = getWarehouse(value);
        return warehouse?.code || '-';
      },
    },
    {
      field: 'effectiveFrom',
      headerName: 'Effective From',
      flex: 1,
      minWidth: 140,
      valueFormatter: (value) => {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;
        return date.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      },
    },
    {
      field: 'enabledCount',
      headerName: 'Processes Enabled',
      flex: 1,
      minWidth: 150,
      valueGetter: (_value, row) => {
        const enabled =
          row.processes?.filter((item) => item.enabled).length ?? 0;
        const total = row.processes?.length ?? 0;
        return `${enabled} / ${total}`;
      },
    },
    {
      field: 'resourceCount',
      headerName: 'Resources',
      flex: 1.2,
      minWidth: 200,
      valueGetter: (_value, row) => {
        const resources = (row.resources || []).filter(
          (item) => item.isActive,
        );
        if (!resources.length) return '-';

        return resources
          .map(
            (item) =>
              `${item.resourceType} ${item.availableQuantity}/${item.plannedQuantity}`,
          )
          .join(' · ');
      },
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
        title="Warehouse Configuration"
        subtitle="Connect warehouse processes and resources — capacity, SLA, and productivity"
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
            Add Configuration
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
            ? 'Warehouse Configuration'
            : mode === 'edit'
              ? 'Edit Warehouse Configuration'
              : 'View Warehouse Configuration'
        }
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        submitText="Save"
        loading={saving}
        hideSubmit={mode === 'view'}
        maxWidth="lg"
      >
        <WarehouseConfigForm
          form={form}
          setForm={setForm}
          warehouses={WAREHOUSE_MASTER_DATA}
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
