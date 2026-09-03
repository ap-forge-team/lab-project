import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-600',
  Assigned: 'bg-purple-50 text-purple-600',
  Reached: 'bg-indigo-50 text-indigo-600',
  'Sample Collected': 'bg-green-50 text-green-700',
  Completed: 'bg-green-50 text-green-700',
  Processing: 'bg-blue-50 text-blue-600',
}

const LabAssistantTodayBookings = ({ data }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Today's Bookings</h3>
        <button
          onClick={() => navigate(ROUTES.LAB_ASSISTANT_BOOKINGS)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Time</th>
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Booking ID</th>
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider hidden sm:table-cell">Patient</th>
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((item) => (
              <tr key={item._id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 sm:py-3 text-muted-foreground text-xs">{item.time}</td>
                <td className="py-2.5 sm:py-3">
                  <span className="font-semibold text-primary text-xs sm:text-[13px]">{item.bookingId}</span>
                </td>
                <td className="py-2.5 sm:py-3 text-foreground hidden sm:table-cell">{item.patientName}</td>
                <td className="py-2.5 sm:py-3">
                  <span className={`px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${statusStyles[item.status] || 'bg-gray-50 text-gray-600'}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={4} className="py-6 sm:py-8 text-center text-muted-foreground text-xs">No bookings today</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LabAssistantTodayBookings
