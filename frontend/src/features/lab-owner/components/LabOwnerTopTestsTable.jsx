import React from 'react'

const CATEGORY_COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6']

const LabOwnerTopTestsTable = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Top Tests This Week</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(data || []).map((test, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:shadow-md transition-all duration-200 cursor-default"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
            >
              {idx + 1}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm truncate">{test.name}</p>
              <p className="text-xs text-muted-foreground">{test.count} bookings</p>
            </div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <div className="col-span-2 py-6 text-center text-muted-foreground text-xs">No test data available</div>
        )}
      </div>
    </div>
  )
}

export default LabOwnerTopTestsTable
