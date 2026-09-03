import React, { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChevronDown, Check } from 'lucide-react'
import useClickOutside from '@/hooks/useClickOutside'

const filters = ['Today', 'This Week', 'This Month']

const BookingsOverviewChart = ({ data, filter, onFilterChange }) => {
  const [open, setOpen] = useState(false)
  const dropRef = useClickOutside(() => setOpen(false))

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Bookings Overview</h3>
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

      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="text-muted-foreground font-medium">Total Bookings</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
          <span className="text-muted-foreground font-medium">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-muted-foreground font-medium">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="text-muted-foreground font-medium">Cancelled</span>
        </div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis
              dataKey="date"
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
              dataKey="total"
              stroke="#2563EB"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#2563EB', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Total Bookings"
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#22C55E"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#F59E0B"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#F59E0B', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Pending"
            />
            <Line
              type="monotone"
              dataKey="cancelled"
              stroke="#EF4444"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#EF4444', strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              name="Cancelled"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default BookingsOverviewChart
