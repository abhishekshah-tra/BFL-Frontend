'use client';

import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

export default function CommonSwitch({
  label,
  name,
  checked = false,
  onChange,
  disabled = false,
}) {
  return (
    <FormControlLabel
      control={
        <Switch
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      }
      label={label}
    />
  );
}