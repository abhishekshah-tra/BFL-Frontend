import { AlertSeverity, MilestoneStatus, SlaCompliance } from '../types/itemTrace'

export const STATUS_LABELS = {
  [MilestoneStatus.Completed]: 'Completed',
  [MilestoneStatus.InProgress]: 'In Progress',
  [MilestoneStatus.Upcoming]: 'Upcoming',
  [MilestoneStatus.Exception]: 'Exception',
}

export const SEVERITY_LABELS = {
  [AlertSeverity.Info]: 'INFO',
  [AlertSeverity.Warning]: 'WARNING',
  [AlertSeverity.Critical]: 'CRITICAL',
}

export const SLA_LABELS = {
  [SlaCompliance.OnTrack]: 'On Track',
  [SlaCompliance.AtRisk]: 'At Risk',
  [SlaCompliance.Breached]: 'Breached',
}

export const SEARCH_PLACEHOLDER = 'Search PO / Shipment / Carton / SKU / Item'

export const EMPTY_TITLE = 'Track an Item'
export const EMPTY_DESCRIPTION =
  'Search for a PO, Shipment, Carton, SKU or Item to view its complete journey.'

export const ERROR_TITLE = 'Unable to load item journey'
export const ERROR_DESCRIPTION =
  'Something went wrong while retrieving the trace data.'
