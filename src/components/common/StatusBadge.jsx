import { STATUS_LABELS } from '../../constants/status'

export function StatusBadge({ status, withLabel = true }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {withLabel ? STATUS_LABELS[status] : (
        <span className="sr-only">{STATUS_LABELS[status]}</span>
      )}
    </span>
  )
}

export function Card({ title, footer, children, className = '', id }) {
  return (
    <section className={`card ${className}`.trim()} id={id}>
      {title ? (
        <header className="card__header">
          <h2 className="card__title">{title}</h2>
        </header>
      ) : null}
      {children}
      {footer ? <footer className="card__footer">{footer}</footer> : null}
    </section>
  )
}

export function TextLink({ children, onClick }) {
  return (
    <button type="button" className="text-link" onClick={onClick}>
      {children}
    </button>
  )
}
