import React, { useState, useMemo, useCallback } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, Eye, Search, RefreshCw, CheckSquare } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import Pagination from '@/components/ui/Pagination'
import Button from '@/components/ui/Button'

const PAGE_SIZE = 10
const PAGE_SIZES = [10, 25, 50]

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

const SortableHeader = ({ title, sortKey, sortConfig, onSort, onHide }) => {
  const [open, setOpen] = useState(false)
  const currentSort = sortConfig?.key === sortKey ? sortConfig.direction : null

  const handleSort = (direction) => {
    onSort(sortKey, direction)
    setOpen(false)
  }

  return (
    <th className="px-4 py-3 relative">
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
            {onHide && (
              <button onClick={() => { onHide(); setOpen(false) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                <EyeOff size={14} /> Hide
              </button>
            )}
          </div>
        </>
      )}
    </th>
  )
}

const SettlementPendingTable = ({
  bookings,
  isLoading,
  search,
  setSearch,
  onRefresh,
  onBulkSettlement,
  onViewDetails,
  isAdmin,
  selectedBookings,
  setSelectedBookings,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [hiddenColumns, setHiddenColumns] = useState({})
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
      {/* Search and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Lab / Batch ID / UTR Number"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw size={14} />
            Refresh
          </Button>
          {isAdmin && selectedBookings.length > 0 && (
            <Button onClick={onBulkSettlement} variant="success" size="sm" className="flex items-center gap-2">
              <CheckSquare size={14} />
              Bulk Settlement ({selectedBookings.length})
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      {sortedBookings.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No pending settlements found.</div>
      ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-400px)] pb-2 pr-1">
          <div className="rounded-xl border border-border bg-white">
            <table className="w-full min-w-[1000px] text-sm">
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
                  <SortableHeader title="Patient" sortKey="patient" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, patient: true }))} />
                  <SortableHeader title="Lab Owner" sortKey="labOwner" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, labOwner: true }))} />
                  <SortableHeader title="Test / Package" sortKey="test" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, test: true }))} />
                  <SortableHeader title="Amount" sortKey="amount" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, amount: true }))} />
                  <SortableHeader title="Lab Share" sortKey="labShare" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, labShare: true }))} />
                  <SortableHeader title="Commission" sortKey="commission" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, commission: true }))} />
                  <th className="px-4 py-3">UTR</th>
                  <SortableHeader title="Date" sortKey="date" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, date: true }))} />
                  <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, status: true }))} />
                  <th className="px-4 py-3">Action</th>
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
                      {!hiddenColumns.patient && (
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-foreground">{booking.patientName || booking.user?.name || '—'}</p>
                            <p className="text-xs text-muted-foreground">{booking.phone}</p>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.labOwner && (
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">{booking.labOwner?.name || '—'}</span>
                        </td>
                      )}
                      {!hiddenColumns.test && (
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">{booking.test?.title || booking.package?.title || '—'}</span>
                        </td>
                      )}
                      {!hiddenColumns.amount && (
                        <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(booking.paymentAmount)}</td>
                      )}
                      {!hiddenColumns.labShare && (
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-foreground">{formatCurrency(booking.labShare)}</span>
                            <span className="text-xs text-muted-foreground ml-1">(85%)</span>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.commission && (
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-foreground">{formatCurrency(booking.systemCommission)}</span>
                            <span className="text-xs text-muted-foreground ml-1">(15%)</span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{booking.settlementUTR || '—'}</span>
                      </td>
                      {!hiddenColumns.date && (
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm text-foreground">{formatDate(booking.createdAt)}</span>
                            <span className="text-xs text-muted-foreground block">{formatTime(booking.createdAt)}</span>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.status && (
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            {booking.labPaymentStatus || 'Pending'}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <Tooltip title="View Details" arrow placement="top">
                          <button
                            type="button"
                            onClick={() => onViewDetails(booking)}
                            className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                          >
                            <Eye size={15} />
                          </button>
                        </Tooltip>
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
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {Math.min((page - 1) * pageSize + 1, sortedBookings.length)} to {Math.min(page * pageSize, sortedBookings.length)} of {sortedBookings.length} results
        </p>
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
