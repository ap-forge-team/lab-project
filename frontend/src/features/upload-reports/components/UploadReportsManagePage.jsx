import React, { useMemo, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Upload,
  CloudUpload,
  CalendarX,
  AlertCircle,
  FileText,
} from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import SearchInput from '@/components/ui/SearchInput'
import ViewToggle from '@/components/ui/ViewToggle'
import { toast } from 'react-toastify'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import Pagination from '@/components/ui/Pagination'
import Modal from '@/components/ui/Modal'
import ReportViewerModal from '@/components/Dashboard/ReportViewerModal'
import { uploadReport } from '@/services/booking.service'

const PAGE_SIZE = 10
const PAGE_SIZES = [10, 25, 50]

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

const StatCard = ({ icon: Icon, borderColor, iconColor, cardBg, title, value, detailTop, detailBottom, detailColor }) => (
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
        <p className={`text-xs ${detailColor || 'text-muted-foreground'}`}>{detailTop}</p>
        <p className="text-xs text-muted-foreground">{detailBottom}</p>
      </div>
    </div>
  </div>
)

const UploadReportsManagePage = ({ bookings, isLoading, isError, onRefresh }) => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [reportModal, setReportModal] = useState({ open: false, booking: null })
  const [uploadModal, setUploadModal] = useState({ open: false, booking: null })
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const [view, setView] = useState('grid')

  const list = useMemo(() => {
    if (!Array.isArray(bookings)) return []
    return bookings
  }, [bookings])

  const today = new Date().toISOString().slice(0, 10)

  const stats = useMemo(() => {
    const total = list.length
    const uploaded = list.filter((b) => b.report).length
    const pending = list.filter((b) => !b.report && b.status !== 'Cancelled').length
    const todayPending = list.filter((b) => !b.report && b.bookingDate === today && b.status !== 'Cancelled').length
    const failed = list.filter((b) => !b.report && b.status === 'Cancelled').length
    return { total, uploaded, pending, todayPending, failed }
  }, [list, today])

  const filterCategories = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      type: 'checkbox',
      options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'Assigned', label: 'Assigned' },
        { value: 'Reached', label: 'Reached' },
        { value: 'Sample Collected', label: 'Sample Collected' },
        { value: 'Processing', label: 'Processing' },
        { value: 'Report Ready', label: 'Report Ready' },
        { value: 'Completed', label: 'Completed' },
        { value: 'Cancelled', label: 'Cancelled' },
        { value: 'Rescheduled', label: 'Rescheduled' },
      ],
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      type: 'checkbox',
      options: [
        { value: 'Paid', label: 'Paid' },
        { value: 'Pending', label: 'Pending' },
        { value: 'Failed', label: 'Failed' },
        { value: 'Refunded', label: 'Refunded' },
      ],
    },
    {
      key: 'bookingDate',
      label: 'Booking Date',
      type: 'date-range',
    },
  ], [])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      if (val && typeof val === 'object' && (val.start || val.end)) return 1
      return count
    }, 0)
  }, [activeFilters])

  const handleApplyFilters = useCallback((filters) => {
    setActiveFilters(filters)
    setPage(1)
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return list.filter((booking) => {
      if (term && !`${booking.patientName || ''} ${booking.phone || ''} ${booking.test?.title || ''} ${booking.package?.title || ''}`.toLowerCase().includes(term)) return false
      if (activeFilters.status?.length && !activeFilters.status.includes(booking.status)) return false
      if (activeFilters.paymentStatus?.length && !activeFilters.paymentStatus.includes(booking.paymentStatus)) return false
      if (activeFilters.bookingDate) {
        const { start, end } = activeFilters.bookingDate
        if (start && booking.bookingDate < start) return false
        if (end && booking.bookingDate > end) return false
      }
      return true
    })
  }, [list, search, activeFilters])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return dateB - dateA
    })
  }, [filtered])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const visibleBookings = sorted.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleViewReport = (booking) => {
    if (booking.report) {
      setReportModal({ open: true, booking })
    }
  }

  const handleDownloadReport = (booking) => {
    if (booking.report) {
      window.open(booking.report, '_blank')
    }
  }

  const openUploadModal = (booking) => {
    setUploadFile(null)
    setUploadModal({ open: true, booking })
  }

  const handleUpload = useCallback(async () => {
    if (!uploadModal.booking || !uploadFile) return
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('report', uploadFile)
      await uploadReport(uploadModal.booking._id, formData)
      toast.success('Report uploaded successfully')
      setUploadModal({ open: false, booking: null })
      setUploadFile(null)
      onRefresh?.()
    } catch {
      toast.error('Failed to upload report')
    } finally {
      setUploading(false)
    }
  }, [uploadModal.booking, uploadFile, onRefresh])

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: '2-digit', short: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <section className="mx-auto max-w-[1500px] space-y-4 lg:space-y-5">
      {/* Mobile Header */}
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <h1 className="text-2xl font-bold text-foreground">Upload Reports</h1>
      </div>

      {/* Desktop Header */}
      <div className="hidden sm:flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Upload Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Select a booking to upload its laboratory report.</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search upload reports..." />
          <FilterButton
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
            }}
            activeCount={activeFilterCount}
          />
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {/* Mobile Search */}
      <div className="flex sm:hidden items-center gap-2">
        <SearchInput value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search upload reports..." className="flex-1" width="w-full" />
        <FilterButton
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
          }}
          activeCount={activeFilterCount}
        />
        <ViewToggle value={view} onChange={setView} />
      </div>

      {/* Stat Cards */}
      <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 min-w-max">
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={FileText}
              borderColor="border-blue-200"
              iconColor="text-blue-500"
              cardBg="bg-blue-50"
              title="Total Bookings"
              value={stats.total.toLocaleString()}
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
              title="Reports Uploaded"
              value={stats.uploaded.toLocaleString()}
              detailTop={stats.total ? `${((stats.uploaded / stats.total) * 100).toFixed(1)}%` : '0%'}
              detailBottom="of total"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={Clock}
              borderColor="border-amber-200"
              iconColor="text-amber-500"
              cardBg="bg-amber-50"
              title="Pending Upload"
              value={stats.pending.toLocaleString()}
              detailTop={stats.total ? `${((stats.pending / stats.total) * 100).toFixed(1)}%` : '0%'}
              detailBottom="of total"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={CalendarX}
              borderColor="border-violet-200"
              iconColor="text-violet-500"
              cardBg="bg-violet-50"
              title="Today's Pending"
              value={stats.todayPending.toLocaleString()}
              detailTop="Scheduled"
              detailBottom="today"
            />
          </div>
          <div className="snap-start min-w-[220px] shrink-0">
            <StatCard
              icon={AlertCircle}
              borderColor="border-rose-200"
              iconColor="text-rose-500"
              cardBg="bg-rose-50"
              title="Failed Uploads"
              value={stats.failed.toLocaleString()}
              detailTop="Needs"
              detailBottom="attention"
              detailColor="text-rose-500"
            />
          </div>
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
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading upload reports…</div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load upload reports. Please try again.</div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No bookings match the selected filters.</div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleBookings.map((booking) => {
            const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending
            const paymentStyle = PAYMENT_STYLES[booking.paymentStatus] || PAYMENT_STYLES.Pending
            const hasReport = !!booking.report
            return (
              <article key={booking._id || booking.id} className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md overflow-hidden">
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(booking.patientName)} text-white font-semibold text-xs`}>
                        {getInitials(booking.patientName)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate" title={booking.patientName}>{booking.patientName}</h3>
                        <p className="text-xs text-muted-foreground">{booking.test?.title || booking.package?.title || '—'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                      {booking.status}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-4 pt-3">
                  <dl className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payment</span>
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>{booking.paymentStatus}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Booking Date</span>
                      <span className="font-medium text-foreground">{booking.bookingDate || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Report</span>
                      {hasReport ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <FileText size={12} />
                          <span className="text-[11px] font-medium">Uploaded</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600">
                          <Clock size={12} />
                          <span className="text-[11px] font-medium">Pending</span>
                        </span>
                      )}
                    </div>
                  </dl>
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      NABL Accredited Labs
                    </span>
                    <div className="flex items-center gap-1">
                      {hasReport ? (
                        <>
                          <Tooltip title="View Report" arrow placement="top">
                            <button type="button" onClick={() => handleViewReport(booking)} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Eye size={14} /></button>
                          </Tooltip>
                          <Tooltip title="Download Report" arrow placement="top">
                            <button type="button" onClick={() => handleDownloadReport(booking)} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Download size={14} /></button>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Upload Report" arrow placement="top">
                          <button type="button" onClick={() => openUploadModal(booking)} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><CloudUpload size={14} /></button>
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
        <div className="rounded-xl border border-border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-accent text-left text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Patient Name</th>
                  <th className="px-4 py-3 font-semibold">Test / Package</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Payment Status</th>
                  <th className="px-4 py-3 font-semibold">Booking Date</th>
                  <th className="px-4 py-3 font-semibold">Report</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleBookings.map((booking) => {
                  const statusStyle = STATUS_STYLES[booking.status] || STATUS_STYLES.Pending
                  const paymentStyle = PAYMENT_STYLES[booking.paymentStatus] || PAYMENT_STYLES.Pending
                  const hasReport = !!booking.report
                  return (
                    <tr key={booking._id || booking.id} className="border-t border-border hover:bg-accent/30 transition">
                      <td className="px-4 py-3 font-medium text-foreground">{booking.patientName || '—'}</td>
                      <td className="px-4 py-3 text-foreground">{booking.test?.title || booking.package?.title || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{booking.bookingDate || '—'}</td>
                      <td className="px-4 py-3">
                        {hasReport ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-500"><FileText size={14} /></span>
                            <div>
                              <p className="text-xs font-medium text-emerald-600">Uploaded</p>
                              <p className="text-[10px] text-muted-foreground">{formatDate(booking.updatedAt || booking.createdAt)}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-500"><Clock size={14} /></span>
                            <div>
                              <p className="text-xs font-medium text-amber-600">Pending</p>
                              <p className="text-[10px] text-muted-foreground">Upload pending</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {hasReport ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleViewReport(booking)}
                                className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                                title="View Report"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDownloadReport(booking)}
                                className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                                title="Download Report"
                              >
                                <Download size={16} />
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openUploadModal(booking)}
                              className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
                              title="Upload Report"
                            >
                              <CloudUpload size={16} />
                            </button>
                          )}
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

      <div className="mt-4">
        <Pagination
          page={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={sorted.length}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
          pageSizes={PAGE_SIZES}
          itemName="results"
        />
      </div>

      {/* Report Viewer Modal */}
      <ReportViewerModal
        isOpen={reportModal.open}
        onClose={() => setReportModal({ open: false, booking: null })}
        reportUrl={reportModal.booking?.report}
        title={`Report - ${reportModal.booking?.patientName || ''}`}
      />

      {/* Upload Modal */}
      <Modal
        open={uploadModal.open}
        onClose={() => { setUploadModal({ open: false, booking: null }); setUploadFile(null) }}
        title="Upload Report"
        subtitle={uploadModal.booking ? `For ${uploadModal.booking.patientName}` : ''}
        size="sm"
      >
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
            onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.[0]) setUploadFile(e.dataTransfer.files[0]) }}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition"
          >
            <CloudUpload size={36} className="text-muted-foreground" />
            {uploadFile ? (
              <div>
                <p className="text-sm font-medium text-foreground">{uploadFile.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => { if (e.target.files?.[0]) setUploadFile(e.target.files[0]) }}
            className="hidden"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setUploadModal({ open: false, booking: null }); setUploadFile(null) }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!uploadFile || uploading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Upload
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {filterPanelOpen && createPortal(
        <FilterPanel
          isOpen={true}
          onClose={() => setFilterPanelOpen(null)}
          onApply={handleApplyFilters}
          position={filterPanelOpen}
          title="Filters"
          categories={filterCategories}
          activeFilters={activeFilters}
        />,
        document.body
      )}
    </section>
  )
}

export default UploadReportsManagePage
