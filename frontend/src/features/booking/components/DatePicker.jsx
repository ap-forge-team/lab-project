import { useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const SHORT_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function DatePicker({ selectedDate, onDateChange, minDate }) {
  const today = new Date()
  const [viewDate, setViewDate] = useState(selectedDate ? new Date(selectedDate) : new Date(today.getFullYear(), today.getMonth(), today.getDate()))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const minD = minDate ? new Date(minDate) : today
  minD.setHours(0, 0, 0, 0)

  const cells = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: daysInPrevMonth - firstDay + i + 1, currentMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    date.setHours(0, 0, 0, 0)
    const isPast = date < minD
    const isSelected = selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = date.getTime() === new Date().setHours(0, 0, 0, 0)
    const isTomorrow = date.getTime() === new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).getTime()
    cells.push({ day: d, currentMonth: true, isPast, isSelected, isToday, isTomorrow, dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }
  const remaining = 42 - cells.length
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, currentMonth: false })
  }

  const prevMonth = () => {
    if (month === 0) setViewDate(new Date(year - 1, 11, 1))
    else setViewDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    if (month === 11) setViewDate(new Date(year + 1, 0, 1))
    else setViewDate(new Date(year, month + 1, 1))
  }

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return null
    const [y, m, d] = dateStr.split('-')
    const date = new Date(y, parseInt(m) - 1, parseInt(d))
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
    return `${dayName}, ${d} ${MONTHS[parseInt(m) - 1]} ${y}`
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-foreground flex items-center gap-2">
        <CalendarDays size={18} className="text-primary" />
        Select Date
      </label>

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {/* Month Navigation */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-border">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{MONTHS[month]}</span>
            <span className="text-sm font-bold text-foreground">{year}</span>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-foreground" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7">
          {SHORT_DAYS.map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-muted-foreground py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 px-1 pb-1">
          {cells.map((cell, i) => (
            <button
              key={i}
              type="button"
              disabled={!cell.currentMonth || cell.isPast}
              onClick={() => cell.currentMonth && !cell.isPast && onDateChange(cell.dateStr)}
              className={`
                relative h-10 w-full text-sm font-medium rounded-lg transition-all duration-150
                ${!cell.currentMonth
                  ? 'text-muted-foreground/25'
                  : cell.isPast
                    ? 'text-muted-foreground/35 cursor-not-allowed'
                    : 'hover:bg-primary/10 cursor-pointer active:scale-95'
                }
                ${cell.isSelected
                  ? 'bg-primary text-white font-bold shadow-md shadow-primary/25'
                  : ''
                }
                ${cell.isToday && !cell.isSelected
                  ? 'text-primary font-bold'
                  : ''
                }
                ${cell.isTomorrow && !cell.isSelected
                  ? 'text-foreground'
                  : ''
                }
              `}
            >
              {cell.day}
              {cell.isToday && !cell.isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
              )}
            </button>
          ))}
        </div>

        {/* Selected Date Display */}
        {selectedDate && (
          <div className="px-4 py-3 border-t border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-primary" />
              <span className="text-sm font-medium text-foreground">{formatSelectedDate(selectedDate)}</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="px-4 py-2 border-t border-border flex items-center justify-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="relative w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-primary/20"></span>
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
            </span>
            Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm"></span>
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-muted"></span>
            Unavailable
          </span>
        </div>
      </div>
    </div>
  )
}
