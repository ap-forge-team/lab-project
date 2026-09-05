import React, { useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import { useAdminDashboardStats } from '@/hooks/useAdminDashboard'
import { Spinner } from '@/components/ui/Loader'
import AdminDashboardHeader from '@/features/admin/components/AdminDashboardHeader'
import AdminDashboardStats from '@/features/admin/components/AdminDashboardStats'
import BookingsOverviewChart from '@/features/admin/components/BookingsOverviewChart'
import BookingsByStatusChart from '@/features/admin/components/BookingsByStatusChart'
import RevenueOverviewChart from '@/features/admin/components/RevenueOverviewChart'
import RevenueByPaymentMethodChart from '@/features/admin/components/RevenueByPaymentMethodChart'
import AdminQuickActions from '@/features/admin/components/AdminQuickActions'
import RecentBookingsTable from '@/features/admin/components/RecentBookingsTable'
import RecentPaymentsTable from '@/features/admin/components/RecentPaymentsTable'
import TopTestsTable from '@/features/admin/components/TopTestsTable'
import TopPackagesTable from '@/features/admin/components/TopPackagesTable'
import TopLabOwnersTable from '@/features/admin/components/TopLabOwnersTable'
import AdminRecentActivity from '@/features/admin/components/AdminRecentActivity'

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [bookingsFilter, setBookingsFilter] = useState('This Week')
  const [revenueFilter, setRevenueFilter] = useState('This Month')

  const dateParams = {}
  if (dateRange?.from) dateParams.from = dateRange.from.toISOString()
  if (dateRange?.to) dateParams.to = dateRange.to.toISOString()

  const { data, isLoading, error, refetch } = useAdminDashboardStats(dateParams)

  return (
    <DashboardLayout>
      <div className="bg-background min-h-screen lg:pb-6 overflow-x-hidden">
      <AdminDashboardHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center mt-4">
          <p className="text-red-600 text-xs font-medium">Failed to load dashboard data.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-3" size="sm">Retry</Button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <AdminDashboardStats stats={data?.stats} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <BookingsOverviewChart
              data={data?.bookingsOverview || []}
              filter={bookingsFilter}
              onFilterChange={setBookingsFilter}
            />
            <BookingsByStatusChart statusCounts={data?.bookingStatusCounts} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RevenueOverviewChart
              data={data?.revenueOverview || []}
              totalRevenue={data?.stats?.totalRevenue}
              trend={data?.stats?.totalRevenueTrend}
              filter={revenueFilter}
              onFilterChange={setRevenueFilter}
            />
            <RevenueByPaymentMethodChart
              paymentMethods={data?.paymentMethods}
              totalPaidAmount={data?.totalPaidAmount}
            />
          </div>

          <AdminQuickActions />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <RecentBookingsTable data={data?.recentBookings} />
            <RecentPaymentsTable data={data?.recentPayments} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <TopTestsTable data={data?.topTests} />
            <TopPackagesTable data={data?.topPackages} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <AdminRecentActivity data={data?.recentActivity} />
            <TopLabOwnersTable data={data?.topLabOwners} />
          </div>
        </div>
      )}

      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
