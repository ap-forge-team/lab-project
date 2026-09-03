import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const LabAssistantWeeklySamplesChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Samples Collected This Week</h3>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data || []} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Samples Collected"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default LabAssistantWeeklySamplesChart
