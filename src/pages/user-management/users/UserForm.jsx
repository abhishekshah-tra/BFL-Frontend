'use client';

import CommonInput from '@/components/common/CommonInput';
import CommonSelect from '@/components/common/CommonSelect';
import CommonSwitch from '@/components/common/CommonSwitch';

export default function UserForm({
  form,
  setForm,
  roles = [],
  readOnly = false,
  mode = 'add',
}) {
  const roleOptions = roles.map((role) => ({
    value: role._id,
    label: role.name,
  }));

  const handleChange = (event) => {
    const {
      name,
      value,
      checked,
      type,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  };

  const passwordMismatch =
    form.password &&
    form.confirmPassword &&
    form.password !== form.confirmPassword;

  return (
    <div
      className="row g-2"
      style={{
        marginTop: 0,
      }}
    >
      {/* First Name */}

      <div className="col-12 col-md-6">
        <CommonInput
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      {/* Last Name */}

      <div className="col-12 col-md-6">
        <CommonInput
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          disabled={readOnly}
        />
      </div>

      {/* Email */}

      <div className="col-12 col-md-6">
        <CommonInput
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      {/* Role */}

      <div className="col-12 col-md-6">
        <CommonSelect
          label="Roles"
          name="roleId"
          value={form.roleId}
          onChange={handleChange}
          options={roleOptions}
          required
          disabled={readOnly}
          placeholder="Select Roles"
          multiple
        />
      </div>

      {/* Password */}

      <div className="col-12 col-md-6">
        <CommonInput
          label={
            mode === 'edit'
              ? 'New Password'
              : 'Password'
          }
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required={mode === 'add'}
          disabled={readOnly}
          helperText={
            mode === 'edit'
              ? 'Leave blank to keep the current password.'
              : ''
          }
          error={Boolean(passwordMismatch)}
        />
      </div>

      {/* Confirm Password */}

      <div className="col-12 col-md-6">
        <CommonInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          required={mode === 'add'}
          disabled={readOnly}
          error={Boolean(passwordMismatch)}
          helperText={
            passwordMismatch
              ? 'Passwords do not match.'
              : mode === 'edit'
                ? 'Leave blank if you are not changing the password.'
                : ''
          }
        />
      </div>

      {/* Status */}

      <div className="col-12">
        <CommonSwitch
          label="Active"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
          disabled={readOnly}
        />
      </div>
    </div>
  );
}