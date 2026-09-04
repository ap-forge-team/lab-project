import React from 'react'

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const SettlementCharts = ({ history, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-48"></div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!history || history.length === 0) return null

  // Aggregate monthly data for Revenue Trend
  const monthlyData = history.reduce((acc, item) => {
    const date = new Date(item.settledAt || item.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[key]) {
      acc[key] = { month: key, label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), totalRevenue: 0, labShare: 0, count: 0 }
    }
    acc[key].totalRevenue += item.totalAmount || 0
    acc[key].labShare += item.labShare || item.netPayable || 0
    acc[key].count += 1
    return acc
  }, {})

  const sortedMonths = Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6).reverse()
  const maxRevenue = Math.max(...sortedMonths.map((m) => m.totalRevenue), 1)

  // Top Lab Owners by Revenue
  const labOwnerData = history.reduce((acc, item) => {
    const name = item.labOwner?.name || 'Unknown'
    if (!acc[name]) {
      acc[name] = { name, totalRevenue: 0, count: 0 }
    }
    acc[name].totalRevenue += item.totalAmount || 0
    acc[name].count += 1
    return acc
  }, {})

  const topLabOwners = Object.values(labOwnerData)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5)
  const maxLabRevenue = Math.max(...topLabOwners.map((l) => l.totalRevenue), 1)

  // Settlement Status distribution
  const statusData = history.reduce((acc, item) => {
    const status = item.status || 'Pending'
    acc[status] = (acc[status] || 0) + (item.totalAmount || 0)
    return acc
  }, {})

  const totalAmount = Object.values(statusData).reduce((sum, val) => sum + val, 0)
  const statusColors = {
    Pending: { bg: 'bg-amber-500', text: 'text-amber-600' },
    Sent: { bg: 'bg-blue-500', text: 'text-blue-600' },
    Verified: { bg: 'bg-emerald-500', text: 'text-emerald-600' },
    Rejected: { bg: 'bg-red-500', text: 'text-red-600' },
  }

  // Build donut segments
  let cumulativePercent = 0
  const donutSegments = Object.entries(statusData).map(([status, amount]) => {
    const percent = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
    const startPercent = cumulativePercent
    cumulativePercent += percent
    return { status, amount, percent, startPercent, color: statusColors[status]?.bg || 'bg-gray-400' }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Revenue Trend */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Revenue Trend</h3>
          <select className="text-xs border border-border rounded px-2 py-1 text-muted-foreground bg-white">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>

        <div className="space-y-3">
          {sortedMonths.map((month) => {
            const widthPercent = (month.totalRevenue / maxRevenue) * 100
            return (
              <div key={month.month} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">{month.label}</span>
                  <span className="text-foreground">{formatCurrency(month.totalRevenue)}</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                    style={{ width: `${widthPercent}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {sortedMonths.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Revenue: {formatCurrency(sortedMonths.reduce((sum, m) => sum + m.totalRevenue, 0))}</span>
            <span>Lab Share: {formatCurrency(sortedMonths.reduce((sum, m) => sum + m.labShare, 0))}</span>
          </div>
        )}
      </div>

      {/* Top Lab Owners by Revenue */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Top Lab Owners by Revenue</h3>
          <select className="text-xs border border-border rounded px-2 py-1 text-muted-foreground bg-white">
            <option>This Week</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
        </div>

        <div className="space-y-3">
          {topLabOwners.map((lab, index) => {
            const widthPercent = (lab.totalRevenue / maxLabRevenue) * 100
            return (
              <div key={lab.name} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground truncate">{lab.name}</span>
                    <span className="text-xs font-medium text-foreground">{formatCurrency(lab.totalRevenue)}</span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all duration-500"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {topLabOwners.length > 5 && (
          <button className="mt-3 text-xs text-primary hover:underline w-full text-center">View All</button>
        )}
      </div>

      {/* Settlement Status */}
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Settlement Status</h3>
        </div>

        <div className="flex items-center justify-center">
          {/* Donut Chart */}
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              {donutSegments.map((segment, index) => (
                <circle
                  key={segment.status}
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={segment.color.replace('bg-', '').includes('amber') ? '#f59e0b' :
                    segment.color.includes('blue') ? '#3b82f6' :
                    segment.color.includes('emerald') ? '#10b981' :
                    segment.color.includes('red') ? '#ef4444' : '#9ca3af'}
                  strokeWidth="3"
                  strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
                  strokeDashoffset={`${-segment.startPercent}`}
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-foreground">{formatCurrency(totalAmount)}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2">
          {Object.entries(statusData).map(([status, amount]) => {
            const style = statusColors[status] || statusColors.Pending
            const percent = totalAmount > 0 ? ((amount / totalAmount) * 100).toFixed(1) : 0
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${style.bg}`}></span>
                  <span className="text-xs text-foreground">{status}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatCurrency(amount)} ({percent}%)</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SettlementCharts
