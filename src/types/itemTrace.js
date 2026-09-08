export const MilestoneStatus = {
  Completed: 'completed',
  InProgress: 'in_progress',
  Upcoming: 'upcoming',
  Exception: 'exception',
}

export const AlertSeverity = {
  Info: 'info',
  Warning: 'warning',
  Critical: 'critical',
}

export const DelayRisk = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
}

export const SlaCompliance = {
  OnTrack: 'on_track',
  AtRisk: 'at_risk',
  Breached: 'breached',
}

export const defaultFilters = {
  status: 'all',
  location: 'all',
  journeyType: 'all',
  dateFrom: '',
  dateTo: '',
  exceptionOnly: false,
}
