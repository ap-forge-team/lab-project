import React from 'react'
import { Calendar, Clock, MapPin, User } from 'lucide-react'

const BookingCardContent = ({ testName, amount, bookingDate, bookingTime, detail, detailType = 'address', isDetailMissing = false }) => {
  return (
    <div className="flex flex-col flex-1 p-4 pt-3">
      <h4 className="font-medium text-foreground text-sm leading-snug" title={testName}>
        {testName}
      </h4>

      <div className="mt-2">
        <span className="font-mono text-sm font-bold text-primary">
          ₹{amount?.toLocaleString('en-IN')}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar size={12} />
          <span>{bookingDate}</span>
          <span className="text-border">•</span>
          <Clock size={12} />
          <span>{bookingTime}</span>
        </div>
        {detail && (
          <div className={`flex items-center gap-2 ${isDetailMissing ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {detailType === 'address' ? (
              <MapPin size={12} className="text-red-500 shrink-0" />
            ) : (
              <User size={12} className="shrink-0" />
            )}
            <span className={`truncate ${isDetailMissing ? 'font-medium' : ''}`}>{detail}</span>
          </div>
        )}
      </dl>
    </div>
  )
}

export default BookingCardContent
