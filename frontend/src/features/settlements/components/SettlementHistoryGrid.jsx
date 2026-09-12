import React, { useState, useMemo } from 'react'
import { Eye, Download } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'

const PAGE_SIZE = 12
const PAGE_SIZES = [6, 12, 24, 48]

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLES = {
  Verified: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Sent: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
}

const SettlementHistoryGrid = ({ history, isLoading, activeFilters, onViewDetails, onDownload }) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const filteredHistory = useMemo(() => {
    let result = history || []

    if (activeFilters?.labOwner?.length) {
      result = result.filter((item) => activeFilters.labOwner.includes(item.labOwner?._id || item.labOwner?.id))
    }
    if (activeFilters?.dateRange?.start) {
      const start = new Date(activeFilters.dateRange.start)
      result = result.filter((item) => new Date(item.paidAt || item.settledAt || item.createdAt) >= start)
    }
    if (activeFilters?.dateRange?.end) {
      const end = new Date(activeFilters.dateRange.end)
      end.setHours(23, 59, 59, 999)
      result = result.filter((item) => new Date(item.paidAt || item.settledAt || item.createdAt) <= end)
    }
    if (activeFilters?.totalAmount?.min) {
      result = result.filter((item) => (item.totalAmount || 0) >= Number(activeFilters.totalAmount.min))
    }
    if (activeFilters?.totalAmount?.max) {
      result = result.filter((item) => (item.totalAmount || 0) <= Number(activeFilters.totalAmount.max))
    }
    if (activeFilters?.commission?.min) {
      result = result.filter((item) => (item.commission || 0) >= Number(activeFilters.commission.min))
    }
    if (activeFilters?.commission?.max) {
      result = result.filter((item) => (item.commission || 0) <= Number(activeFilters.commission.max))
    }
    if (activeFilters?.netPayable?.min) {
      result = result.filter((item) => ((item.netPayable || item.labShare) || 0) >= Number(activeFilters.netPayable.min))
    }
    if (activeFilters?.netPayable?.max) {
      result = result.filter((item) => ((item.netPayable || item.labShare) || 0) <= Number(activeFilters.netPayable.max))
    }
    if (activeFilters?.utr) {
      const term = activeFilters.utr.toLowerCase()
      result = result.filter((item) => (item.settlementUTR || item.utr || '').toLowerCase().includes(term))
    }

    return result
  }, [history, activeFilters])

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize))
  const visibleHistory = filteredHistory.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-5 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
              <div className="h-8 bg-muted rounded w-full mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Settlement History</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      {filteredHistory.length === 0 ? (
        <EmptyState
          title="No settlement history found"
          description="You don't have any settlement history yet. Settlements will appear here once processed."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleHistory.map((item) => {
            const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.Pending
            const commissionPct = item.totalAmount > 0 ? `${((item.commission / item.totalAmount) * 100).toFixed(1)}%` : '—'

            return (
              <div
                key={item._id}
                className="rounded-xl border border-border bg-white p-5 transition hover:shadow-md cursor-pointer"
                onClick={() => onViewDetails(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primary truncate">{item.settlementBatchId || '—'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.labOwner?.name || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium shrink-0 ml-2 ${statusStyle.bg} ${statusStyle.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Paid On</span>
                    <span className="text-foreground">{formatDate(item.paidAt || item.settledAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">UTR</span>
                    <span className="text-foreground font-mono text-[11px] truncate ml-2">{item.settlementUTR || item.utr || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Bookings</span>
                    <span className="text-foreground">{item.totalBookings || 0}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 mb-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</p>
                      <p className="text-sm font-bold text-foreground">{formatCurrency(item.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Commission</p>
                      <p className="text-sm font-bold text-amber-600">{formatCurrency(item.commission)}</p>
                      <p className="text-[10px] text-muted-foreground">{commissionPct}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Net Payable</p>
                      <p className="text-sm font-bold text-emerald-600">{formatCurrency(item.netPayable || item.labShare)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <Tooltip title="View Details" arrow placement="top">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onViewDetails(item) }}
                      className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                    >
                      <Eye size={15} />
                    </button>
                  </Tooltip>
                  <Tooltip title="Download" arrow placement="top">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onDownload?.(item) }}
                      className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                    >
                      <Download size={15} />
                    </button>
                  </Tooltip>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredHistory.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizes={PAGE_SIZES}
          itemName="settlements"
        />
      </div>
    </div>
  )
}

export default SettlementHistoryGrid
