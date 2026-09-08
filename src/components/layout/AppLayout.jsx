import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { LayoutProvider } from './LayoutContext'
import { Sidebar } from './Sidebar'

export function AppLayout({ children }) {
  const isDesktop = useMediaQuery('(min-width: 1100px)')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMobileOpen(false)
  }, [router.pathname])

  const toggleMenu = () => {
    if (isDesktop) {
      setCollapsed((value) => !value)
    } else {
      setMobileOpen((value) => !value)
    }
  }

  return (
    <LayoutProvider value={{ onMenuClick: toggleMenu }}>
      <div className={`app-shell ${collapsed && isDesktop ? 'is-collapsed' : ''}`}>
        <Sidebar
          collapsed={isDesktop ? collapsed : false}
          mobileOpen={!isDesktop && mobileOpen}
          onNavigate={() => setMobileOpen(false)}
        />
        {!isDesktop && mobileOpen ? (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}
        <div className="app-main">{children}</div>
      </div>
    </LayoutProvider>
  )
}
