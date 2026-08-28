import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify'
import DashboardShell from '@/features/dashboard/components/DashboardShell'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { getAllTests } from '@/services/test.service'
import { getAllPackages } from '@/services/package.service'
import { getAllLabOwners, getBookingLabOwners, getPaymentSetting, createPaymentSetting, updatePaymentSetting } from '@/services/user.service'
import { getAllBookings } from '@/services/booking.service'
import { BOOKING_STATUS } from '@/constants/status'
import AdminStatsGrid from '@/features/admin/components/AdminStatsGrid'
import AddTestModal from '@/features/tests/components/AddTestModal'
import AdminPackagesSection from '@/features/admin/components/AdminPackagesSection'
import AdminUsersSection from '@/features/admin/components/AdminUsersSection'
import AdminBookingsSection from '@/features/admin/components/AdminBookingsSection'
import AdminPaymentSection from '@/features/admin/components/AdminPaymentSection'

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([])
  const [showLabMap, setShowLabMap] = useState(false)
  const [activePanel, setActivePanel] = useState('')
  const [activeSection, setActiveSection] = useState('all')
  const [tests, setTests] = useState([])
  const [allTests, setAllTests] = useState([])
  const [packages, setPackages] = useState([])
  const [labOwners, setLabOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedLab, setSelectedLab] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const openEditModal = (booking) => {
    setSelectedBooking(booking)
    setSelectedLab(booking.labOwner?._id || '')
    setShowEditModal(true)
  }

  const [payment, setPayment] = useState(null)
  const [qrImage, setQrImage] = useState(null)
  const [showPaymentOverview, setShowPaymentOverview] = useState(false)
  const [savingPayment, setSavingPayment] = useState(false)

  const fetchPayment = async () => {
    try {
      const { data } = await getPaymentSetting()
      if (data.data) {
        setPayment(data.data)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const handleSubmit = async () => {
    try {
      setSavingPayment(true)
      const formData = new FormData()
      if (qrImage) {
        formData.append('qrImage', qrImage)
      }
      if (payment) {
        await updatePaymentSetting(formData)
      } else {
        await createPaymentSetting(formData)
      }
      toast.success('Saved Successfully')
      fetchPayment()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setSavingPayment(false)
    }
  }

  useEffect(() => {
    fetchPayment()
  }, [])

  const tableRef = useRef(null)
  const labOwnersRef = useRef(null)

  const fetchLabOwners = async () => {
    try {
      const { data: res } = await getBookingLabOwners()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setLabOwners(list)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchLabOwners()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setFetchError(null)
      const [testsRes, packagesRes, labOwnersRes] = await Promise.all([
        getAllTests(),
        getAllPackages(),
        getAllLabOwners(),
      ])
      setTests(Array.isArray(testsRes.data?.data) ? testsRes.data.data : Array.isArray(testsRes.data) ? testsRes.data : [])
      setAllTests(Array.isArray(testsRes.data?.data) ? testsRes.data.data : Array.isArray(testsRes.data) ? testsRes.data : [])
      setPackages(Array.isArray(packagesRes.data?.data) ? packagesRes.data.data : Array.isArray(packagesRes.data) ? packagesRes.data : [])
      setLabOwners(Array.isArray(labOwnersRes.data?.data) ? labOwnersRes.data.data : Array.isArray(labOwnersRes.data) ? labOwnersRes.data : [])
    } catch {
      setFetchError('Failed to load dashboard data. Please try again.')
    }
  }

  const fetchBookings = async () => {
    try {
      const { data: res } = await getAllBookings()
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
    fetchDashboardData()
  }, [])

  const scrollToTable = () => {
    setTimeout(() => {
      tableRef.current?.scrollIntoView({
        behavior: 'smooth',
      })
    }, 100)
  }

  const scrollToLabOwners = () => {
    setTimeout(() => {
      labOwnersRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)
  }

  const filteredBookings =
    activeSection === 'pending'
      ? bookings.filter((item) => item.status === BOOKING_STATUS.PENDING)
      : activeSection === 'completed'
        ? bookings.filter((item) => item.status === BOOKING_STATUS.COMPLETED)
        : bookings

  return (
    <DashboardShell
      badge="Admin Management Portal"
      title="Admin Dashboard"
      subtitle="Manage tests, packages, bookings, lab owners and laboratory operations."
    >
      <AdminStatsGrid
        bookings={bookings}
        tests={tests}
        packages={packages}
        labOwners={labOwners}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        scrollToTable={scrollToTable}
        scrollToLabOwners={scrollToLabOwners}
        setActivePanel={setActivePanel}
        openPaymentOverview={() => setShowPaymentOverview(true)}
      />
          <AddTestModal
            open={activePanel === 'test'}
            onClose={() => setActivePanel('')}
            onCreated={fetchDashboardData}
          />
          <AdminPackagesSection
            open={activePanel === 'package'}
            onClose={() => setActivePanel('')}
            onCreated={fetchDashboardData}
            allTests={allTests}
          />
          <AdminUsersSection
            labOwners={labOwners}
            onRefresh={fetchDashboardData}
            showLabMap={showLabMap}
            setShowLabMap={setShowLabMap}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            selectedBooking={selectedBooking}
            selectedLab={selectedLab}
            setSelectedLab={setSelectedLab}
            labOwnersRef={labOwnersRef}
            open={activePanel === 'lab-owner'}
            onClose={() => setActivePanel('')}
          />
          <Modal
            open={activePanel === 'payment'}
            title="Payment Settings"
            subtitle="Upload a QR code for payments"
            onClose={() => setActivePanel('')}
            size="lg"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="space-y-6"
            >
              <div>
                <label className="block mb-2 font-semibold">QR Code</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrImage(e.target.files[0])}
                  className="w-full"
                />
              </div>
              {qrImage && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="font-medium text-blue-700 text-sm">Selected File</p>
                  <p className="text-xs mt-1">{qrImage.name}</p>
                </div>
              )}
              {payment?.qrImage && (
                <div className="space-y-3">
                  <p className="font-semibold text-sm">Current QR Code</p>
                  <img src={payment.qrImage} alt="" className="w-64 rounded-xl border" />
                </div>
              )}
              <Button
                type="submit"
                fullWidth
                loading={savingPayment}
              >
                {payment ? 'Update Payment Settings' : 'Save Payment Settings'}
              </Button>
            </form>
          </Modal>
          <AdminPaymentSection open={showPaymentOverview} onClose={() => setShowPaymentOverview(false)} />
          <AdminBookingsSection
            bookings={bookings}
            loading={loading}
            fetchError={fetchError}
            onRetry={() => {
              fetchBookings()
              fetchDashboardData()
            }}
            openEditModal={openEditModal}
            filteredBookings={filteredBookings}
            tableRef={tableRef}
          />
    </DashboardShell>
  )
}

export default AdminDashboard
