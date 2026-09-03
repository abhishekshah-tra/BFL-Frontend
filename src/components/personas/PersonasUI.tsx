'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import { PAGE_PATHS, type PersonaPage } from '@/lib/auth'
import type { ProcessName, WarehouseId } from '@/data/personas/personasData'

export interface NavOpts {
  warehouse?: WarehouseId
  process?: ProcessName
  silent?: boolean
}

interface ModalState {
  title: string
  body: string
  navTarget?: PersonaPage
  navOpts?: NavOpts
}

interface PersonasUIValue {
  showToast: (msg: string) => void
  showModal: (title: string, body: string, navTarget?: PersonaPage, navOpts?: NavOpts) => void
  closeModal: () => void
  navigateTo: (page: PersonaPage | string, opts?: NavOpts) => void
}

const PersonasUIContext = createContext<PersonasUIValue | null>(null)

export function usePersonasUI(): PersonasUIValue {
  const ctx = useContext(PersonasUIContext)
  if (!ctx) throw new Error('usePersonasUI must be used within PersonasUIProvider')
  return ctx
}

export function PersonasUIProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [toast, setToast] = useState('')
  const [toastVisible, setToastVisible] = useState(false)
  const [modal, setModal] = useState<ModalState | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setToastVisible(true)
  }, [])

  useEffect(() => {
    if (!toastVisible) return
    const id = window.setTimeout(() => setToastVisible(false), 3000)
    return () => window.clearTimeout(id)
  }, [toastVisible, toast])

  const closeModal = useCallback(() => setModal(null), [])

  const navigateTo = useCallback(
    (page: PersonaPage | string, opts: NavOpts = {}) => {
      const valid: PersonaPage[] = ['control-tower', 'operations', 'process']
      if (!valid.includes(page as PersonaPage)) {
        showToast('This section is coming soon. Try Control Tower, Operations, or Process Details.')
        return
      }

      const persona = page as PersonaPage
      const params = new URLSearchParams()
      if (opts.warehouse) params.set('warehouse', opts.warehouse)
      if (opts.process) params.set('process', opts.process)
      const qs = params.toString()
      const path = PAGE_PATHS[persona] + (qs ? `?${qs}` : '')
      router.push(path)

      const labels = {
        'control-tower': 'Control Tower',
        operations: 'Operations',
        process: 'Process Details',
      } as const
      if (!opts.silent) {
        showToast(
          `Opened: ${labels[persona]}${opts.warehouse ? ` → ${opts.warehouse}` : ''}${
            opts.process ? ` → ${opts.process}` : ''
          }`,
        )
      }
    },
    [router, showToast],
  )

  const showModal = useCallback(
    (title: string, body: string, navTarget?: PersonaPage, navOpts?: NavOpts) => {
      setModal({ title, body, navTarget, navOpts })
    },
    [],
  )

  const value = useMemo(
    () => ({ showToast, showModal, closeModal, navigateTo }),
    [showToast, showModal, closeModal, navigateTo],
  )

  return (
    <PersonasUIContext.Provider value={value}>
      {children}
      <div className={`toast${toastVisible ? ' show' : ''}`} id="toast">
        {toast}
      </div>
      <div
        className={`modal-overlay${modal ? ' show' : ''}`}
        id="modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal()
        }}
      >
        {modal ? (
          <div className="modal">
            <h3>{modal.title}</h3>
            <p>{modal.body}</p>
            <div className="modal-actions">
              <button type="button" className="modal-btn secondary" onClick={closeModal}>
                Close
              </button>
              {modal.navTarget ? (
                <button
                  type="button"
                  className="modal-btn primary"
                  onClick={() => {
                    navigateTo(modal.navTarget!, {
                      process: 'Robo Sorting',
                      warehouse: 'TECHNO',
                      ...modal.navOpts,
                    })
                    closeModal()
                  }}
                >
                  Go to{' '}
                  {modal.navTarget === 'operations'
                    ? 'Operations'
                    : modal.navTarget === 'process'
                      ? 'Process Details'
                      : 'Control Tower'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </PersonasUIContext.Provider>
  )
}
