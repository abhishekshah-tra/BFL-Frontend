'use client';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import CommonInput from '@/components/common/CommonInput';
import CommonSelect from '@/components/common/CommonSelect';
import CommonSwitch from '@/components/common/CommonSwitch';
import {
  PROCESS_MASTER_DATA,
  SLA_UNIT_OPTIONS,
  formatProcessSla,
  normalizeSlaUnit,
} from '@/data/processMaster';
import {
  PRODUCTIVITY_UNIT,
  PRODUCTIVITY_UNIT_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
} from '@/data/warehouseConfiguration';
import { getRefId } from '@/utils/api';

export const createEmptyResource = () => ({
  id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  resourceType: '',
  processId: '',
  plannedQuantity: '',
  availableQuantity: '',
  productivity: '',
  unit: PRODUCTIVITY_UNIT.ITEMS_HOUR,
  isActive: true,
});

const tableSx = {
  border: '1px solid var(--border)',
  borderRadius: '8px',
  overflow: 'hidden',
  '& th': {
    fontWeight: 700,
    backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.03))',
    color: 'var(--text)',
  },
  '& td, & th': {
    borderColor: 'var(--border)',
    color: 'var(--text)',
  },
};

export default function WarehouseConfigForm({
  form,
  setForm,
  warehouses = [],
  processes = PROCESS_MASTER_DATA,
  readOnly = false,
  disableWarehouse = false,
}) {
  const selectedWarehouseId = getRefId(form.warehouseId);

  const warehouseOptions = warehouses
    .filter(
      (warehouse) =>
        warehouse.isActive || getRefId(warehouse._id) === selectedWarehouseId,
    )
    .map((warehouse) => ({
      value: getRefId(warehouse._id),
      label: `${warehouse.code} — ${warehouse.name}`,
    }));

  const processById = Object.fromEntries(
    processes.map((process) => [getRefId(process._id), process]),
  );

  const usedProcessIds = new Set(
    [
      ...(form.processes || []).map((item) => getRefId(item.processId)),
      ...(form.resources || []).map((item) => getRefId(item.processId)),
    ].filter(Boolean),
  );

  const processOptions = processes
    .filter(
      (process) =>
        process.isActive || usedProcessIds.has(getRefId(process._id)),
    )
    .sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0))
    .map((process) => ({
      value: getRefId(process._id),
      label: process.name,
    }));

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleProcessChange = (processId, field, value) => {
    setForm((previous) => ({
      ...previous,
      processes: previous.processes.map((item) =>
        item.processId === processId
          ? { ...item, [field]: value }
          : item,
      ),
    }));
  };

  const handleResourceChange = (resourceId, field, value) => {
    setForm((previous) => ({
      ...previous,
      resources: previous.resources.map((item) =>
        item.id === resourceId
          ? { ...item, [field]: value }
          : item,
      ),
    }));
  };

  const handleAddResource = () => {
    setForm((previous) => ({
      ...previous,
      resources: [...previous.resources, createEmptyResource()],
    }));
  };

  const handleRemoveResource = (resourceId) => {
    setForm((previous) => ({
      ...previous,
      resources: previous.resources.filter(
        (item) => item.id !== resourceId,
      ),
    }));
  };

  return (
    <div className="row g-3" style={{ marginTop: 0 }}>
      <div className="col-12 col-md-6">
        <CommonSelect
          label="Warehouse"
          name="warehouseId"
          value={form.warehouseId}
          onChange={handleChange}
          options={warehouseOptions}
          required
          disabled={readOnly || disableWarehouse}
          placeholder="Select Warehouse"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Configuration Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={readOnly}
          placeholder="e.g. TECHNO Default"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Effective From"
          name="effectiveFrom"
          type="date"
          value={form.effectiveFrom}
          onChange={handleChange}
          required
          disabled={readOnly}
          InputLabelProps={{ shrink: true }}
        />
      </div>

      <div className="col-12 col-md-6 d-flex align-items-center">
        <CommonSwitch
          label="Active"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
          disabled={readOnly}
        />
      </div>

      <div className="col-12">
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 1,
            color: 'var(--text)',
          }}
        >
          Process Configuration
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1.5,
            color: 'var(--text-secondary)',
          }}
        >
          Capacity and SLA default from Process Master and can be
          overridden for this warehouse. Enable or disable each process.
        </Typography>

        <Table size="small" sx={tableSx}>
          <TableHead>
            <TableRow>
              <TableCell>Process</TableCell>
              <TableCell align="center">Sequence</TableCell>
              <TableCell align="right" sx={{ minWidth: 120 }}>
                Capacity / Hour
              </TableCell>
              <TableCell sx={{ minWidth: 220 }}>SLA</TableCell>
              <TableCell align="center">Enabled</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {form.processes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 3, color: 'var(--text-secondary)' }}
                >
                  No processes available. Add processes in Process Master first.
                </TableCell>
              </TableRow>
            ) : (
            form.processes.map((item) => {
              const process = processById[getRefId(item.processId)];

              if (!process) {
                return (
                  <TableRow key={item.processId || 'unknown'}>
                    <TableCell colSpan={5} sx={{ color: 'var(--text-secondary)' }}>
                      Unknown process
                    </TableCell>
                  </TableRow>
                );
              }

              const capacity =
                item.capacityPerHour ?? process.capacityPerHour ?? '';
              const sla = item.sla ?? process.sla ?? '';
              const slaUnit = normalizeSlaUnit(
                item.slaUnit || process.slaUnit,
              );

              return (
                <TableRow key={item.processId}>
                  <TableCell>{process.name}</TableCell>
                  <TableCell align="center">{process.sequence}</TableCell>
                  <TableCell align="right">
                    {readOnly ? (
                      Number(capacity).toLocaleString()
                    ) : (
                      <CommonInput
                        name={`capacityPerHour-${item.processId}`}
                        type="number"
                        value={capacity}
                        onChange={(event) =>
                          handleProcessChange(
                            item.processId,
                            'capacityPerHour',
                            event.target.value,
                          )
                        }
                        inputProps={{ min: 0 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      formatProcessSla(sla, slaUnit)
                    ) : (
                      <div className="d-flex gap-2 align-items-center">
                        <CommonInput
                          name={`sla-${item.processId}`}
                          type="number"
                          value={sla}
                          onChange={(event) =>
                            handleProcessChange(
                              item.processId,
                              'sla',
                              event.target.value,
                            )
                          }
                          inputProps={{ min: 0 }}
                        />
                        <CommonSelect
                          name={`slaUnit-${item.processId}`}
                          value={slaUnit}
                          onChange={(event) =>
                            handleProcessChange(
                              item.processId,
                              'slaUnit',
                              event.target.value,
                            )
                          }
                          options={SLA_UNIT_OPTIONS}
                          placeholder="Unit"
                          required
                          sx={{ minWidth: 120 }}
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={Boolean(item.enabled)}
                      onChange={(event) =>
                        handleProcessChange(
                          item.processId,
                          'enabled',
                          event.target.checked,
                        )
                      }
                      disabled={readOnly}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            Resource Configuration
          </Typography>
          {!readOnly && (
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddResource}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                color: 'var(--text)',
              }}
            >
              Add Resource
            </Button>
          )}
        </div>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mb: 1.5,
            color: 'var(--text-secondary)',
          }}
        >
          Planned vs available counts and productivity are required for
          simulation and demo scenarios.
        </Typography>

        <Table size="small" sx={tableSx}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 120 }}>Resource</TableCell>
              <TableCell sx={{ minWidth: 120 }}>Process</TableCell>
              <TableCell align="right" sx={{ minWidth: 90 }}>
                Planned
              </TableCell>
              <TableCell align="right" sx={{ minWidth: 90 }}>
                Available
              </TableCell>
              <TableCell align="right" sx={{ minWidth: 100 }}>
                Productivity
              </TableCell>
              <TableCell sx={{ minWidth: 120 }}>Unit</TableCell>
              <TableCell align="center" sx={{ minWidth: 80 }}>
                Active
              </TableCell>
              {!readOnly && (
                <TableCell align="center" sx={{ width: 56 }} />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {(form.resources || []).length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={readOnly ? 7 : 8}
                  align="center"
                  sx={{ py: 3, color: 'var(--text-secondary)' }}
                >
                  No resources configured. Add operators, robots, or
                  chutes for this warehouse.
                </TableCell>
              </TableRow>
            ) : (
              form.resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    {readOnly ? (
                      resource.resourceType || '-'
                    ) : (
                      <CommonSelect
                        name={`resourceType-${resource.id}`}
                        value={resource.resourceType}
                        onChange={(event) =>
                          handleResourceChange(
                            resource.id,
                            'resourceType',
                            event.target.value,
                          )
                        }
                        options={RESOURCE_TYPE_OPTIONS}
                        placeholder="Type"
                        required
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      processById[getRefId(resource.processId)]?.name || '-'
                    ) : (
                      <CommonSelect
                        name={`processId-${resource.id}`}
                        value={resource.processId}
                        onChange={(event) =>
                          handleResourceChange(
                            resource.id,
                            'processId',
                            event.target.value,
                          )
                        }
                        options={processOptions}
                        placeholder="Process"
                        required
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {readOnly ? (
                      resource.plannedQuantity ?? '-'
                    ) : (
                      <CommonInput
                        name={`plannedQuantity-${resource.id}`}
                        type="number"
                        value={resource.plannedQuantity}
                        onChange={(event) =>
                          handleResourceChange(
                            resource.id,
                            'plannedQuantity',
                            event.target.value,
                          )
                        }
                        inputProps={{ min: 0 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {readOnly ? (
                      resource.availableQuantity ?? '-'
                    ) : (
                      <CommonInput
                        name={`availableQuantity-${resource.id}`}
                        type="number"
                        value={resource.availableQuantity}
                        onChange={(event) =>
                          handleResourceChange(
                            resource.id,
                            'availableQuantity',
                            event.target.value,
                          )
                        }
                        inputProps={{ min: 0 }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {readOnly ? (
                      resource.productivity ?? '-'
                    ) : (
                      <CommonInput
                        name={`productivity-${resource.id}`}
                        type="number"
                        value={resource.productivity}
                        onChange={(event) =>
                          handleResourceChange(
                            resource.id,
                            'productivity',
                            event.target.value,
                          )
                        }
                        inputProps={{ min: 0 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {readOnly ? (
                      resource.unit || '-'
                    ) : (
                      <CommonSelect
                        name={`unit-${resource.id}`}
                        value={resource.unit}
                        onChange={(event) =>
                          handleResourceChange(
                            resource.id,
                            'unit',
                            event.target.value,
                          )
                        }
                        options={PRODUCTIVITY_UNIT_OPTIONS}
                        placeholder="Unit"
                        required
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={Boolean(resource.isActive)}
                      onChange={(event) =>
                        handleResourceChange(
                          resource.id,
                          'isActive',
                          event.target.checked,
                        )
                      }
                      disabled={readOnly}
                      size="small"
                    />
                  </TableCell>
                  {!readOnly && (
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        aria-label="Remove resource"
                        onClick={() =>
                          handleRemoveResource(resource.id)
                        }
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
