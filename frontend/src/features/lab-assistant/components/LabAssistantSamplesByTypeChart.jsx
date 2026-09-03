import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const TYPE_COLORS = ['#2563EB', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6']

const LabAssistantSamplesByTypeChart = ({ data }) => {
  const chartData = (data || []).map((item, index) => ({
    ...item,
    color: TYPE_COLORS[index % TYPE_COLORS.length],
  }))

  const total = chartData.reduce((sum, d) => sum + (d.count || 0), 0)

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Samples by Type (This Week)</h3>
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
                dataKey="count"
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
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
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Total Samples</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 sm:space-y-3">
          {chartData.map((item, index) => {
            const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-xs sm:text-sm text-foreground font-medium">{item.type}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-semibold text-foreground">{item.count}</span>
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

export default LabAssistantSamplesByTypeChart
