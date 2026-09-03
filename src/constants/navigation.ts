export interface NavItem {
  id: string
  label: string
  path: string
  icon: string
  indent?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', path: '/home', icon: 'home' },
  { id: 'control-tower', label: 'Control Tower', path: '/control-tower', icon: 'tower' },
  {
    id: 'item-trace',
    label: 'End to End Item Trace',
    path: '/item-trace',
    icon: 'route',
  },
  {
    id: 'warehouse-network',
    label: 'Warehouse Network',
    path: '/warehouse-network',
    icon: 'network',
  },
  { id: 'inventory', label: 'Inventory', path: '/inventory', icon: 'package' },
  { id: 'operations', label: 'Operations', path: '/operations', icon: 'cog' },
  {
    id: 'process',
    label: 'Process Details',
    path: '/process',
    icon: 'process',
    indent: true,
  },
  {
    id: 'simulation',
    label: 'Simulation & Scenarios',
    path: '/simulation',
    icon: 'flask',
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    path: '/analytics',
    icon: 'chart',
  },
  {
    id: 'alerts',
    label: 'Alerts & Exceptions',
    path: '/alerts',
    icon: 'bell',
  },
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
]

export const HELP_ITEM: NavItem = {
  id: 'help',
  label: 'Help & Support',
  path: '/help',
  icon: 'help',
}

export const APP_NAME = 'BFL Digital Twin'
export const PAGE_TITLE = 'End to End Item Trace'
export const PAGE_SUBTITLE =
  "Real-time visibility of an item's journey across the supply chain and warehouse network"
