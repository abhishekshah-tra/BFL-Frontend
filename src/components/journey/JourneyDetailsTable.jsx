import { memo } from 'react'
import { formatEventDateTime, formatHours } from '../../utils/format'
import { Card, StatusBadge, TextLink } from '../common/StatusBadge'

export const JourneyDetailsTable = memo(function JourneyDetailsTable({
  milestones,
  selectedId,
  onSelect,
  onViewLog,
}) {
  return (
    <Card
      className="table-card"
      title="Journey Details (Milestone View)"
      footer={<TextLink onClick={onViewLog}>View Full Event Log →</TextLink>}
    >
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Milestone</th>
              <th>Location</th>
              <th>Event Time</th>
              <th>Dwell Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {milestones.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-cell">
                  No milestones match the current filters.
                </td>
              </tr>
            ) : (
              milestones.map((milestone) => {
                const time = milestone.eventTime ?? milestone.etaTime
                return (
                  <tr
                    key={milestone.id}
                    className={milestone.id === selectedId ? 'is-selected' : ''}
                    onClick={() => onSelect(milestone.id)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelect(milestone.id)
                      }
                    }}
                  >
                    <td>
                      <span className="milestone-cell">
                        <span className={`status-dot status-dot--${milestone.status}`} />
                        {milestone.name}
                      </span>
                    </td>
                    <td>{milestone.location}</td>
                    <td>
                      {time ? formatEventDateTime(time) : '—'}
                      {!milestone.eventTime && milestone.etaTime ? ' (ETA)' : ''}
                    </td>
                    <td>{formatHours(milestone.dwellTimeHours)}</td>
                    <td>
                      <StatusBadge status={milestone.status} />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
})
