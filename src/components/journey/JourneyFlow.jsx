import { memo } from 'react'
import { Info } from 'lucide-react'
import { MilestoneNode } from './MilestoneNode'
import { Card } from '../common/StatusBadge'

export const JourneyFlow = memo(function JourneyFlow({ milestones, selectedId, onSelect }) {
  return (
    <Card
      className="journey-flow-card"
      title={
        <span className="card__title-row">
          Journey Flow
          <span className="info-tip" title="Click a milestone to focus details, table and map.">
            <Info size={14} />
            <span className="sr-only">
              Click a milestone to focus details, table and map.
            </span>
          </span>
        </span>
      }
    >
      <div className="timeline-scroll">
        <ol className="timeline">
          {milestones.map((milestone, index) => (
            <li key={milestone.id} className="timeline__item">
              <MilestoneNode
                milestone={milestone}
                selected={milestone.id === selectedId}
                onSelect={onSelect}
              />
              {index < milestones.length - 1 ? (
                <span
                  className={`timeline__connector timeline__connector--${milestone.status}`}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <ul className="legend" aria-label="Milestone status legend">
        <li><span className="status-dot status-dot--completed" /> Completed</li>
        <li><span className="status-dot status-dot--in_progress" /> In Progress</li>
        <li><span className="status-dot status-dot--upcoming" /> Upcoming</li>
        <li><span className="status-dot status-dot--exception" /> Exception</li>
      </ul>
    </Card>
  )
})
