import React from 'react'
import { FlaskConical, ClipboardList, CircleCheckBig } from 'lucide-react'
import { BOOKING_STATUS } from '@/constants/status'

const StatCard = ({ icon: Icon, borderColor, iconColor, cardBg, title, value, detailTop, detailBottom, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-2xl border ${borderColor} px-4 py-3 ${cardBg} transition hover:shadow-md ${active ? 'ring-2 ring-primary ring-offset-2' : ''}`}
  >
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${borderColor} ${iconColor}`}>
        {React.createElement(Icon, { size: 18 })}
      </span>
      <div className="min-w-0 flex-1 space-y-0 text-left">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-bold leading-tight text-foreground">{value}</p>
      </div>
      <div className="h-8 w-px shrink-0 self-stretch my-auto bg-border" />
      <div className="shrink-0 text-right leading-tight">
        <p className="text-xs text-muted-foreground">{detailTop}</p>
        <p className="text-xs text-muted-foreground">{detailBottom}</p>
      </div>
    </div>
  </button>
)

const LabAssistantStatsGrid = ({ bookings, activeSection, setActiveSection }) => {
  const totalTests = bookings.length
  const pendingReports = bookings.filter((item) => item.status === BOOKING_STATUS.PENDING).length
  const completed = bookings.filter((item) => item.status === BOOKING_STATUS.COMPLETED).length

  return (
    <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-4 min-w-max">
        <div className="snap-start min-w-[220px] shrink-0">
          <StatCard
            icon={FlaskConical}
            borderColor="border-blue-200"
            iconColor="text-blue-500"
            cardBg="bg-blue-50"
            title="Total Tests"
            value={totalTests}
            detailTop="All"
            detailBottom="bookings"
            active={activeSection === 'all'}
            onClick={() => setActiveSection('all')}
          />
        </div>
        <div className="snap-start min-w-[220px] shrink-0">
          <StatCard
            icon={ClipboardList}
            borderColor="border-amber-200"
            iconColor="text-amber-500"
            cardBg="bg-amber-50"
            title="Pending Reports"
            value={pendingReports}
            detailTop="Awaiting"
            detailBottom="completion"
            active={activeSection === 'pending'}
            onClick={() => setActiveSection('pending')}
          />
        </div>
        <div className="snap-start min-w-[220px] shrink-0">
          <StatCard
            icon={CircleCheckBig}
            borderColor="border-emerald-200"
            iconColor="text-emerald-500"
            cardBg="bg-emerald-50"
            title="Completed"
            value={completed}
            detailTop="Done"
            detailBottom="bookings"
            active={activeSection === 'completed'}
            onClick={() => setActiveSection('completed')}
          />
        </div>
      </div>
    </div>
  )
}

export default LabAssistantStatsGrid
