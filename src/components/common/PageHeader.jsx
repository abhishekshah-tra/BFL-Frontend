'use client';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';

export default function PageHeader({
  title,
  description,
  buttonText,
  onAdd,
}) {
  return (
    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
      <div>
        <h5 className="mb-1 fw-semibold">{title}</h5>

        {description && (
          <p className="text-muted mb-0 small">
            {description}
          </p>
        )}
      </div>

      {buttonText && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
}