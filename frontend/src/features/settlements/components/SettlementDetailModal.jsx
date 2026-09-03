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
  const bookings = data?.data?.bookings || []

  return (
    <Modal open={open} onClose={onClose} title="Settlement Details" subtitle={`Batch: ${batchId || '—'}`} size="lg">
      {isLoading ? (
        <div className="py-8 text-center text-sm text-muted-foreground">Loading details…</div>
      ) : (
        <div className="space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Lab Owner</p>
              <p className="text-sm font-medium">{summary.labOwner || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {summary.status || '—'}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Settled At</p>
              <p className="text-sm font-medium">{formatDate(summary.settledAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bank Name</p>
              <p className="text-sm font-medium">{summary.bankName || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">UTR Number</p>
              <p className="text-sm font-medium">{summary.utr || '—'}</p>
            </div>
            {summary.remark && (
              <div>
                <p className="text-xs text-muted-foreground">Remark</p>
                <p className="text-sm font-medium">{summary.remark}</p>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="flex flex-wrap gap-4 p-3 bg-accent rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Total Bookings</p>
              <p className="text-sm font-semibold">{summary.totalBookings || 0}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="text-sm font-semibold">{formatCurrency(summary.totalAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lab Share</p>
              <p className="text-sm font-semibold">{formatCurrency(summary.labShare)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Commission</p>
              <p className="text-sm font-semibold">{formatCurrency(summary.commission)}</p>
            </div>
          </div>

          {/* Bookings Table */}
          {bookings.length > 0 && (
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
                    {bookings.map((b) => (
                      <tr key={b._id} className="border-t border-border">
                        <td className="px-3 py-2">
                          <p className="font-medium">{b.patientName || '—'}</p>
                          <p className="text-xs text-muted-foreground">{b.phone}</p>
                        </td>
                        <td className="px-3 py-2">{b.test?.title || b.package?.title || '—'}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(b.paymentAmount)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(b.labShare)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(b.commission)}</td>
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
