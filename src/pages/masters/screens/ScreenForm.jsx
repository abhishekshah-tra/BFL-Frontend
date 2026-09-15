'use client';

import CommonInput from '@/components/common/CommonInput';
import CommonSelect from '@/components/common/CommonSelect';
import CommonTextArea from '@/components/common/CommonTextArea';
import CommonSwitch from '@/components/common/CommonSwitch';

export default function ScreenForm({
  form,
  setForm,
  menus = [],
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

  const menuOptions = menus.map(
    (menu) => ({
      value: menu._id,
      label: menu.name,
    }),
  );

  return (
    <div className="row g-3" style={{ marginTop: 0 }}>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Screen Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonInput
          label="Screen Code"
          name="code"
          value={form.code}
          onChange={handleChange}
          required
          disabled={readOnly}
        />
      </div>

      <div className="col-12 col-md-6">
        <CommonSelect
          label="Menu"
          name="menuId"
          value={form.menuId}
          onChange={handleChange}
          options={menuOptions}
          required
          disabled={readOnly}
          placeholder="Select Menu"
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
