import React, { useState, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { getSettlementStatistics, getSettlementList, getSettlementHistory, getLabSettlementStatistics, getLabSettlementPending, getLabSettlementHistory, exportSettlementHistory, exportLabSettlementHistory } from '@/services/settlement.service'
import { getAllLabOwners } from '@/services/user.service'
import SettlementStatsGrid from './SettlementStatsGrid'
import SettlementPendingTable from './SettlementPendingTable'
import SettlementHistoryTable from './SettlementHistoryTable'
import SettlementDetailModal from './SettlementDetailModal'
import SendSettlementModal from './SendSettlementModal'
import VerifySettlementModal from './VerifySettlementModal'
import BulkSettlementModal from './BulkSettlementModal'
import SettlementCharts from './SettlementCharts'
import SettlementFooter from './SettlementFooter'
import SettlementSummary from './SettlementSummary'
import Button from '@/components/ui/Button'
import SearchInput from '@/components/ui/SearchInput'
import FilterButton from '@/components/ui/FilterButton'
import FilterPanel from '@/components/ui/FilterPanel'

const SettlementDashboard = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [activeTab, setActiveTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [selectedBookings, setSelectedBookings] = useState([])
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [sendBooking, setSendBooking] = useState(null)
  const [verifyBooking, setVerifyBooking] = useState(null)
  const [bulkSettlementOpen, setBulkSettlementOpen] = useState(false)
  const [exporting, setExporting] = useState(false)

  const statusFilter = activeFilters.status?.[0] || ''
  const labOwnerFilter = activeFilters.labOwner?.[0] || ''
  const fromDate = activeFilters.dateRange?.start || ''
  const toDate = activeFilters.dateRange?.end || ''

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['settlementStats', user?.role],
    queryFn: () => isAdmin ? getSettlementStatistics() : getLabSettlementStatistics(),
    enabled: !!user?.role,
  })

  const { data: labOwnersData } = useQuery({
    queryKey: ['labOwners'],
    queryFn: getAllLabOwners,
    enabled: !!user?.role && isAdmin,
  })

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['settlementPending', user?.role, labOwnerFilter],
    queryFn: () => isAdmin ? getSettlementList({ labOwner: labOwnerFilter }) : getLabSettlementPending(),
    enabled: !!user?.role && activeTab === 'pending',
  })

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['settlementHistory', user?.role, statusFilter, fromDate, toDate],
    queryFn: () => isAdmin ? getSettlementHistory({ status: statusFilter, fromDate, toDate }) : getLabSettlementHistory(),
    enabled: !!user?.role && activeTab === 'history',
  })

  const statistics = statsData?.data?.statistics || statsData?.data || {}
  const pendingBookings = pendingData?.data?.bookings || pendingData?.data || []
  const history = historyData?.data?.history || historyData?.data || []

  const labOwners = useMemo(() => {
    const list = labOwnersData?.data?.data || labOwnersData?.data?.labOwners || labOwnersData?.data || []
    return Array.isArray(list) ? list : []
  }, [labOwnersData])

  const filterCategories = useMemo(() => {
    const cats = [
      {
        key: 'dateRange',
        label: 'Paid On',
        type: 'date-range',
      },
      {
        key: 'totalAmount',
        label: 'Amount',
        type: 'range',
        unit: '(₹)',
        minPlaceholder: 'Min amount',
        maxPlaceholder: 'Max amount',
      },
      {
        key: 'commission',
        label: 'Commission',
        type: 'range',
        unit: '(₹)',
        minPlaceholder: 'Min commission',
        maxPlaceholder: 'Max commission',
      },
      {
        key: 'netPayable',
        label: 'Net Payable',
        type: 'range',
        unit: '(₹)',
        minPlaceholder: 'Min payable',
        maxPlaceholder: 'Max payable',
      },
      {
        key: 'utr',
        label: 'UTR Number',
        type: 'text-search',
        placeholder: 'Search by UTR number...',
      },
    ]
    if (isAdmin) {
      cats.splice(0, 0, {
        key: 'labOwner',
        label: 'Lab Owner',
        type: 'checkbox',
        options: labOwners.map((lab) => ({ value: lab._id || lab.id, label: lab.name || lab.labName })),
      })
    }
    return cats
  }, [isAdmin, labOwners])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      if (val && typeof val === 'object' && (val.start || val.end || val.min || val.max)) return 1
      if (val && typeof val === 'string') return 1
      return count
    }, 0)
  }, [activeFilters])

  const handleApplyFilters = useCallback((filters) => {
    setActiveFilters(filters)
  }, [])

  const handleViewDetails = useCallback((item) => setSelectedBooking(item), [])
  const handleSendSettlement = useCallback((booking) => setSendBooking(booking), [])
  const handleVerifySettlement = useCallback((booking) => setVerifyBooking(booking), [])
  const handleBulkSettlement = useCallback(() => {
    if (selectedBookings.length > 0) {
      setBulkSettlementOpen(true)
    }
  }, [selectedBookings])
  const handleExport = useCallback(async () => {
    try {
      setExporting(true)
      const response = isAdmin
        ? await exportSettlementHistory()
        : await exportLabSettlementHistory({ status: statusFilter, from: fromDate, to: toDate })

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = isAdmin ? 'SettlementHistory.xlsx' : 'LabSettlementHistory.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }, [isAdmin, statusFilter, fromDate, toDate])
  const handleDownload = useCallback((item) => console.log('Download:', item), [])

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settlement Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? 'Manage all payment settlements and their status' : 'View your payment settlements'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Lab / Batch ID / UTR Number..." width="w-72" />
          <FilterButton
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
            }}
            activeCount={activeFilterCount}
          />
          <Button onClick={handleExport} variant="success" size="sm" className="flex items-center gap-2" disabled={exporting}>
            <Download size={16} />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <SettlementStatsGrid statistics={statistics} isLoading={statsLoading} isAdmin={isAdmin} />

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'pending'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Pending Settlements
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-sm font-medium transition border-b-2 ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Settlement History
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        <SettlementPendingTable
          bookings={pendingBookings}
          isLoading={pendingLoading}
          search={search}
          setSearch={setSearch}
          onBulkSettlement={handleBulkSettlement}
          onSendSettlement={handleSendSettlement}
          onVerifySettlement={handleVerifySettlement}
          onViewDetails={handleViewDetails}
          isAdmin={isAdmin}
          selectedBookings={selectedBookings}
          setSelectedBookings={setSelectedBookings}
        />
      ) : (
        <SettlementHistoryTable
          history={history}
          isLoading={historyLoading}
          activeFilters={activeFilters}
          onViewDetails={handleViewDetails}
          onDownload={handleDownload}
        />
      )}

      {/* Charts */}
      <SettlementCharts history={history} isLoading={historyLoading} />

      {/* Summary */}
      <SettlementSummary statistics={statistics} isLoading={statsLoading} />

      {/* Footer */}
      <SettlementFooter statistics={statistics} isAdmin={isAdmin} />

      {/* Modals */}
      <SettlementDetailModal open={!!selectedBooking} onClose={() => setSelectedBooking(null)} booking={selectedBooking} isAdmin={isAdmin} />
      <SendSettlementModal open={!!sendBooking} onClose={() => setSendBooking(null)} booking={sendBooking} />
      <VerifySettlementModal open={!!verifyBooking} onClose={() => setVerifyBooking(null)} booking={verifyBooking} />
      <BulkSettlementModal
        open={bulkSettlementOpen}
        onClose={() => {
          setBulkSettlementOpen(false)
          setSelectedBookings([])
        }}
        bookings={pendingBookings.filter((b) => selectedBookings.includes(b._id))}
        labOwnerId={pendingBookings.find((b) => selectedBookings.includes(b._id))?.labOwner?._id}
      />

      {/* Filter Panel */}
      {filterPanelOpen && createPortal(
        <FilterPanel
          isOpen={true}
          onClose={() => setFilterPanelOpen(null)}
          onApply={handleApplyFilters}
          position={filterPanelOpen}
          title="Settlement Filters"
          categories={filterCategories}
          activeFilters={activeFilters}
        />,
        document.body
      )}
    </section>
  )
}

export default SettlementDashboard
