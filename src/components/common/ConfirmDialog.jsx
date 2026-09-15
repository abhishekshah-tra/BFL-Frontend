'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function ConfirmDialog({
  open,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this record?',
  onClose,
  onConfirm,
  loading = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '14px' },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 600,
          color: '#1E1450',
          borderBottom: '1px solid #eef0f5',
          py: 2,
          px: 3,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography variant="body2">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: '1px solid #eef0f5',
          px: 3,
          py: 2,
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          color="inherit"
          sx={{ fontWeight: 600 }}
        >
          Cancel
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{ fontWeight: 600, minWidth: 110 }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}