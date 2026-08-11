export interface User {
  _id: string
  name: string
  email: string
  role: 'patient' | 'super_admin' | 'lab_owner' | 'lab_assistant'
  token?: string
}

export interface Test {
  _id: string
  title: string
  category: string
  price: number
  reportTime: string
  description: string
  image: string
}

export interface Package {
  _id: string
  title: string
  category: string
  price: number
  testsIncluded: Test[] | string[]
  description: string
  image: string
}

export interface Booking {
  _id: string
  patientName: string
  phone: string
  age: number
  gender: string
  flatNo: string
  address: string
  city: string
  pincode: string
  landmark?: string
  latitude?: number
  longitude?: number
  bookingDate: string
  bookingTime: string
  test?: Test
  package?: Package
  status: string
  paymentStatus: string
  report?: string
  sampleImages?: string[]
  labOwner?: {
    _id: string
    name: string
    labAddress: string
  }
  assignedLabAssistant?: {
    _id: string
    name: string
    email: string
  }
  user?: User
  createdAt?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface LabOwner {
  _id: string
  name: string
  email: string
  phone?: string
  role: string
  servicePincodes: string[]
  labAddress: string
  latitude?: number
  longitude?: number
}

export interface LabAssistant {
  _id: string
  name: string
  email: string
  phone?: string
  document?: string
}
