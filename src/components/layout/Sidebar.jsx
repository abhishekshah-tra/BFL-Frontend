"use client";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  BarChart3,
  Bell,
  Boxes,
  CircleHelp,
  ClipboardList,
  FlaskConical,
  Cog,
  GitFork,
  Home,
  Network,
  Settings,
  TowerControl,
  Workflow
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
  chart: BarChart3,
  bell: Bell,
  settings: Settings,
  help: CircleHelp
};
function Sidebar({ collapsed, mobileOpen, onNavigate }) {
  const { pathname } = useRouter();
  return <aside
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
    const Icon = ICONS[item.icon] ?? Home;
    const isActive = pathname === item.path;
    return <Link
      key={item.id}
      href={item.path}
      className={`sidebar__link ${item.indent ? "sidebar__link--sub" : ""} ${isActive ? "is-active" : ""}`}
      onClick={onNavigate}
      title={collapsed ? item.label : void 0}
    >
              <Icon size={item.indent ? 16 : 18} strokeWidth={1.75} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>;
  })}
      </nav>

      <div className="sidebar__footer">
        <Link
    href={HELP_ITEM.path}
    className={`sidebar__link ${pathname === HELP_ITEM.path ? "is-active" : ""}`}
    onClick={onNavigate}
    title={collapsed ? HELP_ITEM.label : void 0}
  >
          <CircleHelp size={18} strokeWidth={1.75} aria-hidden="true" />
          <span>{HELP_ITEM.label}</span>
        </Link>
      </div>
    </aside>;
}
export {
  Sidebar
};
