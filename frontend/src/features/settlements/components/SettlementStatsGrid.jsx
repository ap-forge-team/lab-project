import React from 'react'
import { IndianRupee, Percent, Clock, Send, CheckCircle, FileText } from 'lucide-react'

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const StatCard = ({ icon: Icon, borderColor, iconColor, cardBg, title, value, change, changeType }) => (
  <div className={`rounded-2xl border ${borderColor} px-4 py-3 ${cardBg}`}>
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${borderColor} ${iconColor}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1 space-y-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-bold leading-tight text-foreground">{value}</p>
      </div>
      {change !== undefined && (
        <div className="shrink-0 text-right leading-tight">
          <p className={`text-[11px] font-medium ${changeType === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
            {changeType === 'up' ? '↑' : '↓'} {change}
          </p>
          <p className="text-[10px] text-muted-foreground">from last 7 days</p>
        </div>
      )}
    </div>
  </div>
)

const SettlementStatsGrid = ({ statistics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-white px-4 py-3 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-20"></div>
                <div className="h-5 bg-muted rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const stats = [
    {
      icon: IndianRupee,
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-500',
      cardBg: 'bg-blue-50',
      title: 'Total Revenue',
      value: formatCurrency(statistics?.totalRevenue),
      change: '16.8%',
      changeType: 'up',
    },
    {
      icon: Percent,
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      cardBg: 'bg-emerald-50',
      title: 'System Commission',
      value: formatCurrency(statistics?.systemCommission),
      change: '12.4%',
      changeType: 'up',
    },
    {
      icon: Clock,
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-500',
      cardBg: 'bg-amber-50',
      title: 'Pending Settlement',
      value: formatCurrency(statistics?.pendingSettlement),
      change: '5.2%',
      changeType: 'down',
    },
    {
      icon: Send,
      borderColor: 'border-purple-200',
      iconColor: 'text-purple-500',
      cardBg: 'bg-purple-50',
      title: 'Settlement Sent',
      value: formatCurrency(statistics?.sentSettlement),
      change: '9.6%',
      changeType: 'up',
    },
    {
      icon: CheckCircle,
      borderColor: 'border-teal-200',
      iconColor: 'text-teal-500',
      cardBg: 'bg-teal-50',
      title: 'Verified Settlement',
      value: formatCurrency(statistics?.verifiedSettlement),
      change: '14.3%',
      changeType: 'up',
    },
    {
      icon: FileText,
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-500',
      cardBg: 'bg-rose-50',
      title: 'Transactions',
      value: statistics?.totalTransactions || 0,
      change: '8.7%',
      changeType: 'up',
    },
  ]

  return (
    <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-4 min-w-max">
        {stats.map((stat, index) => (
          <div key={index} className="snap-start min-w-[180px] shrink-0">
            <StatCard {...stat} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SettlementStatsGrid
