import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Banknote, Building2, FileText, MessageSquare, CheckCircle, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { sendSettlement } from '@/services/settlement.service'

const formatCurrency = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`

const SendSettlementModal = ({ open, onClose, booking }) => {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    utr: '',
    bankName: '',
    remark: '',
  })
  const [paymentProof, setPaymentProof] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [errors, setErrors] = useState({})

  const mutation = useMutation({
    mutationFn: (data) => sendSettlement(booking._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlementPending'] })
      queryClient.invalidateQueries({ queryKey: ['settlementStats'] })
      handleClose()
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || 'Failed to send settlement'
      setErrors({ submit: msg })
    },
  })

  const validate = () => {
    const newErrors = {}
    if (!formData.utr.trim()) newErrors.utr = 'UTR number is required'
    if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    const payload = new FormData()
    payload.append('utr', formData.utr.trim())
    payload.append('bankName', formData.bankName.trim())
    if (formData.remark.trim()) payload.append('remark', formData.remark.trim())
    if (paymentProof) payload.append('paymentProof', paymentProof)

    mutation.mutate(payload)
  }

  const handleClose = () => {
    setFormData({ utr: '', bankName: '', remark: '' })
    setPaymentProof(null)
    setProofPreview(null)
    setErrors({})
    onClose()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentProof(file)
      const reader = new FileReader()
      reader.onloadend = () => setProofPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setPaymentProof(null)
    setProofPreview(null)
  }

  if (!booking) return null

  return (
    <Modal open={open} onClose={handleClose} title="Send Settlement" subtitle={`Booking: ${booking.bookingId || booking._id}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Booking Summary */}
        <div className="p-3 bg-accent rounded-lg">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Patient</p>
              <p className="font-medium">{booking.patientName || booking.user?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Test / Package</p>
              <p className="font-medium">{booking.test?.title || booking.package?.title || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lab Share (85%)</p>
              <p className="font-semibold text-primary">{formatCurrency(booking.labShare)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
              <p className="font-medium">{formatCurrency(booking.paymentAmount)}</p>
            </div>
          </div>
        </div>

        {/* UTR Number */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <Banknote size={14} className="text-muted-foreground" />
            UTR Number <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.utr}
            onChange={(e) => setFormData({ ...formData, utr: e.target.value })}
            placeholder="Enter UTR transaction reference"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition ${
              errors.utr ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
          {errors.utr && <p className="text-xs text-red-500 mt-1">{errors.utr}</p>}
        </div>

        {/* Bank Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <Building2 size={14} className="text-muted-foreground" />
            Bank Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.bankName}
            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
            placeholder="Enter bank name"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none transition ${
              errors.bankName ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />
          {errors.bankName && <p className="text-xs text-red-500 mt-1">{errors.bankName}</p>}
        </div>

        {/* Payment Proof */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <Upload size={14} className="text-muted-foreground" />
            Payment Proof <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </label>
          {proofPreview ? (
            <div className="relative inline-block">
              <img src={proofPreview} alt="Payment proof" className="h-20 rounded-lg border border-border" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition">
              <Upload size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload receipt</span>
              <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Remark */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-1.5">
            <MessageSquare size={14} className="text-muted-foreground" />
            Remark <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            value={formData.remark}
            onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
            placeholder="Add a note (optional)"
            rows={2}
            className="w-full px-3 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
          />
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {errors.submit}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="success" disabled={mutation.isPending} className="flex items-center gap-2">
            {mutation.isPending ? (
              <>Sending…</>
            ) : (
              <>
                <CheckCircle size={16} />
                Send Settlement
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default SendSettlementModal
