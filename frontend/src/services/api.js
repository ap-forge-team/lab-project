import axios from 'axios'
import { ROUTES } from '@/constants/routes'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

API.interceptors.request.use(
  (config) => {
    const userInfo = sessionStorage.getItem('user')
    if (userInfo) {
      const token = JSON.parse(userInfo).token
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      const currentPath = window.location.pathname
      const isPublicPage = [ROUTES.LOGIN, ROUTES.SIGNUP, ROUTES.FORGOT_PASSWORD, ROUTES.HOME, ROUTES.TESTS, ROUTES.PACKAGES, ROUTES.ABOUT].includes(currentPath)

      if (!isPublicPage) {
        sessionStorage.removeItem('user')
        window.location.href = ROUTES.LOGIN
      }
    }

    if (status === 500) {
      console.error('Server error:', error.response?.data?.message || 'Internal server error')
    }

    return Promise.reject(error)
  }
)

export default API
