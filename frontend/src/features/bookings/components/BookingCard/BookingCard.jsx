import React from 'react'
import { MoreVertical } from 'lucide-react'
import { ROLES } from '@/constants/roles'
import BookingCardHeader from './BookingCardHeader'
import BookingCardContent from './BookingCardContent'
import BookingCardBadges from './BookingCardBadges'
import BookingCardFooter from './BookingCardFooter'

const BookingCard = ({
  booking,
  role,
  onSelect,
  onEditLab,
  onViewReport,
  onMenuToggle,
  cardId,
}) => {
  const isLabAssistant = role === ROLES.LAB_ASSISTANT
  const isLabOwner = role === ROLES.LAB_OWNER
  const testName = booking.test?.title || booking.package?.title || 'N/A'
  const testCity = booking.test?.city || booking.package?.city
  const amount = booking.test?.price || booking.package?.price || booking.totalAmount || 0
  const detail = isLabAssistant
    ? booking.address
    : isLabOwner
      ? null
      : (booking.labOwner?.name || 'No Lab Assigned')
  const detailType = isLabAssistant ? 'address' : 'lab'
  const isDetailMissing = !isLabAssistant && !isLabOwner && !booking.labOwner?.name
  const assistantName = isLabOwner ? booking.assignedLabAssistant?.name : null

  const threeDotButton = (isLabAssistant || isLabOwner) ? (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onMenuToggle?.(e, booking, cardId)
      }}
      className="p-1 text-muted-foreground hover:text-foreground rounded transition"
    >
      <MoreVertical size={16} />
    </button>
  ) : null

  return (
    <article
      onClick={() => onSelect?.(booking)}
      className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md overflow-hidden cursor-pointer"
    >
      <BookingCardHeader
        patientName={booking.patientName}
        phone={booking.phone}
        variant="initials"
      />

      <BookingCardContent
        testName={testName}
        testCity={testCity}
        amount={amount}
        bookingDate={booking.bookingDate}
        bookingTime={booking.bookingTime}
        detail={detail}
        detailType={detailType}
        isDetailMissing={isDetailMissing}
        assistantName={assistantName}
      />

      <BookingCardBadges
        status={booking.status}
        paymentStatus={booking.paymentStatus}
        variant={isLabAssistant ? 'assistant' : 'default'}
        actionButton={threeDotButton}
      />

      {!isLabAssistant && (
        <BookingCardFooter
          booking={booking}
          role={role}
          onEditLab={onEditLab}
          onViewReport={onViewReport}
        />
      )}
    </article>
  )
}

export default BookingCard
