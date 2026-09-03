import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const LabAssistantNotices = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Important Notices</h3>
        <button
          onClick={() => navigate(ROUTES.LAB_ASSISTANT)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All Notices
        </button>
      </div>

      <div className="space-y-3">
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <span className="text-amber-600 text-sm mt-0.5">⏰</span>
            <div>
              <p className="text-sm font-medium text-amber-800">Timely Sample Delivery</p>
              <p className="text-xs text-amber-700 mt-1">
                Please ensure all collected samples are delivered to the lab within the scheduled time to maintain test accuracy.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <span className="text-blue-600 text-sm mt-0.5">📋</span>
            <div>
              <p className="text-sm font-medium text-blue-800">New Test Procedures</p>
              <p className="text-xs text-blue-700 mt-1">
                Updated sample collection procedures for Thyroid Profile tests. Please review before next collection.
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
          <div className="flex items-start gap-2">
            <span className="text-rose-600 text-sm mt-0.5">⚠️</span>
            <div>
              <p className="text-sm font-medium text-rose-800">Inventory Alert</p>
              <p className="text-xs text-rose-700 mt-1">
                Blood collection supplies are running low. Please report to inventory manager before next shift.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LabAssistantNotices
