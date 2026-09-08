import { memo } from 'react'
import {
  Check,
  Cog,
  FileText,
  ListChecks,
  MapPin,
  Package,
  Send,
  Store,
  Truck,
  Warehouse,
  ArrowRightLeft,
  AlertCircle,
} from 'lucide-react'
import { MilestoneStatus } from '../../types/itemTrace'
import { formatEventDate } from '../../utils/format'
import { STATUS_LABELS } from '../../constants/status'

const ICONS = {
  file: FileText,
  truck: Truck,
  pin: MapPin,
  package: Package,
  warehouse: Warehouse,
  transfer: ArrowRightLeft,
  list: ListChecks,
  cog: Cog,
  send: Send,
  store: Store,
}

export const MilestoneNode = memo(function MilestoneNode({ milestone, selected, onSelect }) {
  const Icon = ICONS[milestone.icon] ?? MapPin
  const stamp = milestone.eventTime ?? milestone.etaTime
  const parts = stamp ? formatEventDate(stamp) : { date: '—', time: '' }
  const isEta = !milestone.eventTime && Boolean(milestone.etaTime)

  return (
    <button
      type="button"
      className={`milestone ${selected ? 'is-selected' : ''} milestone--${milestone.status}`}
      onClick={() => onSelect(milestone.id)}
      aria-current={selected ? 'step' : undefined}
      aria-label={`${milestone.name}, ${STATUS_LABELS[milestone.status]}`}
    >
      <span className="milestone__node">
        {milestone.status === MilestoneStatus.Completed ? (
          <Check size={14} strokeWidth={2.4} />
        ) : milestone.status === MilestoneStatus.Exception ? (
          <AlertCircle size={14} />
        ) : (
          <Icon size={14} />
        )}
      </span>
      <span className="milestone__name">{milestone.name}</span>
      {isEta ? <span className="milestone__eta">ETA</span> : null}
      <span className="milestone__date">{parts.date}</span>
      <span className="milestone__time">{parts.time}</span>
    </button>
  )
})
