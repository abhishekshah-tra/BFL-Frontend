import { memo } from 'react'
import { formatHours, formatPercent } from '../../utils/format'

export const JourneyMetricsBar = memo(function JourneyMetricsBar({ metrics }) {
  const variancePositive = metrics.slaVarianceHours <= 0

  const items = [
    { label: 'Total Journey Time', value: formatHours(metrics.totalJourneyTimeHours) },
    { label: 'Total Dwell Time', value: formatHours(metrics.totalDwellTimeHours) },
    { label: 'Total Processing Time', value: formatHours(metrics.totalProcessingTimeHours) },
    { label: 'Total Waiting Time', value: formatHours(metrics.totalWaitingTimeHours) },
    { label: 'SLA', value: formatHours(metrics.slaHours) },
    {
      label: 'SLA Variance',
      value: formatHours(metrics.slaVarianceHours),
      tone: variancePositive ? 'success' : 'danger',
    },
    { label: '% SLA Utilized', value: formatPercent(metrics.slaUtilizedPercent) },
    { label: 'Aging (Since Last Event)', value: formatHours(metrics.agingHours) },
  ]

  return (
    <section className="metrics-strip" aria-label="Journey metrics">
      {items.map((item) => (
        <div className="metric" key={item.label}>
          <p className="metric__label">{item.label}</p>
          <p className={`metric__value ${item.tone ? `is-${item.tone}` : ''}`}>{item.value}</p>
        </div>
      ))}
    </section>
  )
})
