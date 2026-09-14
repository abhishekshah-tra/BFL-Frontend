'use client';

import TextField from '@mui/material/TextField';

export default function CommonTextArea({
  label,
  name,
  value = '',
  onChange,
  placeholder = '',
  rows = 4,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  ...props
}) {
  return (
    <TextField
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      multiline
      rows={rows}
      size="small"
      {...props}
    />
  );
}