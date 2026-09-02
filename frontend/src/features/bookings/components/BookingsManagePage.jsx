import React, { useMemo, useState, useCallback, useEffect } from 'react'
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
  CircleUser,
  Route,
  MapPinCheck,
  Microscope,
  Banknote,
} from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import Can from '@/components/Can'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'
import { updateBookingLab, assignAssistant, markReached } from '@/services/booking.service'
import { getAllLabOwners, getMyAssistants } from '@/services/user.service'

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

const ASSISTANT_STATUS_STYLES = {
  [BOOKING_STATUS.COMPLETED]: "bg-green-50 text-green-700",
  [BOOKING_STATUS.PENDING]: "bg-primary/10 text-primary",
  [BOOKING_STATUS.CANCELLED]: "bg-red-100 text-red-700",
  [BOOKING_STATUS.RESCHEDULED]: "bg-primary/10 text-primary",
  [BOOKING_STATUS.ASSIGNED]: "bg-primary/10 text-primary",
  [BOOKING_STATUS.REACHED]: "bg-accent text-secondary",
  [BOOKING_STATUS.SAMPLE_COLLECTED]: "bg-accent text-secondary",
  [PAYMENT_STATUS.PAID]: "bg-green-50 text-green-700",
  [PAYMENT_STATUS.UNPAID]: "bg-red-100 text-red-700",
  [PAYMENT_STATUS.FAILED]: "bg-red-100 text-red-700",
}

const AssistantStatusBadge = ({ status }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block ${
      ASSISTANT_STATUS_STYLES[status] || "bg-primary/10 text-muted-foreground"
    }`}
  >
    {status}
  </span>
)

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

const BookingsManagePage = ({ bookings, isLoading, isError, onRefresh, user: userProp }) => {
  const { user: authUser } = useAuth()
  const user = userProp || authUser
  const isAdmin = user?.role === ROLES.ADMIN
  const isLabAssistant = user?.role === ROLES.LAB_ASSISTANT
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState(null)
  const [selectedLab, setSelectedLab] = useState('')
  const [labOwners, setLabOwners] = useState([])
  const [savingLab, setSavingLab] = useState(false)
  const [assistants, setAssistants] = useState([])
  const [markingReachedId, setMarkingReachedId] = useState(null)

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

  const openEditModal = useCallback((booking) => {
    setSelectedBookingForEdit(booking)
    setSelectedLab(booking.labOwner?._id || '')
    setShowEditModal(true)
  }, [])

  const handleUpdateLab = useCallback(async () => {
    if (!selectedBookingForEdit || !selectedLab) return
    try {
      setSavingLab(true)
      await updateBookingLab(selectedBookingForEdit._id, selectedLab)
      toast.success('Lab updated successfully')
      setShowEditModal(false)
      setSelectedBookingForEdit(null)
      setSelectedLab('')
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update lab')
    } finally {
      setSavingLab(false)
    }
  }, [selectedBookingForEdit, selectedLab, onRefresh])

  useEffect(() => {
    if (showEditModal && isAdmin) {
      getAllLabOwners()
        .then(({ data }) => {
          const list = data?.data || data?.labOwners || data || []
          setLabOwners(Array.isArray(list) ? list : [])
        })
        .catch(() => setLabOwners([]))
    }
  }, [showEditModal, isAdmin])

  useEffect(() => {
    getMyAssistants()
      .then(({ data }) => {
        const list = data?.data || data || []
        setAssistants(Array.isArray(list) ? list : [])
      })
      .catch(() => setAssistants([]))
  }, [])

  const handleAssignAssistant = useCallback(async (bookingId, assistantId) => {
    if (!assistantId) return
    try {
      const { data } = await assignAssistant(bookingId, assistantId)
      toast.success(data?.message || 'Assistant assigned successfully')
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to assign assistant')
    }
  }, [onRefresh])

  const handleMarkReached = useCallback(async (bookingId) => {
    setMarkingReachedId(bookingId)
    try {
      const { data } = await markReached(bookingId)
      toast.success(data?.message || 'Marked as reached successfully')
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to mark as reached')
    } finally {
      setMarkingReachedId(null)
    }
  }, [onRefresh])

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
                {isLabAssistant ? (
                  <>
                    {/* Header with avatar */}
                    <div className="p-4 pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <CircleUser className="text-primary" size={20} />
                        </div>
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
                        <span className="font-mono text-sm font-bold text-primary">₹{(booking.test?.price || booking.package?.price || 0).toLocaleString('en-IN')}</span>
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
                        {booking.address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin size={12} className="text-red-500 shrink-0" />
                            <span className="truncate">{booking.address}</span>
                          </div>
                        )}
                      </dl>

                      {/* Badges */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <AssistantStatusBadge status={booking.status} />
                        <AssistantStatusBadge status={booking.paymentStatus} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                          {isAdmin && (
                            <Tooltip title="Edit Lab" arrow placement="top">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openEditModal(booking)
                                }}
                                disabled={booking.status === BOOKING_STATUS.COMPLETED || booking.status === BOOKING_STATUS.CANCELLED}
                                className="rounded p-1 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                <Pencil size={14} />
                              </button>
                            </Tooltip>
                          )}
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
                  </>
                )}
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
                {isLabAssistant ? (
                  <>
                    <th className="px-4 py-3">Test</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Address</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3">Test / Package</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Assistant</th>
                  </>
                )}
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                {!isLabAssistant && <th className="px-4 py-3">Samples</th>}
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
                    {isLabAssistant ? (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <CircleUser className="text-primary" size={18} />
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-foreground">{booking.patientName}</h3>
                              <p className="text-[11px] text-muted-foreground">{booking.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {booking.test?.title || booking.package?.title}
                            </p>
                            <p className="font-mono text-xs font-bold text-primary mt-0.5">
                              ₹{booking.test?.price || booking.package?.price}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{booking.bookingDate}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{booking.bookingTime}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5 items-start max-w-[200px]">
                            <MapPin className="text-red-500 mt-0.5 flex-shrink-0" size={14} />
                            <span className="text-[12px] text-muted-foreground line-clamp-2">
                              {booking.address || 'No address'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <AssistantStatusBadge status={booking.status} />
                        </td>
                        <td className="px-4 py-3">
                          <AssistantStatusBadge status={booking.paymentStatus} />
                        </td>
                      </>
                    ) : (
                      <>
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
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-foreground">{booking.test?.title || booking.package?.title || 'N/A'}</span>
                          {(booking.test?.city || booking.package?.city) && (
                            <p className="text-xs text-muted-foreground">{booking.test?.city || booking.package?.city}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">₹{amount.toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">{booking.bookingDate}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock size={10} />
                            <span>{booking.bookingTime}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {booking.assignedLabAssistant ? (
                            <div>
                              <p className="text-sm font-medium text-foreground">{booking.assignedLabAssistant.name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{booking.assignedLabAssistant.email}</p>
                            </div>
                          ) : (
                            <select
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); handleAssignAssistant(booking._id, e.target.value) }}
                              className="text-xs py-1.5 h-8 min-w-[140px] border border-border rounded-lg px-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground bg-card"
                            >
                              <option value="">Assign</option>
                              {assistants.map((assistant) => (
                                <option key={assistant._id} value={assistant._id}>
                                  {assistant.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>{booking.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>{booking.paymentStatus}</span>
                        </td>
                        <td className="px-4 py-3">
                          {booking.sampleImages?.length ? (
                            <div className="flex items-center gap-1.5 flex-wrap max-w-[160px]">
                              {booking.sampleImages.slice(0, 3).map((image, index) => (
                                <a key={index} href={image} target="_blank" rel="noreferrer" className="shrink-0 hover:scale-110 transition-transform">
                                  <img src={image} alt={`Sample ${index + 1}`} className="w-10 h-10 rounded-md object-cover border border-border" />
                                </a>
                              ))}
                              {booking.sampleImages.length > 3 && (
                                <span className="w-10 h-10 bg-primary/10 border border-border rounded-md flex items-center justify-center text-[10px] font-medium text-primary">
                                  +{booking.sampleImages.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px] text-gray-400">No Samples</span>
                          )}
                        </td>
                      </>
                    )}
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

      {/* Edit Lab Modal */}
      {showEditModal && (
        <Modal open={showEditModal} onClose={() => { setShowEditModal(false); setSelectedBookingForEdit(null); setSelectedLab('') }} title="Edit Assigned Lab">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-foreground">Select Lab Owner</label>
              <select
                value={selectedLab}
                onChange={(e) => setSelectedLab(e.target.value)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">Select a lab owner</option>
                {labOwners.map((owner) => (
                  <option key={owner._id} value={owner._id}>{owner.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => { setShowEditModal(false); setSelectedBookingForEdit(null); setSelectedLab('') }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateLab}
                disabled={!selectedLab}
                loading={savingLab}
              >
                Update Lab
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Context Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setMenuOpen(null)} />
          <div className="fixed bg-white border border-border rounded-lg shadow-lg py-1 z-[100] min-w-[160px]" style={{ top: menuOpen.top, left: menuOpen.left }}>
            {isLabAssistant ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const booking = menuOpen.booking
                    const address = `${booking.address || ''}, ${booking.city || ''} - ${booking.pincode || ''}`
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
                    window.open(url, '_blank')
                    setMenuOpen(null)
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
                >
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-red-100 text-red-600">
                    <Route size={14} />
                  </span>
                  Navigate
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleMarkReached(menuOpen.booking?._id)
                    setMenuOpen(null)
                  }}
                  disabled={menuOpen.booking?.status !== BOOKING_STATUS.ASSIGNED || markingReachedId === menuOpen.booking?._id}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-blue-100 text-blue-600">
                    {markingReachedId === menuOpen.booking?._id ? (
                      <svg className="animate-spin size-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <MapPinCheck size={14} />
                    )}
                  </span>
                  {markingReachedId === menuOpen.booking?._id ? 'Marking...' : 'Mark Reached'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.info('Collect Sample - API call needed')
                    setMenuOpen(null)
                  }}
                  disabled={menuOpen.booking?.status !== BOOKING_STATUS.REACHED}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-amber-100 text-amber-600">
                    <Microscope size={14} />
                  </span>
                  Collect Sample
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toast.info('Collect Payment - API call needed')
                    setMenuOpen(null)
                  }}
                  disabled={menuOpen.booking?.status !== BOOKING_STATUS.SAMPLE_COLLECTED || menuOpen.booking?.paymentStatus === PAYMENT_STATUS.PAID}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-green-100 text-green-600">
                    <Banknote size={14} />
                  </span>
                  Collect Payment
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (menuOpen.booking?.report) {
                      handleViewReport(menuOpen.booking)
                    }
                    setMenuOpen(null)
                  }}
                  disabled={!menuOpen.booking?.report}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-gray-100 text-gray-600">
                    <Download size={14} />
                  </span>
                  View Report
                </button>
              </>
            ) : (
              <>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditModal(menuOpen.booking)
                      setMenuOpen(null)
                    }}
                    disabled={menuOpen.booking?.status === BOOKING_STATUS.COMPLETED || menuOpen.booking?.status === BOOKING_STATUS.CANCELLED}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Pencil size={14} className="text-amber-500" /> Edit Lab
                  </button>
                )}
                {menuOpen.booking?.report && (
                  <button onClick={(e) => { e.stopPropagation(); handleViewReport(menuOpen.booking); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                    <Download size={14} className="text-blue-500" /> View Report
                  </button>
                )}
                {!isAdmin && (
                  <button onClick={(e) => { e.stopPropagation(); setSelectedBookingId(menuOpen.id); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                    <Eye size={14} /> View
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default BookingsManagePage
