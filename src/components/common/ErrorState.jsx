import { AlertTriangle } from 'lucide-react'
import { ERROR_DESCRIPTION, ERROR_TITLE } from '../../constants/status'

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <div className="state-panel__icon state-panel__icon--error" aria-hidden="true">
        <AlertTriangle size={32} strokeWidth={1.6} />
      </div>
      <h2>{ERROR_TITLE}</h2>
      <p>{message || ERROR_DESCRIPTION}</p>
      <button type="button" className="btn btn--primary" onClick={onRetry}>
        Retry
      </button>
    </div>
  )
}
