import React, { useState, useMemo, useCallback } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, Eye, CheckSquare, Send, CheckCircle } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import Pagination from '@/components/ui/Pagination'
import Button from '@/components/ui/Button'

const PAGE_SIZE = 10
const PAGE_SIZES = [5, 10, 25, 50]

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const SortableHeader = ({ title, sortKey, sortConfig, onSort }) => {
  const [open, setOpen] = useState(false)
  const currentSort = sortConfig?.key === sortKey ? sortConfig.direction : null

  const handleSort = (direction) => {
    onSort(sortKey, direction)
    setOpen(false)
  }

  return (
    <th className="px-4 py-3 relative text-left">
      <div className="flex items-center gap-1">
        <span>{title}</span>
        <button type="button" onClick={() => setOpen(!open)} className="p-0.5 rounded hover:bg-accent">
          {currentSort === 'asc' ? <ArrowUp size={14} /> : currentSort === 'desc' ? <ArrowDown size={14} /> : <ChevronsUpDown size={14} className="text-muted-foreground" />}
        </button>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg py-1 z-[100] min-w-[120px]">
            <button onClick={() => handleSort('asc')} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <ArrowUp size={14} /> Asc
            </button>
            <button onClick={() => handleSort('desc')} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <ArrowDown size={14} /> Desc
            </button>
          </div>
        </>
      )}
    </th>
  )
}

const STATUS_STYLES = {
  Verified: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Sent: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
}

const SettlementPendingTable = ({
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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)

  const handleSort = useCallback((key, direction) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === direction) {
        return { key: null, direction: null }
      }
      return { key, direction }
    })
  }, [])

  const getSortValue = useCallback((booking, key) => {
    switch (key) {
      case 'patient': return (booking.patientName || booking.user?.name || '').toLowerCase()
      case 'labOwner': return (booking.labOwner?.name || '').toLowerCase()
      case 'test': return (booking.test?.title || booking.package?.title || '').toLowerCase()
      case 'bookings': return 1
      case 'amount': return booking.paymentAmount || 0
      case 'labShare': return booking.labShare || 0
      case 'commission': return booking.systemCommission || 0
      case 'date': return booking.createdAt || ''
      case 'status': return (booking.labPaymentStatus || '').toLowerCase()
      default: return ''
    }
  }, [])

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase()
    return (bookings || []).filter((b) => {
      if (!term) return true
      return `${b.patientName || b.user?.name || ''} ${b.labOwner?.name || ''} ${b.test?.title || ''} ${b.package?.title || ''} ${b.settlementBatchId || ''} ${b.settlementUTR || ''}`.toLowerCase().includes(term)
    })
  }, [bookings, search])

  const sortedBookings = useMemo(() => {
    let result = filteredBookings
    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const aVal = getSortValue(a, sortConfig.key)
        const bVal = getSortValue(b, sortConfig.key)
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
        }
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }
    return result
  }, [filteredBookings, sortConfig, getSortValue])

  const totalPages = Math.max(1, Math.ceil(sortedBookings.length / pageSize))
  const visibleBookings = sortedBookings.slice((page - 1) * pageSize, page * pageSize)

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
      <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading settlements…</div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      {isAdmin && (
        <div className="flex items-center justify-end">
          <Button onClick={onBulkSettlement} variant="success" size="sm" className="flex items-center gap-2" disabled={selectedBookings.length === 0}>
            <CheckSquare size={14} />
            Bulk Settlement{selectedBookings.length > 0 && ` (${selectedBookings.length})`}
          </Button>
        </div>
      )}

      {/* Table */}
      {sortedBookings.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No pending settlements found.</div>
      ) : (
        <div className="rounded-xl border border-border bg-white">
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] pb-2 pr-1">
            <table className="w-full min-w-[1100px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground sticky top-0">
                <tr>
                  {isAdmin && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        className="rounded border-border"
                      />
                    </th>
                  )}
                  <SortableHeader title="Patient" sortKey="patient" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Lab Owner" sortKey="labOwner" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Test / Package" sortKey="test" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Bookings" sortKey="bookings" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Amount" sortKey="amount" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Lab Share" sortKey="labShare" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Commission" sortKey="commission" sortConfig={sortConfig} onSort={handleSort} />
                  <th className="px-4 py-3 text-left">UTR</th>
                  <SortableHeader title="Date" sortKey="date" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => {
                  const isSelected = selectedBookings.includes(booking._id)
                  return (
                    <tr key={booking._id} className={`border-t border-border transition hover:bg-accent/40 ${isSelected ? 'bg-primary/5' : ''}`}>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectBooking(booking._id)}
                            className="rounded border-border"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{booking.patientName || booking.user?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{booking.phone}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{booking.labOwner?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-foreground">{booking.test?.title || booking.package?.title || '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-foreground">1</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(booking.paymentAmount)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-foreground">{formatCurrency(booking.labShare)}</span>
                          <span className="text-xs text-muted-foreground ml-1">(85%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-foreground">{formatCurrency(booking.systemCommission)}</span>
                          <span className="text-xs text-muted-foreground ml-1">(15%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{booking.settlementUTR || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm text-foreground">{formatDate(booking.createdAt)}</span>
                          <span className="text-xs text-muted-foreground block">{formatTime(booking.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const statusStyle = STATUS_STYLES[booking.labPaymentStatus] || STATUS_STYLES.Pending
                          return (
                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                              {booking.labPaymentStatus || 'Pending'}
                            </span>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {isAdmin && (
                            <Tooltip title="Send Settlement" arrow placement="top">
                              <button
                                type="button"
                                onClick={() => onSendSettlement(booking)}
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
                                onClick={() => onVerifySettlement(booking)}
                                className="rounded p-1.5 text-muted-foreground hover:text-green-600 hover:bg-green-50 transition"
                              >
                                <CheckCircle size={15} />
                              </button>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details" arrow placement="top">
                            <button
                              type="button"
                              onClick={() => onViewDetails(booking)}
                              className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                            >
                              <Eye size={15} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sortedBookings.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizes={PAGE_SIZES}
          itemName="settlements"
        />
      </div>
    </div>
  )
}

export default SettlementPendingTable
