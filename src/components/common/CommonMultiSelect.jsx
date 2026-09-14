'use client';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import FormHelperText from '@mui/material/FormHelperText';

export default function CommonMultiSelect({
  label,
  name,
  value = [],
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  fullWidth = true,
  valueKey = 'value',
  labelKey = 'label',
}) {
  return (
    <FormControl
      fullWidth={fullWidth}
      size="small"
      required={required}
      disabled={disabled}
      error={error}
    >
      <InputLabel>{label}</InputLabel>

      <Select
        multiple
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        renderValue={(selected) =>
          options
            .filter((option) =>
              selected.includes(option[valueKey]),
            )
            .map((option) => option[labelKey])
            .join(', ')
        }
      >
        {options.map((option) => {
          const optionValue = option[valueKey];

          return (
            <MenuItem
              key={optionValue}
              value={optionValue}
            >
              <Checkbox
                checked={value.includes(optionValue)}
              />

              <ListItemText
                primary={option[labelKey]}
              />
            </MenuItem>
          );
        })}
      </Select>

      {helperText && (
        <FormHelperText>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
}