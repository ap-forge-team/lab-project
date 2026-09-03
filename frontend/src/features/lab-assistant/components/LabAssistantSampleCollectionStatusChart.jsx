import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const STATUS_COLORS = {
  collected: '#22C55E',
  pending: '#F59E0B',
  inTransit: '#3B82F6',
  failed: '#EF4444',
}

const LabAssistantSampleCollectionStatusChart = ({ data }) => {
  const chartData = [
    { name: 'Collected', value: data?.collected || 0 },
    { name: 'Pending', value: data?.pending || 0 },
    { name: 'In Transit', value: data?.inTransit || 0 },
    { name: 'Failed', value: data?.failed || 0 },
  ].filter((item) => item.value > 0)

  const total = chartData.reduce((sum, d) => sum + (d.value || 0), 0)

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Today's Sample Collection Status</h3>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="relative w-full sm:w-[180px] h-[180px] flex-shrink-0 mx-auto sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={STATUS_COLORS[entry.name.toLowerCase().replace(' ', '')] || '#94A3B8'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
                formatter={(value) => [value, 'Samples']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono font-bold text-lg sm:text-2xl text-foreground">{total}</span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 sm:space-y-3">
          {chartData.map((item, index) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0
            const colorKey = item.name.toLowerCase().replace(' ', '')
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[colorKey] || '#94A3B8' }}
                  ></span>
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

export default LabAssistantSampleCollectionStatusChart
