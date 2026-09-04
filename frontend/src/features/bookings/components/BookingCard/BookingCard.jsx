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
  onManageBooking,
  onMenuToggle,
  onAssignAssistant,
  assistants,
  cardId,
}) => {
  const isLabAssistant = role === ROLES.LAB_ASSISTANT
  const isLabOwner = role === ROLES.LAB_OWNER
  const isPatient = role === ROLES.PATIENT
  const testName = booking.test?.title || booking.package?.title || 'N/A'
  const testCity = booking.test?.city || booking.package?.city
  const amount = booking.totalAmount || booking.test?.price || booking.package?.price || 0
  const detail = isPatient
    ? (booking.labOwner?.name || 'Lab Pending')
    : isLabAssistant
      ? booking.address
      : isLabOwner
        ? null
        : (booking.labOwner?.name || 'No Lab Assigned')
  const detailType = isPatient ? 'lab' : isLabAssistant ? 'address' : 'lab'
  const isDetailMissing = !isPatient && !isLabAssistant && !isLabOwner && !booking.labOwner?.name
  const assistantName = isLabOwner ? (booking.assignedLabAssistant?.name || 'No Assistant Assigned') : null
  const isAssistantMissing = isLabOwner && !booking.assignedLabAssistant?.name

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
      className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md cursor-pointer"
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
        isAssistantMissing={isAssistantMissing}
        assistants={isLabOwner ? assistants : null}
        onAssignAssistant={onAssignAssistant}
        bookingId={booking._id}
        bookingStatus={booking.status}
        additionalTests={booking.additionalTests}
        additionalPackages={booking.additionalPackages}
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
          onManageBooking={onManageBooking}
        />
      )}
    </article>
  )
}

export default BookingCard
