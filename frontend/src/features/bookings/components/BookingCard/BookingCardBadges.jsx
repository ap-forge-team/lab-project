import React from 'react'
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'

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
  Paid: { bg: 'bg-green-50', text: 'text-green-700' },
  Pending: { bg: 'bg-primary/10', text: 'text-primary' },
  Unpaid: { bg: 'bg-red-100', text: 'text-red-700' },
  Failed: { bg: 'bg-red-100', text: 'text-red-700' },
}

const AssistantStatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || PAYMENT_STYLES[status] || { bg: 'bg-primary/10', text: 'text-muted-foreground' }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block ${style.bg} ${style.text}`}>
      {status}
    </span>
  )
}

const AdminStatusBadge = ({ status, type = 'status' }) => {
  const styles = type === 'status' ? STATUS_STYLES : PAYMENT_STYLES
  const style = styles[status] || styles.Pending
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${style.bg} ${style.text}`}>
      {style.dot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>}
      {status}
    </span>
  )
}

const BookingCardBadges = ({ status, paymentStatus, variant = 'default', actionButton }) => {
  return (
    <div className="px-4 pb-4 pt-3 flex flex-wrap items-center gap-2">
      {variant === 'assistant' ? (
        <>
          <AssistantStatusBadge status={status} />
          <AssistantStatusBadge status={paymentStatus} />
        </>
      ) : (
        <>
          <AdminStatusBadge status={status} type="status" />
          <AdminStatusBadge status={paymentStatus} type="payment" />
        </>
      )}
      {actionButton && (
        <div className="ml-auto">
          {actionButton}
        </div>
      )}
    </div>
  )
}

export default BookingCardBadges
