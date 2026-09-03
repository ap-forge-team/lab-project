import React, { useState, useRef, useEffect } from 'react'
import { Calendar, Clock, MapPin, User, ChevronDown } from 'lucide-react'

const AssistantSelect = ({ assistants, isAssistantMissing, assistantName, bookingStatus, onAssignAssistant, bookingId }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const disabled = bookingStatus !== 'Assigned' && bookingStatus !== 'Pending'

  useEffect(() => {
    if (!open) return
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [open])

  const handleSelect = (id) => {
    onAssignAssistant?.(bookingId, id)
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); if (!disabled) setOpen(!open) }}
        disabled={disabled}
        className={`text-xs py-1.5 w-full min-w-0 border rounded-lg px-2 pr-6 text-left bg-card truncate ${isAssistantMissing ? 'border-amber-300 text-amber-500' : 'border-border text-foreground'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        {isAssistantMissing ? 'Assign' : assistantName}
      </button>
      <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      {open && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-full min-w-[160px] bg-white border border-border rounded-lg shadow-lg py-1 z-[100] max-h-[200px] overflow-y-auto">
            {assistants.map((a) => (
              <button
                key={a._id}
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSelect(a._id) }}
                className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent w-full text-left truncate"
              >
                <span className="truncate">{a.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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
          <div className="flex items-center gap-2 min-w-0">
            <User size={12} className={`shrink-0 ${isAssistantMissing ? 'text-amber-500' : 'text-muted-foreground'}`} />
            <div className="flex-1 min-w-0">
              <AssistantSelect
                assistants={assistants}
                isAssistantMissing={isAssistantMissing}
                assistantName={assistantName}
                bookingStatus={bookingStatus}
                onAssignAssistant={onAssignAssistant}
                bookingId={bookingId}
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
