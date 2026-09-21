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

import { formatProcessSla, SLA_UNIT, normalizeSlaUnit, sortProcesses } from '@/data/processMaster';
import {
  createProcess,
  deleteProcess,
  getProcessById,
  getProcesses,
  updateProcess,
} from '@/services/process.service';
import { getChangedFields, getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

import ProcessForm from './ProcessForm';

const emptyForm = {
  code: '',
  name: '',
  description: '',
  sequence: '',
  capacityPerHour: '',
  sla: '',
  slaUnit: SLA_UNIT.MIN,
  isActive: true,
};

const mapRowToForm = (row) => ({
  code: row.code || '',
  name: row.name || '',
  description: row.description || '',
  sequence: row.sequence ?? '',
  capacityPerHour: row.capacityPerHour ?? '',
  sla: row.sla ?? '',
  slaUnit: normalizeSlaUnit(row.slaUnit),
  isActive: row.isActive ?? true,
});

const buildPayload = (form) => ({
  code: form.code.trim().toUpperCase(),
  name: form.name.trim(),
  description: form.description?.trim() || '',
  sequence: Number(form.sequence),
  capacityPerHour: Number(form.capacityPerHour),
  sla: Number(form.sla),
  slaUnit: normalizeSlaUnit(form.slaUnit),
  isActive: Boolean(form.isActive),
});

const validateForm = (form) => {
  if (!form.code?.trim() || !form.name?.trim()) {
    return 'Process code and name are required.';
  }

  if (form.sequence === '' || !Number.isFinite(Number(form.sequence)) || Number(form.sequence) < 1) {
    return 'Sequence must be at least 1.';
  }

  if (
    form.capacityPerHour === '' ||
    !Number.isFinite(Number(form.capacityPerHour)) ||
    Number(form.capacityPerHour) < 0
  ) {
    return 'Capacity per hour must be 0 or more.';
  }

  if (form.sla === '' || !Number.isFinite(Number(form.sla)) || Number(form.sla) < 0) {
    return 'SLA must be 0 or more.';
  }

  if (!form.slaUnit || !Object.values(SLA_UNIT).includes(normalizeSlaUnit(form.slaUnit))) {
    return 'SLA unit is required and must be Minutes, Hours, or Days.';
  }

  return '';
};

export async function getServerSideProps() {
  try {
    const rows = await getProcesses();

    return {
      props: serializeProps({
        initialRows: sortProcesses(Array.isArray(rows) ? rows : []),
        fetchedAt: new Date().toISOString(),
        initialError: '',
      }),
    };
  } catch (error) {
    return {
      props: {
        initialRows: [],
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load processes.'),
      },
    };
  }
}

export default function ProcessMasterPage({
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

  const loadProcesses = async () => {
    try {
      setLoading(true);
      setError('');
      await router.replace(router.asPath);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load processes.'));
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
    const nextSequence =
      rows.reduce((max, row) => Math.max(max, Number(row.sequence) || 0), 0) +
      1;

    openDialog('add', null, {
      ...emptyForm,
      sequence: nextSequence,
    });
  };

  const hydrateRow = async (row) => {
    try {
      const fresh = await getProcessById(row._id);
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
        await createProcess(payload);
      } else if (selectedRow) {
        const patch = getChangedFields(buildPayload(selectedRow), payload);

        if (Object.keys(patch).length) {
          await updateProcess(selectedRow._id, patch);
        }
      }

      setDialogOpen(false);
      await loadProcesses();
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save process.'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    try {
      setSaving(true);
      setError('');

      await deleteProcess(selectedRow._id);

      setDeleteOpen(false);
      setSelectedRow(null);
      await loadProcesses();
    } catch (deleteError) {
      setDeleteOpen(false);
      setError(getErrorMessage(deleteError, 'Failed to deactivate process.'));
    } finally {
      setSaving(false);
    }
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
        onRefresh={loadProcesses}
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

        {error && !dialogOpen && !deleteOpen ? (
          <Typography variant="body2" sx={{ color: '#c62828', mb: 1 }}>
            {error}
          </Typography>
        ) : null}

        <AppDataGrid rows={rows} columns={columns} loading={loading} />
      </div>

      <AppDialog
        open={dialogOpen}
        title={dialogTitle}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        submitText={mode === 'edit' ? 'Update' : 'Save'}
        loading={saving}
        hideSubmit={mode === 'view'}
        maxWidth="md"
      >
        <ProcessForm
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
