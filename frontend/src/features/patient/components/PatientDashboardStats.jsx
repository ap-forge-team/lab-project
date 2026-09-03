import React from 'react'
import { CalendarCheck, FileText, ClipboardList, TestTube } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const statConfig = [
  {
    key: 'upcomingBooking',
    title: 'Upcoming Booking',
    icon: CalendarCheck,
    iconClass: 'bg-blue-50 text-blue-600',
    subtitle: 'Tomorrow, 10:00 AM',
    buttonLabel: 'View Booking',
    buttonAction: 'bookings',
  },
  {
    key: 'reportsAvailable',
    title: 'Reports Available',
    icon: FileText,
    iconClass: 'bg-emerald-50 text-emerald-600',
    subtitle: 'View your latest test reports',
    buttonLabel: 'View Reports',
    buttonAction: 'reports',
  },
  {
    key: 'totalBookings',
    title: 'Total Bookings',
    icon: ClipboardList,
    iconClass: 'bg-purple-50 text-purple-600',
    subtitle: 'All time bookings completed',
    buttonLabel: 'View All',
    buttonAction: 'bookings',
  },
  {
    key: 'totalTests',
    title: 'Total Tests',
    icon: TestTube,
    iconClass: 'bg-amber-50 text-amber-600',
    subtitle: 'Tests taken so far',
    buttonLabel: 'View History',
    buttonAction: 'bookings',
  },
]

const PatientStatsGrid = ({ stats, upcomingBooking }) => {
  const navigate = useNavigate()

  const handleAction = (action) => {
    if (action === 'bookings') navigate('/booking/history')
    else if (action === 'reports') navigate('/booking/reports')
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
      {statConfig.map((s) => {
        const Icon = s.icon
        let value = stats[s.key] ?? 0
        let subtitle = s.subtitle

        if (s.key === 'upcomingBooking' && upcomingBooking) {
          subtitle = `${upcomingBooking.date}, ${upcomingBooking.time}`
        }

        return (
          <div
            key={s.key}
            className="rounded-xl border border-border bg-white p-3 shadow-sm sm:p-4 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.iconClass}`}>
                <Icon size={16} />
              </span>
              <p className="text-xs text-muted-foreground font-medium">{s.title}</p>
            </div>
            <p className="text-2xl font-bold text-foreground mb-1">
              {value.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-muted-foreground mb-3 flex-1">{subtitle}</p>
            <button
              onClick={() => handleAction(s.buttonAction)}
              className="w-full py-1.5 px-3 text-xs font-semibold text-foreground border border-border rounded-lg hover:bg-accent transition"
            >
              {s.buttonLabel}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default PatientStatsGrid
