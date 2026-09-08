import { useCallback, useMemo, useState } from 'react'
import {
  addItemComment,
  applyMilestoneFilters,
  getItemTrace,
} from '../services/itemTraceService'
import { defaultFilters } from '../types/itemTrace'

export function useItemTrace() {
  const [query, setQuery] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [trace, setTrace] = useState(null)
  const [loadState, setLoadState] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null)
  const [filters, setFilters] = useState(defaultFilters)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(() => new Date('2025-05-20T10:30:00'))

  const load = useCallback((identifier) => {
    const value = identifier.trim()
    if (!value) {
      setTrace(null)
      setSelectedMilestoneId(null)
      setLoadState('idle')
      setErrorMessage('')
      return
    }

    try {
      const result = getItemTrace(value)
      if (!result) {
        setTrace(null)
        setSelectedMilestoneId(null)
        setLoadState('empty')
        setErrorMessage('')
        return
      }

      const current = result.milestones.find((m) => m.status === 'in_progress')
      setTrace(result)
      setSelectedMilestoneId(current?.id ?? result.milestones[0]?.id ?? null)
      setLoadState('ready')
      setErrorMessage('')
      setLastUpdated(new Date(result.lastUpdated))
    } catch (error) {
      setTrace(null)
      setSelectedMilestoneId(null)
      setLoadState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error')
    }
  }, [])

  const search = useCallback(
    (value) => {
      const next = value ?? query
      setQuery(next)
      setActiveQuery(next)
      load(next)
    },
    [load, query],
  )

  const refresh = useCallback(() => {
    setIsRefreshing(true)
    window.setTimeout(() => {
      if (activeQuery) load(activeQuery)
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 450)
  }, [activeQuery, load])

  const retry = useCallback(() => {
    load(activeQuery || query)
  }, [activeQuery, load, query])

  const addComment = useCallback(
    (input) => {
      if (!activeQuery) return
      addItemComment(activeQuery, input)
      load(activeQuery)
    },
    [activeQuery, load],
  )

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const filteredMilestones = useMemo(() => {
    if (!trace) return []
    return applyMilestoneFilters(trace, filters)
  }, [trace, filters])

  return {
    query,
    setQuery,
    search,
    trace,
    filteredMilestones,
    selectedMilestoneId,
    setSelectedMilestoneId,
    filters,
    setFilters,
    resetFilters,
    loadState,
    errorMessage,
    isRefreshing,
    lastUpdated,
    refresh,
    addComment,
    retry,
  }
}
