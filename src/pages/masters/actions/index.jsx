'use client';

import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import AppDataGrid from '@/components/common/AppDataGrid';
import AppDialog from '@/components/common/AppDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusChip from '@/components/common/StatusChip';
import RowActions from '@/components/common/RowActions';
import ActionForm from './ActionForm';
import { getActions, createAction, updateAction, deleteAction, } from '@/services/action.service';
import PageHeader from '@/components/common/PageHeader';

const emptyForm = {
  name: '',
  code: '',
  description: '',
  isActive: true,
};

export default function ActionsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadActions = async () => {
    try {
      setLoading(true);

      const data = await getActions();

      setRows(
        Array.isArray(data)
          ? data
          : data?.data || [],
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions();
  }, []);

  const handleAdd = () => {
    setMode('add');
    setSelectedRow(null);
    setForm(emptyForm);
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
        await createAction(form);
      } else {
        await updateAction(selectedRow._id, form);
      }

      setDialogOpen(false);

      await loadActions();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setSaving(true);

      await deleteAction(selectedRow._id);

      setDeleteOpen(false);

      await loadActions();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Action Name',
      flex: 1,
      minWidth: 160,
    },
    {
      field: 'code',
      headerName: 'Code',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 220,
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
    <div className="container-fluid px-0">

      <PageHeader
        title="Actions"
        description="Manage system actions and permissions"
        buttonText="Add Action"
        onAdd={handleAdd}
      />

      <div className="row">
        <div className="col-12">

          <div
            className="bg-white rounded-3 shadow-sm border"
            style={{
              borderColor: '#e9ecef',
              overflow: 'hidden',
            }}
          >
            <div className="p-3 p-md-4 border-bottom">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <div>
                  <h6 className="mb-1 fw-semibold">
                    System Actions
                  </h6>

                  <p className="mb-0 text-muted small">
                    Configure actions available across the application
                  </p>
                </div>

                <span className="text-muted small">
                  {rows.length} {rows.length === 1 ? 'action' : 'actions'}
                </span>
              </div>
            </div>

            <AppDataGrid
              rows={rows}
              columns={columns}
              loading={loading}
            />
          </div>

        </div>
      </div>

      <AppDialog
        open={dialogOpen}
        title={
          mode === 'add'
            ? 'Add Action'
            : mode === 'edit'
              ? 'Edit Action'
              : 'View Action'
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
        <ActionForm
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