'use client';

import CommonInput from '@/components/common/CommonInput';
import CommonTextArea from '@/components/common/CommonTextArea';
import CommonSwitch from '@/components/common/CommonSwitch';

export default function RoleForm({
  form,
  setForm,
  readOnly = false,
}) {
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
    <div className="row g-3">

      <div className="col-12 col-md-6">
        <CommonInput
          label="Role Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Role Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12">
        <CommonTextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonSwitch
          label="Active"
          name="isActive"
          checked={form.isActive}
          onChange={handleChange}
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonSwitch
          label="System Role"
          name="isSystemRole"
          checked={form.isSystemRole}
          onChange={handleChange}
          disabled={readOnly}
        />
      </div>

    </div>
  );
}