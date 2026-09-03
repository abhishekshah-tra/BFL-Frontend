'use client'

import { FormEvent, useState } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { PAGE_PATHS, type PersonaPage } from '@/lib/auth'

/**
 * Login UI — matches the BFL Personas HTML prototype (same demo users & credentials).
 */
export function LoginScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)

  const resetPasswordToggle = () => setShowPassword(false)

  // Full browser navigation (not client-side router) so the new user always
  // lands on a freshly-mounted page instead of briefly seeing whatever page
  // was open for the previous session.
  const goTo = (page: PersonaPage) => {
    window.location.href = PAGE_PATHS[page]
  }

  const fillDemo = (user: string, pass: string) => {
    setUsername(user)
    setPassword(pass)
    setError(false)
    resetPasswordToggle()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const ok = login(username, password)
    if (!ok) {
      setError(true)
      setPassword('')
      return
    }
    setError(false)
    const key = username.trim().toLowerCase()
    const profileDefault: PersonaPage =
      key === 'operations'
        ? 'operations'
        : key === 'warehouse'
          ? 'process'
          : 'control-tower'
    goTo(profileDefault)
  }

  return (
    <div id="login-screen">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">BFL</div>
          <div className="login-subtitle">Warehouse Operations Platform</div>
        </div>
        <div className="login-body">
          <h2>Sign in to your account</h2>
          <p className="login-desc">
            Enter your credentials to access your role-based dashboard.
          </p>
          <div className={`login-error${error ? ' show' : ''}`} id="login-error">
            Invalid username or password. Please try again.
          </div>
          <form id="login-form" autoComplete="on" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className="form-input"
                placeholder="Enter username"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={`password-toggle${showPassword ? ' visible' : ''}`}
                  id="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <svg
                    className="icon-show"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg
                    className="icon-hide"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M14.12 14.12a3 3 0 01-4.24-4.24" />
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" className="btn-login" id="btn-login">
              Sign In
            </button>
          </form>
          <div className="demo-users">
            <div className="demo-users-title">Demo accounts (click to fill)</div>
            <div
              className="demo-user-row"
              data-user="executive"
              data-pass="Executive@123"
              onClick={() => fillDemo('executive', 'Executive@123')}
              onDoubleClick={() => {
                fillDemo('executive', 'Executive@123')
                void login('executive', 'Executive@123')
                goTo('control-tower')
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fillDemo('executive', 'Executive@123')
              }}
            >
              <span className="role-name">Executive / Control Tower</span>
              <span className="creds">executive</span>
            </div>
            <div
              className="demo-user-row"
              data-user="operations"
              data-pass="Operations@123"
              onClick={() => fillDemo('operations', 'Operations@123')}
              onDoubleClick={() => {
                fillDemo('operations', 'Operations@123')
                void login('operations', 'Operations@123')
                goTo('operations')
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fillDemo('operations', 'Operations@123')
              }}
            >
              <span className="role-name">Operations Manager</span>
              <span className="creds">operations</span>
            </div>
            <div
              className="demo-user-row"
              data-user="warehouse"
              data-pass="Warehouse@123"
              onClick={() => fillDemo('warehouse', 'Warehouse@123')}
              onDoubleClick={() => {
                fillDemo('warehouse', 'Warehouse@123')
                void login('warehouse', 'Warehouse@123')
                goTo('process')
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter') fillDemo('warehouse', 'Warehouse@123')
              }}
            >
              <span className="role-name">Warehouse Manager</span>
              <span className="creds">warehouse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
