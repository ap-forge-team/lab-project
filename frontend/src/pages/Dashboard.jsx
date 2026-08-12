import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import { Download } from 'lucide-react'
import DashboardShell from '@/features/dashboard/components/DashboardShell'
import useAuth from '@/hooks/useAuth'
import { getMyBookings, manageBooking } from '@/services/booking.service'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { BOOKING_STATUS } from '@/constants/status'
import { DataTable } from '@/components/ui/data-table'
import { createPatientBookingsColumns } from '@/features/patient/columns/patient-bookings.columns'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Loader'
import PatientStatsGrid from '@/features/patient/components/PatientStatsGrid'
import BookingMobileCard from '@/features/patient/components/BookingMobileCard'
import ManageBookingModal from '@/features/patient/components/ManageBookingModal'
import EmptyState from '@/components/Dashboard/EmptyState'
import ReportViewerModal from '@/components/Dashboard/ReportViewerModal'
import ViewToggle from '@/components/ui/ViewToggle'
import useResponsiveView from '@/hooks/useResponsiveView'
import { db } from '@/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const Dashboard = () => {
  const { user } = useAuth()
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showManageModal, setShowManageModal] = useState(false)
  const [action, setAction] = useState('')
  const [reason, setReason] = useState('')
  const [bookings, setBookings] = useState([])
  const [activeSection, setActiveSection] = useState('all')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [previewReport, setPreviewReport] = useState(null)
  const tableRef = useRef(null)
  const navigate = useNavigate()
  const [customReason, setCustomReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [rescheduling, setRescheduling] = useState(false)
  const [view, setView] = useResponsiveView()
  const [rescheduleData, setRescheduleData] = useState({
    bookingDate: '',
    bookingTime: '',
  })

  const fetchBookings = async () => {
    try {
      setFetchError(null)
      const { data: res } = await getMyBookings()
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

    if (!user?._id) return

    const q = query(collection(db, 'bookings'), where('patient', '==', user._id))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const updatedDoc = change.doc.data()
          setBookings((prev) =>
            prev.map((b) =>
              b._id === updatedDoc._id
                ? { ...b, status: updatedDoc.status, report: updatedDoc.report || b.report }
                : b
            )
          )
        }
      })
    })

    return () => unsubscribe()
  }, [user])

  const openManageModal = (booking) => {
    setSelectedBooking(booking)
    setAction('')
    setReason('')
    setRescheduleData({ bookingDate: '', bookingTime: '' })
    setShowManageModal(true)
  }

  const handleCancel = async () => {
    if (!reason) {
      toast.error('Please select cancellation reason')
      return
    }
    if (reason === 'Other' && !customReason.trim()) {
      toast.error('Please enter custom reason')
      return
    }
    try {
      setCancelling(true)
      await manageBooking(selectedBooking._id, {
        action: 'cancel',
        reason: reason === 'Other' ? customReason : reason,
      })
      toast.success('Booking Cancelled Successfully')
      fetchBookings()
      setShowManageModal(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed To Cancel Booking')
    } finally {
      setCancelling(false)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleData.bookingDate) {
      toast.error('Please select booking date')
      return
    }
    if (!rescheduleData.bookingTime) {
      toast.error('Please select booking time')
      return
    }
    try {
      setRescheduling(true)
      await manageBooking(selectedBooking._id, {
        action: 'reschedule',
        bookingDate: rescheduleData.bookingDate,
        bookingTime: rescheduleData.bookingTime,
        reason,
      })
      toast.success('Booking Rescheduled Successfully')
      fetchBookings()
      setShowManageModal(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed To Reschedule Booking')
    } finally {
      setRescheduling(false)
    }
  }

  const handleRescheduleChange = (e) => {
    const { name, value } = e.target
    setRescheduleData((prev) => ({ ...prev, [name]: value }))
  }

  const scrollToTable = () => {
    setTimeout(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const filteredBookings =
    activeSection === 'pending'
      ? bookings.filter((item) => item.status === BOOKING_STATUS.PENDING)
      : activeSection === 'completed'
        ? bookings.filter((item) => item.status === BOOKING_STATUS.COMPLETED)
        : activeSection === 'reports'
          ? bookings.filter((item) => item.report)
          : bookings

  const columns = React.useMemo(
    () => createPatientBookingsColumns({ openManageModal }),
    [openManageModal]
  )

  const actions = React.useMemo(
    () => [
      {
        label: 'View Report',
        icon: <Download size={14} />,
        iconColor: 'bg-blue-100 text-blue-600',
        onClick: (row) => {
          if (row.report) setPreviewReport(row.report)
        },
        disabled: (row) => !row.report,
      },
    ],
    []
  )

  return (
    <DashboardShell
      badge="Patient Dashboard"
      title={`Welcome back, ${user?.name}`}
      subtitle="Manage your bookings and download reports"
    >
      <PatientStatsGrid
        bookings={bookings}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        scrollToTable={scrollToTable}
      />

          <div
            ref={tableRef}
            className="bg-white border border-border rounded-xl shadow-sm mt-8 p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-heading font-bold text-xl text-foreground">My Bookings</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    View all your booked tests &amp; reports
                  </p>
                </div>
                <div className="ml-auto">
                  <ViewToggle view={view} onChange={setView} />
                </div>
              </div>
              <Button onClick={() => navigate(ROUTES.BOOKING)}>
                Book New Test
              </Button>
            </div>

            {loading ? (
              <Spinner />
            ) : fetchError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <p className="text-red-600 text-xs font-medium">{fetchError}</p>
                <Button onClick={fetchBookings} variant="outline" className="mt-3" size="sm">
                  Retry
                </Button>
              </div>
            ) : filteredBookings.length === 0 ? (
              <EmptyState text="No Bookings Found" />
            ) : (
              <>
                {view === 'table' ? (
                  <div className="overflow-x-auto">
                    <DataTable
                      columns={columns}
                      data={filteredBookings}
                      enablePagination={true}
                      enableSorting={true}
                      pageSize={10}
                      actions={actions}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredBookings.map((booking) => (
                      <BookingMobileCard
                        key={booking._id}
                        booking={booking}
                        openManageModal={openManageModal}
                        setPreviewReport={setPreviewReport}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

        <ManageBookingModal
          showManageModal={showManageModal}
          setShowManageModal={setShowManageModal}
          action={action}
          setAction={setAction}
          reason={reason}
          setReason={setReason}
          customReason={customReason}
          setCustomReason={setCustomReason}
          rescheduleData={rescheduleData}
          handleRescheduleChange={handleRescheduleChange}
          handleCancel={handleCancel}
          handleReschedule={handleReschedule}
          cancelling={cancelling}
          rescheduling={rescheduling}
        />
        <ReportViewerModal
          isOpen={!!previewReport}
          onClose={() => setPreviewReport(null)}
          reportUrl={previewReport}
        />
    </DashboardShell>
  )
}

export default Dashboard
