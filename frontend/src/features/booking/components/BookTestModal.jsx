import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import BookingTestSelect from './BookingTestSelect'
import BookingPatientInfo from './BookingPatientInfo'
import BookingAddressSection from './BookingAddressSection'
import BookingDateTime from '@/components/BookingDateTime'
import { getAllTests } from '@/services/test.service'
import { getAllPackages } from '@/services/package.service'
import { createBooking } from '@/services/booking.service'
import { toast } from 'react-toastify'
import useBookingFormModal from '../hooks/useBookingFormModal'

export default function BookTestModal({ open, onClose, preselectedTest, onBooked }) {
  const { errors, validate, onFieldChange, buildErrors } = useBookingFormModal()

  const [formData, setFormData] = useState({
    test: '',
    package: '',
    patientName: '',
    age: '',
    gender: '',
    phone: '',
    flatNo: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    address: '',
    bookingDate: '',
    bookingTime: '',
    latitude: '',
    longitude: '',
  })

  const [tests, setTests] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [mapLocation, setMapLocation] = useState(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    if (!open) return
    setFormData({
      test: '', package: '', patientName: '', age: '', gender: '', phone: '',
      flatNo: '', landmark: '', city: '', state: '', pincode: '', address: '',
      bookingDate: '', bookingTime: '', latitude: '', longitude: '',
    })
    setMapLocation(null)

    const fetch = async () => {
      try {
        setFetchError(null)
        const [testsRes, packagesRes] = await Promise.all([getAllTests(), getAllPackages()])
        const testsList = Array.isArray(testsRes.data?.data) ? testsRes.data.data : Array.isArray(testsRes.data) ? testsRes.data : []
        const packagesList = Array.isArray(packagesRes.data?.data) ? packagesRes.data.data : Array.isArray(packagesRes.data) ? packagesRes.data : []
        setTests(testsList)
        setPackages(packagesList)
      } catch {
        setFetchError('Failed to load tests and packages.')
      }
    }
    fetch()
  }, [open])

  useEffect(() => {
    if (!preselectedTest?._id || !open) return
    setFormData((prev) => ({ ...prev, test: preselectedTest._id, package: '' }))
  }, [preselectedTest, open])

  const handleChange = (e) => {
    const { name, value } = e.target
    if ((name === 'phone' || name === 'pincode') && value && !/^\d*$/.test(value)) return
    const next = { ...formData, [name]: value }
    setFormData(next)
    onFieldChange(name, next)
  }

  const handleTestPackageChange = (e) => {
    const selectedId = e.target.value
    const isTest = tests.some((item) => item._id === selectedId)
    const isPackage = packages.some((item) => item._id === selectedId)
    const next = { ...formData, test: isTest ? selectedId : '', package: isPackage ? selectedId : '' }
    setFormData(next)
    onFieldChange('test', next)
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`)
      const data = await response.json()
      const area = data.address?.suburb || data.address?.neighbourhood || data.address?.residential || data.address?.quarter || ''
      const society = data.address?.hamlet || data.address?.allotments || ''
      const road = data.address?.road || ''
      const city = data.address?.city || data.address?.town || data.address?.village || ''
      const state = data.address?.state || ''
      const pincode = data.address?.postcode || ''
      const fullAddress = [area, road, society, city, state, pincode].filter(Boolean).join(', ')
      setFormData((prev) => ({ ...prev, address: area || road || '', landmark: road, city, state, pincode, latitude: lat, longitude: lng }))
      toast.success(`Location Selected: ${area}`)
    } catch {
      toast.error('Unable to fetch address')
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('Location not supported'); return }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setMapLocation({ lat, lng })
        await reverseGeocode(lat, lng)
      },
      () => { toast.error('Location Permission Denied') }
    )
  }

  const openMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => { setMapLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); setShowMap(true) },
        () => { setShowMap(true) }
      )
    } else { setShowMap(true) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate(formData)) return
    if (!mapLocation) { toast.error('Please select location'); return }
    try {
      setLoading(true)
      await createBooking({ ...formData, latitude: mapLocation?.lat, longitude: mapLocation?.lng })
      toast.success('Booking Created Successfully')
      onBooked?.()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking Failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Book a Lab Test" subtitle="Fill in the details below to book your test" size="xl">
      {fetchError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
          <p className="text-red-600 font-medium">{fetchError}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Retry</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <BookingTestSelect tests={tests} packages={packages} formData={formData} errors={errors} handleTestPackageChange={handleTestPackageChange} />
          <BookingPatientInfo formData={formData} errors={errors} handleChange={handleChange} />
          <BookingAddressSection
            formData={formData} errors={errors} handleChange={handleChange}
            mapLocation={mapLocation} setMapLocation={setMapLocation}
            showMap={showMap} setShowMap={setShowMap}
            getCurrentLocation={getCurrentLocation} openMap={openMap} reverseGeocode={reverseGeocode}
          />
          <BookingDateTime formData={formData} errors={errors} handleChange={handleChange} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Confirm Booking</Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
