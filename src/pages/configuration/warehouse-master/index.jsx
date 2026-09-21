import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

import AppDataGrid from '@/components/common/AppDataGrid';
import AppDialog from '@/components/common/AppDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusChip from '@/components/common/StatusChip';
import RowActions from '@/components/common/RowActions';
import { Header } from '@/components/layout/Header';
import { useLayout } from '@/components/layout/LayoutContext';

import { sortWarehouses } from '@/data/warehouseMaster';
import {
  createWarehouse,
  deleteWarehouse,
  getWarehouseById,
  getWarehouses,
  updateWarehouse,
} from '@/services/warehouse.service';
import { getChangedFields, getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

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

const mapRowToForm = (row) => ({
  code: row.code || '',
  name: row.name || '',
  description: row.description || '',
  location: row.location || '',
  country: row.country || '',
  timeZone: row.timeZone || '',
  isActive: row.isActive ?? true,
});

const buildPayload = (form) => ({
  code: form.code.trim().toUpperCase(),
  name: form.name.trim(),
  description: form.description?.trim() || '',
  location: form.location?.trim() || '',
  country: form.country || '',
  timeZone: form.timeZone || '',
  isActive: Boolean(form.isActive),
});

const validateForm = (form) => {
  if (!form.code?.trim() || !form.name?.trim()) {
    return 'Warehouse code and name are required.';
  }

  return '';
};

export async function getServerSideProps() {
  try {
    const rows = await getWarehouses();

    return {
      props: serializeProps({
        initialRows: sortWarehouses(Array.isArray(rows) ? rows : []),
        fetchedAt: new Date().toISOString(),
        initialError: '',
      }),
    };
  } catch (error) {
    return {
      props: {
        initialRows: [],
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load warehouses.'),
      },
    };
  }
}

export default function WarehouseMasterPage({
  initialRows,
  fetchedAt,
  initialError = '',
}) {
  const { onMenuClick } = useLayout();
  const router = useRouter();

  const [rows, setRows] = useState(initialRows);
  const [lastUpdated, setLastUpdated] = useState(() => new Date(fetchedAt));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    setRows(initialRows);
    setError(initialError);
    setLastUpdated(new Date(fetchedAt));
    setLoading(false);
  }, [initialRows, initialError, fetchedAt]);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError('');
      await router.replace(router.asPath);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load warehouses.'));
      setLoading(false);
    }
  };

  const openDialog = (nextMode, row = null, nextForm = emptyForm) => {
    setMode(nextMode);
    setSelectedRow(row);
    setForm({ ...nextForm });
    setError('');
    setDialogOpen(true);
  };

  const handleAdd = () => {
    openDialog('add', null, { ...emptyForm });
  };

  const hydrateRow = async (row) => {
    try {
      const fresh = await getWarehouseById(row._id);
      return fresh || row;
    } catch {
      return row;
    }
  };

  const handleView = async (row) => {
    openDialog('view', row, mapRowToForm(row));
    const fresh = await hydrateRow(row);
    setSelectedRow(fresh);
    setForm(mapRowToForm(fresh));
  };

  const handleEdit = async (row) => {
    openDialog('edit', row, mapRowToForm(row));
    const fresh = await hydrateRow(row);
    setSelectedRow(fresh);
    setForm(mapRowToForm(fresh));
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setError('');
    setDeleteOpen(true);
  };

  const handleSubmit = async () => {
    const validationError = validateForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = buildPayload(form);

      if (mode === 'add') {
        await createWarehouse(payload);
      } else if (selectedRow) {
        const patch = getChangedFields(buildPayload(selectedRow), payload);

        if (Object.keys(patch).length) {
          await updateWarehouse(selectedRow._id, patch);
        }
      }

      setDialogOpen(false);
      await loadWarehouses();
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save warehouse.'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    try {
      setSaving(true);
      setError('');

      await deleteWarehouse(selectedRow._id);

      setDeleteOpen(false);
      setSelectedRow(null);
      await loadWarehouses();
    } catch (deleteError) {
      setDeleteOpen(false);
      setError(getErrorMessage(deleteError, 'Failed to deactivate warehouse.'));
    } finally {
      setSaving(false);
    }
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
      renderCell: (params) => <StatusChip active={params.value} />,
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
        onRefresh={loadWarehouses}
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

        {error && !dialogOpen && !deleteOpen ? (
          <Typography variant="body2" sx={{ color: '#c62828', mb: 1 }}>
            {error}
          </Typography>
        ) : null}

        <AppDataGrid rows={rows} columns={columns} loading={loading} />
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
          disableCode={mode !== 'add'}
        />

        {error ? (
          <Typography variant="body2" sx={{ color: '#c62828', mt: 2 }}>
            {error}
          </Typography>
        ) : null}
      </AppDialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={saving}
        message={`Are you sure you want to deactivate "${selectedRow?.name}"?`}
      />
    </div>
  );
}
