'use client';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';

export default function PageHeader({
  title,
  description,
  buttonText,
  onAdd,
  icon = <AddIcon />,
}) {
  return (
    <div className="row align-items-center g-3 mb-4">
      {/* Page title */}
      <div className="col-12 col-md">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 46,
              height: 46,
              borderRadius: 10,
              backgroundColor: '#eeecf8',
              color: '#1E1450',
            }}
          >
            {icon}
          </div>

          <div>
            <h4
              className="mb-1 fw-semibold"
              style={{ color: '#1E1450' }}
            >
              {title}
            </h4>

            {description && (
              <p className="mb-0 text-muted small">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action */}
      {buttonText && (
        <div className="col-12 col-md-auto">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            fullWidth
            sx={{
              minWidth: {
                xs: '100%',
                sm: 140,
              },
              height: 42,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            {buttonText}
          </Button>
        </div>
      )}
    </div>
  );
}