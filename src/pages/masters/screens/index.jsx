'use client';
import { useEffect, useState } from 'react';
import AppDataGrid from '@/components/common/AppDataGrid';
import AppDialog from '@/components/common/AppDialog';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusChip from '@/components/common/StatusChip';
import RowActions from '@/components/common/RowActions';
import PageHeader from '@/components/common/PageHeader';

import ScreenForm from './ScreenForm';

import {
    getScreens,
    createScreen,
    updateScreen,
    deleteScreen,
} from '@/services/screen.service';

import { getMenus } from '@/services/menu.service';

const emptyForm = {
    name: '',
    code: '',
    menuId: '',
    route: '',
    description: '',
    sortOrder: 0,
    isActive: true,
};

export default function ScreensPage() {
    const [rows, setRows] = useState([]);
    const [menus, setMenus] = useState([]);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [mode, setMode] = useState('add');
    const [selectedRow, setSelectedRow] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const loadScreens = async () => {
        try {
            setLoading(true);

            const [
                screenData,
                menuData,
            ] = await Promise.all([
                getScreens(),
                getMenus(),
            ]);

            setRows(
                Array.isArray(screenData)
                    ? screenData
                    : screenData?.data || [],
            );

            setMenus(
                Array.isArray(menuData)
                    ? menuData
                    : menuData?.data || [],
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadScreens();
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
            menuId:
                row.menuId?._id ||
                row.menuId ||
                '',
            route: row.route || '',
            description:
                row.description || '',
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
            menuId:
                row.menuId?._id ||
                row.menuId ||
                '',
            route: row.route || '',
            description:
                row.description || '',
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
                sortOrder: Number(form.sortOrder) || 0,
            };

            if (mode === 'add') {
                await createScreen(payload);
            } else {
                await updateScreen(
                    selectedRow._id,
                    payload,
                );
            }

            setDialogOpen(false);

            await loadScreens();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            setSaving(true);

            await deleteScreen(
                selectedRow._id,
            );

            setDeleteOpen(false);

            await loadScreens();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Screen Name',
            flex: 1,
            minWidth: 170,
        },
        {
            field: 'code',
            headerName: 'Code',
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'menuId',
            headerName: 'Menu',
            flex: 1,
            minWidth: 160,
            valueGetter: (value) => {
                if (!value) return '-';

                if (typeof value === 'object') {
                    return value.name || '-';
                }

                const menu = menus.find(
                    (item) => item._id === value,
                );

                return menu?.name || '-';
            },
        },
        {
            field: 'route',
            headerName: 'Route',
            flex: 1,
            minWidth: 180,
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
        <>
            <PageHeader
                title="Screens"
                description="Manage application screens"
                buttonText="Add Screen"
                onAdd={handleAdd}
            />

            <AppDataGrid
                rows={rows}
                columns={columns}
                loading={loading}
            />

            <AppDialog
                open={dialogOpen}
                title={
                    mode === 'add'
                        ? 'Add Screen'
                        : mode === 'edit'
                            ? 'Edit Screen'
                            : 'View Screen'
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
                <ScreenForm
                    form={form}
                    setForm={setForm}
                    menus={menus}
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
        </>
    );
}