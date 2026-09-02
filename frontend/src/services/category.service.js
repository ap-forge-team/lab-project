import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

// Category
export const getCategories = (params) => {
  return API.get(API_ENDPOINTS.CATEGORIES.BASE, { params })
}

export const createCategory = (data) => {
  return API.post(API_ENDPOINTS.CATEGORIES.BASE, data)
}

export const updateCategory = (id, data) => {
  return API.put(API_ENDPOINTS.CATEGORIES.BY_ID(id), data)
}

export const deleteCategory = (id) => {
  return API.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id))
}

export const toggleCategoryStatus = (id) => {
  return API.patch(API_ENDPOINTS.CATEGORIES.TOGGLE_STATUS(id))
}

// Subcategory
export const getSubcategories = (params) => {
  return API.get(API_ENDPOINTS.SUBCATEGORIES.BASE, { params })
}

export const createSubcategory = (data) => {
  return API.post(API_ENDPOINTS.SUBCATEGORIES.BASE, data)
}

export const updateSubcategory = (id, data) => {
  return API.put(API_ENDPOINTS.SUBCATEGORIES.BY_ID(id), data)
}

export const deleteSubcategory = (id) => {
  return API.delete(API_ENDPOINTS.SUBCATEGORIES.BY_ID(id))
}

export const toggleSubcategoryStatus = (id) => {
  return API.patch(API_ENDPOINTS.SUBCATEGORIES.TOGGLE_STATUS(id))
}
