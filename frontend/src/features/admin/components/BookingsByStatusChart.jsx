import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const STATUS_CONFIG = {
  Completed: { color: '#22C55E', label: 'Completed' },
  Pending: { color: '#F59E0B', label: 'Pending' },
  Processing: { color: '#3B82F6', label: 'Processing' },
  Cancelled: { color: '#EF4444', label: 'Cancelled' },
  Assigned: { color: '#8B5CF6', label: 'Assigned' },
  Reached: { color: '#6366F1', label: 'Reached' },
  'Sample Collected': { color: '#A855F7', label: 'Sample Collected' },
}

const BookingsByStatusChart = ({ statusCounts }) => {
  const data = Object.entries(statusCounts || {})
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_CONFIG[status]?.color || '#94A3B8',
    }))

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="mb-4 sm:mb-5">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Bookings by Status</h3>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="relative w-full sm:w-[180px] h-[180px] flex-shrink-0 mx-auto sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
                formatter={(value) => [value, 'Bookings']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono font-bold text-lg sm:text-2xl text-foreground">{total.toLocaleString('en-IN')}</span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 sm:space-y-3">
          {data.map((item) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
            return (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-xs sm:text-sm text-foreground font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-foreground">{item.value}</span>
                  <span className="text-[10px] sm:text-[11px] text-muted-foreground w-10 sm:w-12 text-right">{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default BookingsByStatusChart
