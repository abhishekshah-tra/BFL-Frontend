'use client';

import TextField from '@mui/material/TextField';

export default function CommonInput({
  label,
  name,
  value = '',
  onChange,
  placeholder = '',
  type = 'text',
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
      type={type}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      size="small"
      {...props}
    />
  );
}