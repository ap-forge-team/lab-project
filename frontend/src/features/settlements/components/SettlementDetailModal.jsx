import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Modal from '@/components/ui/Modal'
import { getSettlementDetails, getLabSettlementDetails } from '@/services/settlement.service'

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const SettlementDetailModal = ({ open, onClose, booking, isAdmin }) => {
  const batchId = booking?.settlementBatchId

  const { data, isLoading } = useQuery({
    queryKey: ['settlementDetails', batchId],
    queryFn: () => isAdmin ? getSettlementDetails(batchId) : getLabSettlementDetails(batchId),
    enabled: !!batchId && open,
  })

  const summary = data?.data?.summary || {}
  const batchBookings = data?.data?.bookings || []

  const isPending = !batchId
  const displayBookings = isPending && booking ? [booking] : batchBookings
  const displaySummary = isPending && booking ? {
    labOwner: booking.labOwner?.name || '—',
    status: booking.labPaymentStatus || 'Pending',
    settledAt: null,
    bankName: '—',
    utr: '—',
    totalBookings: 1,
    totalAmount: booking.paymentAmount || 0,
    labShare: booking.labShare || 0,
    commission: booking.systemCommission || 0,
  } : summary

  return (
    <Modal open={open} onClose={onClose} title="Settlement Details" subtitle={batchId ? `Batch: ${batchId}` : 'Pending Settlement'} size="lg">
      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading details…</div>
      ) : (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Lab Owner</p>
              <p className="text-sm font-medium">{displaySummary.labOwner || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {displaySummary.status || '—'}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{formatDate(displaySummary.settledAt || booking?.createdAt)}</p>
            </div>
            {!isPending && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Bank Name</p>
                  <p className="text-sm font-medium">{displaySummary.bankName || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">UTR Number</p>
                  <p className="text-sm font-medium">{displaySummary.utr || '—'}</p>
                </div>
                {displaySummary.remark && (
                  <div>
                    <p className="text-xs text-muted-foreground">Remark</p>
                    <p className="text-sm font-medium">{displaySummary.remark}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Totals */}
          <div className="flex flex-wrap gap-4 p-3 bg-accent rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Total Bookings</p>
              <p className="text-sm font-semibold">{displaySummary.totalBookings || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-sm font-semibold">{formatCurrency(displaySummary.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lab Share</p>
              <p className="text-sm font-semibold">{formatCurrency(displaySummary.labShare)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commission</p>
              <p className="text-sm font-semibold">{formatCurrency(displaySummary.commission)}</p>
            </div>
          </div>

          {/* Payment Proof */}
          {!isPending && (displaySummary.paymentProof || displayBookings[0]?.paymentProof) && (
            <div>
              <h4 className="text-sm font-medium mb-2">Payment Proof</h4>
              <div className="border border-border rounded-lg overflow-hidden inline-block">
                <img
                  src={displaySummary.paymentProof || displayBookings[0]?.paymentProof}
                  alt="Payment Proof"
                  className="max-h-48 rounded-lg cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(displaySummary.paymentProof || displayBookings[0]?.paymentProof, '_blank')}
                />
              </div>
            </div>
          )}

          {/* Bookings Table */}
          {displayBookings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Bookings</h4>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-accent text-left text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Patient</th>
                      <th className="px-3 py-2">Test / Package</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                      <th className="px-3 py-2 text-right">Lab Share</th>
                      <th className="px-3 py-2 text-right">Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBookings.map((b) => (
                      <tr key={b._id} className="border-t border-border">
                        <td className="px-3 py-2">
                          <p className="font-medium">{b.patientName || b.user?.name || '—'}</p>
                          <p className="text-xs text-muted-foreground">{b.phone}</p>
                        </td>
                        <td className="px-3 py-2">{b.test?.title || b.package?.title || '—'}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(b.paymentAmount)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(b.labShare)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(b.systemCommission || b.commission)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

export default SettlementDetailModal
