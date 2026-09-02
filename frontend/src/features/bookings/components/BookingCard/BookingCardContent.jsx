import React from 'react'
import { Calendar, Clock, MapPin, User } from 'lucide-react'

const BookingCardContent = ({ testName, testCity, amount, bookingDate, bookingTime, detail, detailType = 'address', isDetailMissing = false, assistantName, isAssistantMissing = false, assistants, onAssignAssistant, bookingId, bookingStatus }) => {
  return (
    <div className="flex flex-col flex-1 p-4 pt-3">
      <div>
        <h4 className="font-medium text-foreground text-sm leading-snug" title={testName}>
          {testName}
        </h4>
        {testCity && (
          <p className="text-xs text-muted-foreground mt-0.5">{testCity}</p>
        )}
      </div>

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
        {assistants ? (
          <div className="flex items-center gap-2">
            <User size={12} className={`shrink-0 ${isAssistantMissing ? 'text-amber-500' : 'text-muted-foreground'}`} />
            <select
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { e.stopPropagation(); onAssignAssistant?.(bookingId, e.target.value) }}
              value={isAssistantMissing ? '' : ''}
              disabled={bookingStatus !== 'Assigned'}
              className={`text-xs py-1 min-w-[130px] border rounded-lg px-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-card truncate ${isAssistantMissing ? 'border-amber-300 text-amber-500' : 'border-border text-foreground'} ${bookingStatus !== 'Assigned' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="" disabled>{isAssistantMissing ? 'Assign' : assistantName}</option>
              {assistants.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          </div>
        ) : assistantName ? (
          <div className={`flex items-center gap-2 ${isAssistantMissing ? 'text-amber-500' : 'text-muted-foreground'}`}>
            <User size={12} className="shrink-0" />
            <span className={`truncate ${isAssistantMissing ? 'font-medium' : ''}`}>{assistantName}</span>
          </div>
        ) : null}
      </dl>
    </div>
  )
}

export default BookingCardContent
