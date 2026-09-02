import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const getCommission = () => API.get(API_ENDPOINTS.COMMISSIONS.BASE)
export const createCommission = (data) => API.post(API_ENDPOINTS.COMMISSIONS.BASE, data)
export const updateCommission = (data) => API.put(API_ENDPOINTS.COMMISSIONS.BASE, data)
export const deleteCommission = () => API.delete(API_ENDPOINTS.COMMISSIONS.BASE)
export const getCommissionHistory = () => API.get(API_ENDPOINTS.COMMISSIONS.HISTORY)
