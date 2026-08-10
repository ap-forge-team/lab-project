export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PASSWORD: {
    FORGOT: '/pass/forgot-password',
    VERIFY_OTP: '/pass/verify-otp',
    RESET: '/pass/reset-password',
  },
  TESTS: '/tests',
  PACKAGES: '/packages',
  BOOKINGS: {
    BASE: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    ALL: '/bookings/all',
    LAB_OWNERS: '/bookings/lab-owners',
    LAB_OWNER: '/bookings/lab-owner',
    LAB_OWNER_SEARCH: '/bookings/lab-owner/search',
    ASSIGNED: '/bookings/assigned',
    ASSIGNED_SEARCH: '/bookings/assigned/search',
    MANAGE: (id) => `/bookings/manage/${id}`,
    ASSIGN_ASSISTANT: '/bookings/assign-assistant',
    REACHED: (id) => `/bookings/reached/${id}`,
    SAMPLE: (id) => `/bookings/sample/${id}`,
    UPLOAD_REPORT: (id) => `/bookings/upload-report/${id}`,
    UPDATE_LAB: (id) => `/bookings/update-booking-lab/${id}`,
    PAYMENT_STATUS: (id) => `/bookings/${id}/payment-status`,
  },
  ADMIN: {
    LAB_OWNERS: '/admin/lab-owners',
    CREATE_LAB_OWNER: '/admin/create-lab-owner',
    CREATE_LAB_ASSISTANT: '/admin/create-lab-assistant',
  },
  USERS: {
    MY_ASSISTANTS: '/users/my-assistants',
  },
  PAYMENT: {
    CREATE: '/payment/create',
    VERIFY: '/payment/verify',
  },
  PAYMENT_SETTING: {
    BASE: '/payment-setting',
  },
  PAYMENT_STATS: {
    LAB_OWNER: '/payment-statistic/lab-owner',
    ADMIN: '/payment-statistic/admin',
  },
  BOOKINGS_PAYMENT_RECEIPT: (id) => `/bookings/payment/${id}`,
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id) => `/categories/${id}`,
    SUBCATEGORIES: (categoryId) => `/categories/${categoryId}/subcategories`,
    SUBCATEGORY_BY_ID: (categoryId, subId) => `/categories/${categoryId}/subcategories/${subId}`,
  },
}
