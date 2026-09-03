import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/utils/formatCurrency'
import { TrendingUp, ChevronDown, Check } from 'lucide-react'
import useClickOutside from '@/hooks/useClickOutside'

const filters = ['Today', 'This Week', 'This Month']

const RevenueOverviewChart = ({ data, totalRevenue, trend, filter, onFilterChange }) => {
  const [open, setOpen] = useState(false)
  const dropRef = useClickOutside(() => setOpen(false))

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-1 gap-2">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Revenue Overview</h3>
        <div className="relative shrink-0" ref={dropRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-accent hover:bg-accent/80 transition"
          >
            {filter}
            <ChevronDown size={14} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-border rounded-lg shadow-lg py-1 min-w-[140px]">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => { onFilterChange(f); setOpen(false) }}
                  className="flex items-center justify-between w-full px-3 py-2 text-xs text-foreground hover:bg-accent transition"
                >
                  {f}
                  {filter === f && <Check size={14} className="text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-5">
        <p className="text-muted-foreground text-xs font-medium mb-1">Total Revenue</p>
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-2xl text-foreground">
            {formatCurrency(totalRevenue)}
          </span>
          {trend > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-green-600">
              <TrendingUp size={12} />
              {trend}% from last 7 days
            </span>
          )}
        </div>
      </div>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                fontSize: '12px',
              }}
              formatter={(value) => [formatCurrency(value), 'Revenue']}
            />
            <Bar
              dataKey="revenue"
              fill="#2563EB"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RevenueOverviewChart
