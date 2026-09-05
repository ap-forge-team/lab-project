import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Calendar, MapPin, CalendarDays } from 'lucide-react'

const statusStyles = {
  Pending: 'bg-amber-50 text-amber-600',
  Assigned: 'bg-purple-50 text-purple-600',
  Reached: 'bg-indigo-50 text-indigo-600',
  'Sample Collected': 'bg-green-50 text-green-700',
  Confirmed: 'bg-green-50 text-green-700',
  Completed: 'bg-green-50 text-green-700',
  Processing: 'bg-blue-50 text-blue-600',
}

const PatientUpcomingBooking = ({ data }) => {
  const navigate = useNavigate()

  if (!data) {
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Upcoming Booking</h3>
          <button
            onClick={() => navigate('/booking/bookings')}
            className="text-xs font-semibold text-primary hover:underline"
          >
            View All
          </button>
        </div>
        <div className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No upcoming bookings</p>
          <button
            onClick={() => navigate('/booking/tests')}
            className="mt-3 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            Book a Test
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Upcoming Booking</h3>
        <button
          onClick={() => navigate('/booking/bookings')}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Left - Test Info */}
        <div className="flex-shrink-0 flex flex-col items-center sm:items-start">
          <div className="w-16 h-16 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
          <p className="font-semibold text-foreground text-base text-center sm:text-left">{data.testName}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${statusStyles[data.status] || 'bg-gray-50 text-gray-600'}`}>
            {data.status}
          </span>
          <p className="text-xs text-muted-foreground mt-2">Booking ID: {data.bookingId}</p>
        </div>

        {/* Middle - Details */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start gap-2">
            <CalendarDays size={14} className="text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Date & Time</p>
              <p className="text-sm font-medium text-foreground">{data.date}, {data.time}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Lab</p>
              <p className="text-sm font-medium text-foreground">{data.labName}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={14} className="text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="text-sm text-foreground">{data.address}, {data.city} {data.pincode}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default PatientUpcomingBooking
