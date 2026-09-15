'use client';

import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function RowActions({
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div
      className="d-flex align-items-center gap-1"
      style={{ height: '100%' }}
    >

      <Tooltip title="View">
        <IconButton
          size="small"
          color="info"
          onClick={onView}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit">
        <IconButton
          size="small"
          color="primary"
          onClick={onEdit}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          size="small"
          color="error"
          onClick={onDelete}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );
}