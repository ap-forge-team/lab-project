import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const createBooking = (payload) => {
  return API.post(API_ENDPOINTS.BOOKINGS.BASE, payload)
}

export const getMyBookings = () => {
  return API.get(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS)
}

export const getAllBookings = () => {
  return API.get(API_ENDPOINTS.BOOKINGS.ALL)
}

export const getLabOwnerBookings = () => {
  return API.get(API_ENDPOINTS.BOOKINGS.LAB_OWNER)
}

export const getAssignedBookings = () => {
  return API.get(API_ENDPOINTS.BOOKINGS.ASSIGNED)
}

export const searchLabOwnerBookings = (search) => {
  return API.get(`${API_ENDPOINTS.BOOKINGS.LAB_OWNER_SEARCH}?search=${search}`)
}

export const searchAssignedBookings = (search) => {
  return API.get(`${API_ENDPOINTS.BOOKINGS.ASSIGNED_SEARCH}?search=${search}`)
}

export const manageBooking = (bookingId, payload) => {
  return API.put(API_ENDPOINTS.BOOKINGS.MANAGE(bookingId), payload)
}

export const assignAssistant = (bookingId, assistantId) => {
  return API.put(API_ENDPOINTS.BOOKINGS.ASSIGN_ASSISTANT, { bookingId, assistantId })
}

export const markReached = (bookingId) => {
  return API.put(API_ENDPOINTS.BOOKINGS.REACHED(bookingId))
}

export const uploadSample = (bookingId, formData) => {
  return API.put(API_ENDPOINTS.BOOKINGS.SAMPLE(bookingId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const uploadReport = (bookingId, formData) => {
  return API.put(API_ENDPOINTS.BOOKINGS.UPLOAD_REPORT(bookingId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const updateBookingLab = (bookingId, labOwnerId) => {
  return API.put(API_ENDPOINTS.BOOKINGS.UPDATE_LAB(bookingId), { labOwnerId })
}

export const updatePaymentStatus = (bookingId, paymentStatus) => {
  return API.put(API_ENDPOINTS.BOOKINGS.PAYMENT_STATUS(bookingId), { paymentStatus })
}

export const uploadPaymentReceipt = (bookingId, formData) => {
  return API.put(API_ENDPOINTS.BOOKINGS_PAYMENT_RECEIPT(bookingId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const addTestsToBooking = (bookingId, { testIds = [], packageIds = [] }) => {
  return API.put(API_ENDPOINTS.BOOKINGS.ADD_TESTS(bookingId), { testIds, packageIds })
}
