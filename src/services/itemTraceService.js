import { SAMPLE_EVENT_LOG, SAMPLE_TRACE } from '../data/mockItemTrace'
import { defaultFilters } from '../types/itemTrace'

const traces = [structuredClone(SAMPLE_TRACE)]

function normalize(value) {
  return value.trim().toLowerCase()
}

export function getItemTrace(identifier) {
  if (!identifier.trim()) return null
  if (normalize(identifier) === '__error__') {
    throw new Error('Unable to load item journey')
  }

  const query = normalize(identifier)
  const match = traces.find((trace) =>
    trace.identifiers.some((id) => normalize(id).includes(query) || query.includes(normalize(id))),
  )

  return match ? structuredClone(match) : null
}

export function getJourneyMilestones(identifier) {
  return getItemTrace(identifier)?.milestones ?? []
}

export function getItemAlerts(identifier) {
  return getItemTrace(identifier)?.alerts ?? []
}

export function getItemComments(identifier) {
  return getItemTrace(identifier)?.comments ?? []
}

export function addItemComment(identifier, input) {
  const query = normalize(identifier)
  const trace = traces.find((item) =>
    item.identifiers.some((id) => normalize(id) === query || query.includes(normalize(id))),
  )

  if (!trace) {
    throw new Error('Item not found')
  }

  const comment = {
    id: `comment-${Date.now()}`,
    author: input.author,
    role: input.role,
    location: input.location,
    timestamp: new Date().toISOString(),
    message: input.message.trim(),
  }

  trace.comments = [comment, ...trace.comments]
  return structuredClone(comment)
}

export function getEventLog(identifier) {
  const trace = getItemTrace(identifier)
  if (!trace) return []
  return SAMPLE_EVENT_LOG
}

export function searchSuggestions(query) {
  if (!query.trim()) {
    return ['PO123456', 'ASN789012', 'SKU100123', 'CTN567890123']
  }
  const q = normalize(query)
  const ids = traces.flatMap((trace) => trace.identifiers.slice(0, 6))
  return [...new Set(ids)].filter((id) => normalize(id).includes(q)).slice(0, 6)
}

export function applyMilestoneFilters(trace, filters) {
  return trace.milestones.filter((milestone) => {
    if (filters.status !== 'all' && milestone.status !== filters.status) return false
    if (filters.location !== 'all' && milestone.location !== filters.location) return false
    if (filters.exceptionOnly && milestone.status !== 'exception') return false
    if (filters.journeyType !== 'all' && trace.item.journeyType !== filters.journeyType) {
      return false
    }

    const time = milestone.eventTime ?? milestone.etaTime
    if (filters.dateFrom && time && time.slice(0, 10) < filters.dateFrom) return false
    if (filters.dateTo && time && time.slice(0, 10) > filters.dateTo) return false
    return true
  })
}

export { defaultFilters }
