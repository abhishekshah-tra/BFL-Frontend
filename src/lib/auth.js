 



















/** Demo users — same credentials as the BFL Personas HTML prototype */
export const AUTH_USERS = {
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

export const PAGE_LABELS = {
  'control-tower': 'Control Tower',
  operations: 'Operations Overview',
  process: 'Process / Resource Details',
}

export const PAGE_PATHS = {
  'control-tower': '/control-tower',
  operations: '/operations',
  process: '/process',
}

export function getInitials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) ) : null
  } catch (e) {
    return null
  }
}

export function setSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function validateCredentials(
  username,
  password,
) {
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
