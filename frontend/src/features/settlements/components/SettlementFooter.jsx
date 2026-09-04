import React from 'react'
import { Info, Clock, HelpCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const SettlementFooter = ({ statistics, isAdmin }) => {
  if (!statistics) return null

  const pendingAmount = statistics.pendingSettlement || 0
  const pendingCount = statistics.pendingPayouts || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Important Notes */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <Info size={16} />
          </span>
          <h3 className="text-sm font-semibold text-foreground">Important Notes</h3>
        </div>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0"></span>
            Settlements are processed every Monday.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0"></span>
            Minimum settlement amount is ₹500.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0"></span>
            Please ensure UTR numbers are accurate for verification.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0"></span>
            For any issues, raise a support ticket!
          </li>
        </ul>
      </div>

      {/* Upcoming Settlement */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Clock size={16} />
          </span>
          <h3 className="text-sm font-semibold text-foreground">Upcoming Settlement</h3>
          <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">2 Days Left</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Amount</span>
            <span className="text-sm font-bold text-foreground">{formatCurrency(pendingAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Lab Owners</span>
            <span className="text-sm font-bold text-foreground">{pendingCount}</span>
          </div>
          <Button variant="outline" size="sm" className="w-full mt-2">
            View Details
          </Button>
        </div>
      </div>

      {/* Need Help */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50 text-purple-500">
            <HelpCircle size={16} />
          </span>
          <h3 className="text-sm font-semibold text-foreground">Need Help?</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          If you have any questions, feel free to contact our support team.
        </p>
        <Button variant="primary" size="sm" className="w-full">
          Contact Support
        </Button>
      </div>
    </div>
  )
}

export default SettlementFooter
