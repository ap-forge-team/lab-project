import React, { useState, useMemo, useCallback } from 'react'
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, MapPin, Route, MapPinCheck, Microscope, Banknote, Download, MoreVertical } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import Pagination from '@/components/ui/Pagination'
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'

const PAGE_SIZE = 10
const PAGE_SIZES = [10, 25, 50]

const STATUS_STYLES = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Assigned: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  Reached: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
  'Sample Collected': { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  Rescheduled: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
}

const PAYMENT_STYLES = {
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Unpaid: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Failed: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
}

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-pink-500',
]

const getAvatarColor = (name) => {
  const str = String(name || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
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

const MobileBookingCard = ({ booking, handleReached, openSampleModal, openNavigation, handlePayment, setPreviewReport }) => {
  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending
  const paymentStyle = PAYMENT_STYLES[booking.paymentStatus] || PAYMENT_STYLES.Pending
  const isReachDisabled = booking.status !== BOOKING_STATUS.ASSIGNED
  const isSampleDisabled = booking.status !== BOOKING_STATUS.REACHED
  const isPayDisabled = booking.status !== BOOKING_STATUS.SAMPLE_COLLECTED || booking.paymentStatus === PAYMENT_STATUS.PAID

  return (
    <article className="flex flex-col rounded-xl border border-border bg-white shadow-sm overflow-hidden">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(booking.patientName)} text-white font-semibold text-xs`}>
              {getInitials(booking.patientName)}
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate" title={booking.patientName}>{booking.patientName}</h3>
              <p className="text-xs text-muted-foreground">{booking.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
              {booking.status}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-4 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">₹{(booking.test?.price || booking.package?.price || 0).toLocaleString('en-IN')}</span>
          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${paymentStyle.dot}`}></span>
            {booking.paymentStatus}
          </span>
        </div>
        <dl className="mt-3 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Test</span>
            <span className="font-medium text-foreground text-right max-w-[180px] truncate">{booking.test?.title || booking.package?.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="text-foreground">{booking.bookingDate} {booking.bookingTime}</span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-muted-foreground shrink-0">Address</span>
            <span className="text-foreground text-right line-clamp-2">{booking.address || '—'}</span>
          </div>
        </dl>
        <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => openNavigation(booking)} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition" title="Navigate">
              <Route size={14} />
            </button>
            <button type="button" onClick={() => handleReached(booking._id)} disabled={isReachDisabled} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Mark Reached">
              <MapPinCheck size={14} />
            </button>
            <button type="button" onClick={() => openSampleModal(booking)} disabled={isSampleDisabled} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Collect Sample">
              <Microscope size={14} />
            </button>
            <button type="button" onClick={() => handlePayment(booking)} disabled={isPayDisabled} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed" title="Collect Payment">
              <Banknote size={14} />
            </button>
            <button type="button" onClick={() => booking.report && setPreviewReport(booking.report)} disabled={!booking.report} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed" title="View Report">
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

const LabAssistantBookingsTable = ({
  filteredBookings,
  handleReached,
  openSampleModal,
  openNavigation,
  handlePayment,
  setPreviewReport,
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
      case 'patient': return (booking.patientName || '').toLowerCase()
      case 'test': return (booking.test?.title || booking.package?.title || '').toLowerCase()
      case 'date': return booking.bookingDate || ''
      case 'status': return (booking.status || '').toLowerCase()
      case 'payment': return (booking.paymentStatus || '').toLowerCase()
      default: return ''
    }
  }, [])

  const sortedBookings = useMemo(() => {
    let result = filteredBookings || []
    if (sortConfig.key && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const aVal = getSortValue(a, sortConfig.key)
        const bVal = getSortValue(b, sortConfig.key)
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortConfig.direction === 'asc' ? comparison : -comparison
      })
    }
    return result
  }, [filteredBookings, sortConfig, getSortValue])

  const totalPages = Math.max(1, Math.ceil(sortedBookings.length / pageSize))
  const visibleBookings = sortedBookings.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      {filteredBookings.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No bookings found.</div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-4">
            {visibleBookings.map((booking) => (
              <MobileBookingCard
                key={booking._id}
                booking={booking}
                handleReached={handleReached}
                openSampleModal={openSampleModal}
                openNavigation={openNavigation}
                handlePayment={handlePayment}
                setPreviewReport={setPreviewReport}
              />
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-y-auto max-h-[calc(100vh-250px)] pb-2 pr-1">
            <div className="rounded-xl border border-border bg-white">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="bg-accent text-left text-muted-foreground sticky top-0">
                  <tr>
                    <SortableHeader title="Patient" sortKey="patient" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, patient: true }))} />
                    <SortableHeader title="Test" sortKey="test" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, test: true }))} />
                    <SortableHeader title="Date" sortKey="date" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, date: true }))} />
                    <th className="px-4 py-3">Address</th>
                    <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, status: true }))} />
                    <SortableHeader title="Payment" sortKey="payment" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, payment: true }))} />
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBookings.map((booking) => {
                    const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending
                    const paymentStyle = PAYMENT_STYLES[booking.paymentStatus] || PAYMENT_STYLES.Pending
                    const isReachDisabled = booking.status !== BOOKING_STATUS.ASSIGNED
                    const isSampleDisabled = booking.status !== BOOKING_STATUS.REACHED
                    const isPayDisabled = booking.status !== BOOKING_STATUS.SAMPLE_COLLECTED || booking.paymentStatus === PAYMENT_STATUS.PAID
                    return (
                      <tr key={booking._id} className="border-t border-border transition hover:bg-accent/40">
                        {!hiddenColumns.patient && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getAvatarColor(booking.patientName)} text-white font-semibold text-[10px]`}>
                                {getInitials(booking.patientName)}
                              </span>
                              <div>
                                <h3 className="text-sm font-medium text-foreground">{booking.patientName}</h3>
                                <p className="text-[11px] text-muted-foreground">{booking.phone}</p>
                              </div>
                            </div>
                          </td>
                        )}
                        {!hiddenColumns.test && (
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{booking.test?.title || booking.package?.title}</p>
                              <p className="font-mono text-xs font-bold text-primary mt-0.5">₹{booking.test?.price || booking.package?.price}</p>
                            </div>
                          </td>
                        )}
                        {!hiddenColumns.date && (
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{booking.bookingDate}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{booking.bookingTime}</p>
                            </div>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 items-start max-w-[200px]">
                            <MapPin className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                            <span className="text-[12px] text-muted-foreground line-clamp-2">{booking.address || 'No address'}</span>
                          </div>
                        </td>
                        {!hiddenColumns.status && (
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                              {booking.status}
                            </span>
                          </td>
                        )}
                        {!hiddenColumns.payment && (
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${paymentStyle.dot}`}></span>
                              {booking.paymentStatus}
                            </span>
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="relative flex items-center gap-1">
                            <Tooltip title="Navigate" arrow placement="top">
                              <button type="button" onClick={() => openNavigation(booking)} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition">
                                <Route size={15} />
                              </button>
                            </Tooltip>
                            <Tooltip title="Mark Reached" arrow placement="top">
                              <button type="button" onClick={() => handleReached(booking._id)} disabled={isReachDisabled} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                <MapPinCheck size={15} />
                              </button>
                            </Tooltip>
                            <Tooltip title="Collect Sample" arrow placement="top">
                              <button type="button" onClick={() => openSampleModal(booking)} disabled={isSampleDisabled} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                <Microscope size={15} />
                              </button>
                            </Tooltip>
                            <Tooltip title="Collect Payment" arrow placement="top">
                              <button type="button" onClick={() => handlePayment(booking)} disabled={isPayDisabled} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                <Banknote size={15} />
                              </button>
                            </Tooltip>
                            <Tooltip title="View Report" arrow placement="top">
                              <button type="button" onClick={() => booking.report && setPreviewReport(booking.report)} disabled={!booking.report} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition disabled:opacity-50 disabled:cursor-not-allowed">
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
        </>
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
          itemName="bookings"
        />
      </div>
    </div>
  )
}

export default LabAssistantBookingsTable
