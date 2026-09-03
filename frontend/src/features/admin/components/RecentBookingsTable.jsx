import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const statusStyles = {
  Completed: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-600',
  Processing: 'bg-blue-50 text-blue-600',
  Cancelled: 'bg-red-100 text-red-700',
  Assigned: 'bg-purple-50 text-purple-600',
  Reached: 'bg-indigo-50 text-indigo-600',
  'Sample Collected': 'bg-violet-50 text-violet-600',
}

const RecentBookingsTable = ({ data }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Recent Bookings</h3>
        <button
          onClick={() => navigate(ROUTES.ADMIN_BOOKINGS)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 sm:py-2.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Booking ID</th>
              <th className="text-left py-2 sm:py-2.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider hidden sm:table-cell">Patient</th>
              <th className="text-left py-2 sm:py-2.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((booking) => (
              <tr key={booking._id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 sm:py-3">
                  <span className="font-semibold text-primary text-xs sm:text-[13px]">{booking.bookingId}</span>
                  <span className="block sm:hidden text-muted-foreground text-[11px] mt-0.5">{booking.patientName}</span>
                </td>
                <td className="py-2.5 sm:py-3 text-foreground hidden sm:table-cell">{booking.patientName}</td>
                <td className="py-2.5 sm:py-3">
                  <span className={`px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${statusStyles[booking.status] || 'bg-gray-50 text-gray-600'}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={3} className="py-6 sm:py-8 text-center text-muted-foreground text-xs">No recent bookings</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentBookingsTable
