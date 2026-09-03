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
import {
  clearSession,
  getSession,
  setSession,
  validateCredentials,
  type AuthSession,
  type PersonaPage,
} from '@/lib/auth'

interface AuthContextValue {
  session: AuthSession | null
  ready: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = getSession()
    if (saved) setSessionState(saved)
    setReady(true)
  }, [])

  const login = useCallback((username: string, password: string) => {
    const next = validateCredentials(username, password)
    if (!next) return false
    setSession(next)
    setSessionState(next)
    return true
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSessionState(null)
    // Force a full browser navigation (not a client-side route change) so every
    // component unmounts and all in-memory state/timers are discarded. This
    // guarantees the next login starts from a clean slate instead of briefly
    // showing whatever page/state was active before signing out.
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [])

  const value = useMemo(
    () => ({ session, ready, login, logout }),
    [session, ready, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function useRequireAuth(defaultRedirect?: PersonaPage) {
  const auth = useAuth()
  return { ...auth, defaultRedirect }
}
