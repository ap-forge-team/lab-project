import React, { useMemo, useState, useCallback } from 'react'
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Eye,
  FlaskConical,
  Grid2X2,
  List,
  MapPin,
  Pencil,
  Search,
  User,
  XCircle,
  MoreVertical,
  Download,
} from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import Can from '@/components/Can'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'

const PAGE_SIZE = 12
const PAGE_SIZES = [12, 24, 48]

const STATUS_STYLES = {
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Assigned: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  Reached: { bg: 'bg-indigo-50', text: 'text-indigo-600', dot: 'bg-indigo-500' },
  'Sample Collected': { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  Processing: { bg: 'bg-cyan-50', text: 'text-cyan-600', dot: 'bg-cyan-500' },
  'Report Ready': { bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-500' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Cancelled: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  Rescheduled: { bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500' },
}

const PAYMENT_STYLES = {
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600' },
  Unpaid: { bg: 'bg-amber-50', text: 'text-amber-600' },
  Failed: { bg: 'bg-red-50', text: 'text-red-600' },
  Refunded: { bg: 'bg-gray-50', text: 'text-gray-600' },
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

const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.Pending
const getPaymentStyle = (status) => PAYMENT_STYLES[status] || PAYMENT_STYLES.Pending

const StatCard = ({ icon: Icon, iconClass, title, value, detail }) => (
  <div className="rounded-xl border border-border bg-white p-3 shadow-sm sm:p-4">
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>{React.createElement(Icon, { size: 20 })}</span>
      <div><p className="text-xs text-muted-foreground">{title}</p><p className="mt-0.5 text-xl font-bold text-foreground">{value}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p></div>
    </div>
  </div>
)

const BookingDetailsModal = ({ booking, onClose }) => {
  if (!booking) return null
  const statusStyle = getStatusStyle(booking.status)
  const paymentStyle = getPaymentStyle(booking.paymentStatus)
  return (
    <Modal open={!!booking} title="Booking Details" onClose={onClose} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(booking.patientName)} text-white font-semibold text-sm`}>
            {getInitials(booking.patientName)}
          </span>
          <div>
            <p className="font-semibold text-foreground">{booking.patientName}</p>
            <p className="text-xs text-muted-foreground">{booking.phone}</p>
          </div>
        </div>
        <div className="divide-y divide-border border-t border-border">
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Test / Package</span><span className="font-medium text-foreground">{booking.test?.title || booking.package?.title || 'N/A'}</span></div>
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Amount</span><span className="font-medium text-foreground">₹{(booking.totalAmount || booking.test?.price || booking.package?.price || 0).toLocaleString('en-IN')}</span></div>
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Booking Date</span><span className="font-medium text-foreground">{booking.bookingDate}</span></div>
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Booking Time</span><span className="font-medium text-foreground">{booking.bookingTime}</span></div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>{booking.status}
            </span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>{booking.paymentStatus}</span>
          </div>
          {booking.labOwner && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">Assigned Lab</span>
              <span className="font-medium text-foreground text-right">{booking.labOwner.name}</span>
            </div>
          )}
          {booking.address && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">Address</span>
              <span className="font-medium text-foreground text-right max-w-[200px]">{booking.address}, {booking.city} - {booking.pincode}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

const BookingsManagePage = ({ bookings, isLoading, isError, onRefresh }) => {
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)

  const completedBookings = useMemo(() => bookings.filter((b) => b.status === 'Completed'), [bookings])
  const inProgressBookings = useMemo(() => bookings.filter((b) => !['Completed', 'Cancelled'].includes(b.status)), [bookings])
  const sampleCollectedBookings = useMemo(() => bookings.filter((b) => b.status === 'Sample Collected'), [bookings])
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === 'Cancelled'), [bookings])

  const filterCategories = useMemo(() => {
    const patientOptions = [...new Set(bookings.map((b) => b.patientName).filter(Boolean))].map((n) => ({ value: n, label: n }))
    return [
      {
        key: 'patientName',
        label: 'Patient',
        type: 'search-checkbox',
        searchPlaceholder: 'Search patients...',
        options: patientOptions,
      },
      {
        key: 'status',
        label: 'Status',
        type: 'checkbox',
        options: [
          { value: 'Pending', label: 'Pending' },
          { value: 'Assigned', label: 'Assigned' },
          { value: 'Reached', label: 'Reached' },
          { value: 'Sample Collected', label: 'Sample Collected' },
          { value: 'Completed', label: 'Completed' },
          { value: 'Cancelled', label: 'Cancelled' },
          { value: 'Rescheduled', label: 'Rescheduled' },
        ],
      },
      {
        key: 'paymentStatus',
        label: 'Payment',
        type: 'checkbox',
        options: [
          { value: 'Paid', label: 'Paid' },
          { value: 'Pending', label: 'Pending' },
          { value: 'Failed', label: 'Failed' },
          { value: 'Refunded', label: 'Refunded' },
        ],
      },
    ]
  }, [bookings])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      return count
    }, 0)
  }, [activeFilters])

  const handleApplyFilters = useCallback((filters) => {
    setActiveFilters(filters)
    setPage(1)
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return bookings.filter((booking) => {
      const matchesSearch = !term || `${booking.patientName || ''} ${booking.phone || ''} ${booking.test?.title || ''} ${booking.package?.title || ''}`.toLowerCase().includes(term)
      if (!matchesSearch) return false
      if (activeFilters.patientName?.length && !activeFilters.patientName.includes(booking.patientName)) return false
      if (activeFilters.status?.length && !activeFilters.status.includes(booking.status)) return false
      if (activeFilters.paymentStatus?.length && !activeFilters.paymentStatus.includes(booking.paymentStatus)) return false
      return true
    })
  }, [bookings, search, activeFilters])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleBookings = filtered.slice((page - 1) * pageSize, page * pageSize)
  const pageNumbers = totalPages <= 5
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [1, 2, 3, 'ellipsis', totalPages]

  const getBookingId = (b, index) => b._id || b.id || `${b.patientName}-${index}`
  const selectedBooking = visibleBookings.find((b, index) => getBookingId(b, index) === selectedBookingId) || null

  const handleViewReport = useCallback((booking) => {
    if (booking.report) {
      window.open(booking.report, '_blank')
    } else {
      toast.info('No report available for this booking')
    }
  }, [])

  return (
    <section className="mx-auto max-w-[1500px] space-y-4 lg:space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage all test bookings and their status</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by patient, phone, test..." className="pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-72" />
          </div>
          <FilterButton
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
            }}
            activeCount={activeFilterCount}
          />
          <div className="flex items-center rounded-lg border border-border p-1">
            <Tooltip title="Grid View" arrow placement="top">
              <button type="button" aria-label="Grid view" onClick={() => { setView('grid'); setSelectedBookingId(null) }} className={`rounded p-1.5 ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
            </Tooltip>
            <Tooltip title="List View" arrow placement="top">
              <button type="button" aria-label="List view" onClick={() => setView('list')} className={`rounded p-1.5 ${view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={Calendar} iconClass="bg-blue-50 text-primary" title="Total Bookings" value={bookings.length} detail="All time" />
        <StatCard icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-500" title="Completed" value={completedBookings.length} detail={bookings.length ? `${((completedBookings.length / bookings.length) * 100).toFixed(1)}% of total` : '0% of total'} />
        <StatCard icon={Clock} iconClass="bg-amber-50 text-amber-500" title="In Progress" value={inProgressBookings.length} detail={bookings.length ? `${((inProgressBookings.length / bookings.length) * 100).toFixed(1)}% of total` : '0% of total'} />
        <StatCard icon={FlaskConical} iconClass="bg-purple-50 text-purple-500" title="Sample Collected" value={sampleCollectedBookings.length} detail={bookings.length ? `${((sampleCollectedBookings.length / bookings.length) * 100).toFixed(1)}% of total` : '0% of total'} />
        <StatCard icon={XCircle} iconClass="bg-red-50 text-red-500" title="Cancelled" value={cancelledBookings.length} detail={bookings.length ? `${((cancelledBookings.length / bookings.length) * 100).toFixed(1)}% of total` : '0% of total'} />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading bookings…</div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load bookings. Please try again.</div>
      ) : visibleBookings.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No bookings match the selected filters.</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {visibleBookings.map((booking, index) => {
            const id = getBookingId(booking, index)
            const statusStyle = getStatusStyle(booking.status)
            const paymentStyle = getPaymentStyle(booking.paymentStatus)
            const testName = booking.test?.title || booking.package?.title || 'N/A'
            const amount = booking.totalAmount || booking.test?.price || booking.package?.price || 0
            return (
              <article key={id} className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md overflow-hidden">
                {/* Header with avatar */}
                <div className="p-4 pb-0">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(booking.patientName)} text-white font-semibold text-xs`}>
                      {getInitials(booking.patientName)}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm truncate" title={booking.patientName}>{booking.patientName}</h3>
                      <p className="text-xs text-muted-foreground">{booking.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4 pt-3">
                  <h4 className="font-medium text-foreground text-sm leading-snug" title={testName}>{testName}</h4>

                  <div className="mt-2">
                    <span className="text-lg font-bold text-foreground">₹{amount.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Details */}
                  <dl className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={12} />
                      <span>{booking.bookingDate}</span>
                      <span className="text-border">•</span>
                      <Clock size={12} />
                      <span>{booking.bookingTime}</span>
                    </div>
                    {booking.labOwner && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin size={12} />
                        <span className="truncate">{booking.labOwner.name}</span>
                      </div>
                    )}
                  </dl>

                  {/* Badges */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                      {booking.status}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>
                      {booking.paymentStatus}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      NABL Accredited Labs
                    </span>
                    <div className="flex items-center gap-1">
                      <Tooltip title="View" arrow placement="top">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedBookingId(id) }} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Eye size={14} /></button>
                      </Tooltip>
                      {booking.report && (
                        <Tooltip title="View Report" arrow placement="top">
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleViewReport(booking) }} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Download size={14} /></button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-accent text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Test / Package</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Lab</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.map((booking, index) => {
                const id = getBookingId(booking, index)
                const statusStyle = getStatusStyle(booking.status)
                const paymentStyle = getPaymentStyle(booking.paymentStatus)
                const amount = booking.totalAmount || booking.test?.price || booking.package?.price || 0
                return (
                  <tr key={id} onClick={() => setSelectedBookingId(id)} className="cursor-pointer border-t border-border transition hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getAvatarColor(booking.patientName)} text-white font-semibold text-[10px]`}>
                          {getInitials(booking.patientName)}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{booking.patientName}</p>
                          <p className="text-xs text-muted-foreground">{booking.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{booking.test?.title || booking.package?.title || 'N/A'}</td>
                    <td className="px-4 py-3"><span className="text-foreground">{booking.bookingDate}</span><br /><span className="text-xs text-muted-foreground">{booking.bookingTime}</span></td>
                    <td className="px-4 py-3 font-medium text-foreground">₹{amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>{booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>{booking.paymentStatus}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{booking.labOwner?.name || '—'}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative">
                        <button type="button" onClick={(e) => { e.stopPropagation(); if (menuOpen?.id === id) { setMenuOpen(null) } else { const rect = e.currentTarget.getBoundingClientRect(); setMenuOpen({ id, booking, top: rect.bottom + 4, left: rect.right - 140 }) } }} className="p-1.5 text-muted-foreground hover:text-foreground rounded transition">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBookingId(null)} />
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 pb-2 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} bookings</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="Previous page" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-border p-2 transition hover:bg-accent disabled:opacity-40"><ChevronLeft size={17} /></button>
            {pageNumbers.map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`} className="px-1">…</span> : <button key={item} type="button" onClick={() => setPage(item)} className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 font-medium transition ${page === item ? 'bg-primary text-white' : 'hover:bg-accent text-foreground'}`}>{item}</button>)}
            <button type="button" aria-label="Next page" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-lg border border-border p-2 transition hover:bg-accent disabled:opacity-40"><ChevronRight size={17} /></button>
            <select aria-label="Bookings per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="ml-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
              {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} per page</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {filterPanelOpen && (
        <FilterPanel
          isOpen={true}
          onClose={() => setFilterPanelOpen(null)}
          onApply={handleApplyFilters}
          position={filterPanelOpen}
          title="Filters"
          categories={filterCategories}
          activeFilters={activeFilters}
        />
      )}

      {/* Context Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setMenuOpen(null)} />
          <div className="fixed bg-white border border-border rounded-lg shadow-lg py-1 z-[100] min-w-[140px]" style={{ top: menuOpen.top, left: menuOpen.left }}>
            <button onClick={(e) => { e.stopPropagation(); setSelectedBookingId(menuOpen.id); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Eye size={14} /> View
            </button>
            {menuOpen.booking?.report && (
              <button onClick={(e) => { e.stopPropagation(); handleViewReport(menuOpen.booking); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                <Download size={14} /> View Report
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default BookingsManagePage
