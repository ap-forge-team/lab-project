import DashboardLayout from '@/components/layout/DashboardLayout'
import BookingDateTime from '@/components/BookingDateTime'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Loader'
import useBookingForm from '@/features/booking/hooks/useBookingForm'
import BookingFormHeader from '@/features/booking/components/BookingFormHeader'
import BookingTestSelect from '@/features/booking/components/BookingTestSelect'
import BookingPatientInfo from '@/features/booking/components/BookingPatientInfo'
import BookingAddressSection from '@/features/booking/components/BookingAddressSection'
import BookingSummary from '@/features/booking/components/BookingSummary'

const Booking = () => {
  const {
    formData,
    errors,
    tests,
    packages,
    loading,
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

  return (
    <DashboardLayout>
      <BookingFormHeader />
      <div className="enterprise-container py-6 md:py-12 grid lg:grid-cols-3 gap-6 md:gap-10">
        {loading ? (
          <Spinner />
        ) : fetchError ? (
          <div className="lg:col-span-2 bg-red-50 border border-red-200 rounded-xl p-5 text-center">
            <p className="text-red-600 font-medium">{fetchError}</p>
            <Button onClick={fetchTests} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        ) : (
          <>
            <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
            <h2 className="font-heading font-bold text-2xl text-foreground">Appointment Details</h2>
            <p className="text-muted-foreground mt-1 text-sm">Fill all details carefully</p>
            <form onSubmit={handleSubmit} className="mt-6 md:mt-10 space-y-8">
              <BookingTestSelect
                tests={tests}
                packages={packages}
                formData={formData}
                errors={errors}
                handleTestPackageChange={handleTestPackageChange}
              />
              <BookingPatientInfo formData={formData} errors={errors} handleChange={handleChange} />
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
              <BookingDateTime formData={formData} errors={errors} handleChange={handleChange} />
              <Button type="submit" loading={loading} fullWidth size="lg">
                Confirm Booking
              </Button>
            </form>
          </div>
          
          <div className="hidden lg:block">
            <BookingSummary 
              selectedItem={tests.find(t => t._id === formData.test) || packages.find(p => p._id === formData.package)} 
              type={formData.package ? 'package' : 'test'} 
            />
          </div>
        </>
        )}
      </div>
    </DashboardLayout>
  )
}
export default Booking
