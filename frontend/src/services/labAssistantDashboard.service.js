import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const getLabAssistantDashboardStats = (params = {}) => {
  return API.get(API_ENDPOINTS.LAB_ASSISTANT_DASHBOARD.DASHBOARD_STATS, { params })
}
