import React, { useState, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Spinner } from '@/components/ui/Loader'
import { useLabAssistantDashboard } from '@/hooks/useLabAssistantDashboard'
import LabAssistantDashboardHeader from '@/features/lab-assistant/components/LabAssistantDashboardHeader'
import LabAssistantDashboardStats from '@/features/lab-assistant/components/LabAssistantDashboardStats'
import LabAssistantSampleCollectionStatusChart from '@/features/lab-assistant/components/LabAssistantSampleCollectionStatusChart'
import LabAssistantWeeklySamplesChart from '@/features/lab-assistant/components/LabAssistantWeeklySamplesChart'
import LabAssistantRecentSampleCollections from '@/features/lab-assistant/components/LabAssistantRecentSampleCollections'
import LabAssistantTodayBookings from '@/features/lab-assistant/components/LabAssistantTodayBookings'
import LabAssistantSamplesInLab from '@/features/lab-assistant/components/LabAssistantSamplesInLab'
import LabAssistantRecentActivity from '@/features/lab-assistant/components/LabAssistantRecentActivity'

const LabAssistantDashboard = () => {
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })

  const params = useMemo(() => {
    const p = {}
    if (dateRange?.from) {
      p.from = dateRange.from instanceof Date
        ? dateRange.from.toISOString().split('T')[0]
        : String(dateRange.from)
    }
    if (dateRange?.to) {
      p.to = dateRange.to instanceof Date
        ? dateRange.to.toISOString().split('T')[0]
        : String(dateRange.to)
    }
    return p
  }, [dateRange?.from?.getTime?.(), dateRange?.to?.getTime?.()])

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useLabAssistantDashboard(params)

  const stats = dashboardData?.stats || {}
  const recentSampleCollections = dashboardData?.recentSampleCollections || []
  const todayBookings = dashboardData?.todayBookings || []
  const samplesInLabList = dashboardData?.samplesInLabList || []
  const weeklySamples = dashboardData?.weeklySamples || []
  const sampleCollectionStatus = dashboardData?.sampleCollectionStatus || {}
  const recentActivity = dashboardData?.recentActivity || []

  const isInitialLoading = dashboardLoading && !dashboardData

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {isInitialLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner />
          </div>
        ) : dashboardError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <p className="text-red-600 text-xs font-medium">Failed to load dashboard data. Please try again.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <LabAssistantDashboardHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

            {/* Stats Grid */}
            <LabAssistantDashboardStats stats={stats} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <LabAssistantSampleCollectionStatusChart data={sampleCollectionStatus} />
              <LabAssistantWeeklySamplesChart data={weeklySamples} />
            </div>

            {/* Tables Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <LabAssistantRecentSampleCollections data={recentSampleCollections} />
              <LabAssistantTodayBookings data={todayBookings} />
            </div>

            {/* Tables Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <LabAssistantSamplesInLab data={samplesInLabList} />
              <LabAssistantRecentSampleCollections data={recentSampleCollections} />
            </div>

            {/* Activity */}
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <LabAssistantRecentActivity data={recentActivity} />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default LabAssistantDashboard
