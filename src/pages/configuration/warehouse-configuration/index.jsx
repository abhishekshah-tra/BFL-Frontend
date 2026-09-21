import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';

import AppDataGrid from '@/components/common/AppDataGrid';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusChip from '@/components/common/StatusChip';
import RowActions from '@/components/common/RowActions';
import { Header } from '@/components/layout/Header';
import { useLayout } from '@/components/layout/LayoutContext';
import {
  getWarehouseById,
  sortWarehouseConfigs,
} from '@/data/warehouseConfiguration';
import { WAREHOUSE_MASTER_DATA } from '@/data/warehouseMaster';
import {
  deleteWarehouseConfig,
  getWarehouseConfigs,
} from '@/services/configuration.service';
import { getWarehouses } from '@/services/warehouse.service';
import { getErrorMessage } from '@/utils/api';
import { serializeProps } from '@/utils/ssr';

export async function getServerSideProps() {
  try {
    const [configData, warehouseData] = await Promise.all([
      getWarehouseConfigs(),
      getWarehouses(),
    ]);

    return {
      props: serializeProps({
        initialRows: sortWarehouseConfigs(
          Array.isArray(configData) ? configData : [],
        ),
        initialWarehouses: Array.isArray(warehouseData)
          ? warehouseData
          : WAREHOUSE_MASTER_DATA,
        fetchedAt: new Date().toISOString(),
        initialError: '',
      }),
    };
  } catch (error) {
    return {
      props: serializeProps({
        initialRows: [],
        initialWarehouses: WAREHOUSE_MASTER_DATA,
        fetchedAt: new Date().toISOString(),
        initialError: getErrorMessage(error, 'Failed to load configurations.'),
      }),
    };
  }
}

export default function WarehouseConfigurationPage({
  initialRows,
  initialWarehouses,
  fetchedAt,
  initialError = '',
}) {
  const { onMenuClick } = useLayout();
  const router = useRouter();

  const [rows, setRows] = useState(initialRows);
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [lastUpdated, setLastUpdated] = useState(() => new Date(fetchedAt));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    setRows(initialRows);
    setWarehouses(initialWarehouses);
    setError(initialError);
    setLastUpdated(new Date(fetchedAt));
    setLoading(false);
  }, [initialRows, initialWarehouses, initialError, fetchedAt]);

  const loadPage = async () => {
    try {
      setLoading(true);
      setError('');
      await router.replace(router.asPath);
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load configurations.'));
      setLoading(false);
    }
  };

  const handleAdd = () => {
    router.push('/configuration/warehouse-configuration/new');
  };

  const handleView = (row) => {
    router.push(
      `/configuration/warehouse-configuration/${row._id}?mode=view`,
    );
  };

  const handleEdit = (row) => {
    router.push(`/configuration/warehouse-configuration/${row._id}`);
  };

  const handleDelete = (row) => {
    setSelectedRow(row);
    setError('');
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRow) return;

    try {
      setSaving(true);
      setError('');

      await deleteWarehouseConfig(selectedRow._id);

      setDeleteOpen(false);
      setSelectedRow(null);
      await loadPage();
    } catch (deleteError) {
      setDeleteOpen(false);
      setError(
        getErrorMessage(deleteError, 'Failed to deactivate configuration.'),
      );
    } finally {
      setSaving(false);
    }
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
        const warehouse = getWarehouseById(value, warehouses);
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
        title="Warehouse Configuration"
        subtitle="Connect warehouse processes and resources — capacity, SLA, and productivity"
        lastUpdated={lastUpdated}
        isRefreshing={loading}
        onRefresh={loadPage}
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

        {error && !deleteOpen ? (
          <Typography variant="body2" sx={{ color: '#c62828', mb: 1 }}>
            {error}
          </Typography>
        ) : null}

        <AppDataGrid rows={rows} columns={columns} loading={loading} />
      </div>

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
