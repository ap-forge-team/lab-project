import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Lock, Shield, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Loader'
import { toast } from 'react-toastify'
import useBookingForm from '@/features/booking/hooks/useBookingForm'
import BookingTestSelect from '@/features/booking/components/BookingTestSelect'
import BookingPatientInfo from '@/features/booking/components/BookingPatientInfo'
import BookingAddressSection from '@/features/booking/components/BookingAddressSection'
import DatePicker from '@/features/booking/components/DatePicker'
import TimeSlotPicker from '@/features/booking/components/TimeSlotPicker'
import SampleCollectionPreference from '@/features/booking/components/SampleCollectionPreference'

const timeSlots = [
  '06:00 AM',
  '07:00 AM',
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
]

const Booking = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const {
    formData,
    errors,
    tests,
    packages,
    fetchError,
    mapLocation,
    setMapLocation,
    showMap,
    setShowMap,
    fetchTests,
    handleChange,
    handleTestPackageChange,
    handleSubmit,
    getCurrentLocation,
    openMap,
    reverseGeocode,
  } = useBookingForm()

  const selectedTest = tests.find(t => t._id === formData.test)
  const selectedPackage = packages.find(p => p._id === formData.package)
  const selectedItem = selectedTest || selectedPackage
  const itemType = formData.package ? 'package' : 'test'

  const handleConfirmBooking = async () => {
    // Validation
    if (!formData.test && !formData.package) {
      toast.error('Please select a test or package')
      return
    }
    if (!formData.patientName || formData.patientName.length < 2) {
      toast.error('Please enter patient name')
      return
    }
    if (!formData.age || formData.age < 1 || formData.age > 99) {
      toast.error('Please enter valid age')
      return
    }
    if (!formData.gender) {
      toast.error('Please select gender')
      return
    }
    if (!formData.phone || !/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter valid phone number')
      return
    }
    if (!formData.flatNo) {
      toast.error('Please enter flat / apartment number')
      return
    }
    if (!formData.city) {
      toast.error('Please enter city')
      return
    }
    if (!formData.state) {
      toast.error('Please select state')
      return
    }
    if (!formData.pincode || !/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      toast.error('Please enter valid pincode')
      return
    }
    if (!formData.address) {
      toast.error('Please enter address')
      return
    }
    if (!formData.bookingDate) {
      toast.error('Please select booking date')
      return
    }
    if (!formData.bookingTime) {
      toast.error('Please select booking time')
      return
    }

    handleSubmit({ preventDefault: () => {} })
  }

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return null
    const [y, m, d] = dateStr.split('-')
    const date = new Date(y, parseInt(m) - 1, parseInt(d))
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
    const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(m) - 1]
    return `${dayName}, ${d} ${monthName} ${y}`
  }

  const price = selectedItem?.price || selectedItem?.offerPrice || 0

  return (
    <DashboardLayout>
      <div className="min-h-screen pb-32">
        {/* Header */}
        <div className="bg-tertiary sticky top-0 z-40">
          <div className="enterprise-container py-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FlaskConical size={18} className="text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-tight">Checked Up</h1>
                <p className="text-white/60 text-[10px] uppercase tracking-wider">Lab Tests</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : fetchError ? (
          <div className="enterprise-container py-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <p className="text-red-600 font-medium">{fetchError}</p>
              <Button onClick={fetchTests} variant="outline" className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="enterprise-container py-4 space-y-4">
            {/* Page Title */}
            <div className="mb-2">
              <h1 className="text-xl font-bold text-foreground">Book Your Lab Test</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Fill in your details to schedule your sample collection</p>
            </div>

            {/* Selected Test / Package */}
            <div className="bg-card rounded-xl border border-border p-4">
              <BookingTestSelect
                tests={tests}
                packages={packages}
                formData={formData}
                errors={errors}
                handleTestPackageChange={handleTestPackageChange}
              />
            </div>

            {/* Patient Details */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="text-primary">👤</span> Patient Details
                </h2>
              </div>
              <div className="p-4">
                <BookingPatientInfo formData={formData} errors={errors} handleChange={handleChange} />
              </div>
            </div>

            {/* Address & Location */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="text-primary">📍</span> Address & Location
                </h2>
              </div>
              <div className="p-4">
                <BookingAddressSection
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                  mapLocation={mapLocation}
                  setMapLocation={setMapLocation}
                  showMap={showMap}
                  setShowMap={setShowMap}
                  getCurrentLocation={getCurrentLocation}
                  openMap={openMap}
                  reverseGeocode={reverseGeocode}
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="font-semibold text-foreground flex items-center gap-2">
                  <span className="text-primary">📅</span> Date & Time
                </h2>
              </div>
              <div className="p-4 space-y-4">
                {/* Date Picker Toggle */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Select Date *</label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full border border-border rounded-xl px-4 py-3.5 flex items-center justify-between outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card transition"
                  >
                    <span className={formData.bookingDate ? 'text-foreground' : 'text-muted-foreground'}>
                      {formData.bookingDate ? formatSelectedDate(formData.bookingDate) : 'Select date'}
                    </span>
                    {showCalendar ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                  </button>
                </div>

                {/* Calendar (shown when toggled) */}
                {showCalendar && (
                  <DatePicker
                    selectedDate={formData.bookingDate}
                    onDateChange={(date) => {
                      handleChange({ target: { name: 'bookingDate', value: date } })
                      setShowCalendar(false)
                    }}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                )}

                {/* Time Slots Dropdown */}
                <div>
                  <label className="text-xs font-semibold text-foreground mb-2 block">Select Time Slot *</label>
                  <div className="relative">
                    <select
                      name="bookingTime"
                      value={formData.bookingTime}
                      onChange={handleChange}
                      className="w-full border border-border rounded-xl px-4 py-3.5 pr-10 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-foreground bg-card transition appearance-none"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Selected Date & Time Summary */}
                {formData.bookingDate && formData.bookingTime && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 flex items-center gap-2">
                    <span className="text-primary text-sm">📅</span>
                    <span className="text-sm font-medium text-foreground">
                      Selected: {formatSelectedDate(formData.bookingDate)}, {formData.bookingTime}
                    </span>
                  </div>
                )}

                <SampleCollectionPreference />
              </div>
            </div>
          </div>
        )}

        {/* Fixed Bottom Button */}
        {!loading && !fetchError && (
          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 z-40">
            <div className="enterprise-container">
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="w-full py-3.5 bg-primary text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition active:scale-[0.98]"
              >
                <Lock size={16} />
                Confirm Booking
              </button>
              <p className="text-center text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Shield size={12} /> You won't be charged now
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
export default Booking
