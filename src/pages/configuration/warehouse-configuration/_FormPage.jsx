'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { Header } from '@/components/layout/Header';
import { useLayout } from '@/components/layout/LayoutContext';
import { WAREHOUSE_MASTER_DATA } from '@/data/warehouseMaster';
import { PROCESS_MASTER_DATA } from '@/data/processMaster';
import {
  buildDefaultProcesses,
  buildWarehouseConfigPayload,
  emptyWarehouseConfigForm,
  mapWarehouseConfigToForm,
  validateWarehouseConfigForm,
} from '@/data/warehouseConfiguration';
import {
  createWarehouseConfig,
  updateWarehouseConfig,
} from '@/services/configuration.service';
import { getChangedFields, getErrorMessage } from '@/utils/api';

import WarehouseConfigForm, {
  createEmptyResource,
} from './WarehouseConfigForm';

const LIST_PATH = '/configuration/warehouse-configuration';

const TITLE_BY_MODE = {
  add: 'Add Warehouse Configuration',
  edit: 'Edit Warehouse Configuration',
  view: 'View Warehouse Configuration',
};

const SUBTITLE_BY_MODE = {
  add: 'Set warehouse processes, capacity, SLA, and resources',
  edit: 'Update warehouse processes, capacity, SLA, and resources',
  view: 'Review warehouse processes, capacity, SLA, and resources',
};

const createInitialForm = (mode, processes, initialForm, initialRow) => {
  if (initialForm) return initialForm;

  if (mode !== 'add' && initialRow) {
    return mapWarehouseConfigToForm(initialRow, processes);
  }

  return {
    ...emptyWarehouseConfigForm,
    processes: buildDefaultProcesses(processes),
    resources: [createEmptyResource()],
  };
};

export default function WarehouseConfigFormPage({
  mode = 'add',
  configId,
  warehouses: initialWarehouses = WAREHOUSE_MASTER_DATA,
  processes: initialProcesses = PROCESS_MASTER_DATA,
  initialRow = null,
  initialForm = null,
  fetchedAt,
  initialError = '',
  notFound = false,
}) {
  const router = useRouter();
  const { onMenuClick } = useLayout();
  const readOnly = mode === 'view';

  const [form, setForm] = useState(() =>
    createInitialForm(mode, initialProcesses, initialForm, initialRow),
  );
  const [selectedRow] = useState(initialRow);
  const [warehouses] = useState(initialWarehouses);
  const [processes] = useState(initialProcesses);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(initialError);
  const [lastUpdated] = useState(
    () => new Date(fetchedAt || Date.now()),
  );

  const handleCancel = () => {
    router.push(LIST_PATH);
  };

  const handleSubmit = async () => {
    const validationError = validateWarehouseConfigForm(form);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError('');

      const payload = buildWarehouseConfigPayload(form);

      if (mode === 'add') {
        await createWarehouseConfig(payload);
      } else if (mode === 'edit' && configId) {
        const original = selectedRow
          ? buildWarehouseConfigPayload(
              mapWarehouseConfigToForm(selectedRow, processes),
            )
          : {};
        const patch = getChangedFields(original, payload);
        const nextPayload = Object.keys(patch).length ? patch : payload;

        await updateWarehouseConfig(configId, nextPayload);
      }

      router.push(LIST_PATH);
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save configuration.'));
    } finally {
      setSaving(false);
    }
  };

  if (notFound) {
    return (
      <div className="page">
        <Header
          onMenuClick={onMenuClick}
          title="Warehouse Configuration"
          subtitle="Configuration not found"
          lastUpdated={lastUpdated}
          onRefresh={() => router.replace(router.asPath)}
        />
        <div className="page-body">
          <Typography sx={{ color: 'var(--text-secondary)', mb: 2 }}>
            This warehouse configuration does not exist or was deleted.
          </Typography>
          {error ? (
            <Typography variant="body2" sx={{ color: '#c62828', mb: 2 }}>
              {error}
            </Typography>
          ) : null}
          <Button
            onClick={handleCancel}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Header
        onMenuClick={onMenuClick}
        title={TITLE_BY_MODE[mode]}
        subtitle={SUBTITLE_BY_MODE[mode]}
        lastUpdated={lastUpdated}
        onRefresh={() => router.replace(router.asPath)}
      />

      <div className="page-body">
        <div
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: 24,
          }}
        >
          <WarehouseConfigForm
            form={form}
            setForm={setForm}
            warehouses={warehouses}
            processes={processes}
            readOnly={readOnly}
            disableWarehouse={mode !== 'add'}
          />

          {error ? (
            <Typography
              variant="body2"
              sx={{ color: '#c62828', mt: 2 }}
            >
              {error}
            </Typography>
          ) : null}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 24,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
            }}
          >
            <Button
              onClick={handleCancel}
              disabled={saving}
              color="inherit"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {readOnly ? 'Back' : 'Cancel'}
            </Button>

            {!readOnly && (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={saving}
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
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
