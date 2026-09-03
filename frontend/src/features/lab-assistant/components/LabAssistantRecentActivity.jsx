import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const activityIcons = {
  'Sample collected': 'bg-green-100 text-green-600',
  'Sample handed to lab': 'bg-blue-100 text-blue-600',
  'Report uploaded': 'bg-purple-100 text-purple-600',
  'Booking assigned': 'bg-amber-100 text-amber-600',
}

const LabAssistantRecentActivity = ({ data }) => {
  const navigate = useNavigate()

  const formatTime = (time) => {
    if (!time) return ''
    const diff = Date.now() - new Date(time).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Recent Activity</h3>
        <button
          onClick={() => navigate(ROUTES.LAB_ASSISTANT_SAMPLE_PICKUPS)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {(data || []).map((item) => (
          <div key={item._id} className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activityIcons[item.type] || 'bg-gray-100 text-gray-600'}`}>
              <span className="text-xs font-bold">{item.type?.charAt(0) || 'A'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground">
                <span className="font-medium">{item.type}</span>
                {item.bookingId && (
                  <span className="text-muted-foreground"> - Booking ID: {item.bookingId}</span>
                )}
                {item.patientName && (
                  <span className="text-muted-foreground"> for {item.patientName}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{formatTime(item.time)}</p>
            </div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <p className="text-center text-muted-foreground text-xs py-4">No recent activity</p>
        )}
      </div>
    </div>
  )
}

export default LabAssistantRecentActivity
