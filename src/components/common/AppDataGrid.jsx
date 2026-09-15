'use client';

import Box from '@mui/material/Box';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

export default function AppDataGrid({
  rows,
  columns,
  loading = false,
}) {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'var(--card-bg)',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row._id}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              page: 0,
              pageSize: 10,
            },
          },
        }}
        slots={{
          toolbar: GridToolbar,
        }}
        sx={{
          border: 0,

          color: 'var(--text)',

          '& .MuiDataGrid-toolbarContainer': {
            padding: '12px 16px',
            borderBottom: '1px solid var(--border)',
            gap: 1,
          },

          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'var(--page-bg)',
            borderBottom: '1px solid var(--border)',
          },

          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: '0.85rem',
            color: 'var(--text)',
          },

          '& .MuiDataGrid-cell': {
            borderColor: 'var(--border)',
            fontSize: '0.875rem',
          },

          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'var(--page-bg)',
          },

          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          },

          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
        }}
      />
    </Box>
  );
}