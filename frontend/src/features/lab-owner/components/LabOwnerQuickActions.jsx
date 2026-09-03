import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FlaskConical, PackageOpen, Calendar, FileUp, TestTube, Download } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import Can from '@/components/Can'

const actions = [
  {
    key: 'test',
    label: 'Add New Test',
    description: 'Create a new test',
    icon: FlaskConical,
    bgColor: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    route: ROUTES.LAB_OWNER,
    permission: { resource: 'tests', action: 'create' },
  },
  {
    key: 'package',
    label: 'Create Package',
    description: 'Create a new package',
    icon: PackageOpen,
    bgColor: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    route: ROUTES.LAB_OWNER,
    permission: { resource: 'packages', action: 'create' },
  },
  {
    key: 'bookings',
    label: 'View Bookings',
    description: 'Manage all bookings',
    icon: Calendar,
    bgColor: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    route: ROUTES.LAB_OWNER,
    permission: { resource: 'bookings', action: 'read' },
  },
  {
    key: 'upload-reports',
    label: 'Upload Reports',
    description: 'Upload test reports',
    icon: FileUp,
    bgColor: 'bg-rose-50 border-rose-200',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    route: ROUTES.LAB_OWNER,
    permission: { resource: 'reports', action: 'create' },
  },
  {
    key: 'sample-collection',
    label: 'Sample Collection',
    description: 'Manage collections',
    icon: TestTube,
    bgColor: 'bg-amber-50 border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    route: ROUTES.LAB_OWNER,
    permission: { resource: 'bookings', action: 'read' },
  },
  {
    key: 'download-reports',
    label: 'Download Reports',
    description: 'Bulk download reports',
    icon: Download,
    bgColor: 'bg-indigo-50 border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    route: ROUTES.LAB_OWNER,
    permission: { resource: 'reports', action: 'read' },
  },
]

const LabOwnerQuickActions = () => {
  const navigate = useNavigate()

  const handleAction = (action) => {
    if (action.route) {
      navigate(action.route)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <h3 className="font-serif text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Can key={action.key} resource={action.permission.resource} action={action.permission.action}>
              <button
                onClick={() => handleAction(action)}
                className={`border rounded-xl p-3 sm:p-4 text-left hover:shadow-md transition group ${action.bgColor}`}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition ${action.iconBg}`}>
                  <Icon size={16} className={action.iconColor} />
                </div>
                <h4 className="font-semibold text-foreground text-xs sm:text-sm leading-tight">{action.label}</h4>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{action.description}</p>
              </button>
            </Can>
          )
        })}
      </div>
    </div>
  )
}

export default LabOwnerQuickActions
