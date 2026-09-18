'use client';

import CommonInput from '@/components/common/CommonInput';
import CommonSelect from '@/components/common/CommonSelect';
import CommonTextArea from '@/components/common/CommonTextArea';
import CommonSwitch from '@/components/common/CommonSwitch';

const SLA_UNIT_OPTIONS = [
  { value: 'Minutes', label: 'Minutes' },
  { value: 'Hours', label: 'Hours' },
  { value: 'Days', label: 'Days' },
];

export default function ProcessForm({
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
    <div className="row g-3" style={{ marginTop: 0 }}>
      <div className="col-12 col-md-6">
        <CommonInput
          label="Process Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          required
          disabled={readOnly}
          placeholder="e.g. SORTING"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Process Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={readOnly}
          placeholder="e.g. Sorting"
        />
      </div>

      <div className="col-12">
        <CommonTextArea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Sequence"
          name="sequence"
          type="number"
          value={form.sequence}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Capacity / Hour"
          name="capacityPerHour"
          type="number"
          value={form.capacityPerHour}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="SLA"
          name="sla"
          type="number"
          value={form.sla}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonSelect
          label="SLA Unit"
          name="slaUnit"
          value={form.slaUnit}
          onChange={handleChange}
          options={SLA_UNIT_OPTIONS}
          required
          disabled={readOnly}
          placeholder="Select SLA Unit"
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
