import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  CheckCircle2,
  ChevronsUpDown,
  Clock,
  Copy,
  Eye,
  EyeOff,
  FlaskConical,
  Grid2X2,
  List,
  MapPin,
  Pencil,
  Search,
  ShoppingCart,
  User,
  XCircle,
  MoreVertical,
  Download,
  CircleUser,
  Route,
  MapPinCheck,
  Microscope,
  Banknote,
  FileUp,
  Settings,
  CalendarDays,
} from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import Can from '@/components/Can'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import Pagination from '@/components/ui/Pagination'
import useAuth from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'
import { ROUTES } from '@/constants/routes'
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'
import { updateBookingLab, assignAssistant, markReached, uploadSample, uploadPaymentReceipt, uploadReport, manageBooking } from '@/services/booking.service'
import { getAllLabOwners, getMyAssistants, getPaymentSetting } from '@/services/user.service'
import LabAssistantSampleModal from '@/features/lab-assistant/components/LabAssistantSampleModal'
import AddTestsToBookingModal from '@/features/lab-assistant/components/AddTestsToBookingModal'
import ReportViewerModal from '@/components/Dashboard/ReportViewerModal'
import ManageBookingModal from '@/features/patient/components/ManageBookingModal'
import { BookingCard } from './BookingCard'

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

const StatCard = ({ icon: Icon, borderColor, iconColor, cardBg, title, value, detailTop, detailBottom }) => (
  <div className={`rounded-2xl border ${borderColor} px-4 py-3 ${cardBg}`}>
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${borderColor} ${iconColor}`}>
        {React.createElement(Icon, { size: 18 })}
      </span>
      <div className="min-w-0 flex-1 space-y-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-bold leading-tight text-foreground">{value}</p>
      </div>
      <div className="h-8 w-px shrink-0 self-stretch my-auto bg-border" />
      <div className="shrink-0 text-right leading-tight">
        <p className="text-xs text-muted-foreground">{detailTop}</p>
        <p className="text-xs text-muted-foreground">{detailBottom}</p>
      </div>
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
          <div className="py-2 text-sm">
            <span className="text-muted-foreground">Test / Package</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-medium text-foreground">{booking.test?.title || booking.package?.title || 'N/A'}</span>
              <span className="font-mono text-sm font-bold text-primary">₹{(booking.test?.price || booking.package?.price || 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
          {booking.additionalTests?.length > 0 && (
            <div className="py-2 text-sm">
              <span className="text-muted-foreground">Additional Tests</span>
              <div className="mt-1.5 space-y-1.5">
                {booking.additionalTests.map((at, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-purple-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                      <span className="text-foreground text-xs font-medium">{at.test?.title || 'Test'}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-purple-600">₹{at.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {booking.additionalPackages?.length > 0 && (
            <div className="py-2 text-sm">
              <span className="text-muted-foreground">Additional Packages</span>
              <div className="mt-1.5 space-y-1.5">
                {booking.additionalPackages.map((ap, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                      <span className="text-foreground text-xs font-medium">{ap.package?.title || 'Package'}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-600">₹{ap.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground font-medium">Total Amount</span>
            <span className="font-mono text-base font-bold text-primary">₹{(booking.totalAmount || booking.test?.price || booking.package?.price || 0).toLocaleString('en-IN')}</span>
          </div>
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
          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">Assigned Lab</span>
            <span className={`font-medium text-right ${booking.labOwner ? 'text-foreground' : 'text-muted-foreground'}`}>{booking.labOwner?.name || 'Not Assigned'}</span>
          </div>
          {booking.assignedLabAssistant && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">Lab Assistant</span>
              <span className="font-medium text-foreground text-right">{booking.assignedLabAssistant.name}</span>
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
  const navigate = useNavigate()
  const { user: authUser } = useAuth()
  const user = userProp || authUser
  const isAdmin = user?.role === ROLES.ADMIN
  const isLabAssistant = user?.role === ROLES.LAB_ASSISTANT
  const isLabOwner = user?.role === ROLES.LAB_OWNER
  const isPatient = user?.role === ROLES.PATIENT
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [selectedBookingId, setSelectedBookingId] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [sampleImagesModal, setSampleImagesModal] = useState({ open: false, images: [], bookingId: null })
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const [hiddenColumns, setHiddenColumns] = useState({})

  const handleSort = useCallback((key, direction) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === direction) {
        return { key: null, direction: null }
      }
      return { key, direction }
    })
  }, [])
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState(null)
  const [selectedLab, setSelectedLab] = useState('')
  const [labOwners, setLabOwners] = useState([])
  const [savingLab, setSavingLab] = useState(false)
  const [assistants, setAssistants] = useState([])
  const [markingReachedId, setMarkingReachedId] = useState(null)
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [selectedBookingForSample, setSelectedBookingForSample] = useState(null)
  const [sampleImages, setSampleImages] = useState([])
  const [assistantNotes, setAssistantNotes] = useState('')
  const [uploadingSample, setUploadingSample] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentBooking, setPaymentBooking] = useState(null)
  const [paymentReceipt, setPaymentReceipt] = useState(null)
  const [uploadingPayment, setUploadingPayment] = useState(false)
  const [paymentSetting, setPaymentSetting] = useState(null)
  const [reportModalBooking, setReportModalBooking] = useState(null)
  const [showAddTestsModal, setShowAddTestsModal] = useState(false)
  const [addTestsBooking, setAddTestsBooking] = useState(null)

  // Patient manage booking state
  const [showManageModal, setShowManageModal] = useState(false)
  const [manageBookingData, setManageBookingData] = useState(null)
  const [manageAction, setManageAction] = useState('')
  const [manageReason, setManageReason] = useState('')
  const [manageCustomReason, setManageCustomReason] = useState('')
  const [rescheduleData, setRescheduleData] = useState({ bookingDate: '', bookingTime: '' })
  const [cancelling, setCancelling] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)

  const completedBookings = useMemo(() => bookings.filter((b) => b.status === 'Completed'), [bookings])
  const inProgressBookings = useMemo(() => bookings.filter((b) => !['Completed', 'Cancelled'].includes(b.status)), [bookings])
  const sampleCollectedBookings = useMemo(() => bookings.filter((b) => b.status === 'Sample Collected'), [bookings])
  const cancelledBookings = useMemo(() => bookings.filter((b) => b.status === 'Cancelled'), [bookings])
  const upcomingBookings = useMemo(() => bookings.filter((b) => ['Pending', 'Assigned', 'Reached', 'Sample Collected', 'Processing', 'Report Ready'].includes(b.status)), [bookings])

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

  const getSortValue = useCallback((booking, key) => {
    switch (key) {
      case 'patient': return (booking.patientName || '').toLowerCase()
      case 'test': return (booking.test?.title || booking.package?.title || '').toLowerCase()
      case 'amount': return booking.totalAmount || booking.test?.price || booking.package?.price || 0
      case 'date': return booking.bookingDate || ''
      case 'status': return (booking.status || '').toLowerCase()
      case 'payment': return (booking.paymentStatus || '').toLowerCase()
      case 'assistant': return (booking.assignedLabAssistant?.name || '').toLowerCase()
      default: return ''
    }
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let result = bookings.filter((booking) => {
      const matchesSearch = !term || `${booking.patientName || ''} ${booking.phone || ''} ${booking.test?.title || ''} ${booking.package?.title || ''}`.toLowerCase().includes(term)
      if (!matchesSearch) return false
      if (activeFilters.patientName?.length && !activeFilters.patientName.includes(booking.patientName)) return false
      if (activeFilters.status?.length && !activeFilters.status.includes(booking.status)) return false
      if (activeFilters.paymentStatus?.length && !activeFilters.paymentStatus.includes(booking.paymentStatus)) return false
      return true
    })

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
  }, [bookings, search, activeFilters, sortConfig, getSortValue])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visibleBookings = filtered.slice((page - 1) * pageSize, page * pageSize)

  const getBookingId = (b, index) => b._id || b.id || `${b.patientName}-${index}`
  const selectedBooking = visibleBookings.find((b, index) => getBookingId(b, index) === selectedBookingId) || null

  const handleViewReport = useCallback((booking) => {
    if (booking.report) {
      setReportModalBooking(booking)
    } else {
      toast.info('No report available for this booking')
    }
  }, [])

  const [uploadingReportId, setUploadingReportId] = useState(null)

  const handleUploadReport = useCallback(async (bookingId, file) => {
    try {
      setUploadingReportId(bookingId)
      const formData = new FormData()
      formData.append('report', file)
      await uploadReport(bookingId, formData)
      toast.success('Report uploaded successfully')
      onRefresh?.()
    } catch {
      toast.error('Failed to upload report')
    } finally {
      setUploadingReportId(null)
    }
  }, [onRefresh])

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

  const openSampleModal = useCallback((booking) => {
    setSelectedBookingForSample(booking)
    setSampleImages([])
    setAssistantNotes('')
    setShowSampleModal(true)
  }, [])

  const handleSampleUpload = useCallback(async () => {
    if (!selectedBookingForSample || sampleImages.length === 0) return
    setUploadingSample(true)
    try {
      const formData = new FormData()
      sampleImages.forEach((image) => {
        formData.append('sampleImages', image)
      })
      formData.append('assistantNotes', assistantNotes)
      const { data } = await uploadSample(selectedBookingForSample._id, formData)
      toast.success(data?.message || 'Sample uploaded successfully')
      setShowSampleModal(false)
      setSelectedBookingForSample(null)
      setSampleImages([])
      setAssistantNotes('')
      if (onRefresh) onRefresh()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload sample')
    } finally {
      setUploadingSample(false)
    }
  }, [selectedBookingForSample, sampleImages, assistantNotes, onRefresh])

  const handlePayment = async (booking) => {
    setPaymentBooking(booking)
    try {
      const { data } = await getPaymentSetting()
      setPaymentSetting(data.data)
    } catch {
      // Payment setting may not be available for lab assistant - continue without QR
    }
    setShowPaymentModal(true)
  }

  const handlePaymentDone = async () => {
    if (!paymentReceipt) {
      toast.error('Please upload payment receipt.')
      return
    }
    try {
      setUploadingPayment(true)
      const formData = new FormData()
      formData.append('receipt', paymentReceipt)
      const res = await uploadPaymentReceipt(paymentBooking._id, formData)
      toast.success(res.data.message)
      setShowPaymentModal(false)
      setPaymentReceipt(null)
      setPaymentBooking(null)
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingPayment(false)
    }
  }

  const openManageModal = useCallback((booking) => {
    setManageBookingData(booking)
    setManageAction('')
    setManageReason('')
    setManageCustomReason('')
    setRescheduleData({ bookingDate: '', bookingTime: '' })
    setShowManageModal(true)
  }, [])

  const handleRescheduleChange = useCallback((e) => {
    const { name, value } = e.target
    setRescheduleData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleCancelBooking = useCallback(async () => {
    if (!manageBookingData) return
    const reasonText = manageReason === 'Other' ? manageCustomReason : manageReason
    if (!reasonText) return
    try {
      setCancelling(true)
      await manageBooking(manageBookingData._id, { action: 'cancel', reason: reasonText })
      toast.success('Booking cancelled successfully')
      setShowManageModal(false)
      setManageBookingData(null)
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }, [manageBookingData, manageReason, manageCustomReason, onRefresh])

  const handleRescheduleBooking = useCallback(async () => {
    if (!manageBookingData || !rescheduleData.bookingDate || !rescheduleData.bookingTime) return
    try {
      setRescheduling(true)
      await manageBooking(manageBookingData._id, {
        action: 'reschedule',
        newDate: rescheduleData.bookingDate,
        newTime: rescheduleData.bookingTime,
        reason: manageReason,
      })
      toast.success('Booking rescheduled successfully')
      setShowManageModal(false)
      setManageBookingData(null)
      if (onRefresh) onRefresh()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reschedule booking')
    } finally {
      setRescheduling(false)
    }
  }, [manageBookingData, rescheduleData, manageReason, onRefresh])

  return (
    <section className="mx-auto max-w-[1500px] space-y-4 lg:space-y-5">
      {/* Mobile Header */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <h1 className="text-2xl font-bold text-foreground">{isPatient ? 'My Bookings' : 'Bookings'}</h1>
        {isPatient && (
          <Button onClick={() => navigate(ROUTES.BOOKING)} className="shrink-0">
            <ShoppingCart size={18} className="mr-2" />Book a Test
          </Button>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{isPatient ? 'My Bookings' : 'Bookings'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{isPatient ? 'Review your upcoming and previous bookings.' : 'Manage all test bookings and their status'}</p>
        </div>
        <div className="flex items-center gap-2">
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
          {isPatient && (
            <Button onClick={() => navigate(ROUTES.BOOKING)} className="shrink-0">
              <ShoppingCart size={18} className="mr-2" />Book a Test
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="flex sm:hidden items-center gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by patient, phone, test..." className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
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

      {/* Stat Cards */}
      <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 min-w-max">
          {isPatient ? (
            <>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={Calendar}
                  borderColor="border-blue-200"
                  iconColor="text-blue-500"
                  cardBg="bg-blue-50"
                  title="Total Bookings"
                  value={bookings.length}
                  detailTop="All"
                  detailBottom="time"
                />
              </div>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={CheckCircle2}
                  borderColor="border-emerald-200"
                  iconColor="text-emerald-500"
                  cardBg="bg-emerald-50"
                  title="Completed"
                  value={completedBookings.length}
                  detailTop={bookings.length ? `${((completedBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%'}
                  detailBottom="of total"
                />
              </div>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={Clock}
                  borderColor="border-amber-200"
                  iconColor="text-amber-500"
                  cardBg="bg-amber-50"
                  title="Upcoming"
                  value={upcomingBookings.length}
                  detailTop={bookings.length ? `${((upcomingBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%'}
                  detailBottom="of total"
                />
              </div>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={XCircle}
                  borderColor="border-red-200"
                  iconColor="text-red-500"
                  cardBg="bg-red-50"
                  title="Cancelled"
                  value={cancelledBookings.length}
                  detailTop={bookings.length ? `${((cancelledBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%'}
                  detailBottom="of total"
                />
              </div>
            </>
          ) : (
            <>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={Calendar}
                  borderColor="border-blue-200"
                  iconColor="text-blue-500"
                  cardBg="bg-blue-50"
                  title="Total Bookings"
                  value={bookings.length}
                  detailTop="All"
                  detailBottom="time"
                />
              </div>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={CheckCircle2}
                  borderColor="border-emerald-200"
                  iconColor="text-emerald-500"
                  cardBg="bg-emerald-50"
                  title="Completed"
                  value={completedBookings.length}
                  detailTop={bookings.length ? `${((completedBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%'}
                  detailBottom="of total"
                />
              </div>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={Clock}
                  borderColor="border-amber-200"
                  iconColor="text-amber-500"
                  cardBg="bg-amber-50"
                  title="In Progress"
                  value={inProgressBookings.length}
                  detailTop={bookings.length ? `${((inProgressBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%'}
                  detailBottom="of total"
                />
              </div>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={FlaskConical}
                  borderColor="border-purple-200"
                  iconColor="text-purple-500"
                  cardBg="bg-purple-50"
                  title="Sample Collected"
                  value={sampleCollectedBookings.length}
                  detailTop={bookings.length ? `${((sampleCollectedBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%'}
                  detailBottom="of total"
                />
              </div>
              <div className="snap-start min-w-[220px] shrink-0">
                <StatCard
                  icon={XCircle}
                  borderColor="border-red-200"
                  iconColor="text-red-500"
                  cardBg="bg-red-50"
                  title="Cancelled"
                  value={cancelledBookings.length}
                  detailTop={bookings.length ? `${((cancelledBookings.length / bookings.length) * 100).toFixed(1)}%` : '0%'}
                  detailBottom="of total"
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 sm:hidden">
        <span className="w-2 h-2 rounded-full bg-primary"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
        <span className="w-2 h-2 rounded-full bg-border"></span>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading bookings…</div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load bookings. Please try again.</div>
      ) : visibleBookings.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No bookings match the selected filters.</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleBookings.map((booking, index) => {
            const id = getBookingId(booking, index)
            return (
              <BookingCard
                key={id}
                booking={booking}
                role={user?.role}
                cardId={id}
                onSelect={() => setSelectedBookingId(id)}
                onEditLab={openEditModal}
                onViewReport={handleViewReport}
                onManageBooking={openManageModal}
                onAssignAssistant={handleAssignAssistant}
                assistants={assistants}
                onMenuToggle={(e, b, cardId) => {
                  if (menuOpen?.id === cardId) {
                    setMenuOpen(null)
                  } else {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setMenuOpen({ id: cardId, booking: b, top: rect.bottom + 4, left: rect.right - 180 })
                  }
                }}
                menuOpen={menuOpen}
              />
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="overflow-y-auto max-h-[calc(100vh-250px)] pb-2 pr-1">
          <div className="rounded-xl border border-border bg-white">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-accent text-left text-muted-foreground sticky top-0">
              <tr>
                <SortableHeader title={isPatient ? 'Test / Package' : 'Patient'} sortKey={isPatient ? 'test' : 'patient'} sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, [isPatient ? 'test' : 'patient']: true }))} />
                {isPatient ? (
                  <>
                    <SortableHeader title="Date" sortKey="date" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, date: true }))} />
                    <th className="px-4 py-3">Time</th>
                  </>
                ) : isLabAssistant ? (
                  <>
                    <SortableHeader title="Test" sortKey="test" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, test: true }))} />
                    <SortableHeader title="Date" sortKey="date" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, date: true }))} />
                    <th className="px-4 py-3">Address</th>
                  </>
                ) : (
                  <>
                    <SortableHeader title="Test / Package" sortKey="test" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, test: true }))} />
                    <SortableHeader title="Amount" sortKey="amount" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, amount: true }))} />
                    <SortableHeader title="Date" sortKey="date" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, date: true }))} />
                    <SortableHeader title="Assistant" sortKey="assistant" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, assistant: true }))} />
                  </>
                )}
                <SortableHeader title="Status" sortKey="status" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, status: true }))} />
                <SortableHeader title="Payment" sortKey="payment" sortConfig={sortConfig} onSort={handleSort} onHide={() => setHiddenColumns(prev => ({ ...prev, payment: true }))} />
                {!isLabAssistant && !isPatient && <th className="px-4 py-3">Samples</th>}
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
                    {isPatient ? (
                      <>
                        {!hiddenColumns.test && (
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {booking.test?.title || booking.package?.title || 'N/A'}
                            </p>
                            <p className="font-mono text-xs font-bold text-primary mt-0.5">
                              ₹{(booking.test?.price || booking.package?.price || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </td>
                        )}
                        {!hiddenColumns.date && (
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">{booking.bookingDate}</span>
                        </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={10} />
                            <span>{booking.bookingTime}</span>
                          </div>
                        </td>
                        {!hiddenColumns.status && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>{booking.status}
                          </span>
                        </td>
                        )}
                        {!hiddenColumns.payment && (
                        <td className="px-4 py-3">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>{booking.paymentStatus}</span>
                        </td>
                        )}
                      </>
                    ) : isLabAssistant ? (
                      <>
                        {!hiddenColumns.patient && (
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
                        )}
                        {!hiddenColumns.test && (
                        <td className="px-4 py-3">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-sm font-medium text-foreground">
                                {booking.test?.title || booking.package?.title}
                              </p>
                              {(booking.additionalTests?.length > 0 || booking.additionalPackages?.length > 0) && (
                                <span className="text-[10px] text-purple-700 font-medium bg-purple-50 px-1.5 py-0.5 rounded">
                                  +{booking.additionalTests.length + booking.additionalPackages.length}
                                </span>
                              )}
                            </div>
                            <p className="font-mono text-xs font-bold text-primary mt-0.5">
                              ₹{(booking.totalAmount || booking.test?.price || booking.package?.price || 0).toLocaleString('en-IN')}
                            </p>
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
                            <span className="text-[12px] text-muted-foreground line-clamp-2">
                              {booking.address || 'No address'}
                            </span>
                          </div>
                        </td>
                        {!hiddenColumns.status && (
                        <td className="px-4 py-3">
                          <AssistantStatusBadge status={booking.status} />
                        </td>
                        )}
                        {!hiddenColumns.payment && (
                        <td className="px-4 py-3">
                          <AssistantStatusBadge status={booking.paymentStatus} />
                        </td>
                        )}
                      </>
                    ) : (
                      <>
                        {!hiddenColumns.patient && (
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
                        )}
                        {!hiddenColumns.test && (
                        <td className="px-4 py-3">
                          <span className="text-sm font-semibold text-foreground">{booking.test?.title || booking.package?.title || 'N/A'}</span>
                          {(booking.test?.city || booking.package?.city) && (
                            <p className="text-xs text-muted-foreground">{booking.test?.city || booking.package?.city}</p>
                          )}
                        </td>
                        )}
                        {!hiddenColumns.amount && (
                        <td className="px-4 py-3 font-semibold text-foreground">₹{amount.toLocaleString('en-IN')}</td>
                        )}
                        {!hiddenColumns.date && (
                        <td className="px-4 py-3">
                          <span className="text-sm text-foreground">{booking.bookingDate}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Clock size={10} />
                            <span>{booking.bookingTime}</span>
                          </div>
                        </td>
                        )}
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
                        {!hiddenColumns.status && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>{booking.status}
                          </span>
                        </td>
                        )}
                        {!hiddenColumns.payment && (
                        <td className="px-4 py-3">
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>{booking.paymentStatus}</span>
                        </td>
                        )}
                        <td className="px-4 py-3">
                          {booking.sampleImages?.length ? (
                            <div className="relative inline-block">
                              <img src={booking.sampleImages[0]} alt="Sample" className="w-10 h-10 rounded-md object-cover border border-border" />
                              {booking.sampleImages.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSampleImagesModal({ open: true, images: booking.sampleImages, bookingId: id })
                                  }}
                                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow hover:bg-primary/90 transition"
                                >
                                  +{booking.sampleImages.length - 1}
                                </button>
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
        </div>
      )}

      {/* Sample Images Modal */}
      {sampleImagesModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSampleImagesModal({ open: false, images: [], bookingId: null })}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Sample Images</h2>
              <button type="button" onClick={() => setSampleImagesModal({ open: false, images: [], bookingId: null })} className="p-1 rounded hover:bg-accent text-muted-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sampleImagesModal.images.map((image, index) => (
                  <a key={index} href={image} target="_blank" rel="noreferrer" className="block group">
                    <img src={image} alt={`Sample ${index + 1}`} className="w-full h-40 object-cover rounded-lg border border-border group-hover:scale-[1.02] transition-transform" />
                    <p className="text-xs text-muted-foreground text-center mt-1.5">Sample {index + 1}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal booking={selectedBooking} onClose={() => setSelectedBookingId(null)} />
      )}

      {/* Report View Modal */}
      <ReportViewerModal
        isOpen={!!reportModalBooking}
        onClose={() => setReportModalBooking(null)}
        reportUrl={reportModalBooking?.report}
        title={reportModalBooking?.test?.title || reportModalBooking?.package?.title || 'Test Report'}
      />

      {/* Pagination */}
      <div className="mt-4">
        <Pagination
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
        pageSizes={PAGE_SIZES}
        itemName="bookings"
      />
      </div>

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
                    setAddTestsBooking(menuOpen.booking)
                    setShowAddTestsModal(true)
                    setMenuOpen(null)
                  }}
                  disabled={menuOpen.booking?.status === BOOKING_STATUS.COMPLETED || menuOpen.booking?.status === BOOKING_STATUS.CANCELLED}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="inline-flex items-center justify-center size-6 rounded-md bg-purple-100 text-purple-600">
                    <FlaskConical size={14} />
                  </span>
                  Add Test
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
                    openSampleModal(menuOpen.booking)
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
                    handlePayment(menuOpen.booking)
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
                {isLabOwner && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewReport(menuOpen.booking)
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.accept = '.pdf,.jpg,.jpeg,.png'
                        input.onchange = (ev) => {
                          const file = ev.target.files?.[0]
                          if (file && menuOpen.booking?._id) {
                            handleUploadReport(menuOpen.booking._id, file)
                          }
                        }
                        input.click()
                        setMenuOpen(null)
                      }}
                      disabled={uploadingReportId === menuOpen.booking?._id}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="inline-flex items-center justify-center size-6 rounded-md bg-green-100 text-green-600">
                        {uploadingReportId === menuOpen.booking?._id ? (
                          <svg className="animate-spin size-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <FileUp size={14} />
                        )}
                      </span>
                      {uploadingReportId === menuOpen.booking?._id ? 'Uploading...' : 'Upload Report'}
                    </button>
                  </>
                )}
                {isPatient && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewReport(menuOpen.booking)
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
                    {menuOpen.booking?.status !== BOOKING_STATUS.COMPLETED && menuOpen.booking?.status !== BOOKING_STATUS.CANCELLED && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openManageModal(menuOpen.booking)
                          setMenuOpen(null)
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left"
                      >
                        <span className="inline-flex items-center justify-center size-6 rounded-md bg-amber-100 text-amber-600">
                          <Settings size={14} />
                        </span>
                        Manage Booking
                      </button>
                    )}
                  </>
                )}
                {!isAdmin && !isLabOwner && !isPatient && (
                  <button onClick={(e) => { e.stopPropagation(); setSelectedBookingId(menuOpen.id); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
                    <Eye size={14} /> View
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Sample Upload Modal */}
      {isLabAssistant && (
        <LabAssistantSampleModal
          showSampleModal={showSampleModal}
          setShowSampleModal={setShowSampleModal}
          sampleImages={sampleImages}
          setSampleImages={setSampleImages}
          assistantNotes={assistantNotes}
          setAssistantNotes={setAssistantNotes}
          handleSampleUpload={handleSampleUpload}
          uploadingSample={uploadingSample}
        />
      )}

      {/* Add Tests Modal */}
      {isLabAssistant && (
        <AddTestsToBookingModal
          open={showAddTestsModal}
          onClose={() => {
            setShowAddTestsModal(false)
            setAddTestsBooking(null)
          }}
          booking={addTestsBooking}
          onTestsAdded={() => onRefresh?.()}
        />
      )}

      {/* Payment Modal */}
      {isLabAssistant && (
        <Modal
          open={showPaymentModal}
          title="Collect Payment"
          onClose={() => {
            setShowPaymentModal(false)
            setPaymentReceipt(null)
          }}
          size="md"
        >
          {paymentSetting?.qrImage && (
            <div className="flex justify-center">
              <img src={paymentSetting.qrImage} alt="" className="w-64 rounded-2xl border" />
            </div>
          )}
          <div className="mt-6 space-y-2">
            <p><strong>Amount:</strong> ₹{paymentBooking?.test?.price || paymentBooking?.package?.price}</p>
          </div>
          <div className="mt-5">
            <h3 className="text-lg font-semibold mb-3">Upload Payment Receipt</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="border-2 border-dashed border-blue-300 rounded-2xl p-4 cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(e) => {
                    if (e.target.files[0]) setPaymentReceipt(e.target.files[0])
                  }}
                />
                <div className="flex flex-col items-center">
                  <div className="text-3xl">📷</div>
                  <p className="mt-2 text-sm font-semibold">Capture</p>
                </div>
              </label>
              <label className="border-2 border-dashed border-green-300 rounded-2xl p-4 cursor-pointer hover:bg-green-50 transition">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={(e) => {
                    if (e.target.files[0]) setPaymentReceipt(e.target.files[0])
                  }}
                />
                <div className="flex flex-col items-center">
                  <div className="text-3xl">🖼️</div>
                  <p className="mt-2 text-sm font-semibold">Upload</p>
                </div>
              </label>
            </div>
            {paymentReceipt && (
              <div className="mt-4 p-3 rounded-xl bg-blue-50 border">
                <p className="text-sm font-semibold">{paymentReceipt.name}</p>
                {paymentReceipt.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(paymentReceipt)}
                    alt=""
                    className="w-28 h-28 object-cover rounded-lg mt-3 border"
                  />
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowPaymentModal(false)
                setPaymentReceipt(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePaymentDone}
              disabled={!paymentReceipt}
              loading={uploadingPayment}
              fullWidth
              variant="primary"
            >
              Payment Done
            </Button>
          </div>
        </Modal>
      )}

      {/* Patient Manage Booking Modal */}
      {isPatient && (
        <ManageBookingModal
          showManageModal={showManageModal}
          setShowManageModal={setShowManageModal}
          action={manageAction}
          setAction={setManageAction}
          reason={manageReason}
          setReason={setManageReason}
          customReason={manageCustomReason}
          setCustomReason={setManageCustomReason}
          rescheduleData={rescheduleData}
          handleRescheduleChange={handleRescheduleChange}
          handleCancel={handleCancelBooking}
          handleReschedule={handleRescheduleBooking}
          cancelling={cancelling}
          rescheduling={rescheduling}
        />
      )}
    </section>
  )
}

export default BookingsManagePage
