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

  return (
    <div
      className="row g-2"
      style={{
        marginTop: 0,
      }}
    >

      {/* Name */}
      <div className="col-12 col-md-6">
        <CommonInput
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
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
        />
      </div>

      {/* Role */}
      <div className="col-12 col-md-6">
        <CommonSelect
          label="Role"
          name="roleId"
          value={form.roleId}
          onChange={handleChange}
          options={roleOptions}
          required
          disabled={readOnly}
          placeholder="Select Role"
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