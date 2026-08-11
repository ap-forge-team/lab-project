import { CalendarDays, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/ui/Modal'
import BookingDateTime from '@/components/BookingDateTime'

const ManageBookingModal = ({
  showManageModal,
  setShowManageModal,
  action,
  setAction,
  reason,
  setReason,
  customReason,
  setCustomReason,
  rescheduleData,
  handleRescheduleChange,
  handleCancel,
  handleReschedule,
  cancelling = false,
  rescheduling = false,
}) => {
  return (
    <Modal
      open={showManageModal}
      onClose={() => setShowManageModal(false)}
      title="Manage Booking"
      subtitle="Cancel or reschedule your appointment"
    >
      <div className="space-y-4">
        {action === '' && (
          <>
            <Button onClick={() => setAction('reschedule')} fullWidth>
              <CalendarDays className="inline mr-2" size={16} />
              Reschedule Booking
            </Button>
            <Button onClick={() => setAction('cancel')} variant="danger" fullWidth>
              <X className="inline mr-2" size={16} />
              Cancel Booking
            </Button>
          </>
        )}
        {action === 'reschedule' && (
          <div className="space-y-4">
            <Button
              onClick={() => setAction('')}
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              ← Back
            </Button>
            <BookingDateTime formData={rescheduleData} handleChange={handleRescheduleChange} />
            <Textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (Optional)"
            />
            <Button onClick={handleReschedule} variant="success" fullWidth loading={rescheduling}>
              Save Changes
            </Button>
          </div>
        )}
        {action === 'cancel' && (
          <div className="space-y-4">
            <Button
              onClick={() => setAction('')}
              variant="ghost"
              size="sm"
              className="text-blue-600"
            >
              ← Back
            </Button>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="">Select Reason</option>
              <option value="Booked By Mistake">Booked By Mistake</option>
              <option value="Not Available">Not Available</option>
              <option value="Found Another Lab">Found Another Lab</option>
              <option value="Other">Other</option>
            </Select>
            {reason === 'Other' && (
              <Textarea
                rows={4}
                required
                placeholder="Please enter cancellation reason *"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}
            <Button
              onClick={handleCancel}
              disabled={!reason || (reason === 'Other' && !customReason.trim())}
              variant="danger"
              fullWidth
              loading={cancelling}
            >
              Confirm Cancellation
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ManageBookingModal
