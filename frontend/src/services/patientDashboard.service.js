import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const getPatientDashboardStats = (params = {}) => {
  return API.get(API_ENDPOINTS.PATIENT_DASHBOARD.DASHBOARD_STATS, { params })
}
