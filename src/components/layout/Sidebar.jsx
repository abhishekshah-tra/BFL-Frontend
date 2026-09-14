'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BoltIcon from '@mui/icons-material/Bolt';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import MenuIcon from '@mui/icons-material/Menu';
import WebIcon from '@mui/icons-material/Web';

const menuItems = [
  {
    name: 'Dashboard',
    route: '/',
    icon: DashboardIcon,
  },
  {
    name: 'Actions',
    route: '/actions',
    icon: BoltIcon,
  },
  {
    name: 'Roles',
    route: '/roles',
    icon: PeopleIcon,
  },
  {
    name: 'Permissions',
    route: '/permissions',
    icon: SecurityIcon,
  },
  {
    name: 'Menus',
    route: '/menus',
    icon: MenuIcon,
  },
  {
    name: 'Screens',
    route: '/screens',
    icon: WebIcon,
  },
];

export default function Sidebar({
  mobileOpen,
  onClose,
}) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay d-lg-none"
          onClick={onClose}
        />
      )}

      <aside
        className={`sidebar ${
          mobileOpen
            ? 'sidebar-mobile-open'
            : ''
        }`}
      >
        <div className="sidebar-brand">
          <span>BFL</span>

          <button
            type="button"
            className="btn btn-sm text-white d-lg-none"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const active =
              item.route === '/'
                ? pathname === '/'
                : pathname.startsWith(item.route);

            return (
              <Link
                key={item.route}
                href={item.route}
                onClick={onClose}
                className={`sidebar-link ${
                  active ? 'active' : ''
                }`}
              >
                <Icon fontSize="small" />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}