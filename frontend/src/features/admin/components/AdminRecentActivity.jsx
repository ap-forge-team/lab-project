import React from 'react'
import { CalendarCheck, CreditCard, Users, FlaskConical, PackageOpen, Clock } from 'lucide-react'

const activityConfig = {
  booking: {
    icon: CalendarCheck,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  payment: {
    icon: CreditCard,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  user: {
    icon: Users,
    bgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
  },
  test: {
    icon: FlaskConical,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  package: {
    icon: PackageOpen,
    bgColor: 'bg-rose-100',
    iconColor: 'text-rose-600',
  },
}

const AdminRecentActivity = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold text-foreground">Recent Activity</h3>
        <button className="text-xs font-semibold text-primary hover:underline">View All</button>
      </div>

      <div className="space-y-1">
        {(data || []).map((activity, idx) => {
          const config = activityConfig[activity.type] || activityConfig.booking
          const Icon = config.icon
          return (
            <div
              key={idx}
              className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                <Icon size={16} className={config.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-tight">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{activity.description}</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground flex-shrink-0">
                <Clock size={10} />
                <span>{activity.timeAgo}</span>
              </div>
            </div>
          )
        })}
        {(!data || data.length === 0) && (
          <div className="py-8 text-center text-muted-foreground text-xs">No recent activity</div>
        )}
      </div>
    </div>
  )
}

export default AdminRecentActivity
