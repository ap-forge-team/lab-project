import React, { useEffect, useRef, useState, useMemo } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { toast } from 'react-toastify'
import {
  getLabOwnerBookings,
  searchLabOwnerBookings,
  assignAssistant,
  uploadReport,
} from '@/services/booking.service'
import { createLabAssistant } from '@/services/user.service'
import { UserPlus, Upload, FileText } from 'lucide-react'
import { EmptyState } from '@/components/Dashboard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Loader'
import LabOwnerDashboardHeader from '@/features/lab-owner/components/LabOwnerDashboardHeader'
import LabOwnerStatsGrid from '@/features/lab-owner/components/LabOwnerStatsGrid'
import BookingsOverviewChart from '@/features/lab-owner/components/BookingsOverviewChart'
import RevenueOverviewChart from '@/features/lab-owner/components/RevenueOverviewChart'
import WeeklyStatsRow from '@/features/lab-owner/components/WeeklyStatsRow'
import LabOwnerRecentBookingsTable from '@/features/lab-owner/components/LabOwnerRecentBookingsTable'
import LabOwnerPendingReportsTable from '@/features/lab-owner/components/LabOwnerPendingReportsTable'
import TestsByCategoryChart from '@/features/lab-owner/components/TestsByCategoryChart'
import SampleCollectionStatusChart from '@/features/lab-owner/components/SampleCollectionStatusChart'
import LabOwnerTopTestsTable from '@/features/lab-owner/components/LabOwnerTopTestsTable'
import LabOwnerRecentPaymentsTable from '@/features/lab-owner/components/LabOwnerRecentPaymentsTable'
import LabOwnerRecentActivity from '@/features/lab-owner/components/LabOwnerRecentActivity'
import LabOwnerAssistantsTable from '@/features/lab-owner/components/LabOwnerAssistantsTable'
import ViewToggle from '@/components/ui/ViewToggle'
import useResponsiveView from '@/hooks/useResponsiveView'
import ReportViewerModal from '@/components/Dashboard/ReportViewerModal'
import { Search } from 'lucide-react'
import useFormErrors from '@/hooks/useFormErrors'
import Can from '@/components/Can'
import LabOwnerBookingsTable from '@/features/lab-owner/components/LabOwnerBookingsTable'
import LabOwnerBookingMobileCard from '@/features/lab-owner/components/LabOwnerBookingMobileCard'
import { useLabOwnerDashboard } from '@/hooks/useLabOwnerDashboard'

const LabOwnerDashboard = () => {
  const tableRef = useRef(null)
  const [bookings, setBookings] = useState([])
  const [creatingAssistant, setCreatingAssistant] = useState(false)
  const [selectedReport, setSelectedReport] = useState({})
  const [uploadingReport, setUploadingReport] = useState({})
  const [previewReport, setPreviewReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useResponsiveView()
  const [showAssistantForm, setShowAssistantForm] = useState(false)
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [bookingsFilter, setBookingsFilter] = useState('This Week')
  const [revenueFilter, setRevenueFilter] = useState('This Week')
  const [testsFilter, setTestsFilter] = useState('This Week')
  const [sampleFilter, setSampleFilter] = useState('This Week')

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
  const [idProofFile, setIdProofFile] = useState(null)
  const [otherDocsFiles, setOtherDocsFiles] = useState([])

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

  const params = useMemo(() => {
    const p = {}
    if (dateRange?.from) {
      p.from = dateRange.from instanceof Date
        ? dateRange.from.toISOString().split('T')[0]
        : String(dateRange.from)
    }
    if (dateRange?.to) {
      p.to = dateRange.to instanceof Date
        ? dateRange.to.toISOString().split('T')[0]
        : String(dateRange.to)
    }
    return p
  }, [dateRange?.from?.getTime?.(), dateRange?.to?.getTime?.()])

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useLabOwnerDashboard(params)

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

  useEffect(() => {
    fetchBookings()
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
      const formData = new FormData()
      formData.append('name', assistantData.name)
      formData.append('email', assistantData.email)
      formData.append('password', assistantData.password)
      formData.append('phone', assistantData.phone)
      if (idProofFile) {
        formData.append('idProof', idProofFile)
      }
      if (otherDocsFiles.length > 0) {
        otherDocsFiles.forEach((file) => {
          formData.append('otherDocuments', file)
        })
      }
      const { data } = await createLabAssistant(formData)
      toast.success(data?.message || 'Assistant created successfully')
      setAssistantData({
        name: '',
        email: '',
        password: '',
        phone: '',
        document: '',
      })
      setIdProofFile(null)
      setOtherDocsFiles([])
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

  const dashboardStats = dashboardData?.stats || {
    totalBookings: 0,
    samplesCollected: 0,
    testsCompleted: 0,
    totalRevenue: 0,
    pendingReports: 0,
    totalBookingsTrend: 0,
    samplesCollectedTrend: 0,
    testsCompletedTrend: 0,
    totalRevenueTrend: 0,
    pendingReportsTrend: 0,
  }

  const weeklyStats = dashboardData?.weekStats || {
    samplesCollected: 0,
    reportsCompleted: 0,
    reportsPending: 0,
    reportsOverdue: 0,
  }

  const bookingsChartData = dashboardData?.bookingsOverview || []
  const revenueChartData = dashboardData?.revenueOverview || []
  const testsByCategoryData = dashboardData?.testsByCategory || []
  const sampleCollectionData = dashboardData?.sampleCollectionData || []
  const recentBookings = dashboardData?.recentBookings || []
  const pendingReports = dashboardData?.pendingReports || []
  const topTests = dashboardData?.topTests || []
  const recentPayments = dashboardData?.recentPayments || []
  const recentActivity = dashboardData?.recentActivity || []
  const assistants = dashboardData?.assistants || []
  const totalRevenue = dashboardData?.totalRevenue || 0

  const isInitialLoading = dashboardLoading && !dashboardData

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {isInitialLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner />
          </div>
        ) : dashboardError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <p className="text-red-600 text-xs font-medium">Failed to load dashboard data. Please try again.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <LabOwnerDashboardHeader dateRange={dateRange} onDateRangeChange={setDateRange} />

        {/* Stats Grid */}
        <LabOwnerStatsGrid stats={dashboardStats} />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <BookingsOverviewChart
            data={bookingsChartData}
            filter={bookingsFilter}
            onFilterChange={setBookingsFilter}
          />
          <RevenueOverviewChart
            data={revenueChartData}
            totalRevenue={totalRevenue}
            trend={dashboardStats.totalRevenueTrend}
            filter={revenueFilter}
            onFilterChange={setRevenueFilter}
          />
        </div>

        {/* Weekly Stats */}
        <WeeklyStatsRow stats={weeklyStats} />

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <LabOwnerRecentBookingsTable data={recentBookings} />
          <LabOwnerPendingReportsTable data={pendingReports} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <TestsByCategoryChart
            data={testsByCategoryData}
            filter={testsFilter}
            onFilterChange={setTestsFilter}
          />
          <SampleCollectionStatusChart
            data={sampleCollectionData}
            filter={sampleFilter}
            onFilterChange={setSampleFilter}
          />
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <LabOwnerTopTestsTable data={topTests} />
          <LabOwnerRecentPaymentsTable data={recentPayments} />
        </div>

          {/* Activity and Assistants */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <LabOwnerRecentActivity data={recentActivity} />
            <LabOwnerAssistantsTable data={assistants} />
          </div>
          </>
        )}
      </div>

      {/* Create Assistant Modal */}
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
            {/* Document Uploads */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Documents</p>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">ID Proof</label>
                <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                  />
                  <Upload size={16} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {idProofFile ? idProofFile.name : 'Upload ID proof (PDF, JPG, PNG)'}
                  </span>
                </label>
                {idProofFile && (
                  <button type="button" onClick={() => setIdProofFile(null)} className="text-[10px] text-red-500 mt-1 hover:underline">Remove</button>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Other Documents (max 5)</label>
                <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    multiple
                    className="hidden"
                    onChange={(e) => setOtherDocsFiles(Array.from(e.target.files || []))}
                  />
                  <Upload size={16} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {otherDocsFiles.length > 0 ? `${otherDocsFiles.length}/5 file(s) selected` : 'Upload additional documents'}
                  </span>
                </label>
                {otherDocsFiles.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {otherDocsFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground truncate">{f.name}</span>
                        <button type="button" onClick={() => setOtherDocsFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-[10px] text-red-500 hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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

      <ReportViewerModal
        isOpen={!!previewReport}
        onClose={() => setPreviewReport(null)}
        reportUrl={previewReport}
      />
    </DashboardLayout>
  )
}

export default LabOwnerDashboard
