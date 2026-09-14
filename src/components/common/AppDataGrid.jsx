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
        backgroundColor: '#fff',
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

          '& .MuiDataGrid-toolbarContainer': {
            padding: '12px 16px',
            borderBottom: '1px solid #edf0f2',
            gap: 1,
          },

          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8f9fb',
            borderBottom: '1px solid #e5e7eb',
          },

          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 600,
            fontSize: '0.85rem',
            color: '#343a40',
          },

          '& .MuiDataGrid-cell': {
            borderColor: '#f0f1f3',
            fontSize: '0.875rem',
          },

          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#fafbfc',
          },

          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid #edf0f2',
          },

          '& .MuiDataGrid-columnSeparator': {
            display: 'none',
          },
        }}
      />
    </Box>
  );
}