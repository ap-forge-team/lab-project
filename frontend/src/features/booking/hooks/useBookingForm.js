import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAllTests } from '@/services/test.service'
import { getAllPackages } from '@/services/package.service'
import { createBooking } from '@/services/booking.service'
import { toast } from 'react-toastify'
import { ROUTES } from '@/constants/routes'
import useFormErrors from '@/hooks/useFormErrors'

export default function useBookingForm() {
  const navigate = useNavigate()
  const pageLocation = useLocation()
  const { errors, validate, onFieldChange } = useFormErrors()

  const buildErrors = (f) => ({
    test: !f.test && !f.package ? 'Please select a test or package' : '',
    patientName:
      !f.patientName
        ? 'Patient name is required'
        : f.patientName.length < 2
          ? 'Name must be at least 2 characters'
          : '',
    age:
      !f.age
        ? 'Age is required'
        : f.age < 1 || f.age > 99
          ? 'Age must be between 1 and 99'
          : '',
    gender: !f.gender ? 'Gender is required' : '',
    phone:
      !f.phone
        ? 'Phone number is required'
        : !/^[6-9]\d{9}$/.test(f.phone)
          ? 'Enter a valid 10 digit phone number'
          : '',
    flatNo: !f.flatNo ? 'Flat / apartment is required' : '',
    city: !f.city ? 'City is required' : '',
    state: !f.state ? 'State is required' : '',
    pincode:
      !f.pincode
        ? 'Pincode is required'
        : !/^[1-9][0-9]{5}$/.test(f.pincode)
          ? 'Enter a valid 6 digit pincode'
          : '',
    address: !f.address ? 'Address is required' : '',
    bookingDate: !f.bookingDate ? 'Booking date is required' : '',
    bookingTime: !f.bookingTime ? 'Booking time is required' : '',
  })

  const selectedItem = pageLocation.state?.selectedItem
  const bookingType = pageLocation.state?.bookingType

  const [formData, setFormData] = useState({
    test: '',
    package: '',
    patientName: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
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
    if (!selectedItem?._id) return
    setFormData((prev) => ({
      ...prev,
      test: bookingType === 'test' ? selectedItem._id : '',
      package: bookingType === 'package' ? selectedItem._id : '',
    }))
  }, [selectedItem, bookingType])

  const fetchTests = async () => {
    try {
      setFetchError(null)
      const [testsRes, packagesRes] = await Promise.all([getAllTests(), getAllPackages()])
      const testsList = Array.isArray(testsRes.data?.data) ? testsRes.data.data : Array.isArray(testsRes.data) ? testsRes.data : []
      const packagesList = Array.isArray(packagesRes.data?.data) ? packagesRes.data.data : Array.isArray(packagesRes.data) ? packagesRes.data : []
      setTests(testsList)
      setPackages(packagesList)
    } catch {
      setFetchError('Failed to load tests and packages. Please try again.')
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if ((name === 'phone' || name === 'pincode') && value && !/^\d*$/.test(value)) {
      return
    }
    const next = { ...formData, [name]: value }
    setFormData(next)
    onFieldChange(name, buildErrors(next))
  }

  const handleTestPackageChange = (e) => {
    const selectedId = e.target.value
    const isTest = tests.some((item) => item._id === selectedId)
    const isPackage = packages.some((item) => item._id === selectedId)
    const next = {
      ...formData,
      test: isTest ? selectedId : '',
      package: isPackage ? selectedId : '',
    }
    setFormData(next)
    onFieldChange('test', buildErrors(next))
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
      )
      const data = await response.json()
      const area =
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.address?.residential ||
        data.address?.quarter ||
        ''
      const society = data.address?.hamlet || data.address?.allotments || ''
      const road = data.address?.road || ''
      const city = data.address?.city || data.address?.town || data.address?.village || ''
      const state = data.address?.state || ''
      const pincode = data.address?.postcode || ''
      const fullAddress = [area, road, society, city, state, pincode].filter(Boolean).join(', ')
      setFormData((prev) => ({
        ...prev,
        address: area || road || '',
        landmark: road,
        city,
        state,
        pincode,
        latitude: lat,
        longitude: lng,
      }))
      toast.success(`Location Selected: ${area}`)
    } catch {
      toast.error('Unable to fetch address')
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setMapLocation({ lat, lng })
        await reverseGeocode(lat, lng)
      },
      () => {
        toast.error('Location Permission Denied')
      }
    )
  }

  const openMap = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setShowMap(true)
        },
        () => {
          setShowMap(true)
        }
      )
    } else {
      setShowMap(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate(buildErrors(formData))) return
    if (!mapLocation) {
      toast.error('Please select location')
      return
    }
    try {
      setLoading(true)
      const payload = {
        ...formData,
        latitude: mapLocation?.lat,
        longitude: mapLocation?.lng,
      }
      await createBooking(payload)
      toast.success('Booking Created Successfully')
      navigate('/booking/bookings')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking Failed')
    } finally {
      setLoading(false)
    }
  }

  return {
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
  }
}
