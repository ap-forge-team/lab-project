import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const getRoles = () => {
  return API.get(API_ENDPOINTS.ROLES.BASE)
}

export const getRoleById = (id) => {
  return API.get(API_ENDPOINTS.ROLES.BY_ID(id))
}

export const createRole = (data) => {
  return API.post(API_ENDPOINTS.ROLES.BASE, data)
}

export const updateRole = (id, data) => {
  return API.put(API_ENDPOINTS.ROLES.BY_ID(id), data)
}

export const updateRolePermissions = (id, permissions) => {
  return API.put(`${API_ENDPOINTS.ROLES.BY_ID(id)}/permissions`, { permissions })
}

export const deleteRole = (id) => {
  return API.delete(API_ENDPOINTS.ROLES.BY_ID(id))
}

export const getAvailableResources = () => {
  return API.get(API_ENDPOINTS.ROLES.RESOURCES)
}
