'use client';

import Box from '@mui/material/Box';
import {
  DataGrid,
  GridToolbar,
} from '@mui/x-data-grid';

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
        borderRadius: 2,
        overflow: 'hidden',
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

          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f8f9fa',
            fontWeight: 600,
          },

          '& .MuiDataGrid-cell': {
            borderColor: '#edf0f2',
          },

          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#fafbfc',
          },
        }}
      />
    </Box>
  );
}