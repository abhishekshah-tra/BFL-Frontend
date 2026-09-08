import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '../layout/Header'
import { useLayout } from '../layout/LayoutContext'
import { SearchBar } from '../search/SearchBar'
import { FiltersPanel } from '../search/FiltersPanel'
import { KPIOverview } from '../kpi/KPIOverview'
import { JourneyMetricsBar } from '../kpi/JourneyMetrics'
import { JourneyFlow } from '../journey/JourneyFlow'
import { JourneyDetailsTable } from '../journey/JourneyDetailsTable'
import { ItemDetails, ItemDetailsDrawer, EventLogDrawer } from '../item/ItemDetails'
import { AlertsDrawer, AlertsPanel } from '../alerts/AlertsPanel'
import { AddCommentModal, CommentsPanel } from '../comments/CommentsPanel'
import { EmptyState } from '../common/EmptyState'
import { ErrorState } from '../common/ErrorState'
import { DashboardSkeleton } from '../common/SkeletonLoader'
import { useItemTrace } from '../../hooks/useItemTrace'
import { getEventLog } from '../../services/itemTraceService'

const JourneyMap = dynamic(
  () => import('../journey/JourneyMap').then((mod) => mod.JourneyMap),
  {
    ssr: false,
    loading: () => (
      <section className="card map-card">
        <header className="card__header">
          <h2 className="card__title">Journey Map (Network View)</h2>
        </header>
        <div className="map-canvas" aria-busy="true">
          <div className="skeleton skeleton--timeline" />
        </div>
      </section>
    ),
  },
)

export function EndToEndTracePage() {
  const { onMenuClick } = useLayout()
  const {
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
  } = useItemTrace()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [itemDrawerOpen, setItemDrawerOpen] = useState(false)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const [commentOpen, setCommentOpen] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState()

  const locations = useMemo(() => {
    if (!trace) return []
    return [...new Set(trace.milestones.map((item) => item.location))]
  }, [trace])

  const journeyTypes = useMemo(() => {
    if (!trace) return ['Store Replenishment']
    return [trace.item.journeyType]
  }, [trace])

  const selectedLocationId = useMemo(() => {
    const milestone = trace?.milestones.find((item) => item.id === selectedMilestoneId)
    return milestone?.locationId ?? null
  }, [trace, selectedMilestoneId])

  const events = trace ? getEventLog(trace.item.poNumber) : []

  return (
    <div className="page">
      <Header
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        onMenuClick={onMenuClick}
      />

      <div className="page-body">
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          onSearch={search}
          onOpenFilters={() => setFiltersOpen(true)}
          filters={filters}
        />

        {isRefreshing ? <DashboardSkeleton /> : null}

        {!isRefreshing && loadState === 'error' ? (
          <ErrorState message={errorMessage} onRetry={retry} />
        ) : null}

        {!isRefreshing && loadState === 'idle' ? (
          <EmptyState variant="idle" />
        ) : null}

        {!isRefreshing && loadState === 'empty' ? (
          <EmptyState variant="empty" />
        ) : null}

        {!isRefreshing && loadState === 'ready' && trace ? (
          <>
            <KPIOverview kpis={trace.kpis} />
            <JourneyFlow
              milestones={filteredMilestones}
              selectedId={selectedMilestoneId}
              onSelect={setSelectedMilestoneId}
            />
            <div className="main-grid">
              <JourneyDetailsTable
                milestones={filteredMilestones}
                selectedId={selectedMilestoneId}
                onSelect={setSelectedMilestoneId}
                onViewLog={() => setLogOpen(true)}
              />
              <JourneyMap
                locations={trace.locations}
                selectedLocationId={selectedLocationId}
                onSelectLocation={(locationId) => {
                  const match =
                    trace.milestones.find(
                      (item) => item.locationId === locationId && item.status !== 'upcoming',
                    ) ?? trace.milestones.find((item) => item.locationId === locationId)
                  if (match) setSelectedMilestoneId(match.id)
                }}
              />
              <div className="side-stack">
                <ItemDetails item={trace.item} onViewAll={() => setItemDrawerOpen(true)} />
                <AlertsPanel
                  alerts={trace.alerts}
                  onViewAll={() => {
                    setSelectedAlert(undefined)
                    setAlertsOpen(true)
                  }}
                  onSelect={(alert) => {
                    setSelectedAlert(alert)
                    setAlertsOpen(true)
                    setSelectedMilestoneId(alert.milestoneId)
                  }}
                />
                <CommentsPanel comments={trace.comments} onAdd={() => setCommentOpen(true)} />
              </div>
            </div>
            <JourneyMetricsBar metrics={trace.metrics} />
          </>
        ) : null}
      </div>

      <FiltersPanel
        open={filtersOpen}
        filters={filters}
        locations={locations}
        journeyTypes={journeyTypes}
        onChange={setFilters}
        onReset={resetFilters}
        onClose={() => setFiltersOpen(false)}
      />
      <ItemDetailsDrawer
        open={itemDrawerOpen}
        item={trace?.item ?? null}
        onClose={() => setItemDrawerOpen(false)}
      />
      <AlertsDrawer
        open={alertsOpen}
        alerts={trace?.alerts ?? []}
        selectedId={selectedAlert?.id}
        onClose={() => setAlertsOpen(false)}
      />
      <EventLogDrawer
        open={logOpen}
        events={events}
        milestones={trace?.milestones ?? []}
        onClose={() => setLogOpen(false)}
      />
      <AddCommentModal
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        onSave={addComment}
      />
    </div>
  )
}
