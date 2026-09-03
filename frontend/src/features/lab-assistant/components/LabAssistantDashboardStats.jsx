import React from 'react'
import { ClipboardList, TestTube, FlaskConical, Microscope, Clock } from 'lucide-react'

const statConfig = [
  {
    key: 'todayCollections',
    title: "Today's Collections",
    icon: ClipboardList,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'samplesCollected',
    title: 'Samples Collected',
    icon: TestTube,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'samplesInLab',
    title: 'Samples in Lab',
    icon: FlaskConical,
    iconClass: 'bg-purple-50 text-purple-600',
  },
  {
    key: 'testsInProgress',
    title: 'Tests In Progress',
    icon: Microscope,
    iconClass: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'testsPending',
    title: 'Tests Pending',
    icon: Clock,
    iconClass: 'bg-rose-50 text-rose-600',
  },
]

const LabAssistantDashboardStats = ({ stats }) => {
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
                  {value.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default LabAssistantDashboardStats
