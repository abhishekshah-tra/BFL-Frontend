'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, LogOut, Menu, RefreshCw } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthProvider'
import { getInitials } from '@/lib/auth'
import { PAGE_SUBTITLE, PAGE_TITLE } from '../../constants/navigation'
import { formatLastUpdated } from '../../utils/format'

interface HeaderProps {
  lastUpdated: Date
  isRefreshing: boolean
  onRefresh: () => void
  onMenuClick: () => void
  title?: string
  subtitle?: string
}

export function Header({
  lastUpdated,
  isRefreshing,
  onRefresh,
  onMenuClick,
  title = PAGE_TITLE,
  subtitle = PAGE_SUBTITLE,
}: HeaderProps) {
  const { session, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className="page-header">
      <div className="page-header__left">
        <button
          type="button"
          className="icon-btn"
          onClick={onMenuClick}
          aria-label="Toggle navigation"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle ? <p className="page-header__subtitle">{subtitle}</p> : null}
        </div>
      </div>

      <div className="page-header__right">
        <div className="last-updated">
          <span>Last Updated: {formatLastUpdated(lastUpdated)}</span>
          <button
            type="button"
            className="icon-btn"
            onClick={onRefresh}
            aria-label="Refresh data"
            disabled={isRefreshing}
          >
            <RefreshCw size={16} className={isRefreshing ? 'is-spinning' : ''} />
          </button>
        </div>
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notif-dot" aria-hidden="true" />
        </button>
        <div className="header-user-menu" ref={menuRef}>
          <button
            type="button"
            className="avatar"
            aria-label="User profile"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {session ? getInitials(session.name) : '?'}
          </button>
          {menuOpen ? (
            <div className="user-menu-dropdown">
              {session ? (
                <div className="user-menu-info">
                  <span className="user-menu-name">{session.name}</span>
                  <span className="user-menu-role">{session.roleLabel}</span>
                </div>
              ) : null}
              <button
                type="button"
                className="user-menu-item logout"
                onClick={() => {
                  setMenuOpen(false)
                  logout()
                }}
              >
                <LogOut size={14} aria-hidden="true" />
                Sign Out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
