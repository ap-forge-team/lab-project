import React from 'react'

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const SettlementCharts = ({ history, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!history || history.length === 0) return null

  // Aggregate monthly data from history
  const monthlyData = history.reduce((acc, item) => {
    const date = new Date(item.settledAt || item.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    if (!acc[key]) {
      acc[key] = { month: key, label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), totalAmount: 0, commission: 0, count: 0 }
    }
    acc[key].totalAmount += item.totalAmount || 0
    acc[key].commission += item.commission || 0
    acc[key].count += 1
    return acc
  }, {})

  const sortedMonths = Object.values(monthlyData).sort((a, b) => b.month.localeCompare(a.month)).slice(0, 6).reverse()
  const maxAmount = Math.max(...sortedMonths.map((m) => m.totalAmount), 1)

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Monthly Settlement Overview</h3>

      <div className="space-y-3">
        {sortedMonths.map((month) => {
          const widthPercent = (month.totalAmount / maxAmount) * 100
          return (
            <div key={month.month} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">{month.label}</span>
                <span className="text-foreground">{formatCurrency(month.totalAmount)}</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary/80 to-primary transition-all duration-500"
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>Total Settlements: {history.length}</span>
        <span>Total Volume: {formatCurrency(history.reduce((sum, item) => sum + (item.totalAmount || 0), 0))}</span>
      </div>
    </div>
  )
}

export default SettlementCharts
