export const NAV_ITEMS = [
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
    label: 'Simulation',
    path: '/simulation',
    icon: 'flask',
  },
  {
    id: 'scenarios',
    label: 'Scenarios',
    path: '/scenarios',
    icon: 'layers',
    indent: true,
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
  {
    id: 'masters',
    label: 'Masters',
    icon: 'database',
    children: [
      {
        id: 'menus',
        label: 'Menu',
        path: '/masters/menus',
        icon: 'menu',
      },
      {
        id: 'screens',
        label: 'Screen',
        path: '/masters/screens',
        icon: 'screen',
      },
      {
        id: 'actions',
        label: 'Action',
        path: '/masters/actions',
        icon: 'action',
      },
    ],
  },

  // ============================================================ // CONFIGURATION // ============================================================ 
  { id: 'configuration', 
    label: 'Configuration', 
    icon: 'settings', 
    children: [
      { 
        id: 'warehouse-master', 
        label: 'Warehouse Master', 
        path: '/configuration/warehouse-master', 
        icon: 'warehouse', 
      }, 
      { 
        id: 'process-master', 
        label: 'Process Master', 
        path: '/configuration/process-master', 
        icon: 'process',
       }, 
       {
         id: 'warehouse-configuration', 
         label: 'Warehouse Configuration', path: '/configuration/warehouse-configuration', icon: 'settings', 
      },
    ], },
  {
    id: 'user-management',
    label: 'User Management',
    icon: 'users',
    children: [
      {
        id: 'roles',
        label: 'Role',
        path: '/user-management/roles',
        icon: 'shield-check',
      },
      {
        id: 'role-permissions',
        label: 'Role Permission',
        path: '/user-management/role-permissions',
        icon: 'key-round',
      },
      {
        id: 'users',
        label: 'User',
        path: '/user-management/users',
        icon: 'user-round',
      },
    ],
  },
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
]

export const HELP_ITEM = {
  id: 'help',
  label: 'Help & Support',
  path: '/help',
  icon: 'help',
}

export const APP_NAME = 'BFL Group'
export const PAGE_TITLE = 'End to End Item Trace'
export const PAGE_SUBTITLE =
  "Real-time visibility of an item's journey across the supply chain and warehouse network"
