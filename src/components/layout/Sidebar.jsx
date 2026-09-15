"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  BarChart3,
  Bell,
  Boxes,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Database,
  FlaskConical,
  Cog,
  GitFork,
  Home,
  Layers,
  LayoutGrid,
  Monitor,
  Network,
  Settings,
  TowerControl,
  Workflow,
  Zap,
  Users,
  ShieldCheck,
  KeyRound,
  UserRound
} from "lucide-react";
import { APP_NAME, HELP_ITEM, NAV_ITEMS } from "../../constants/navigation";

const ICONS = {
  home: Home,
  tower: TowerControl,
  route: Workflow,
  network: Network,
  package: Boxes,
  cog: Cog,
  process: ClipboardList,
  flask: FlaskConical,
  layers: Layers,
  chart: BarChart3,
  bell: Bell,
  settings: Settings,
  help: CircleHelp,
  database: Database,
  menu: LayoutGrid,
  screen: Monitor,
  action: Zap,
  users :Users,
  'shield-check' : ShieldCheck,
  'key-round' :KeyRound,
  'user-round' : UserRound
};

function isPathActive(pathname, path) {
  if (!path) return false;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function NavLink({ item, pathname, collapsed, onNavigate, indent }) {
  const Icon = ICONS[item.icon] ?? Home;
  const isActive = isPathActive(pathname, item.path);

  return (
    <Link
      href={item.path}
      className={`sidebar__link ${indent || item.indent ? "sidebar__link--sub" : ""} ${isActive ? "is-active" : ""}`}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={indent || item.indent ? 16 : 18} strokeWidth={1.75} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

function Sidebar({ collapsed, mobileOpen, onNavigate }) {
  const { pathname } = useRouter();
  const [openGroups, setOpenGroups] = useState({});

  useEffect(() => {
    const next = {};
    NAV_ITEMS.forEach((item) => {
      if (item.children?.some((child) => isPathActive(pathname, child.path))) {
        next[item.id] = true;
      }
    });
    if (Object.keys(next).length) {
      setOpenGroups((prev) => ({ ...prev, ...next }));
    }
  }, [pathname]);

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside
      className={`sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-open" : ""}`}
      aria-label="Primary"
    >
      <div className="sidebar__brand">
        <span className="brand-mark" aria-hidden="true">
          <GitFork size={16} />
        </span>
        <span className="sidebar__brand-text">{APP_NAME}</span>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          if (item.children?.length) {
            const GroupIcon = ICONS[item.icon] ?? Home;
            const isOpen = Boolean(openGroups[item.id]) || collapsed;
            const childActive = item.children.some((child) =>
              isPathActive(pathname, child.path)
            );

            return (
              <div key={item.id} className="sidebar__group">
                <button
                  type="button"
                  className={`sidebar__link sidebar__group-toggle ${childActive ? "is-current" : ""}`}
                  onClick={() => toggleGroup(item.id)}
                  title={collapsed ? item.label : undefined}
                  aria-expanded={isOpen}
                >
                  <GroupIcon size={18} strokeWidth={1.75} aria-hidden="true" />
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`sidebar__chevron ${isOpen ? "is-open" : ""}`}
                    size={14}
                    aria-hidden="true"
                  />
                </button>
                {isOpen ? (
                  <div className="sidebar__children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        item={child}
                        pathname={pathname}
                        collapsed={collapsed}
                        onNavigate={onNavigate}
                        indent
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          }

          return (
            <NavLink
              key={item.id}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <Link
          href={HELP_ITEM.path}
          className={`sidebar__link ${pathname === HELP_ITEM.path ? "is-active" : ""}`}
          onClick={onNavigate}
          title={collapsed ? HELP_ITEM.label : undefined}
        >
          <CircleHelp size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>{HELP_ITEM.label}</span>
        </Link>
      </div>
    </aside>
  );
}

export { Sidebar };
