'use client';

import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export default function CommonSelect({
  label,
  name,
  value = '',
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  placeholder = 'Select',
  fullWidth = true,
  valueKey = 'value',
  labelKey = 'label',
  ...props
}) {
  return (
    <TextField
      select
      label={label}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      error={error}
      helperText={helperText}
      fullWidth={fullWidth}
      size="small"
      {...props}
    >
      <MenuItem value="">
        <em>{placeholder}</em>
      </MenuItem>

      {options.map((option) => (
        <MenuItem
          key={option[valueKey]}
          value={option[valueKey]}
        >
          {option[labelKey]}
        </MenuItem>
      ))}
    </TextField>
  );
}