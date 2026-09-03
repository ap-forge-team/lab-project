import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-600',
  Assigned: 'bg-purple-50 text-purple-600',
  Reached: 'bg-indigo-50 text-indigo-600',
  'Sample Collected': 'bg-green-50 text-green-700',
  Confirmed: 'bg-green-50 text-green-700',
  Completed: 'bg-green-50 text-green-700',
  Processing: 'bg-blue-50 text-blue-600',
  Cancelled: 'bg-red-50 text-red-600',
}

const PatientRecentBookings = ({ data }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Recent Bookings</h3>
        <button
          onClick={() => navigate('/booking/history')}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Booking ID</th>
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider hidden sm:table-cell">Test/Package</th>
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider hidden lg:table-cell">Lab</th>
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Status</th>
              <th className="text-right py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Amount</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((booking) => (
              <tr key={booking._id} className="border-b border-border/50 last:border-0 hover:bg-accent/50 cursor-pointer">
                <td className="py-3">
                  <span className="font-semibold text-primary text-xs sm:text-[13px]">{booking.bookingId}</span>
                </td>
                <td className="py-3 text-foreground hidden sm:table-cell">{booking.testName}</td>
                <td className="py-3 text-muted-foreground text-xs hidden md:table-cell">{booking.date}</td>
                <td className="py-3 text-muted-foreground text-xs hidden lg:table-cell truncate max-w-[120px]">{booking.labName}</td>
                <td className="py-3">
                  <span className={`px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${statusStyles[booking.status] || 'bg-gray-50 text-gray-600'}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="py-3 text-right font-semibold text-foreground">₹{booking.amount.toLocaleString('en-IN')}</td>
                <td className="py-3">
                  <ChevronRight size={16} className="text-muted-foreground" />
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={7} className="py-6 sm:py-8 text-center text-muted-foreground text-xs">No bookings yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PatientRecentBookings
