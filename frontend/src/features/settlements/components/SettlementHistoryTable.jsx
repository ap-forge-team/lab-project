import React, { useState, useMemo, useCallback } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, Eye, Download, Search } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import Pagination from '@/components/ui/Pagination'

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

const STATUS_STYLES = {
  Verified: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Sent: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
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

const SettlementHistoryTable = ({ history, isLoading, onViewDetails, onDownload }) => {
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

  const getSortValue = useCallback((item, key) => {
    switch (key) {
      case 'settlementId': return (item.settlementBatchId || '').toLowerCase()
      case 'labOwner': return (item.labOwner?.name || '').toLowerCase()
      case 'totalAmount': return item.totalAmount || 0
      case 'commission': return item.commission || 0
      case 'labShare': return item.labShare || 0
      case 'utr': return (item.utr || '').toLowerCase()
      case 'date': return item.settledAt || ''
      case 'status': return (item.status || '').toLowerCase()
      default: return ''
    }
  }, [])

  const sortedHistory = useMemo(() => {
    let result = history || []
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
  }, [history, sortConfig, getSortValue])

  const totalPages = Math.max(1, Math.ceil(sortedHistory.length / pageSize))
  const visibleHistory = sortedHistory.slice((page - 1) * pageSize, page * pageSize)

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading history…</div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedHistory.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No settlement history found.</div>
      ) : (
        <div className="overflow-y-auto max-h-[calc(100vh-400px)] pb-2 pr-1">
          <div className="rounded-xl border border-border bg-white">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground sticky top-0">
                <tr>
                  <SortableHeader title="Settlement ID" sortKey="settlementId" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, settlementId: true }))} />
                  <SortableHeader title="Lab Owner" sortKey="labOwner" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, labOwner: true }))} />
                  <SortableHeader title="Total Amount" sortKey="totalAmount" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, totalAmount: true }))} />
                  <SortableHeader title="Commission" sortKey="commission" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, commission: true }))} />
                  <SortableHeader title="Net Payable" sortKey="labShare" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, labShare: true }))} />
                  <SortableHeader title="UTR Number" sortKey="utr" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, utr: true }))} />
                  <SortableHeader title="Paid On" sortKey="date" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, date: true }))} />
                  <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns((p) => ({ ...p, status: true }))} />
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleHistory.map((item) => {
                  const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.Pending
                  return (
                    <tr key={item._id} className="border-t border-border transition hover:bg-accent/40">
                      {!hiddenColumns.settlementId && (
                        <td className="px-4 py-3">
                          <span className="font-medium text-primary">{item.settlementBatchId || '—'}</span>
                        </td>
                      )}
                      {!hiddenColumns.labOwner && (
                        <td className="px-4 py-3">
                          <span className="text-foreground">{item.labOwner?.name || '—'}</span>
                        </td>
                      )}
                      {!hiddenColumns.totalAmount && (
                        <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(item.totalAmount)}</td>
                      )}
                      {!hiddenColumns.commission && (
                        <td className="px-4 py-3">
                          <div>
                            <span className="font-medium text-foreground">{formatCurrency(item.commission)}</span>
                            <span className="text-xs text-muted-foreground ml-1">(15%)</span>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.labShare && (
                        <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(item.labShare)}</td>
                      )}
                      {!hiddenColumns.utr && (
                        <td className="px-4 py-3">
                          <span className="text-xs text-muted-foreground font-mono">{item.utr || '—'}</span>
                        </td>
                      )}
                      {!hiddenColumns.date && (
                        <td className="px-4 py-3">
                          <div>
                            <span className="text-sm text-foreground">{formatDate(item.settledAt)}</span>
                            <span className="text-xs text-muted-foreground block">{formatTime(item.settledAt)}</span>
                          </div>
                        </td>
                      )}
                      {!hiddenColumns.status && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                            {item.status}
                          </span>
                        </td>
                      )}
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
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Showing {Math.min((page - 1) * pageSize + 1, sortedHistory.length)} to {Math.min(page * pageSize, sortedHistory.length)} of {sortedHistory.length} results
        </p>
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
