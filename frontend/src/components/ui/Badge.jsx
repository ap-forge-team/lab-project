import React from 'react'
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'

const statusStyles = {
  [BOOKING_STATUS.COMPLETED]: 'bg-green-50 text-green-700',
  [BOOKING_STATUS.PENDING]: 'bg-primary/10 text-primary',
  [BOOKING_STATUS.CANCELLED]: 'bg-red-50 text-red-700',
  [BOOKING_STATUS.RESCHEDULED]: 'bg-primary/10 text-primary',
  [BOOKING_STATUS.ASSIGNED]: 'bg-primary/10 text-primary',
  [BOOKING_STATUS.REACHED]: 'bg-accent text-secondary',
  [BOOKING_STATUS.SAMPLE_COLLECTED]: 'bg-accent text-secondary',
  [PAYMENT_STATUS.PAID]: 'bg-green-50 text-green-700',
  [PAYMENT_STATUS.UNPAID]: 'bg-red-50 text-red-700',
  [PAYMENT_STATUS.FAILED]: 'bg-red-50 text-red-700',
}

const Badge = ({ children, variant = 'default', status, className = '' }) => {
  const statusClass = status ? statusStyles[status] || 'bg-primary/10 text-muted-foreground' : ''

  const variantStyles = {
    default: 'bg-primary/10 text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700',
  }

  return (
    <span
      className={`
        px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block
        ${statusClass || variantStyles[variant] || variantStyles.default}
        ${className}
      `}
    >
      {children}
    </span>
  )
}

export default Badge
