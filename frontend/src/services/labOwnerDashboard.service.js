import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const getLabOwnerDashboardStats = (params = {}) => {
  return API.get(API_ENDPOINTS.LAB_OWNER_DASHBOARD.DASHBOARD_STATS, { params })
}
