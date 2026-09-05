import {
  LayoutDashboard,
  TestTube,
  Package,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  Tag,
  Users,
  Settings,
  ClipboardList,
  Upload,
  UserCog,
  Landmark,
} from 'lucide-react'

const ROLE_PREFIX = {
  admin: '/admin',
  lab_owner: '/lab-owner',
  lab_assistant: '/lab-assistant',
  patient: '/booking/bookings',
}

const PATIENT_DASHBOARD_ROUTE = '/dashboard'

export const ALL_MENU_ITEMS = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    permission: null,
    routes: {
      admin: '/admin',
      lab_owner: '/lab-owner',
      lab_assistant: '/lab-assistant',
      patient: PATIENT_DASHBOARD_ROUTE,
    },
  },
  {
    label: 'Tests',
    icon: TestTube,
    permission: { resource: 'tests', action: 'read' },
    routes: {
      admin: '/admin/tests',
      lab_owner: '/lab-owner/tests',
      lab_assistant: '/lab-assistant/tests',
      patient: '/booking/tests',
    },
  },
  {
    label: 'Packages',
    icon: Package,
    permission: { resource: 'packages', action: 'read' },
    routes: {
      admin: '/admin/packages',
      lab_owner: '/lab-owner/packages',
      lab_assistant: '/lab-assistant/packages',
      patient: '/booking/packages',
    },
  },
  {
    label: 'Bookings',
    icon: Calendar,
    permission: { resource: 'bookings', action: 'read' },
    routes: {
      admin: '/admin/bookings',
      lab_owner: '/lab-owner/bookings',
      lab_assistant: '/lab-assistant/bookings',
    },
  },
  {
    label: 'My Bookings',
    icon: Calendar,
    permission: { resource: 'bookings', action: 'read' },
    routes: {
      patient: '/booking/bookings',
    },
    roles: ['patient'],
  },
  {
    label: 'Payments',
    icon: CreditCard,
    permission: { resource: 'payments', action: 'read' },
    routes: {
      admin: '/admin/payments',
      lab_owner: '/lab-owner/payments',
    },
  },
  {
    label: 'Settlements',
    icon: Landmark,
    permission: { resource: 'settlements', action: 'read' },
    routes: {
      admin: '/admin/settlements',
      lab_owner: '/lab-owner/settlements',
      lab_assistant: '/lab-assistant/settlements',
      patient: '/booking/settlements',
    },
  },
  {
    label: 'Lab Owners',
    icon: Building2,
    permission: { resource: 'lab_owners', action: 'read' },
    routes: {
      admin: '/admin/lab-owners',
    },
  },
  {
    label: 'Assistants',
    icon: Users,
    permission: { resource: 'lab_assistants', action: 'read' },
    routes: {
      lab_owner: '/lab-owner/assistants',
    },
  },
  {
    label: 'Reports',
    icon: FileText,
    permission: { resource: 'reports', action: 'read' },
    routes: {
      admin: '/admin/reports',
      lab_owner: '/lab-owner/reports',
      lab_assistant: '/lab-assistant/reports',
      patient: '/booking/reports',
    },
  },
  {
    label: 'Offers',
    icon: Tag,
    permission: { resource: 'offers', action: 'read' },
    routes: {
      admin: '/admin/offers',
    },
  },
  {
    label: 'Users',
    icon: Users,
    permission: { resource: 'users', action: 'read' },
    routes: {
      admin: '/admin/users',
    },
  },
  {
    label: 'Sample Pickups',
    icon: ClipboardList,
    permission: { resource: 'bookings', action: 'read' },
    routes: {
      lab_owner: '/lab-owner/sample-pickups',
      lab_assistant: '/lab-assistant/sample-pickups',
    },
  },
  {
    label: 'Upload Reports',
    icon: Upload,
    permission: { resource: 'bookings', action: 'update' },
    routes: {
      lab_owner: '/lab-owner/upload-reports',
      lab_assistant: '/lab-assistant/upload-reports',
    },
  },
  {
    label: 'Upload Prescription',
    icon: Upload,
    permission: { resource: 'bookings', action: 'create' },
    routes: {
      patient: '/upload-prescription',
    },
  },
  {
    label: 'Lab Profile',
    icon: UserCog,
    permission: { resource: 'lab_owners', action: 'read' },
    routes: {
      lab_owner: '/lab-owner/lab-profile',
    },
  },
  {
    label: 'Settings',
    icon: Settings,
    permission: { resource: 'roles', action: 'read' },
    routes: {
      admin: '/admin/settings',
    },
  },
]

export const getMenuItemsForRole = (role, permissions) => {
  return ALL_MENU_ITEMS.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false
    if (!item.routes[role]) return false
    if (!item.permission) return true
    const { resource, action } = item.permission
    return permissions?.[resource]?.[action] === true
  }).map((item) => ({
    label: item.label,
    icon: item.icon,
    route: item.routes[role],
    permission: item.permission,
  }))
}
