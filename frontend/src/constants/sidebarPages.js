import {
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  Package,
  Tag,
  TestTube,
  Upload,
  UserCog,
  Users,
  Building2,
  Landmark,
} from 'lucide-react'

const page = (title, description, icon, permission, dataSource, emptyMessage) => ({
  title,
  description,
  icon,
  permission,
  dataSource,
  emptyMessage,
})

export const ALL_PAGES = {
  tests: page('Tests', 'Browse the laboratory tests available.', TestTube, { resource: 'tests', action: 'read' }, 'tests'),
  packages: page('Packages', 'Browse the health-check packages available.', Package, { resource: 'packages', action: 'read' }, 'packages'),
  bookings: page('Bookings', 'View and manage bookings.', Calendar, { resource: 'bookings', action: 'read' }, 'allBookings'),
  payments: page('Payments', 'Monitor payment totals and recent payment activity.', CreditCard, { resource: 'payments', action: 'read' }, 'paymentsList'),
  settlements: page('Settlements', 'View settlement details.', Landmark, { resource: 'settlements', action: 'read' }, 'settlements'),
  'lab-owners': page('Lab Owners', 'View laboratories and their owner accounts.', Building2, { resource: 'lab_owners', action: 'read' }, 'labOwners'),
  assistants: page('Assistants', 'Manage lab assistants and their assignments.', Users, { resource: 'lab_assistants', action: 'read' }, 'myAssistants'),
  reports: page('Reports', 'Review completed bookings and uploaded reports.', FileText, { resource: 'reports', action: 'read' }, 'allBookings', 'No completed bookings with reports found.'),
  offers: page('Offers', 'Create and manage promotional offers for tests and packages.', Tag, { resource: 'offers', action: 'read' }, 'offers', 'Offer management will appear here when the offers API is available.'),
  users: page('Users', 'Manage all users and their access.', Users, { resource: 'users', action: 'read' }, 'allUsers'),
  'sample-pickups': page('Sample Pickups', 'Track sample collection for bookings.', ClipboardList, { resource: 'bookings', action: 'read' }, 'allBookings'),
  'upload-reports': page('Upload Reports', 'Select a booking to upload its laboratory report.', Upload, { resource: 'bookings', action: 'update' }, 'allBookings'),
  'lab-profile': page('Lab Profile', 'Review your laboratory account and profile information.', UserCog, { resource: 'lab_owners', action: 'read' }, 'labProfile'),
  'upload-prescription': page('Upload Prescription', 'Attach a prescription to a booking.', Upload, { resource: 'bookings', action: 'create' }, 'myBookings'),
}

const ROLE_DATA_SOURCE_OVERRIDES = {
  admin: {
    bookings: 'allBookings',
    'sample-pickups': 'allBookings',
    'upload-reports': 'allBookings',
    reports: 'allBookings',
  },
  lab_owner: {
    bookings: 'labOwnerBookings',
    'sample-pickups': 'labOwnerBookings',
    'upload-reports': 'labOwnerBookings',
    reports: 'labOwnerBookings',
  },
  lab_assistant: {
    bookings: 'assignedBookings',
    'sample-pickups': 'assignedBookings',
    'upload-reports': 'assignedBookings',
    reports: 'assignedBookings',
  },
  patient: {
    bookings: 'myBookings',
    'sample-pickups': 'myBookings',
    'upload-reports': 'myBookings',
    reports: 'myBookings',
    'upload-prescription': 'myBookings',
  },
}

const PAGE_TITLE_OVERRIDES = {
  patient: {
    bookings: 'My Bookings',
    reports: 'My Reports',
  },
}

const PAGE_DESCRIPTION_OVERRIDES = {
  patient: {
    bookings: 'Review your upcoming and previous bookings.',
    reports: 'View reports for your completed bookings.',
  },
}

export const getSidebarPage = (role, slug) => {
  const base = ALL_PAGES[slug]
  if (!base) return undefined

  const dataSourceOverride = ROLE_DATA_SOURCE_OVERRIDES[role]?.[slug]
  const titleOverride = PAGE_TITLE_OVERRIDES[role]?.[slug]
  const descriptionOverride = PAGE_DESCRIPTION_OVERRIDES[role]?.[slug]

  return {
    ...base,
    dataSource: dataSourceOverride || base.dataSource,
    title: titleOverride || base.title,
    description: descriptionOverride || base.description,
  }
}
