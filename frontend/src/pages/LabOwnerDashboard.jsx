import React, { useEffect, useRef, useState } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { toast } from 'react-toastify'
import {
  getLabOwnerBookings,
  searchLabOwnerBookings,
  assignAssistant,
  uploadReport,
} from '@/services/booking.service'
import { getMyAssistants, createLabAssistant } from '@/services/user.service'
import { UserPlus } from 'lucide-react'
import { DashboardStatsCard, EmptyState } from '@/components/Dashboard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Loader'
import LabOwnerStatsGrid from '@/features/lab-owner/components/LabOwnerStatsGrid'
import LabOwnerAssistantsSection from '@/features/lab-owner/components/LabOwnerAssistantsSection'
import LabOwnerBookingsTable from '@/features/lab-owner/components/LabOwnerBookingsTable'
import LabOwnerBookingMobileCard from '@/features/lab-owner/components/LabOwnerBookingMobileCard'
import LabOwnerPaymentSection from '@/features/lab-owner/components/LabOwnerPaymentSection'
import ViewToggle from '@/components/ui/ViewToggle'
import useResponsiveView from '@/hooks/useResponsiveView'
import ReportViewerModal from '@/components/Dashboard/ReportViewerModal'
import { Search } from 'lucide-react'
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'
import useFormErrors from '@/hooks/useFormErrors'
import Can from '@/components/Can'

const LabOwnerDashboard = () => {
  const tableRef = useRef(null)
  const [bookings, setBookings] = useState([])
  const [creatingAssistant, setCreatingAssistant] = useState(false)
  const [assistants, setAssistants] = useState([])
  const [selectedReport, setSelectedReport] = useState({})
  const [uploadingReport, setUploadingReport] = useState({})
  const [previewReport, setPreviewReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [activeSection, setActiveSection] = useState('all')
  const [selectedAssistant, setSelectedAssistant] = useState(null)
  const [showAssistantForm, setShowAssistantForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useResponsiveView()
  const [showPaymentOverview, setShowPaymentOverview] = useState(false)
  const {
    errors: assistantErrors,
    validate: validateAssistant,
    onFieldChange: onAssistantFieldChange,
  } = useFormErrors()
  const [assistantData, setAssistantData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    document: '',
  })

  const buildAssistantErrors = (a) => ({
    name: !a.name.trim() ? 'Full Name is required' : '',
    email:
      !a.email.trim()
        ? 'Email is required'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.email)
          ? 'Enter a valid email'
          : '',
    phone:
      !a.phone.trim()
        ? 'Mobile Number is required'
        : !/^[6-9]\d{9}$/.test(a.phone)
          ? 'Enter a valid 10-digit mobile number'
          : '',
    password:
      !a.password.trim()
        ? 'Password is required'
        : a.password.length < 6
          ? 'Password must be at least 6 characters'
          : '',
  })
  const fetchBookings = async () => {
    try {
      setFetchError(null)
      const { data: res } = await getLabOwnerBookings()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setBookings(list)
    } catch {
      setFetchError('Failed to load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const fetchAssistants = async () => {
    try {
      const { data: res } = await getMyAssistants()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setAssistants(list)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    fetchBookings()
    fetchAssistants()
  }, [])
  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...assistantData, [name]: value }
    setAssistantData(next)
    onAssistantFieldChange(name, buildAssistantErrors(next))
  }
  const handleCreateAssistant = async (e) => {
    e.preventDefault()
    if (creatingAssistant) return
    if (!validateAssistant(buildAssistantErrors(assistantData))) return
    try {
      setCreatingAssistant(true)
      const { data } = await createLabAssistant(assistantData)
      toast.success(data?.message || 'Assistant created successfully')
      fetchAssistants()
      setAssistantData({
        name: '',
        email: '',
        password: '',
        phone: '',
        document: '',
      })
      setShowAssistantForm(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create assistant')
    } finally {
      setCreatingAssistant(false)
    }
  }
  const handleAssignAssistant = async (bookingId, assistantId) => {
    if (!assistantId) {
      return toast.error('Please select an assistant')
    }
    try {
      const { data } = await assignAssistant(bookingId, assistantId)
      toast.success(data?.message || 'Assistant assigned successfully')
      fetchBookings()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to assign assistant')
    }
  }
  const searchBookings = async (value) => {
    setSearchTerm(value)
    try {
      const { data: res } = await searchLabOwnerBookings(value)
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setBookings(list)
    } catch (error) {
      console.log(error)
    }
  }
  const handleUploadReport = async (bookingId) => {
    if (!selectedReport[bookingId]) {
      return toast.error('Please select report file')
    }
    try {
      setUploadingReport((prev) => ({
        ...prev,
        [bookingId]: true,
      }))
      const formData = new FormData()
      formData.append('report', selectedReport[bookingId])
      await uploadReport(bookingId, formData)
      toast.success('Report Uploaded Successfully')
      fetchBookings()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload Failed')
    } finally {
      setUploadingReport((prev) => ({
        ...prev,
        [bookingId]: false,
      }))
    }
  }
  const scrollToTable = () => {
    setTimeout(() => {
      tableRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 100)
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
  const filteredBookings = selectedAssistant
    ? bookings.filter((booking) => booking.assignedLabAssistant?._id === selectedAssistant)
    : activeSection === 'pending'
      ? bookings.filter((item) => item.status === BOOKING_STATUS.PENDING)
      : activeSection === 'completed'
        ? bookings.filter((item) => item.status === BOOKING_STATUS.COMPLETED)
        : bookings
  return (
    <DashboardLayout>
      <div className="bg-background min-h-screen">
        <div className="bg-tertiary">
          <div className="enterprise-container py-8 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-[10px] mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              Laboratory Management Portal
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-white">Lab Owner Dashboard</h1>
            <p className="text-white/40 text-xs mt-1 max-w-lg">
              Manage bookings, assign assistants, and monitor laboratory operations.
            </p>
          </div>
        </div>
        <div className="enterprise-container py-6">
          <LabOwnerStatsGrid
            bookings={bookings}
            assistants={assistants}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            setSelectedAssistant={setSelectedAssistant}
            scrollToTable={scrollToTable}
            openPaymentOverview={() => setShowPaymentOverview(true)}
          />
          <LabOwnerAssistantsSection
            assistants={assistants}
            bookings={bookings}
            activeSection={activeSection}
            selectedAssistant={selectedAssistant}
            setSelectedAssistant={setSelectedAssistant}
            showAssistantForm={showAssistantForm}
            setShowAssistantForm={setShowAssistantForm}
            scrollToTable={scrollToTable}
          />
          <Can resource="lab_assistants" action="create">
            <Modal
              open={showAssistantForm}
              onClose={() => setShowAssistantForm(false)}
              title="Create Assistant"
              subtitle="Add new laboratory assistant"
              size="lg"
            >
            <form onSubmit={handleCreateAssistant} className="space-y-6">
              <Input
                label="Full Name"
                type="text"
                name="name"
                placeholder="Enter full name"
                value={assistantData.name}
                onChange={handleChange}
                required
                error={assistantErrors.name}
              />
              <Input
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter email"
                value={assistantData.email}
                onChange={handleChange}
                required
                error={assistantErrors.email}
              />
              <Input
                label="Phone Number"
                type="text"
                name="phone"
                placeholder="Enter phone number"
                value={assistantData.phone}
                onChange={handleChange}
                required
                error={assistantErrors.phone}
              />
              <Input
                label="Verification Document"
                type="text"
                name="document"
                placeholder="Document URL"
                value={assistantData.document}
                onChange={handleChange}
              />
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="Enter password"
                value={assistantData.password}
                onChange={handleChange}
                required
                error={assistantErrors.password}
              />
              <Button type="submit" loading={creatingAssistant} fullWidth size="lg">
                Create Assistant
              </Button>
            </form>
          </Modal>
          </Can>
          <LabOwnerPaymentSection open={showPaymentOverview} onClose={() => setShowPaymentOverview(false)} />
          <div ref={tableRef} className="bg-white rounded-[35px] shadow-sm mt-10 p-5 md:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Booking Management</h2>
                    <p className="text-gray-500">Manage laboratory bookings</p>
                  </div>
                  <ViewToggle view={view} onChange={setView} />
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-96">
                    <Input
                      type="text"
                      placeholder="Search patient, mobile, test, package..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12"
                      containerClassName="relative"
                    />
                    <Search
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                  <div className="bg-primary/10 px-4 py-2.5 rounded-lg text-xs font-semibold text-primary whitespace-nowrap flex items-center h-11">
                    Total: {filteredBookings.length}
                  </div>
                  <Can resource="lab_assistants" action="create">
                    <Button
                      onClick={() => setShowAssistantForm(true)}
                      className="flex items-center justify-center gap-2"
                    >
                      <UserPlus />
                      Create Assistant
                    </Button>
                  </Can>
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
              ) : filteredBookings.length === 0 ? (
                <EmptyState text="No Bookings Found" />
              ) : (
                <>
                  {view === 'table' ? (
                    <LabOwnerBookingsTable
                      filteredBookings={filteredBookings}
                      assistants={assistants}
                      handleAssignAssistant={handleAssignAssistant}
                      setSelectedReport={setSelectedReport}
                      uploadingReport={uploadingReport}
                      handleUploadReport={handleUploadReport}
                      setPreviewReport={setPreviewReport}
                    />
                  ) : (
                    <LabOwnerBookingMobileCard
                      filteredBookings={filteredBookings}
                      assistants={assistants}
                      handleAssignAssistant={handleAssignAssistant}
                      selectedReport={selectedReport}
                      setSelectedReport={setSelectedReport}
                      uploadingReport={uploadingReport}
                      handleUploadReport={handleUploadReport}
                      setPreviewReport={setPreviewReport}
                    />
                  )}
                </>
              )}
            </div>
        </div>
      </div>
      <ReportViewerModal
        isOpen={!!previewReport}
        onClose={() => setPreviewReport(null)}
        reportUrl={previewReport}
      />
    </DashboardLayout>
  )
}
export default LabOwnerDashboard
