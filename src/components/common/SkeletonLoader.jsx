export function DashboardSkeleton() {
  return (
    <div className="skeleton-page" aria-busy="true" aria-live="polite">
      <div className="kpi-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div className="card skeleton-card" key={index}>
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--line short" />
          </div>
        ))}
      </div>
      <div className="card skeleton-card skeleton-card--wide">
        <div className="skeleton skeleton--line" />
        <div className="skeleton skeleton--timeline" />
      </div>
      <div className="main-grid">
        <div className="card skeleton-card skeleton-card--tall" />
        <div className="card skeleton-card skeleton-card--tall" />
        <div className="stack">
          <div className="card skeleton-card" />
          <div className="card skeleton-card" />
          <div className="card skeleton-card" />
        </div>
      </div>
    </div>
  )
}
