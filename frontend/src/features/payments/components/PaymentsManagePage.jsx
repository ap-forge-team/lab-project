import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Eye,
  Grid2X2,
  List,
  MoreVertical,
  Pencil,
  Search,
  Settings,
  Wallet,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'
import { toast } from 'react-toastify'
import Can from '@/components/Can'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import { getPaymentSetting, createPaymentSetting, updatePaymentSetting } from '@/services/user.service'

const PAGE_SIZE = 10
const PAGE_SIZES = [10, 25, 50]

const STATUS_STYLES = {
  Paid: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Success: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  Pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  Failed: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  Refunded: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
}

const METHOD_STYLES = {
  UPI: { icon: 'text-blue-500', bg: 'bg-blue-50', label: 'UPI' },
  Card: { icon: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Credit Card' },
  Cash: { icon: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Cash' },
  Online: { icon: 'text-cyan-500', bg: 'bg-cyan-50', label: 'Net Banking' },
  Wallet: { icon: 'text-violet-500', bg: 'bg-violet-50', label: 'Wallet' },
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
const getMethodStyle = (method) => METHOD_STYLES[method] || METHOD_STYLES.Cash

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

const StatCard = ({ icon: Icon, iconClass, title, value, detail, trend }) => (
  <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
    <div className="flex items-center gap-3">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
        {React.createElement(Icon, { size: 22 })}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-xl font-bold text-foreground">{value}</p>
        {detail && <p className={`mt-0.5 text-[11px] ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>{detail}</p>}
      </div>
    </div>
  </div>
)

const PaymentDetailsModal = ({ payment, onClose }) => {
  if (!payment) return null
  const statusStyle = getStatusStyle(payment.paymentStatus)
  const methodStyle = getMethodStyle(payment.paymentMethod)
  return (
    <Modal open={!!payment} title="Payment Details" onClose={onClose} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(payment.patientName)} text-white font-semibold text-sm`}>
            {getInitials(payment.patientName)}
          </span>
          <div>
            <p className="font-semibold text-foreground">{payment.patientName}</p>
            <p className="text-xs text-muted-foreground">{payment.phone}</p>
          </div>
        </div>
        <div className="divide-y divide-border border-t border-border">
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Transaction ID</span><span className="font-medium text-foreground">{payment.transactionId || '—'}</span></div>
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Booking ID</span><span className="font-medium text-foreground">{payment._id || '—'}</span></div>
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Test / Package</span><span className="font-medium text-foreground">{payment.test?.title || payment.package?.title || 'N/A'}</span></div>
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Amount</span><span className="font-bold text-foreground">{formatCurrency(payment.totalAmount || payment.paymentAmount || payment.test?.price || payment.package?.price)}</span></div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span className="font-medium text-foreground">{methodStyle.label}</span>
          </div>
          <div className="flex justify-between py-2 text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>{payment.paymentStatus}
            </span>
          </div>
          <div className="flex justify-between py-2 text-sm"><span className="text-muted-foreground">Payment Date</span><span className="font-medium text-foreground">{formatDate(payment.paidAt || payment.createdAt)} {formatTime(payment.paidAt || payment.createdAt)}</span></div>
          {payment.labOwner && (
            <div className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">Lab</span>
              <span className="font-medium text-foreground text-right">{payment.labOwner.name}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}

const PaymentsManagePage = ({ payments, isLoading, isError, onRefresh }) => {
  const [search, setSearch] = useState('')
  const [view, setView] = useState('table')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [showPaymentSettings, setShowPaymentSettings] = useState(false)
  const [payment, setPayment] = useState(null)
  const [qrImage, setQrImage] = useState(null)
  const [savingPayment, setSavingPayment] = useState(false)

  const fetchPayment = useCallback(async () => {
    try {
      const { data } = await getPaymentSetting()
      if (data.data) {
        setPayment(data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }, [])

  const handlePaymentSettingsSubmit = async () => {
    try {
      setSavingPayment(true)
      const formData = new FormData()
      if (qrImage) {
        formData.append('qrImage', qrImage)
      }
      if (payment) {
        await updatePaymentSetting(formData)
      } else {
        await createPaymentSetting(formData)
      }
      toast.success('Payment settings saved successfully')
      fetchPayment()
      setShowPaymentSettings(false)
      setQrImage(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setSavingPayment(false)
    }
  }

  useEffect(() => {
    fetchPayment()
  }, [fetchPayment])

  const stats = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + (p.totalAmount || p.paymentAmount || p.test?.price || p.package?.price || 0), 0)
    const successful = payments.filter((p) => p.paymentStatus === 'Paid')
    const successfulAmount = successful.reduce((sum, p) => sum + (p.totalAmount || p.paymentAmount || p.test?.price || p.package?.price || 0), 0)
    const pending = payments.filter((p) => p.paymentStatus === 'Pending')
    const pendingAmount = pending.reduce((sum, p) => sum + (p.totalAmount || p.paymentAmount || p.test?.price || p.package?.price || 0), 0)
    const failed = payments.filter((p) => p.paymentStatus === 'Failed')
    const failedAmount = failed.reduce((sum, p) => sum + (p.totalAmount || p.paymentAmount || p.test?.price || p.package?.price || 0), 0)
    const refunded = payments.filter((p) => p.paymentStatus === 'Refunded')
    const refundedAmount = refunded.reduce((sum, p) => sum + (p.totalAmount || p.paymentAmount || p.test?.price || p.package?.price || 0), 0)
    return { total, totalAmount: total, successful: successful.length, successfulAmount, pending: pending.length, pendingAmount, failed: failed.length, failedAmount, refunded: refunded.length, refundedAmount }
  }, [payments])

  const filterCategories = useMemo(() => {
    const statusOptions = [
      { value: 'Paid', label: 'Success' },
      { value: 'Pending', label: 'Pending' },
      { value: 'Failed', label: 'Failed' },
      { value: 'Refunded', label: 'Refunded' },
    ]
    const methodOptions = [
      { value: 'UPI', label: 'UPI' },
      { value: 'Card', label: 'Credit Card' },
      { value: 'Cash', label: 'Cash' },
      { value: 'Online', label: 'Net Banking' },
      { value: 'Wallet', label: 'Wallet' },
    ]
    return [
      { key: 'status', label: 'Status', type: 'checkbox', options: statusOptions },
      { key: 'paymentMethod', label: 'Payment Method', type: 'checkbox', options: methodOptions },
    ]
  }, [])

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
    return payments.filter((payment) => {
      const matchesSearch = !term || `${payment.patientName || ''} ${payment.phone || ''} ${payment.transactionId || ''} ${payment.test?.title || ''} ${payment.package?.title || ''}`.toLowerCase().includes(term)
      if (!matchesSearch) return false
      if (activeFilters.status?.length && !activeFilters.status.includes(payment.paymentStatus)) return false
      if (activeFilters.paymentMethod?.length && !activeFilters.paymentMethod.includes(payment.paymentMethod)) return false
      return true
    })
  }, [payments, search, activeFilters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const visiblePayments = filtered.slice((page - 1) * pageSize, page * pageSize)
  const pageNumbers = totalPages <= 5
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
    : [1, 2, 3, 'ellipsis', totalPages]

  const getPaymentId = (p, index) => p._id || p.id || `${p.transactionId}-${index}`
  const selectedPayment = visiblePayments.find((p, index) => getPaymentId(p, index) === selectedPaymentId) || null

  return (
    <section className="mx-auto max-w-[1500px] space-y-4 lg:space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track and manage all payments and transactions</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search by transaction ID, booking ID, customer..." className="pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-72" />
          </div>
          <FilterButton
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
            }}
            activeCount={activeFilterCount}
          />
          <div className="flex items-center rounded-lg border border-border p-1">
            <Tooltip title="Table View" arrow placement="top">
              <button type="button" aria-label="Table view" onClick={() => setView('table')} className={`rounded p-1.5 ${view === 'table' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><List size={18} /></button>
            </Tooltip>
            <Tooltip title="Grid View" arrow placement="top">
              <button type="button" aria-label="Grid view" onClick={() => setView('grid')} className={`rounded p-1.5 ${view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}><Grid2X2 size={18} /></button>
            </Tooltip>
          </div>
          <Can resource="payments" action="update">
            <Button onClick={() => { setQrImage(null); setShowPaymentSettings(true) }} size="sm" variant="outline">
              <Settings size={14} className="mr-1.5" />
              Payment Settings
            </Button>
          </Can>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={CreditCard} iconClass="bg-blue-50 text-primary" title="Total Payments" value={formatCurrency(stats.totalAmount)} detail={`${stats.total} transactions`} trend="up" />
        <StatCard icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-500" title="Successful Payments" value={formatCurrency(stats.successfulAmount)} detail={`${stats.successful} transactions`} trend="up" />
        <StatCard icon={Clock} iconClass="bg-amber-50 text-amber-500" title="Pending Payments" value={formatCurrency(stats.pendingAmount)} detail={`${stats.pending} transactions`} trend="up" />
        <StatCard icon={XCircle} iconClass="bg-red-50 text-red-500" title="Failed Payments" value={formatCurrency(stats.failedAmount)} detail={`${stats.failed} transactions`} trend="down" />
        <StatCard icon={RefreshCw} iconClass="bg-purple-50 text-purple-500" title="Refunds Issued" value={formatCurrency(stats.refundedAmount)} detail={`${stats.refunded} transactions`} trend="up" />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">Loading payments…</div>
      ) : isError ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-destructive">Unable to load payments. Please try again.</div>
      ) : visiblePayments.length === 0 ? (
        <div className="rounded-xl border border-border bg-white p-12 text-center text-sm text-muted-foreground">No payments match the selected filters.</div>
      ) : view === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visiblePayments.map((payment, index) => {
            const id = getPaymentId(payment, index)
            const statusStyle = getStatusStyle(payment.paymentStatus)
            const methodStyle = getMethodStyle(payment.paymentMethod)
            const amount = payment.totalAmount || payment.paymentAmount || payment.test?.price || payment.package?.price || 0
            return (
              <article key={id} onClick={() => setSelectedPaymentId(id)} className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md overflow-hidden cursor-pointer">
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getAvatarColor(payment.patientName)} text-white font-semibold text-xs`}>
                        {getInitials(payment.patientName)}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm truncate" title={payment.patientName}>{payment.patientName}</h3>
                        <p className="text-xs text-muted-foreground">{payment.phone}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                      {payment.paymentStatus === 'Paid' ? 'Success' : payment.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col flex-1 p-4 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground">{formatCurrency(amount)}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className={`flex h-5 w-5 items-center justify-center rounded ${methodStyle.bg}`}>
                        <CreditCard size={10} className={methodStyle.icon} />
                      </span>
                      {methodStyle.label}
                    </span>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Transaction ID</span>
                      <span className="font-medium text-primary">{payment.transactionId || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Booking ID</span>
                      <span className="font-medium text-primary">{payment._id ? `BKD-${String(payment._id).slice(-6).toUpperCase()}` : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Payment Date</span>
                      <span className="text-foreground">{formatDate(payment.paidAt || payment.createdAt)}</span>
                    </div>
                  </dl>
                  <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      NABL Accredited Labs
                    </span>
                    <div className="flex items-center gap-1">
                      <Tooltip title="View" arrow placement="top">
                        <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedPaymentId(id) }} className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"><Eye size={14} /></button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-border bg-white">
          <table className="w-full min-w-[1000px] text-sm">
            <thead className="bg-accent text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Transaction ID</th>
                <th className="px-4 py-3 font-semibold">Booking ID</th>
                <th className="px-4 py-3 font-semibold">Customer</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Payment Method</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Payment Date</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.map((payment, index) => {
                const id = getPaymentId(payment, index)
                const statusStyle = getStatusStyle(payment.paymentStatus)
                const methodStyle = getMethodStyle(payment.paymentMethod)
                const amount = payment.totalAmount || payment.paymentAmount || payment.test?.price || payment.package?.price || 0
                return (
                  <tr key={id} onClick={() => setSelectedPaymentId(id)} className="cursor-pointer border-t border-border transition hover:bg-accent/40">
                    <td className="px-4 py-3">
                      <span className="font-medium text-primary">{payment.transactionId || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-primary">{payment._id ? `BKD-${String(payment._id).slice(-6).toUpperCase()}` : '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getAvatarColor(payment.patientName)} text-white font-semibold text-[10px]`}>
                          {getInitials(payment.patientName)}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{payment.patientName}</p>
                          <p className="text-xs text-muted-foreground">{payment.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(amount)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-foreground">
                        <span className={`flex h-6 w-6 items-center justify-center rounded ${methodStyle.bg}`}>
                          <CreditCard size={12} className={methodStyle.icon} />
                        </span>
                        {methodStyle.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}></span>
                        {payment.paymentStatus === 'Paid' ? 'Success' : payment.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-foreground">{formatDate(payment.paidAt || payment.createdAt)}</span>
                      {(payment.paidAt || payment.createdAt) && <><br /><span className="text-xs text-muted-foreground">{formatTime(payment.paidAt || payment.createdAt)}</span></>}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="relative flex items-center gap-1">
                        <Tooltip title="View" arrow placement="top">
                          <button type="button" onClick={() => setSelectedPaymentId(id)} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition">
                            <Eye size={15} />
                          </button>
                        </Tooltip>
                        <Can resource="payments" action="update">
                          <Tooltip title="Edit" arrow placement="top">
                            <button type="button" onClick={() => toast.info('Edit payment coming soon')} className="rounded p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 transition">
                              <Pencil size={15} />
                            </button>
                          </Tooltip>
                        </Can>
                        <button type="button" onClick={(e) => { e.stopPropagation(); if (menuOpen?.id === id) { setMenuOpen(null) } else { const rect = e.currentTarget.getBoundingClientRect(); setMenuOpen({ id, payment, top: rect.bottom + 4, left: rect.right - 140 }) } }} className="rounded p-1.5 text-muted-foreground hover:text-foreground transition">
                          <MoreVertical size={15} />
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

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex flex-col gap-3 pb-2 text-sm text-muted-foreground lg:flex-row lg:items-center lg:justify-between">
          <p>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} payments</p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="Previous page" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} className="rounded-lg border border-border p-2 transition hover:bg-accent disabled:opacity-40"><ChevronLeft size={17} /></button>
            {pageNumbers.map((item, index) => item === 'ellipsis' ? <span key={`ellipsis-${index}`} className="px-1">…</span> : <button key={item} type="button" onClick={() => setPage(item)} className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 font-medium transition ${page === item ? 'bg-primary text-white' : 'hover:bg-accent text-foreground'}`}>{item}</button>)}
            <button type="button" aria-label="Next page" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} className="rounded-lg border border-border p-2 transition hover:bg-accent disabled:opacity-40"><ChevronRight size={17} /></button>
            <select aria-label="Payments per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1) }} className="ml-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
              {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} per page</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedPayment && (
        <PaymentDetailsModal payment={selectedPayment} onClose={() => setSelectedPaymentId(null)} />
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
            <button onClick={(e) => { e.stopPropagation(); setSelectedPaymentId(menuOpen.id); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Eye size={14} /> View
            </button>
            <button onClick={(e) => { e.stopPropagation(); toast.info('Download receipt coming soon'); setMenuOpen(null) }} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent w-full text-left">
              <Download size={14} /> Download Receipt
            </button>
          </div>
        </>
      )}
      {/* Payment Settings Modal */}
      <Modal
        open={showPaymentSettings}
        title="Payment Settings"
        subtitle="Upload a QR code for payments"
        onClose={() => { setShowPaymentSettings(false); setQrImage(null) }}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handlePaymentSettingsSubmit()
          }}
          className="space-y-6"
        >
          <div>
            <label className="block mb-2 font-semibold">QR Code</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setQrImage(e.target.files[0])}
              className="w-full"
            />
          </div>
          {qrImage && (
            <div className="space-y-2">
              <p className="font-semibold text-sm">Selected File</p>
              <img src={URL.createObjectURL(qrImage)} alt="QR Code Preview" className="w-64 rounded-xl border" />
            </div>
          )}
          {payment?.qrImage && (
            <div className="space-y-3">
              <p className="font-semibold text-sm">Current QR Code</p>
              <img src={payment.qrImage} alt="" className="w-64 rounded-xl border" />
            </div>
          )}
          <Button
            type="submit"
            fullWidth
            loading={savingPayment}
          >
            {payment ? 'Update Payment Settings' : 'Save Payment Settings'}
          </Button>
        </form>
      </Modal>

    </section>
  )
}

export default PaymentsManagePage
