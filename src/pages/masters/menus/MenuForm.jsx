'use client';

import CommonInput from '@/components/common/CommonInput';
import CommonSelect from '@/components/common/CommonSelect';
import CommonSwitch from '@/components/common/CommonSwitch';

export default function MenuForm({
  form,
  setForm,
  menus = [],
  selectedRow = null,
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

  const parentOptions = menus
    .filter(
      (menu) =>
        menu._id !== selectedRow?._id,
    )
    .map((menu) => ({
      value: menu._id,
      label: menu.name,
    }));

  return (
    <div className="row g-3">

      <div className="col-12 col-md-6">
        <CommonInput
          label="Menu Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Menu Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonSelect
          label="Parent Menu"
          name="parentId"
          value={form.parentId}
          onChange={handleChange}
          options={parentOptions}
          disabled={readOnly}
          placeholder="Root Menu"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Route"
          name="route"
          value={form.route}
          onChange={handleChange}
          disabled={readOnly}
          placeholder="/example"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Icon"
          name="icon"
          value={form.icon}
          onChange={handleChange}
          disabled={readOnly}
          placeholder="Dashboard"
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Sort Order"
          name="sortOrder"
          type="number"
          value={form.sortOrder}
          onChange={handleChange}
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
