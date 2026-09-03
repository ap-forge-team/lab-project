import React from 'react'
import { MoreVertical, Pencil, Eye, Download, Settings } from 'lucide-react'
import { ROLES } from '@/constants/roles'
import { BOOKING_STATUS } from '@/constants/status'

const BookingCardFooter = ({
  booking,
  role,
  onEditLab,
  onViewReport,
  onManageBooking,
  onMenuToggle,
  cardId,
}) => {
  const isAdmin = role === ROLES.ADMIN
  const isLabAssistant = role === ROLES.LAB_ASSISTANT
  const isPatient = role === ROLES.PATIENT

  if (isLabAssistant) {
    return (
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-end px-4 pb-4">
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onMenuToggle(e, booking, cardId)
            }}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded transition"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    )
  }

  if (isPatient) {
    const canManage = booking.status !== BOOKING_STATUS.COMPLETED && booking.status !== BOOKING_STATUS.CANCELLED
    return (
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between px-4 pb-4">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          NABL Accredited Labs
        </span>
        <div className="flex items-center gap-1">
          {booking.report && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onViewReport(booking)
              }}
              className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
            >
              <Eye size={14} />
            </button>
          )}
          {booking.report && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                window.open(booking.report, '_blank')
              }}
              className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
            >
              <Download size={14} />
            </button>
          )}
          {canManage && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onManageBooking(booking)
              }}
              className="rounded p-1 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 transition"
            >
              <Settings size={14} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-auto pt-3 border-t border-border flex items-center justify-between px-4 pb-4">
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        NABL Accredited Labs
      </span>
      <div className="flex items-center gap-1">
        {isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEditLab(booking)
            }}
            disabled={booking.status === BOOKING_STATUS.COMPLETED || booking.status === BOOKING_STATUS.CANCELLED}
            className="rounded p-1 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Pencil size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onViewReport(booking)
          }}
          className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
        >
          <Eye size={14} />
        </button>
        {booking.report && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              window.open(booking.report, '_blank')
            }}
            className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
          >
            <Download size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default BookingCardFooter
