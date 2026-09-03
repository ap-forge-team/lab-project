import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'

const paymentStyles = {
  Success: 'bg-green-50 text-green-700',
  Paid: 'bg-green-50 text-green-700',
  Pending: 'bg-amber-50 text-amber-600',
  Failed: 'bg-red-100 text-red-700',
  Refunded: 'bg-gray-50 text-gray-600',
}

const RecentPaymentsTable = ({ data }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Recent Payments</h3>
        <button
          onClick={() => navigate(ROUTES.ADMIN_PAYMENTS)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 sm:py-2.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Payment ID</th>
              <th className="text-left py-2 sm:py-2.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider hidden sm:table-cell">Patient</th>
              <th className="text-right py-2 sm:py-2.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Amount</th>
              <th className="text-left py-2 sm:py-2.5 text-muted-foreground text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((payment) => (
              <tr key={payment._id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 sm:py-3">
                  <span className="font-semibold text-primary text-xs sm:text-[13px]">{payment.paymentId}</span>
                  <span className="block sm:hidden text-muted-foreground text-[11px] mt-0.5">{payment.patientName}</span>
                </td>
                <td className="py-2.5 sm:py-3 text-foreground hidden sm:table-cell">{payment.patientName}</td>
                <td className="py-2.5 sm:py-3 text-right font-semibold text-foreground text-xs sm:text-sm">{formatCurrency(payment.amount)}</td>
                <td className="py-2.5 sm:py-3">
                  <span className={`px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${paymentStyles[payment.status] || 'bg-gray-50 text-gray-600'}`}>
                    {payment.status === 'Paid' ? 'Success' : payment.status}
                  </span>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={4} className="py-6 sm:py-8 text-center text-muted-foreground text-xs">No recent payments</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RecentPaymentsTable
