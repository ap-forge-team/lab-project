import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const getCategories = () => {
  return API.get(API_ENDPOINTS.CATEGORIES.BASE)
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

export const getSubcategories = (categoryId) => {
  return API.get(API_ENDPOINTS.CATEGORIES.SUBCATEGORIES(categoryId))
}

export const createSubcategory = (categoryId, data) => {
  return API.post(API_ENDPOINTS.CATEGORIES.SUBCATEGORIES(categoryId), data)
}

export const updateSubcategory = (categoryId, subId, data) => {
  return API.put(API_ENDPOINTS.CATEGORIES.SUBCATEGORY_BY_ID(categoryId, subId), data)
}

export const deleteSubcategory = (categoryId, subId) => {
  return API.delete(API_ENDPOINTS.CATEGORIES.SUBCATEGORY_BY_ID(categoryId, subId))
}
