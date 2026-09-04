import { Clock } from 'lucide-react'

const MORNING_SLOTS = [
  { time: '6:00 AM', period: 'Morning' },
  { time: '6:30 AM', period: 'Morning' },
  { time: '7:00 AM', period: 'Morning' },
  { time: '7:30 AM', period: 'Morning' },
  { time: '8:00 AM', period: 'Morning' },
  { time: '8:30 AM', period: 'Morning' },
  { time: '9:00 AM', period: 'Morning' },
  { time: '9:30 AM', period: 'Morning' },
  { time: '10:00 AM', period: 'Morning' },
  { time: '10:30 AM', period: 'Morning' },
  { time: '11:00 AM', period: 'Morning' },
  { time: '11:30 AM', period: 'Morning' },
]

const AFTERNOON_SLOTS = [
  { time: '12:00 PM', period: 'Afternoon' },
  { time: '12:30 PM', period: 'Afternoon' },
  { time: '1:00 PM', period: 'Afternoon' },
  { time: '1:30 PM', period: 'Afternoon' },
  { time: '2:00 PM', period: 'Afternoon' },
  { time: '2:30 PM', period: 'Afternoon' },
  { time: '3:00 PM', period: 'Afternoon' },
  { time: '3:30 PM', period: 'Afternoon' },
  { time: '4:00 PM', period: 'Afternoon' },
  { time: '4:30 PM', period: 'Afternoon' },
  { time: '5:00 PM', period: 'Afternoon' },
  { time: '5:30 PM', period: 'Afternoon' },
]

const EVENING_SLOTS = [
  { time: '6:00 PM', period: 'Evening' },
  { time: '6:30 PM', period: 'Evening' },
  { time: '7:00 PM', period: 'Evening' },
  { time: '7:30 PM', period: 'Evening' },
  { time: '8:00 PM', period: 'Evening' },
  { time: '8:30 PM', period: 'Evening' },
  { time: '9:00 PM', period: 'Evening' },
]

export default function TimeSlotPicker({ selectedTime, onTimeChange }) {
  const sections = [
    { label: 'Morning', icon: '🌅', slots: MORNING_SLOTS },
    { label: 'Afternoon', icon: '☀️', slots: AFTERNOON_SLOTS },
    { label: 'Evening', icon: '🌆', slots: EVENING_SLOTS },
  ]

  return (
    <div className="space-y-4">
      {sections.map(({ label, icon, slots }) => (
        <div key={label}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs">{icon}</span>
            <span className="text-xs font-semibold text-foreground">{label}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {slots.map(({ time }) => (
              <button
                key={time}
                type="button"
                onClick={() => onTimeChange(time)}
                className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition
                  ${selectedTime === time
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:border-primary/40 text-foreground'
                  }
                `}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
