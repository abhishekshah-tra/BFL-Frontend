'use client';

import CommonTextArea from '@/components/common/CommonTextArea';
import CommonSwitch from '@/components/common/CommonSwitch';
import CommonInput from '@/components/common/CommonInput';

export default function ActionForm({
  form,
  setForm,
  readOnly = false,
}) {
  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="row g-3">

      <div className="col-12 col-md-6">
        <CommonInput
          label="Action Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Action Code"
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