import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, Building2, Banknote, Calendar, AlertTriangle, Image, ExternalLink } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { verifySettlement } from '@/services/settlement.service'

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const VerifySettlementModal = ({ open, onClose, booking }) => {
  const queryClient = useQueryClient()
  const [imageOpen, setImageOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: () => verifySettlement(booking._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlementPending'] })
      queryClient.invalidateQueries({ queryKey: ['settlementStats'] })
      queryClient.invalidateQueries({ queryKey: ['labSettlementPending'] })
      onClose()
    },
  })

  if (!booking) return null

  return (
    <Modal open={open} onClose={onClose} title="Verify Settlement" subtitle="Confirm payment received" size="md">
      <div className="space-y-5">
        {/* Warning */}
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            By verifying, you confirm that the payment has been received in your bank account. This action cannot be undone.
          </p>
        </div>

        {/* Booking Details */}
        <div className="p-4 bg-accent rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="text-sm font-medium">{booking.patientName || booking.user?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Test / Package</p>
              <p className="text-sm font-medium">{booking.test?.title || booking.package?.title || '—'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Banknote size={14} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Amount Paid</p>
                <p className="text-sm font-semibold text-green-600">{formatCurrency(booking.labShare)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={14} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Sent On</p>
                <p className="text-sm font-medium">{formatDate(booking.labPaidAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-start gap-2">
              <Building2 size={14} className="text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Bank</p>
                <p className="text-sm font-medium">{booking.bankName || '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">UTR Number</p>
              <p className="text-sm font-medium font-mono">{booking.settlementUTR || '—'}</p>
            </div>
          </div>

          {booking.settlementBatchId && (
            <div>
              <p className="text-xs text-muted-foreground">Batch ID</p>
              <p className="text-sm font-medium font-mono">{booking.settlementBatchId}</p>
            </div>
          )}
        </div>

        {/* Payment Proof */}
        {booking.paymentProof && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Image size={14} className="text-muted-foreground" />
              Payment Proof
            </p>
            <div className="border border-border rounded-lg overflow-hidden">
              <img
                src={booking.paymentProof}
                alt="Payment proof"
                className="w-full max-h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition"
                onClick={() => setImageOpen(true)}
              />
            </div>
          </div>
        )}

        {/* Full Screen Image Preview */}
        {imageOpen && booking.paymentProof && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setImageOpen(false)}
          >
            <button
              onClick={() => setImageOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            >
              ✕
            </button>
            <img
              src={booking.paymentProof}
              alt="Payment proof full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <a
              href={booking.paymentProof}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
              Open in new tab
            </a>
          </div>
        )}

        {/* Error */}
        {mutation.isError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {mutation.error?.response?.data?.message || 'Failed to verify settlement'}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="success"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex items-center gap-2"
          >
            {mutation.isPending ? (
              <>Verifying…</>
            ) : (
              <>
                <CheckCircle size={16} />
                Confirm Payment Received
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default VerifySettlementModal
