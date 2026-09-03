import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, PackageOpen, Users, Calendar, CreditCard, BarChart3 } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import Can from '@/components/Can'

const actions = [
  {
    key: 'test',
    label: 'Create Test',
    icon: FlaskConical,
    bgColor: 'bg-primary/5 border-primary/20',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    route: ROUTES.ADMIN_TESTS,
    modal: 'create-test',
    permission: { resource: 'tests', action: 'create' },
  },
  {
    key: 'package',
    label: 'Create Package',
    icon: PackageOpen,
    bgColor: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    route: ROUTES.ADMIN_PACKAGES,
    modal: 'create-package',
    permission: { resource: 'packages', action: 'create' },
  },
  {
    key: 'lab-owner',
    label: 'Add Lab Owner',
    icon: Users,
    bgColor: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    route: ROUTES.ADMIN_LAB_OWNERS,
    modal: 'add-lab-owner',
    permission: { resource: 'users', action: 'create' },
  },
  {
    key: 'bookings',
    label: 'View Bookings',
    icon: Calendar,
    bgColor: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    route: ROUTES.ADMIN_BOOKINGS,
    permission: { resource: 'bookings', action: 'read' },
  },
  {
    key: 'payments',
    label: 'Payment Settings',
    icon: CreditCard,
    bgColor: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    route: ROUTES.ADMIN_PAYMENTS,
    permission: { resource: 'payments', action: 'update' },
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: BarChart3,
    bgColor: 'bg-rose-50 border-rose-200',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    route: ROUTES.ADMIN_REPORTS,
    permission: { resource: 'reports', action: 'read' },
  },
]

const AdminQuickActions = () => {
  const navigate = useNavigate()

  const handleAction = (action) => {
    if (action.route) {
      navigate(action.modal ? `${action.route}?modal=${action.modal}` : action.route)
    }
  }

  return (
    <div>
      <h3 className="font-serif text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Quick Actions</h3>
      <div className="flex gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-6 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Can key={action.key} resource={action.permission.resource} action={action.permission.action}>
              <button
                onClick={() => handleAction(action)}
                className={`border rounded-xl p-3 sm:p-4 text-left hover:shadow-md transition group ${action.bgColor} shrink-0 min-w-[120px] sm:min-w-0`}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition ${action.iconBg}`}>
                  <Icon size={16} className={action.iconColor} />
                </div>
                <h4 className="font-semibold text-foreground text-xs sm:text-sm leading-tight">{action.label}</h4>
              </button>
            </Can>
          )
        })}
      </div>
    </div>
  )
}

export default AdminQuickActions
