import React from 'react'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
import Select from '@/components/ui/Select'

const BookingCardContent = ({ testName, testCity, amount, bookingDate, bookingTime, detail, detailType = 'address', isDetailMissing = false, assistantName, isAssistantMissing = false, assignedAssistantId = '', assistants, onAssignAssistant, bookingId, bookingStatus, additionalTests, additionalPackages }) => {
  return (
    <div className="flex flex-col flex-1 p-4 pt-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <h4 className="font-medium text-foreground text-sm leading-snug" title={testName}>
            {testName}
          </h4>
          {(additionalTests?.length > 0 || additionalPackages?.length > 0) && (
            <span className="text-[10px] text-purple-700 font-medium bg-purple-50 px-1.5 py-0.5 rounded">
              +{additionalTests.length + additionalPackages.length}
            </span>
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
        {assistants ? (
          <div className="flex items-center gap-2 min-w-0">
            <User size={12} className={`shrink-0 ${isAssistantMissing ? 'text-amber-500' : 'text-muted-foreground'}`} />
            <div className="flex-1 min-w-0">
              <Select
                value={assignedAssistantId}
                onChange={(e) => onAssignAssistant?.(bookingId, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder={isAssistantMissing ? 'Assign' : assistantName}
                options={assistants.map((a) => ({ value: a._id, label: a.name }))}
                size="sm"
                disabled={bookingStatus !== 'Assigned' && bookingStatus !== 'Pending'}
              />
            </div>
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
