import React from 'react'
import { useParams } from 'react-router-dom'
import DashboardLayout from '@/components/layout/DashboardLayout'
import CategoryManagement from '@/features/admin/components/CategoryManagement'

const settingsPages = {
  general: { title: 'General Settings', description: 'Configure your general settings here.' },
  subcategories: { title: 'Subcategories', description: 'Manage subcategories within each category.' },
  parameters: { title: 'Test Parameters', description: 'Configure test parameters and reference ranges.' },
  'sample-types': { title: 'Sample Types', description: 'Manage sample types used in tests.' },
  tat: { title: 'Report Time (TAT)', description: 'Configure turnaround times for reports.' },
  'email-templates': { title: 'Email Templates', description: 'Manage email notification templates.' },
}

const PlaceholderPage = ({ title, description }) => (
  <div>
    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
    <p className="text-muted-foreground mt-2">{description}</p>
  </div>
)

const AdminSettings = () => {
  const { section } = useParams()

  if (section === 'categories') {
    return (
      <DashboardLayout>
        <CategoryManagement />
      </DashboardLayout>
    )
  }

  const currentPage = settingsPages[section]

  return (
    <DashboardLayout>
      {currentPage ? (
        <PlaceholderPage title={currentPage.title} description={currentPage.description} />
      ) : (
        <PlaceholderPage title="Settings" description="Select a settings page from the sidebar." />
      )}
    </DashboardLayout>
  )
}

export default AdminSettings
