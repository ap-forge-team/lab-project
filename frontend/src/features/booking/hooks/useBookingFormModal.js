import { useState, useCallback } from 'react'

const useBookingFormModal = () => {
  const [errors, setErrors] = useState({})

  const buildErrors = useCallback((f) => ({
    test: !f.test && !f.package ? 'Please select a test or package' : '',
    patientName: !f.patientName ? 'Patient name is required' : f.patientName.length < 2 ? 'Name must be at least 2 characters' : '',
    age: !f.age ? 'Age is required' : f.age < 1 || f.age > 99 ? 'Age must be between 1 and 99' : '',
    gender: !f.gender ? 'Gender is required' : '',
    phone: !f.phone ? 'Phone number is required' : !/^[6-9]\d{9}$/.test(f.phone) ? 'Enter a valid 10 digit phone number' : '',
    flatNo: !f.flatNo ? 'Flat / apartment is required' : '',
    city: !f.city ? 'City is required' : '',
    pincode: !f.pincode ? 'Pincode is required' : !/^[1-9][0-9]{5}$/.test(f.pincode) ? 'Enter a valid 6 digit pincode' : '',
    address: !f.address ? 'Address is required' : '',
    bookingDate: !f.bookingDate ? 'Booking date is required' : '',
    bookingTime: !f.bookingTime ? 'Booking time is required' : '',
  }), [])

  const validate = useCallback((formData) => {
    const nextErrors = buildErrors(formData)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [buildErrors])

  const onFieldChange = useCallback((fieldName, formData) => {
    const nextErrors = buildErrors(formData)
    setErrors((prev) => {
      const next = { ...prev }
      if (nextErrors[fieldName]) next[fieldName] = nextErrors[fieldName]
      else delete next[fieldName]
      return next
    })
  }, [buildErrors])

  return { errors, validate, onFieldChange, buildErrors }
}

export default useBookingFormModal
