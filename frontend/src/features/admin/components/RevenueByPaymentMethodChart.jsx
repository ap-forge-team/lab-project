import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/utils/formatCurrency'

const METHOD_COLORS = {
  UPI: '#8B5CF6',
  Card: '#3B82F6',
  'Net Banking': '#22C55E',
  Cash: '#F59E0B',
  Online: '#F97316',
}

const RevenueByPaymentMethodChart = ({ paymentMethods, totalPaidAmount }) => {
  const data = (paymentMethods || []).map((m) => ({
    name: m.method,
    value: m.amount,
    percentage: m.percentage,
    color: METHOD_COLORS[m.method] || '#94A3B8',
  }))

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="mb-4 sm:mb-5">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Revenue by Payment Method</h3>
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
                formatter={(value) => [formatCurrency(value), 'Amount']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono font-bold text-base sm:text-xl text-foreground">{formatCurrency(totalPaidAmount)}</span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground">Total</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 sm:space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-xs sm:text-sm text-foreground font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-[10px] sm:text-[11px] text-muted-foreground">{item.percentage}%</span>
                <span className="text-xs sm:text-sm font-semibold text-foreground w-16 sm:w-20 text-right">{formatCurrency(item.value)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RevenueByPaymentMethodChart
