import { Header } from '../layout/Header'
import { useLayout } from '../layout/LayoutContext'

export function PlaceholderPage({ title, description }) {
  const { onMenuClick } = useLayout()

  return (
    <div className="page">
      <Header
        lastUpdated={new Date()}
        isRefreshing={false}
        onRefresh={() => undefined}
        onMenuClick={onMenuClick}
        title={title}
        subtitle={description}
      />
      <div className="page-body">
        <div className="state-panel">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
    </div>
  )
}
