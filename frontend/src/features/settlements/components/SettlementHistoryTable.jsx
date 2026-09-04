import React, { useState, useMemo, useCallback } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, Eye, Download } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import Pagination from '@/components/ui/Pagination'

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

const STATUS_STYLES = {
  Verified: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Sent: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
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

const SettlementHistoryTable = ({ history, isLoading, activeFilters, onViewDetails, onDownload }) => {
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

  const getSortValue = useCallback((item, key) => {
    switch (key) {
      case 'settlementId': return (item.settlementBatchId || '').toLowerCase()
      case 'labOwner': return (item.labOwner?.name || '').toLowerCase()
      case 'totalAmount': return item.totalAmount || 0
      case 'commission': return item.commission || 0
      case 'netPayable': return item.netPayable || item.labShare || 0
      case 'utr': return (item.settlementUTR || item.utr || '').toLowerCase()
      case 'paidOn': return item.paidAt || item.settledAt || item.createdAt || ''
      case 'status': return (item.status || '').toLowerCase()
      default: return ''
    }
  }, [])

  const filteredHistory = useMemo(() => {
    let result = history || []

    if (activeFilters?.labOwner?.length) {
      result = result.filter((item) => activeFilters.labOwner.includes(item.labOwner?._id || item.labOwner?.id))
    }

    if (activeFilters?.dateRange?.start) {
      const start = new Date(activeFilters.dateRange.start)
      result = result.filter((item) => {
        const itemDate = new Date(item.paidAt || item.settledAt || item.createdAt)
        return itemDate >= start
      })
    }

    if (activeFilters?.dateRange?.end) {
      const end = new Date(activeFilters.dateRange.end)
      end.setHours(23, 59, 59, 999)
      result = result.filter((item) => {
        const itemDate = new Date(item.paidAt || item.settledAt || item.createdAt)
        return itemDate <= end
      })
    }

    if (activeFilters?.totalAmount?.min) {
      const min = Number(activeFilters.totalAmount.min)
      result = result.filter((item) => (item.totalAmount || 0) >= min)
    }

    if (activeFilters?.totalAmount?.max) {
      const max = Number(activeFilters.totalAmount.max)
      result = result.filter((item) => (item.totalAmount || 0) <= max)
    }

    if (activeFilters?.commission?.min) {
      const min = Number(activeFilters.commission.min)
      result = result.filter((item) => (item.commission || 0) >= min)
    }

    if (activeFilters?.commission?.max) {
      const max = Number(activeFilters.commission.max)
      result = result.filter((item) => (item.commission || 0) <= max)
    }

    if (activeFilters?.netPayable?.min) {
      const min = Number(activeFilters.netPayable.min)
      result = result.filter((item) => ((item.netPayable || item.labShare) || 0) >= min)
    }

    if (activeFilters?.netPayable?.max) {
      const max = Number(activeFilters.netPayable.max)
      result = result.filter((item) => ((item.netPayable || item.labShare) || 0) <= max)
    }

    if (activeFilters?.utr) {
      const term = activeFilters.utr.toLowerCase()
      result = result.filter((item) => {
        const utr = (item.settlementUTR || item.utr || '').toLowerCase()
        return utr.includes(term)
      })
    }

    return result
  }, [history, activeFilters])

  const sortedHistory = useMemo(() => {
    let result = filteredHistory
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
  }, [filteredHistory, sortConfig, getSortValue])

  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / pageSize))
  const visibleHistory = sortedHistory.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading history…</div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recent Settlement History Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Recent Settlement History</h3>
        <button className="text-sm text-primary hover:underline">View All</button>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No settlement history found.</div>
      ) : (
        <div className="rounded-xl border border-border bg-white">
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] pb-2 pr-1">
            <table className="w-full min-w-[1000px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground sticky top-0">
                <tr>
                  <SortableHeader title="Settlement ID" sortKey="settlementId" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Lab Owner" sortKey="labOwner" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Total Amount" sortKey="totalAmount" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Commission" sortKey="commission" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Net Payable" sortKey="netPayable" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="UTR Number" sortKey="utr" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Paid On" sortKey="paidOn" sortConfig={sortConfig} onSort={handleSort} />
                  <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} />
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map((item) => {
                  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.Pending
                  return (
                    <tr key={item._id} className="border-t border-border transition hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <span className="font-medium text-primary">{item.settlementBatchId || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-foreground">{item.labOwner?.name || '—'}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(item.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="font-medium text-foreground">{formatCurrency(item.commission)}</span>
                          <span className="text-xs text-muted-foreground ml-1">(15%)</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(item.netPayable || item.labShare)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground font-mono">{item.settlementUTR || item.utr || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="text-sm text-foreground">{formatDate(item.paidAt || item.settledAt)}</span>
                          <span className="text-xs text-muted-foreground block">{formatTime(item.paidAt || item.settledAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Tooltip title="View Details" arrow placement="top">
                            <button
                              type="button"
                              onClick={() => onViewDetails(item)}
                              className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                            >
                              <Eye size={15} />
                            </button>
                          </Tooltip>
                          <Tooltip title="Download" arrow placement="top">
                            <button
                              type="button"
                              onClick={() => onDownload?.(item)}
                              className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                            >
                              <Download size={15} />
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
          totalItems={sortedHistory.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizes={PAGE_SIZES}
          itemName="settlements"
        />
      </div>
    </div>
  )
}

export default SettlementHistoryTable
