import React from 'react'

const SettlementSummary = ({ statistics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-48"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const completionRate = statistics?.totalTransactions > 0
    ? ((statistics?.verifiedSettlement || 0) / (statistics?.totalRevenue || 1) * 100).toFixed(1)
    : 0

  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Settlement Summary</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Completion Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-2xl font-bold text-foreground">{completionRate}%</p>
          </div>
          <div className="w-full bg-muted/30 rounded-full h-2">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Pending Payouts</p>
          <p className="text-2xl font-bold text-foreground">{statistics?.pendingPayouts || 0}</p>
          <p className="text-xs text-amber-600">Awaiting settlement</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold text-foreground">{statistics?.thisMonthSettled || 0}</p>
          <p className="text-xs text-emerald-600">Settled this month</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Avg. Settlement Time</p>
          <p className="text-2xl font-bold text-foreground">{statistics?.avgSettlementDays || 0}d</p>
          <p className="text-xs text-muted-foreground">Business days</p>
        </div>
      </div>
    </div>
  )
}

export default SettlementSummary
