import React from 'react'
import { CalendarCheck, FlaskConical, TestTube, IndianRupee, Clock } from 'lucide-react'
import { formatCurrency } from '@/utils/formatCurrency'

const statConfig = [
  {
    key: 'totalBookings',
    title: 'Total Bookings',
    icon: CalendarCheck,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'samplesCollected',
    title: 'Samples Collected',
    icon: FlaskConical,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'testsCompleted',
    title: 'Tests Completed',
    icon: TestTube,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'totalRevenue',
    title: 'Total Revenue',
    icon: IndianRupee,
    iconClass: 'bg-amber-50 text-amber-600',
    isCurrency: true,
  },
  {
    key: 'pendingReports',
    title: 'Pending Reports',
    icon: Clock,
    iconClass: 'bg-rose-50 text-rose-600',
  },
]

const LabOwnerStatsGrid = ({ stats }) => {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
      {statConfig.map((s) => {
        const Icon = s.icon
        const value = stats[s.key] ?? 0
        return (
          <div
            key={s.key}
            className="rounded-xl border border-border bg-white p-3 shadow-sm sm:p-4"
          >
            <div className="flex items-center gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.iconClass}`}>
                <Icon size={20} />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{s.title}</p>
                <p className="mt-0.5 text-xl font-bold text-foreground">
                  {s.isCurrency ? formatCurrency(value) : value.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LabOwnerStatsGrid
