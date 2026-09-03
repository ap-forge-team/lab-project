import API from './api'

// Admin Settlement APIs
export const getSettlementStatistics = () => API.get('/settlements/statistics')
export const getSettlementList = (params) => API.get('/settlements', { params })
export const getSettlementHistory = (params) => API.get('/settlements/history', { params })
export const getSettlementDetails = (batchId) => API.get(`/settlements/details/${batchId}`)
export const sendSettlement = (bookingId, data) => API.put(`/settlements/send/${bookingId}`, data)
export const bulkSettlement = (data) => API.post('/settlements/bulk', data)
export const verifySettlement = (bookingId) => API.patch(`/settlements/verify/${bookingId}`)
export const verifyBulkSettlement = (batchId) => API.patch(`/settlements/verify-bulk/${batchId}`)

// Lab Owner Settlement APIs
export const getLabSettlementStatistics = () => API.get('/settlements/lab/statistics')
export const getLabSettlementPending = () => API.get('/settlements/lab/pending')
export const getLabSettlementHistory = () => API.get('/settlements/lab/history')
export const getLabSettlementDetails = (batchId) => API.get(`/settlements/lab/details/${batchId}`)
