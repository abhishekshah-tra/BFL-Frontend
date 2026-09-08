import { MilestoneStatus } from '../../types/itemTrace'
import { STATUS_LABELS } from '../../constants/status'
import { Drawer } from '../common/Overlay'

export function FiltersPanel({
  open,
  filters,
  locations,
  journeyTypes,
  onChange,
  onReset,
  onClose,
}) {
  return (
    <Drawer open={open} title="Filters" onClose={onClose} width={380}>
      <div className="filter-form">
        <label>
          Status
          <select
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value })}
          >
            <option value="all">All statuses</option>
            {Object.values(MilestoneStatus).map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Location
          <select
            value={filters.location}
            onChange={(event) => onChange({ ...filters, location: event.target.value })}
          >
            <option value="all">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <label>
          Journey Type
          <select
            value={filters.journeyType}
            onChange={(event) => onChange({ ...filters, journeyType: event.target.value })}
          >
            <option value="all">All journey types</option>
            {journeyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          Date from
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(event) => onChange({ ...filters, dateFrom: event.target.value })}
          />
        </label>

        <label>
          Date to
          <input
            type="date"
            value={filters.dateTo}
            onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={filters.exceptionOnly}
            onChange={(event) =>
              onChange({ ...filters, exceptionOnly: event.target.checked })
            }
          />
          Exceptions only
        </label>

        <div className="filter-actions">
          <button type="button" className="btn btn--ghost" onClick={onReset}>
            Reset
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Apply
          </button>
        </div>
      </div>
    </Drawer>
  )
}
