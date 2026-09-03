import React from 'react'
import { FlaskConical, FileCheck, Clock, AlertTriangle } from 'lucide-react'

const statsConfig = [
  {
    key: 'samplesCollected',
    title: 'Samples Collected',
    icon: FlaskConical,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    subtitle: 'This Week',
  },
  {
    key: 'reportsCompleted',
    title: 'Reports Completed',
    icon: FileCheck,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    subtitle: 'This Week',
  },
  {
    key: 'reportsPending',
    title: 'Reports Pending',
    icon: Clock,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    subtitle: 'This Week',
  },
  {
    key: 'reportsOverdue',
    title: 'Reports Overdue',
    icon: AlertTriangle,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    subtitle: 'Requires Attention',
    isWarning: true,
  },
]

const WeeklyStatsRow = ({ stats }) => {
  if (!stats) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statsConfig.map((s) => {
        const Icon = s.icon
        const value = stats[s.key] ?? 0
        return (
          <div
            key={s.key}
            className={`bg-white rounded-xl p-4 shadow-sm border transition hover:shadow-md ${
              s.isWarning ? 'border-rose-200' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                <Icon size={18} className={s.iconColor} />
              </div>
              <div>
                <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider leading-tight">
                  {s.title}
                </p>
              </div>
            </div>
            <p className="font-mono font-bold text-foreground text-2xl">
              {value.toLocaleString('en-IN')}
            </p>
            <p className={`text-[11px] mt-1 ${s.isWarning ? 'text-rose-500 font-medium' : 'text-muted-foreground'}`}>
              {s.subtitle}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export default WeeklyStatsRow
