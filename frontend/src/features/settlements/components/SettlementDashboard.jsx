import React, { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, AlertCircle } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { getSettlementStatistics, getSettlementList, getSettlementHistory, getLabSettlementStatistics, getLabSettlementPending, getLabSettlementHistory } from '@/services/settlement.service'
import SettlementStatsGrid from './SettlementStatsGrid'
import SettlementFilters from './SettlementFilters'
import SettlementPendingTable from './SettlementPendingTable'
import SettlementHistoryTable from './SettlementHistoryTable'
import SettlementDetailModal from './SettlementDetailModal'
import SettlementCharts from './SettlementCharts'
import SettlementFooter from './SettlementFooter'
import { Spinner } from '@/components/ui/Loader'

const SettlementDashboard = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [labOwner, setLabOwner] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [selectedBookings, setSelectedBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)

  // Fetch statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['settlementStats', user?.role],
    queryFn: () => isAdmin ? getSettlementStatistics() : getLabSettlementStatistics(),
    enabled: !!user?.role,
  })

  // Fetch pending settlements
  const { data: pendingData, isLoading: pendingLoading, refetch: refetchPending } = useQuery({
    queryKey: ['settlementPending', user?.role, labOwner],
    queryFn: () => isAdmin ? getSettlementList({ status: 'Pending', labOwner }) : getLabSettlementPending(),
    enabled: !!user?.role && activeTab === 'pending',
  })

  // Fetch history
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['settlementHistory', user?.role, status, fromDate, toDate],
    queryFn: () => isAdmin ? getSettlementHistory({ status, fromDate, toDate }) : getLabSettlementHistory(),
    enabled: !!user?.role && activeTab === 'history',
  })

  const statistics = statsData?.data?.statistics || statsData?.data || {}
  const pendingBookings = pendingData?.data?.bookings || pendingData?.data || []
  const history = historyData?.data?.history || historyData?.data || []

  const handleRefresh = useCallback(() => {
    if (activeTab === 'pending') {
      refetchPending()
    } else {
      refetchHistory()
    }
  }, [activeTab, refetchPending, refetchHistory])

  const handleViewDetails = useCallback((item) => {
    setSelectedBooking(item)
  }, [])

  const handleBulkSettlement = useCallback(() => {
    // TODO: Open bulk settlement modal
    console.log('Bulk settlement:', selectedBookings)
    setSelectedBookings([])
  }, [selectedBookings])

  const handleExport = useCallback(() => {
    // TODO: Export to Excel
    console.log('Export settlements')
  }, [])

  const handleDownload = useCallback((item) => {
    // TODO: Download settlement details
    console.log('Download:', item)
  }, [])

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3">
          <div className="w-11 h-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settlement Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin ? 'Manage payment settlements with lab owners' : 'View your payment settlements'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <SettlementStatsGrid statistics={statistics} isLoading={statsLoading} />

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg border border-border p-1">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition ${
            activeTab === 'pending'
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          Pending Settlements
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition ${
            activeTab === 'history'
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          Settlement History
        </button>
      </div>

      {/* Filters */}
      <SettlementFilters
        status={status}
        setStatus={setStatus}
        labOwner={labOwner}
        setLabOwner={setLabOwner}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onSearch={handleRefresh}
        onReset={() => { setStatus(''); setLabOwner(''); setFromDate(''); setToDate('') }}
        onExport={handleExport}
        isAdmin={isAdmin}
      />

      {/* Content */}
      {activeTab === 'pending' ? (
        <SettlementPendingTable
          bookings={pendingBookings}
          isLoading={pendingLoading}
          search={search}
          setSearch={setSearch}
          onRefresh={handleRefresh}
          onBulkSettlement={handleBulkSettlement}
          onViewDetails={handleViewDetails}
          isAdmin={isAdmin}
          selectedBookings={selectedBookings}
          setSelectedBookings={setSelectedBookings}
        />
      ) : (
        <SettlementHistoryTable
          history={history}
          isLoading={historyLoading}
          onViewDetails={handleViewDetails}
          onDownload={handleDownload}
        />
      )}

      {/* Charts */}
      <SettlementCharts history={history} isLoading={historyLoading} />

      {/* Footer */}
      <SettlementFooter statistics={statistics} isAdmin={isAdmin} />

      {/* Detail Modal */}
      <SettlementDetailModal
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        booking={selectedBooking}
        isAdmin={isAdmin}
      />
    </section>
  )
}

export default SettlementDashboard
