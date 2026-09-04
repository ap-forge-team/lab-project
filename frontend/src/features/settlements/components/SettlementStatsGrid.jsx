import React from 'react'
import { IndianRupee, Percent, Clock, Send, CheckCircle, FileText } from 'lucide-react'

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const StatCard = ({ icon: Icon, borderColor, iconColor, cardBg, title, value, detailTop, detailBottom }) => (
  <div className={`rounded-2xl border ${borderColor} px-4 py-3 ${cardBg}`}>
    <div className="flex items-center gap-3">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${borderColor} ${iconColor}`}>
        {React.createElement(Icon, { size: 18 })}
      </span>
      <div className="min-w-0 flex-1 space-y-0">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-xl font-bold leading-tight text-foreground">{value}</p>
      </div>
      <div className="h-8 w-px shrink-0 self-stretch my-auto bg-border" />
      <div className="shrink-0 text-right leading-tight">
        <p className="text-xs text-muted-foreground">{detailTop}</p>
        <p className="text-xs text-muted-foreground">{detailBottom}</p>
      </div>
    </div>
  </div>
)

const SettlementStatsGrid = ({ statistics, isLoading, isAdmin }) => {
  const statsCount = isAdmin ? 6 : 5

  if (isLoading) {
    return (
      <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 min-w-max">
          {[...Array(statsCount)].map((_, i) => (
            <div key={i} className="snap-start min-w-[220px] shrink-0 rounded-2xl border border-border bg-white px-4 py-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded w-20"></div>
                  <div className="h-5 bg-muted rounded w-24"></div>
                </div>
                <div className="h-8 w-px bg-muted"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-16"></div>
                  <div className="h-3 bg-muted rounded w-14"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
      detailTop: `${statistics?.totalTransactions || 0} settlements`,
      detailBottom: 'total',
    },
    {
      icon: Percent,
      borderColor: 'border-emerald-200',
      iconColor: 'text-emerald-500',
      cardBg: 'bg-emerald-50',
      title: 'System Commission',
      value: formatCurrency(statistics?.systemCommission),
      detailTop: `${statistics?.totalTransactions || 0} from orders`,
      detailBottom: 'commission',
    },
    {
      icon: Clock,
      borderColor: 'border-amber-200',
      iconColor: 'text-amber-500',
      cardBg: 'bg-amber-50',
      title: 'Pending Settlement',
      value: formatCurrency(statistics?.pendingSettlement),
      detailTop: `${statistics?.pendingCount || 0} pending`,
      detailBottom: 'settlements',
    },
    ...(isAdmin
      ? [
          {
            icon: Send,
            borderColor: 'border-purple-200',
            iconColor: 'text-purple-500',
            cardBg: 'bg-purple-50',
            title: 'Settlement Sent',
            value: formatCurrency(statistics?.sentSettlement),
            detailTop: `${statistics?.sentCount || 0} sent`,
            detailBottom: 'settlements',
          },
        ]
      : []),
    {
      icon: CheckCircle,
      borderColor: 'border-teal-200',
      iconColor: 'text-teal-500',
      cardBg: 'bg-teal-50',
      title: 'Verified Settlement',
      value: formatCurrency(statistics?.verifiedSettlement),
      detailTop: `${statistics?.verifiedCount || 0} verified`,
      detailBottom: 'settlements',
    },
    {
      icon: FileText,
      borderColor: 'border-rose-200',
      iconColor: 'text-rose-500',
      cardBg: 'bg-rose-50',
      title: 'Transactions',
      value: statistics?.totalTransactions || 0,
      detailTop: `${statistics?.totalTransactions || 0} total`,
      detailBottom: 'transactions',
    },
  ]

  return (
    <>
      <div className="overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-4 min-w-max">
          {stats.map((stat, index) => (
            <div key={index} className="snap-start min-w-[220px] shrink-0">
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 sm:hidden">
        {[...Array(statsCount)].map((_, i) => (
          <span key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-border'}`}></span>
        ))}
      </div>
    </>
  )
}

export default SettlementStatsGrid
