import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Shield, Tag, FlaskConical, ArrowLeft } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CategoryManagement from '@/features/admin/components/CategoryManagement'
import RoleManagement from '@/features/admin/components/RoleManagement'

const settingsItems = [
  {
    key: 'roles',
    title: 'Roles',
    description: 'View, add, and edit user roles and permissions.',
    icon: Shield,
    color: 'bg-violet-500',
  },
  {
    key: 'categories',
    title: 'Categories',
    description: 'Create and manage test categories.',
    icon: Tag,
    color: 'bg-green-500',
  },
  {
    key: 'tests',
    title: 'Tests',
    description: 'Manage tests and test parameters.',
    icon: FlaskConical,
    color: 'bg-amber-500',
  },
]

const SettingsOverview = ({ onSelect }) => (
  <div>
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="text-muted-foreground text-sm mt-1">
        Configure your application settings. Select a section below to get started.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {settingsItems.map((item) => {
        const Icon = item.icon
        return (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className="bg-white border border-border rounded-xl p-5 text-left hover:shadow-md hover:border-primary/30 transition group"
          >
            <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
              <Icon size={24} className="text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </button>
        )
      })}
    </div>
  </div>
)

const PlaceholderPage = ({ title, description }) => (
  <div>
    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    <p className="text-muted-foreground mt-2">{description}</p>
  </div>
)

const AdminSettings = () => {
  const { section } = useParams()
  const navigate = useNavigate()

  if (section === 'roles') {
    return (
      <DashboardLayout>
        <RoleManagement />
      </DashboardLayout>
    )
  }

  if (section === 'categories') {
    return (
      <DashboardLayout>
        <CategoryManagement />
      </DashboardLayout>
    )
  }

  if (section) {
    const currentPage = settingsItems.find((item) => item.key === section)
    return (
      <DashboardLayout>
        <div className="mb-4">
          <button
            onClick={() => navigate('/admin/settings')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </button>
        </div>
        {currentPage ? (
          <PlaceholderPage title={currentPage.title} description={currentPage.description} />
        ) : (
          <PlaceholderPage title="Settings" description="Select a settings page from the sidebar." />
        )}
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <SettingsOverview onSelect={(key) => navigate(`/admin/settings/${key}`)} />
    </DashboardLayout>
  )
}

export default AdminSettings