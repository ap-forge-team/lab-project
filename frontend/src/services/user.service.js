import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const getAllUsers = () => {
  return API.get(API_ENDPOINTS.USERS.ALL)
}

export const getSingleUser = (id) => {
  return API.get(API_ENDPOINTS.USERS.BY_ID(id))
}

export const updateUser = (id, data) => {
  return API.put(API_ENDPOINTS.USERS.BY_ID(id), data)
}

export const deleteUser = (id) => {
  return API.delete(API_ENDPOINTS.USERS.BY_ID(id))
}

export const getAllLabOwners = () => {
  return API.get(API_ENDPOINTS.ADMIN.LAB_OWNERS)
}

export const getBookingLabOwners = () => {
  return API.get(API_ENDPOINTS.BOOKINGS.LAB_OWNERS)
}

export const createLabOwner = (data) => {
  return API.post(API_ENDPOINTS.ADMIN.CREATE_LAB_OWNER, data)
}

export const createLabAssistant = (data) => {
  return API.post(API_ENDPOINTS.ADMIN.CREATE_LAB_ASSISTANT, data)
}

export const getMyAssistants = () => {
  return API.get(API_ENDPOINTS.USERS.MY_ASSISTANTS)
}

export const createPaymentOrder = (data) => {
  return API.post(API_ENDPOINTS.PAYMENT.CREATE, data)
}

export const verifyPayment = (data) => {
  return API.post(API_ENDPOINTS.PAYMENT.VERIFY, data)
}

export const getPaymentSetting = () => {
  return API.get(API_ENDPOINTS.PAYMENT_SETTING.BASE)
}

export const createPaymentSetting = (formData) => {
  return API.post(API_ENDPOINTS.PAYMENT_SETTING.BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const updatePaymentSetting = (formData) => {
  return API.put(API_ENDPOINTS.PAYMENT_SETTING.BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getAdminDashboardStats = (params = {}) => {
  return API.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS, { params })
}
