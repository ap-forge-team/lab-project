import React, { useState, useMemo } from 'react'
import { Eye, Send, CheckCircle, CheckSquare } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import Pagination from '@/components/ui/Pagination'
import Button from '@/components/ui/Button'
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

const SettlementPendingGrid = ({
  bookings,
  isLoading,
  search,
  onBulkSettlement,
  onSendSettlement,
  onVerifySettlement,
  onViewDetails,
  isAdmin,
  selectedBookings,
  setSelectedBookings,
}) => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (bookings || []).filter((b) => {
      if (!term) return true
      return `${b.patientName || b.user?.name || ''} ${b.labOwner?.name || ''} ${b.test?.title || ''} ${b.package?.title || ''} ${b.settlementBatchId || ''} ${b.settlementUTR || ''}`.toLowerCase().includes(term)
    })
  }, [bookings, search])

  const totalPages = Math.max(1, Math.ceil(filteredBookings.length / pageSize))
  const visibleBookings = filteredBookings.slice((page - 1) * pageSize, page * pageSize)

  const allSelected = visibleBookings.length > 0 && visibleBookings.every((b) => selectedBookings.includes(b._id))

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedBookings([])
    } else {
      setSelectedBookings(visibleBookings.map((b) => b._id))
    }
  }

  const handleSelectBooking = (id) => {
    setSelectedBookings((prev) =>
      prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id]
    )
  }

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
      {isAdmin && (
        <div className="flex items-center justify-end">
          <Button onClick={onBulkSettlement} variant="success" size="sm" className="flex items-center gap-2" disabled={selectedBookings.length === 0}>
            <CheckSquare size={14} />
            Bulk Settlement{selectedBookings.length > 0 && ` (${selectedBookings.length})`}
          </Button>
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <EmptyState
          title="No pending settlements found"
          description="You don't have any pending settlements yet. Settlements will appear here when ready to process."
        />
      ) : (
        <>
          {isAdmin && (
            <div className="flex items-center gap-2 px-1">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
                className="rounded border-border"
              />
              <span className="text-xs text-muted-foreground">
                {allSelected ? 'Deselect all' : 'Select all'} ({filteredBookings.length} items)
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleBookings.map((booking) => {
              const isSelected = selectedBookings.includes(booking._id)
              const statusStyle = STATUS_STYLES[booking.labPaymentStatus] || STATUS_STYLES.Pending
              const commissionPct = booking.commissionType === 'Percentage'
                ? `${booking.commissionValue || 0}%`
                : booking.paymentAmount > 0
                  ? `${((booking.systemCommission / booking.paymentAmount) * 100).toFixed(1)}%`
                  : '—'
              const labSharePct = booking.commissionType === 'Percentage'
                ? `${100 - (booking.commissionValue || 0)}%`
                : booking.paymentAmount > 0
                  ? `${((booking.labShare / booking.paymentAmount) * 100).toFixed(1)}%`
                  : '—'

              return (
                <div
                  key={booking._id}
                  className={`rounded-xl border bg-white p-5 transition hover:shadow-md cursor-pointer ${
                    isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => !isAdmin && onSendSettlement ? undefined : onViewDetails(booking)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{booking.patientName || booking.user?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{booking.phone}</p>
                    </div>
                    {isAdmin && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); handleSelectBooking(booking._id) }}
                        className="rounded border-border mt-1 shrink-0"
                      />
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Lab Owner</span>
                      <span className="text-foreground font-medium truncate ml-2">{booking.labOwner?.name || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Test / Package</span>
                      <span className="text-foreground font-medium truncate ml-2">{booking.test?.title || booking.package?.title || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground">{formatDate(booking.createdAt)}</span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 mb-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Amount</p>
                        <p className="text-sm font-bold text-foreground">{formatCurrency(booking.paymentAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Lab Share</p>
                        <p className="text-sm font-bold text-emerald-600">{formatCurrency(booking.labShare)}</p>
                        <p className="text-[10px] text-muted-foreground">{labSharePct}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Commission</p>
                        <p className="text-sm font-bold text-amber-600">{formatCurrency(booking.systemCommission)}</p>
                        <p className="text-[10px] text-muted-foreground">{commissionPct}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                      {booking.labPaymentStatus || 'Pending'}
                    </span>
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <Tooltip title="Send Settlement" arrow placement="top">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onSendSettlement(booking) }}
                            className="rounded p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 transition"
                          >
                            <Send size={15} />
                          </button>
                        </Tooltip>
                      )}
                      {!isAdmin && booking.labPaymentStatus === 'Sent' && (
                        <Tooltip title="Verify Payment Received" arrow placement="top">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onVerifySettlement(booking) }}
                            className="rounded p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 transition"
                          >
                            <CheckCircle size={15} />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details" arrow placement="top">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onViewDetails(booking) }}
                          className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                        >
                          <Eye size={15} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredBookings.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizes={PAGE_SIZES}
          itemName="settlements"
        />
      </div>
    </div>
  )
}

export default SettlementPendingGrid
