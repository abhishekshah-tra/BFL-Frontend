export type AuthRole = 'executive' | 'operations' | 'warehouse'

export type PersonaPage = 'control-tower' | 'operations' | 'process'

export interface AuthProfile {
  password: string
  name: string
  role: AuthRole
  roleLabel: string
  defaultPage: PersonaPage
}

export interface AuthSession {
  username: string
  name: string
  role: AuthRole
  roleLabel: string
  defaultPage: PersonaPage
}

/** Demo users — same credentials as the BFL Personas HTML prototype */
export const AUTH_USERS: Record<string, AuthProfile> = {
  executive: {
    password: 'Executive@123',
    name: 'Rajesh Kumar',
    role: 'executive',
    roleLabel: 'Executive / Top Management',
    defaultPage: 'control-tower',
  },
  operations: {
    password: 'Operations@123',
    name: 'Priya Sharma',
    role: 'operations',
    roleLabel: 'Operations Manager',
    defaultPage: 'operations',
  },
  warehouse: {
    password: 'Warehouse@123',
    name: 'Amit Patel',
    role: 'warehouse',
    roleLabel: 'Warehouse Manager',
    defaultPage: 'process',
  },
}

export const SESSION_KEY = 'bfl_auth_session'

export const PAGE_LABELS: Record<PersonaPage, string> = {
  'control-tower': 'Control Tower',
  operations: 'Operations Overview',
  process: 'Process / Resource Details',
}

export const PAGE_PATHS: Record<PersonaPage, string> = {
  'control-tower': '/control-tower',
  operations: '/operations',
  process: '/process',
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

export function setSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY)
}

export function validateCredentials(
  username: string,
  password: string,
): AuthSession | null {
  const key = username.trim().toLowerCase()
  const profile = AUTH_USERS[key]
  if (!profile || profile.password !== password) return null
  return {
    username: key,
    name: profile.name,
    role: profile.role,
    roleLabel: profile.roleLabel,
    defaultPage: profile.defaultPage,
  }
}
