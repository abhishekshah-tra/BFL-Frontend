'use client';

import CommonInput from '@/components/common/CommonInput';
import CommonSelect from '@/components/common/CommonSelect';
import CommonTextArea from '@/components/common/CommonTextArea';
import CommonSwitch from '@/components/common/CommonSwitch';

const COUNTRY_OPTIONS = [
  { value: 'UAE', label: 'UAE' },
  { value: 'India', label: 'India' },
  { value: 'Saudi Arabia', label: 'Saudi Arabia' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Oman', label: 'Oman' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Dubai', label: 'Asia/Dubai' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh' },
  { value: 'Asia/Qatar', label: 'Asia/Qatar' },
  { value: 'Asia/Muscat', label: 'Asia/Muscat' },
];

export default function WarehouseForm({
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
          label="Warehouse Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          required
          disabled={readOnly}
          placeholder="e.g. TECHNO"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Warehouse Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={readOnly}
          placeholder="e.g. TECHNO Warehouse"
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
          placeholder="Main sorting..."
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Location"
          name="location"
          value={form.location}
          onChange={handleChange}
          disabled={readOnly}
          placeholder="e.g. Dubai"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonSelect
          label="Country"
          name="country"
          value={form.country}
          onChange={handleChange}
          options={COUNTRY_OPTIONS}
          disabled={readOnly}
          placeholder="Select Country"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonSelect
          label="Time Zone"
          name="timeZone"
          value={form.timeZone}
          onChange={handleChange}
          options={TIMEZONE_OPTIONS}
          disabled={readOnly}
          placeholder="Select Time Zone"
        />
      </div>

      <div className="col-12 col-md-6 d-flex align-items-center">
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
