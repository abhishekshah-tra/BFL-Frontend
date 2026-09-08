import { memo, useState } from 'react'
import { Bell } from 'lucide-react'
import { SEVERITY_LABELS } from '../../constants/status'
import { formatEventDateTime } from '../../utils/format'
import { Card, TextLink } from '../common/StatusBadge'
import { Drawer } from '../common/Overlay'

export const AlertsPanel = memo(function AlertsPanel({ alerts, onViewAll, onSelect }) {
  const visible = alerts.slice(0, 1)

  return (
    <Card
      className="alerts-card"
      title={
        <span className="card__title-row">
          Alerts & Exceptions
          <span className="count-badge">{alerts.length}</span>
        </span>
      }
      footer={<TextLink onClick={onViewAll}>View All Alerts →</TextLink>}
    >
      {visible.length === 0 ? (
        <p className="muted">No active alerts for this item.</p>
      ) : (
        visible.map((alert) => (
          <button
            type="button"
            className={`alert-item alert-item--${alert.severity}`}
            key={alert.id}
            onClick={() => onSelect(alert)}
          >
            <span className="alert-item__icon" aria-hidden="true">
              <Bell size={14} />
            </span>
            <span>
              <span className={`severity-badge severity-badge--${alert.severity}`}>
                {SEVERITY_LABELS[alert.severity]}
              </span>
              <span className="alert-item__title">{alert.title}</span>
              <span className="alert-item__time">{formatEventDateTime(alert.timestamp)}</span>
            </span>
          </button>
        ))
      )}
    </Card>
  )
})

export function AlertsDrawer({ open, alerts, selectedId, onClose }) {
  const [activeId, setActiveId] = useState(selectedId ?? alerts[0]?.id)
  const active = alerts.find((item) => item.id === (selectedId || activeId)) ?? alerts[0]

  return (
    <Drawer open={open} title="Alerts & Exceptions" onClose={onClose}>
      {alerts.length === 0 ? (
        <p className="muted">No alerts found.</p>
      ) : (
        <div className="alert-detail-list">
          {alerts.map((alert) => (
            <article
              key={alert.id}
              className={`alert-detail alert-detail--${alert.severity} ${alert.id === active?.id ? 'is-active' : ''}`}
              onClick={() => setActiveId(alert.id)}
            >
              <header>
                <span className={`severity-badge severity-badge--${alert.severity}`}>
                  {SEVERITY_LABELS[alert.severity]}
                </span>
                <time>{formatEventDateTime(alert.timestamp)}</time>
              </header>
              <h3>{alert.title}</h3>
              <p>{alert.description}</p>
              <p className="muted">Location: {alert.location}</p>
            </article>
          ))}
        </div>
      )}
    </Drawer>
  )
}
