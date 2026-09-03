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
} from 'lucide-react'

const page = (title, description, icon, permission, dataSource, emptyMessage) => ({
  title,
  description,
  icon,
  permission,
  dataSource,
  emptyMessage,
})

export const sidebarPagesByRole = {
  admin: {
    tests: page('Tests', 'Manage the laboratory tests available to patients.', TestTube, { resource: 'tests', action: 'read' }, 'tests'),
    packages: page('Packages', 'Manage health-check packages and their included tests.', Package, { resource: 'packages', action: 'read' }, 'packages'),
    bookings: page('Bookings', 'View and manage bookings across all laboratories.', Calendar, { resource: 'bookings', action: 'read' }, 'allBookings'),
    payments: page('Payments', 'Monitor payment totals and recent payment activity.', CreditCard, { resource: 'payments', action: 'read' }, 'paymentsList'),
    'lab-owners': page('Lab Owners', 'View laboratories and their owner accounts.', Building2, { resource: 'lab_owners', action: 'read' }, 'labOwners'),
    reports: page('Reports', 'Review completed bookings and uploaded reports.', FileText, { resource: 'reports', action: 'read' }, 'allBookings', 'No completed bookings with reports found.'),
    offers: page('Offers', 'Create and manage promotional offers for tests and packages.', Tag, { resource: 'offers', action: 'read' }, 'offers', 'Offer management will appear here when the offers API is available.'),
    users: page('Users', 'Manage all users and their access.', Users, { resource: 'users', action: 'read' }, 'allUsers'),
  },
  lab_owner: {
    assistants: page('Assistants', 'Manage lab assistants and their assignments.', Users, { resource: 'lab_assistants', action: 'read' }, 'myAssistants'),
    tests: page('Tests', 'Browse tests available for your laboratory.', TestTube, { resource: 'tests', action: 'read' }, 'tests'),
    packages: page('Packages', 'Browse health-check packages available for your laboratory.', Package, { resource: 'packages', action: 'read' }, 'packages'),
    bookings: page('Bookings', 'Manage bookings assigned to your laboratory.', Calendar, { resource: 'bookings', action: 'read' }, 'labOwnerBookings'),
    'sample-pickups': page('Sample Pickups', 'Track sample collection for your bookings.', ClipboardList, { resource: 'bookings', action: 'read' }, 'labOwnerBookings'),
    'upload-reports': page('Upload Reports', 'Select a booking to upload its laboratory report.', Upload, { resource: 'bookings', action: 'update' }, 'labOwnerBookings'),
    'lab-profile': page('Lab Profile', 'Review your laboratory account and profile information.', UserCog, { resource: 'lab_owners', action: 'read' }, 'labProfile'),
    payments: page('Payments', 'View payment performance for your laboratory.', CreditCard, { resource: 'payments', action: 'read' }, 'labOwnerPayments'),
    reports: page('Reports', 'Review reports completed by your laboratory.', FileText, { resource: 'reports', action: 'read' }, 'labOwnerBookings', 'No completed reports found.'),
  },
  lab_assistant: {
    tests: page('Tests', 'Browse the laboratory tests available.', TestTube, { resource: 'tests', action: 'read' }, 'tests'),
    packages: page('Packages', 'Browse the health-check packages available.', Package, { resource: 'packages', action: 'read' }, 'packages'),
    'sample-pickups': page('Sample Pickups', 'Process assigned sample pickups.', ClipboardList, { resource: 'bookings', action: 'read' }, 'assignedBookings'),
    'upload-reports': page('Upload Reports', 'Upload reports for assigned bookings.', Upload, { resource: 'bookings', action: 'update' }, 'assignedBookings'),
    bookings: page('Bookings', 'View bookings assigned to you.', Calendar, { resource: 'bookings', action: 'read' }, 'assignedBookings'),
  },
  patient: {
    tests: page('Tests', 'Browse the laboratory tests available.', TestTube, { resource: 'tests', action: 'read' }, 'tests'),
    packages: page('Packages', 'Browse the health-check packages available.', Package, { resource: 'packages', action: 'read' }, 'packages'),
    bookings: page('My Bookings', 'Review your upcoming and previous bookings.', Calendar, { resource: 'bookings', action: 'read' }, 'myBookings'),
    'upload-prescription': page('Upload Prescription', 'Attach a prescription to a booking.', Upload, { resource: 'bookings', action: 'create' }, 'myBookings'),
    reports: page('Reports', 'View reports for your completed bookings.', FileText, { resource: 'reports', action: 'read' }, 'myBookings', 'No reports are ready yet.'),
  },
}

export const getSidebarPage = (role, slug) => sidebarPagesByRole[role]?.[slug]
