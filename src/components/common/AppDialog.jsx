'use client';

import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';

export default function AppDialog({
  open,
  title,
  children,
  onClose,
  onSubmit,
  submitText = 'Save',
  loading = false,
  hideSubmit = false,
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: '14px' },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 600,
          color: '#1E1450',
          borderBottom: '1px solid #eef0f5',
          py: 2,
          px: 3,
        }}
      >
        {title}

        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{ color: '#8a8fa3' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 3 }}>
        {children}
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

        {!hideSubmit && (
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={loading}
            sx={{ fontWeight: 600, minWidth: 110 }}
          >
            {loading ? 'Saving...' : submitText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}