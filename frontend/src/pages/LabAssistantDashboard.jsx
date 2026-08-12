import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardShell from '@/features/dashboard/components/DashboardShell'
import {
  getAssignedBookings,
  searchAssignedBookings,
  markReached,
  uploadSample,
  uploadPaymentReceipt,
} from '@/services/booking.service'
import { getPaymentSetting } from '@/services/user.service'
import { BOOKING_STATUS } from '@/constants/status'
import { EmptyState } from '@/components/Dashboard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Loader'
import { Search } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import LabAssistantStatsGrid from '@/features/lab-assistant/components/LabAssistantStatsGrid'
import LabAssistantBookingsTable from '@/features/lab-assistant/components/LabAssistantBookingsTable'
import LabAssistantBookingMobileCard from '@/features/lab-assistant/components/LabAssistantBookingMobileCard'
import LabAssistantSampleModal from '@/features/lab-assistant/components/LabAssistantSampleModal'
import ViewToggle from '@/components/ui/ViewToggle'
import useResponsiveView from '@/hooks/useResponsiveView'
import ReportViewerModal from '@/components/Dashboard/ReportViewerModal'

const LabAssistantDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadingSample, setUploadingSample] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [activeSection, setActiveSection] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [sampleImages, setSampleImages] = useState([])
  const [assistantNotes, setAssistantNotes] = useState('')
  const [showSampleModal, setShowSampleModal] = useState(false)
  const [previewReport, setPreviewReport] = useState(null)
  const [paymentSetting, setPaymentSetting] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [view, setView] = useResponsiveView()
  const [paymentBooking, setPaymentBooking] = useState(null)
  const [paymentReceipt, setPaymentReceipt] = useState(null)
  const [uploadingPayment, setUploadingPayment] = useState(false)

  const fetchBookings = async () => {
    try {
      setFetchError(null)
      const { data: res } = await getAssignedBookings()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setBookings(list)
    } catch {
      setFetchError('Failed to load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchPaymentSetting = async () => {
    try {
      const { data } = await getPaymentSetting()
      setPaymentSetting(data.data)
    } catch (err) {
      console.log(err)
    }
  }

  const handlePayment = async (booking) => {
    setPaymentBooking(booking)
    await fetchPaymentSetting()
    setShowPaymentModal(true)
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    if (payment) {
      window.history.replaceState({}, '', '/lab-assistant')
    }
    if (payment === 'success') {
      toast.success('Payment Successful')
    }
    if (payment === 'failed') {
      toast.error('Payment Failed')
    }
  }, [])

  const handleReached = async (bookingId) => {
    try {
      await markReached(bookingId)
      fetchBookings()
    } catch (error) {
      console.log(error)
    }
  }

  const openSampleModal = (booking) => {
    setSelectedBooking(booking)
    setSampleImages([])
    setAssistantNotes('')
    setShowSampleModal(true)
  }

  const handleSampleUpload = async () => {
    if (sampleImages.length === 0) {
      toast.error('Please select at least one sample image')
      return
    }
    try {
      setUploadingSample(true)
      const formData = new FormData()
      sampleImages.forEach((image) => {
        formData.append('sampleImages', image)
      })
      formData.append('assistantNotes', assistantNotes)
      await uploadSample(selectedBooking._id, formData)
      toast.success('Sample uploaded successfully')
      setShowSampleModal(false)
      setSampleImages([])
      setAssistantNotes('')
      fetchBookings()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingSample(false)
    }
  }

  const openNavigation = (booking) => {
    const lat = booking.patientLatitude
    const lng = booking.patientLongitude
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      '_blank'
    )
  }

  const handlePaymentDone = async () => {
    if (!paymentReceipt) {
      toast.error('Please upload payment receipt.')
      return
    }
    try {
      setUploadingPayment(true)
      const formData = new FormData()
      formData.append('receipt', paymentReceipt)
      const res = await uploadPaymentReceipt(paymentBooking._id, formData)
      toast.success(res.data.message)
      setShowPaymentModal(false)
      setPaymentReceipt(null)
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingPayment(false)
    }
  }

  const searchBookings = async (value) => {
    setSearchTerm(value)
    try {
      const { data: res } = await searchAssignedBookings(value)
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setBookings(list)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        searchBookings(searchTerm)
      } else {
        fetchBookings()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const filteredBookings =
    activeSection === 'pending'
      ? bookings.filter((item) => item.status === BOOKING_STATUS.PENDING)
      : activeSection === 'completed'
        ? bookings.filter((item) => item.status === BOOKING_STATUS.COMPLETED)
        : bookings

  return (
    <DashboardShell badge="Lab Assistant Portal" title="Lab Assistant Dashboard">
      <LabAssistantStatsGrid
        bookings={bookings}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="bg-white rounded-[35px] shadow-sm mt-10 p-5 md:p-8">
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search patient, mobile, test or package..."
                    value={searchTerm}
                    onChange={(e) => searchBookings(e.target.value)}
                    className="pl-12"
                  />
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                </div>
                <ViewToggle view={view} onChange={setView} />
              </div>
              <div className="bg-primary/10 px-4 py-2.5 rounded-lg text-xs font-semibold text-primary flex items-center whitespace-nowrap h-11">
                Total Bookings: {filteredBookings.length}
              </div>
            </div>
            {loading ? (
              <Spinner />
            ) : fetchError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center mt-6">
                <p className="text-red-600 text-xs font-medium">{fetchError}</p>
                <Button onClick={fetchBookings} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : bookings.length === 0 ? (
              <EmptyState text="No Assigned Bookings" />
            ) : (
              <>
                {view === 'table' ? (
                  <LabAssistantBookingsTable
                    filteredBookings={filteredBookings}
                    handleReached={handleReached}
                    openSampleModal={openSampleModal}
                    openNavigation={openNavigation}
                    handlePayment={handlePayment}
                    setPreviewReport={setPreviewReport}
                  />
                ) : (
                  <LabAssistantBookingMobileCard
                    filteredBookings={filteredBookings}
                    handleReached={handleReached}
                    openSampleModal={openSampleModal}
                    openNavigation={openNavigation}
                    handlePayment={handlePayment}
                    setPreviewReport={setPreviewReport}
                  />
                )}
              </>
            )}
          </div>
        <LabAssistantSampleModal
          showSampleModal={showSampleModal}
          setShowSampleModal={setShowSampleModal}
          sampleImages={sampleImages}
          setSampleImages={setSampleImages}
          assistantNotes={assistantNotes}
          setAssistantNotes={setAssistantNotes}
          handleSampleUpload={handleSampleUpload}
          uploadingSample={uploadingSample}
        />
        <ReportViewerModal
          isOpen={!!previewReport}
          onClose={() => setPreviewReport(null)}
          reportUrl={previewReport}
        />
        <Modal
          open={showPaymentModal && !!paymentSetting}
          title="Collect Payment"
          onClose={() => {
            setShowPaymentModal(false)
            setPaymentReceipt(null)
          }}
          size="md"
        >
          <div className="flex justify-center">
            <img src={paymentSetting?.qrImage} alt="" className="w-64 rounded-2xl border" />
          </div>
          <div className="mt-6 space-y-2">
            <p><strong>Amount:</strong> ₹{paymentBooking?.test?.price || paymentBooking?.package?.price}</p>
          </div>
          <div className="mt-5">
            <h3 className="text-lg font-semibold mb-3">Upload Payment Receipt</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="border-2 border-dashed border-blue-300 rounded-2xl p-4 cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(e) => {
                    if (e.target.files[0]) setPaymentReceipt(e.target.files[0])
                  }}
                />
                <div className="flex flex-col items-center">
                  <div className="text-3xl">📷</div>
                  <p className="mt-2 text-sm font-semibold">Capture</p>
                </div>
              </label>
              <label className="border-2 border-dashed border-green-300 rounded-2xl p-4 cursor-pointer hover:bg-green-50 transition">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  hidden
                  onChange={(e) => {
                    if (e.target.files[0]) setPaymentReceipt(e.target.files[0])
                  }}
                />
                <div className="flex flex-col items-center">
                  <div className="text-3xl">🖼️</div>
                  <p className="mt-2 text-sm font-semibold">Upload</p>
                </div>
              </label>
            </div>
            {paymentReceipt && (
              <div className="mt-4 p-3 rounded-xl bg-blue-50 border">
                <p className="text-sm font-semibold">{paymentReceipt.name}</p>
                {paymentReceipt.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(paymentReceipt)}
                    alt=""
                    className="w-28 h-28 object-cover rounded-lg mt-3 border"
                  />
                )}
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => {
                setShowPaymentModal(false)
                setPaymentReceipt(null)
              }}
              className="flex-1 py-3 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <Button
              onClick={handlePaymentDone}
              disabled={!paymentReceipt}
              loading={uploadingPayment}
              fullWidth
              variant="success"
            >
              Payment Done
            </Button>
          </div>
        </Modal>
    </DashboardShell>
  )
}

export default LabAssistantDashboard
