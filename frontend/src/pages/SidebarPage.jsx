import React, { useContext, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Search, ShieldAlert } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { AuthContext } from '@/context/AuthContext'
import { getSidebarPage } from '@/constants/sidebarPages'
import { ROUTES } from '@/constants/routes'
import { getAllTests } from '@/services/test.service'
import { getAllPackages } from '@/services/package.service'
import { getAllBookings, getAssignedBookings, getLabOwnerBookings, getMyBookings } from '@/services/booking.service'
import { getAllLabOwners, getAllUsers, getMyAssistants } from '@/services/user.service'
import { getAdminPaymentStats, getLabOwnerPaymentStats, getAdminPayments } from '@/services/payment.service'
import { Spinner } from '@/components/ui/Loader'
import TestsManagePage from '@/features/tests/components/TestsManagePage'
import PackagesManagePage from '@/features/packages/components/PackagesManagePage'
import BookingsManagePage from '@/features/bookings/components/BookingsManagePage'
import PaymentsManagePage from '@/features/payments/components/PaymentsManagePage'
import UsersManagePage from '@/features/admin/components/UsersManagePage'
import LabOwnersManagePage from '@/features/admin/components/LabOwnersManagePage'
import AssistantsManagePage from '@/features/lab-owner/components/AssistantsManagePage'
import SettlementDashboard from '@/features/settlements/components/SettlementDashboard'
import ReportsManagePage from '@/features/reports/components/ReportsManagePage'
import SamplePickupsManagePage from '@/features/sample-pickups/components/SamplePickupsManagePage'
import UploadReportsManagePage from '@/features/upload-reports/components/UploadReportsManagePage'

const sources = {
  tests: getAllTests,
  packages: getAllPackages,
  allBookings: getAllBookings,
  labOwnerBookings: getLabOwnerBookings,
  assignedBookings: getAssignedBookings,
  myBookings: getMyBookings,
  labOwners: getAllLabOwners,
  allUsers: getAllUsers,
  myAssistants: getMyAssistants,
  adminPayments: getAdminPaymentStats,
  paymentsList: getAdminPayments,
  labOwnerPayments: getLabOwnerPaymentStats,
  labProfile: async (user) => ({ data: user ? [user] : [] }),
  offers: async () => ({ data: [] }),
}

const normalise = (response) => {
  const data = response?.data ?? response ?? []
  if (Array.isArray(data)) return data
  return Object.values(data).find(Array.isArray) || (data && typeof data === 'object' ? [data] : [])
}

const displayValue = (value) => {
  if (value == null || value === '') return '—'
  if (typeof value === 'object') return value.name || value.title || value.email || '—'
  return String(value)
}

const columnsFor = (items) => {
  const preferred = ['name', 'title', 'testName', 'packageName', 'bookingId', 'patientName', 'email', 'status', 'paymentStatus', 'bookingDate', 'createdAt']
  const keys = [...new Set(items.flatMap((item) => Object.keys(item || {})))]
  const selected = preferred.filter((key) => keys.includes(key)).slice(0, 5)
  return selected.length ? selected : keys.filter((key) => !key.startsWith('_')).slice(0, 5)
}

const SidebarPage = ({ page: pageProp }) => {
  const { user } = useContext(AuthContext)
  const { page: routeSlug } = useParams()
  const slug = pageProp || routeSlug
  const [search, setSearch] = useState('')
  const config = getSidebarPage(user?.role, slug)

  // Handle settlements page separately (uses custom SettlementDashboard component)
  if (slug === 'settlements') {
    return (
      <DashboardLayout>
        <SettlementDashboard />
      </DashboardLayout>
    )
  }

  const permissionKnown = user?.permissions !== undefined
  const allowed = !permissionKnown || !config?.permission || user.permissions?.[config.permission.resource]?.[config.permission.action] === true
  const query = useQuery({
    queryKey: ['sidebar-page', user?.role, slug],
    queryFn: () => (sources[config?.dataSource] || sources.offers)(user),
    enabled: Boolean(config && allowed),
  })
  const items = useMemo(() => normalise(query.data), [query.data])
  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return items
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(term))
  }, [items, search])
  const columns = useMemo(() => columnsFor(filteredItems.length ? filteredItems : items), [filteredItems, items])

  if (!config) return <Navigate to={ROUTES.HOME} replace />
  if (!allowed) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto mt-16 text-center bg-white border border-border rounded-2xl p-8">
          <ShieldAlert className="mx-auto text-destructive mb-4" size={38} />
          <h1 className="text-xl font-bold text-foreground">Access denied</h1>
          <p className="text-sm text-muted-foreground mt-2">You do not have permission to view {config.title}.</p>
        </div>
      </DashboardLayout>
    )
  }

  if (slug === 'tests') {
    return (
      <DashboardLayout>
        <TestsManagePage tests={items} isLoading={query.isLoading} isError={query.isError} onRefresh={query.refetch} />
      </DashboardLayout>
    )
  }

  if (slug === 'packages') {
    return (
      <DashboardLayout>
        <PackagesManagePage packages={items} isLoading={query.isLoading} isError={query.isError} onRefresh={query.refetch} />
      </DashboardLayout>
    )
  }

  if (slug === 'bookings') {
    return (
      <DashboardLayout>
        <BookingsManagePage bookings={items} isLoading={query.isLoading} isError={query.isError} onRefresh={query.refetch} user={user} />
      </DashboardLayout>
    )
  }

  if (slug === 'payments') {
    return (
      <DashboardLayout>
        <PaymentsManagePage payments={items} isLoading={query.isLoading} isError={query.isError} onRefresh={query.refetch} />
      </DashboardLayout>
    )
  }

  if (slug === 'users') {
    return (
      <DashboardLayout>
        <UsersManagePage users={items} isLoading={query.isLoading} isError={query.isError} onRefresh={query.refetch} />
      </DashboardLayout>
    )
  }

  if (slug === 'lab-owners') {
    return (
      <DashboardLayout>
        <LabOwnersManagePage labOwners={items} isLoading={query.isLoading} isError={query.isError} onRefresh={query.refetch} />
      </DashboardLayout>
    )
  }

  if (slug === 'assistants') {
    return (
      <DashboardLayout>
        <AssistantsManagePage assistants={items} isLoading={query.isLoading} isError={query.isError} onRefresh={query.refetch} />
      </DashboardLayout>
    )
  }

  if (slug === 'reports') {
    return (
      <DashboardLayout>
        <ReportsManagePage bookings={items} isLoading={query.isLoading} isError={query.isError} />
      </DashboardLayout>
    )
  }

  if (slug === 'sample-pickups') {
    return (
      <DashboardLayout>
        <SamplePickupsManagePage bookings={items} isLoading={query.isLoading} isError={query.isError} />
      </DashboardLayout>
    )
  }

  if (slug === 'upload-reports') {
    return (
      <DashboardLayout>
        <UploadReportsManagePage bookings={items} isLoading={query.isLoading} isError={query.isError} onRefresh={query.refetch} />
      </DashboardLayout>
    )
  }

  const Icon = config.icon
  return (
    <DashboardLayout>
      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Icon size={22} /></div>
            <div><h1 className="text-2xl font-bold text-foreground">{config.title}</h1><p className="mt-1 text-sm text-muted-foreground">{config.description}</p></div>
          </div>
          <label className="relative block w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${config.title.toLowerCase()}...`} className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-primary" />
          </label>
        </div>

        <div className="bg-white border border-border rounded-xl overflow-hidden">
          {query.isLoading ? <div className="p-12 flex justify-center"><Spinner /></div> : query.isError ? (
            <p className="p-8 text-center text-sm text-destructive">Unable to load {config.title.toLowerCase()}. Please try again.</p>
          ) : filteredItems.length === 0 ? (
            <p className="p-12 text-center text-sm text-muted-foreground">{config.emptyMessage || `No ${config.title.toLowerCase()} found.`}</p>
          ) : (
            <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-accent border-b border-border"><tr>{columns.map((column) => <th key={column} className="px-4 py-3 text-left font-semibold text-muted-foreground capitalize">{column.replace(/([A-Z])/g, ' $1')}</th>)}</tr></thead><tbody>{filteredItems.map((item, index) => <tr key={item._id || item.id || index} className="border-b border-border last:border-0">{columns.map((column) => <td key={column} className="px-4 py-3 text-foreground">{displayValue(item[column])}</td>)}</tr>)}</tbody></table></div>
          )}
        </div>
      </section>
    </DashboardLayout>
  )
}

export default SidebarPage
