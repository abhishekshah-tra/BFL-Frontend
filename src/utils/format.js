export function formatHours(value) {
  if (value === null || value === undefined) return '—'
  const sign = value < 0 ? '-' : ''
  return `${sign}${Math.abs(value).toFixed(1)} hrs`
}

export function formatLastUpdated(iso) {
  const date =
    iso instanceof Date
      ? iso
      : iso
        ? new Date(iso)
        : new Date()

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const time = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const day = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  return `${time} | ${day}`
}

export function formatEventDate(iso) {
  const date = new Date(iso)
  return {
    date: date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }
}

export function formatEventDateTime(iso) {
  const { date, time } = formatEventDate(iso)
  return `${date} ${time}`
}

export function formatPercent(value) {
  return `${Math.round(value)}%`
}

export function countActiveFilters(filters) {
  let count = 0
  if (filters.status !== 'all') count += 1
  if (filters.location !== 'all') count += 1
  if (filters.journeyType !== 'all') count += 1
  if (filters.dateFrom) count += 1
  if (filters.dateTo) count += 1
  if (filters.exceptionOnly) count += 1
  return count
}
