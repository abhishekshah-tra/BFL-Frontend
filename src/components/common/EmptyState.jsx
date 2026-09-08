import { Search } from 'lucide-react'
import { EMPTY_DESCRIPTION, EMPTY_TITLE } from '../../constants/status'

export function EmptyState({ variant = 'idle' }) {
  const isNoResult = variant === 'empty'
  return (
    <div className="state-panel" role="status">
      <div className="state-panel__icon" aria-hidden="true">
        <Search size={32} strokeWidth={1.6} />
      </div>
      <h2>{isNoResult ? 'No matching item found' : EMPTY_TITLE}</h2>
      <p>
        {isNoResult
          ? 'Try another PO, Shipment, Carton, SKU or Item identifier.'
          : EMPTY_DESCRIPTION}
      </p>
    </div>
  )
}
