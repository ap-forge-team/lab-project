# AI Prescription Upload & Test Recommendations — Implementation Plan

## Overview

Patient uploads a prescription image → Backend sends it to OpenAI Vision API → AI extracts test names → System matches with test catalog → Returns recommended tests → Patient can book directly.

---

## Architecture Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│   Patient    │────▶│   Frontend   │────▶│   Backend   │────▶│  OpenAI API  │
│  Uploads Rx  │     │  FormData    │     │  Controller │     │  Vision GPT  │
└─────────────┘     └──────────────┘     └──────┬──────┘     └──────────────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │  MongoDB     │
                                         │  Match Tests │
                                         └──────┬───────┘
                                                │
                                                ▼
                                         ┌──────────────┐
                                         │  Returns     │
                                         │  Matched     │
                                         │  Tests       │
                                         └──────────────┘
```

---

## Step 1: Backend — Environment & Dependencies

### 1.1 Add OpenAI API Key

**Files to modify:**
- `backend/.env`
- `backend/.env.example`

```env
# Add to .env
OPENAI_API_KEY=sk-your-api-key-here

# Add to .env.example
OPENAI_API_KEY=your-openai-api-key
```

### 1.2 Dependencies

**Already installed (no action needed):**
- `openai` v7.4.0 — listed in `backend/package.json` but unused
- `multer` + `multer-storage-cloudinary` — file upload handling
- `cloudinary` — cloud file storage

---

## Step 2: Backend — Prescription Model Enhancement

### File: `backend/models/Prescription.js`

**Current state:** Minimal schema with only `image: String`

**Updated schema:**

```js
import mongoose from 'mongoose'

const prescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    aiExtractedText: {
      type: String,
      default: '',
    },
    recommendedTests: [
      {
        test: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Test',
        },
        confidence: {
          type: Number,
          default: 0,
          min: 0,
          max: 1,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'analyzed', 'booked', 'expired'],
      default: 'pending',
    },
    bookedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Prescription', prescriptionSchema)
```

---

## Step 3: Backend — Prescription Controller

### New file: `backend/controllers/prescriptionController.js`

```js
import Prescription from '../models/Prescription.js'
import Test from '../models/Test.js'
import OpenAI from 'openai'
import logger from '../Utils/logger.js'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// @desc    Upload prescription and get AI test recommendations
// @route   POST /api/prescriptions
// @access  Private (Patient)
export const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a prescription image',
      })
    }

    // 1. Save prescription record
    const prescription = await Prescription.create({
      user: req.user._id,
      image: req.file.path, // Cloudinary URL
      status: 'pending',
    })

    // 2. Call OpenAI Vision API
    let extractedTests = []
    let aiText = ''

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract all medical test names from this prescription. 
                       Return a JSON object with a "tests" array. 
                       Each test should have a "testName" field.
                       Only include diagnostic test names (e.g., CBC, Blood Sugar, Thyroid).
                       Do not include medications, diagnoses, or doctor notes.
                       Example: {"tests": [{"testName": "Complete Blood Count"}, {"testName": "Blood Sugar Fasting"}]}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: req.file.path,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content || '{}'
      aiText = content
      const parsed = JSON.parse(content)
      extractedTests = parsed.tests || []
    } catch (aiError) {
      logger.error('OpenAI API error:', { message: aiError.message })
      // Continue without AI recommendations
    }

    // 3. Match extracted tests with catalog
    const matchedTests = []
    for (const item of extractedTests) {
      const testName = item.testName || item.name || ''

      // Fuzzy match: case-insensitive, partial match
      const matchedTest = await Test.findOne({
        title: { $regex: testName, $options: 'i' },
        isActive: true,
      })

      if (matchedTest) {
        matchedTests.push({
          test: matchedTest._id,
          confidence: 0.8, // Default confidence for matched tests
        })
      }
    }

    // 4. Update prescription
    prescription.aiExtractedText = aiText
    prescription.recommendedTests = matchedTests
    prescription.status = 'analyzed'
    await prescription.save()

    // 5. Return populated prescription
    const populated = await Prescription.findById(prescription._id)
      .populate('recommendedTests.test')

    return res.status(201).json({
      success: true,
      message: 'Prescription analyzed successfully',
      data: populated,
    })
  } catch (error) {
    logger.error('Upload prescription error:', {
      message: error.message,
      stack: error.stack,
    })
    return res.status(500).json({
      success: false,
      message: 'Failed to process prescription',
    })
  }
}

// @desc    Get patient's prescriptions
// @route   GET /api/prescriptions
// @access  Private (Patient)
export const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id })
      .populate('recommendedTests.test')
      .sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      data: prescriptions,
    })
  } catch (error) {
    logger.error('Get prescriptions error:', { message: error.message })
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
    })
  }
}

// @desc    Mark prescription as booked
// @route   PUT /api/prescriptions/:id/book
// @access  Private (Patient)
export const markPrescriptionBooked = async (req, res) => {
  try {
    const { bookingId } = req.body
    const prescription = await Prescription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'booked', bookedBooking: bookingId },
      { new: true }
    )

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: prescription,
    })
  } catch (error) {
    logger.error('Mark prescription booked error:', { message: error.message })
    return res.status(500).json({
      success: false,
      message: 'Failed to update prescription',
    })
  }
}
```

---

## Step 4: Backend — Prescription Routes

### New file: `backend/routes/prescriptionRoutes.js`

```js
import express from 'express'
import protect from '../middleware/authMiddleware.js'
import uploadMiddleware from '../middleware/uploadMiddleware.js'
import {
  uploadPrescription,
  getMyPrescriptions,
  markPrescriptionBooked,
} from '../controllers/prescriptionController.js'

const router = express.Router()

// Upload prescription (image upload to Cloudinary)
router.post(
  '/',
  protect,
  uploadMiddleware.single('prescription'),
  uploadPrescription
)

// Get patient's prescriptions
router.get('/', protect, getMyPrescriptions)

// Mark prescription as booked
router.put('/:id/book', protect, markPrescriptionBooked)

export default router
```

---

## Step 5: Backend — Mount Route in Server

### File: `backend/server.js`

**Add import:**
```js
import prescriptionRoutes from './routes/prescriptionRoutes.js'
```

**Add route mount (after existing routes):**
```js
app.use('/api/prescriptions', prescriptionRoutes)
```

---

## Step 6: Frontend — API Endpoint Constant

### File: `frontend/src/constants/api.js`

**Add to API_ENDPOINTS:**
```js
PRESCRIPTIONS: {
  BASE: '/prescriptions',
  UPLOAD: '/prescriptions',
  BOOK: (id) => `/prescriptions/${id}/book`,
},
```

---

## Step 7: Frontend — Prescription Service

### New file: `frontend/src/services/prescription.service.js`

```js
import API from '@/services/api'
import { API_ENDPOINTS } from '@/constants/api'

export const uploadPrescription = (formData) => {
  return API.post(API_ENDPOINTS.PRESCRIPTIONS.UPLOAD, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const getMyPrescriptions = () => {
  return API.get(API_ENDPOINTS.PRESCRIPTIONS.BASE)
}

export const markPrescriptionBooked = (prescriptionId, bookingId) => {
  return API.put(API_ENDPOINTS.PRESCRIPTIONS.BOOK(prescriptionId), {
    bookingId,
  })
}
```

---

## Step 8: Frontend — UploadPrescriptionPage Component

### New file: `frontend/src/features/prescription/components/UploadPrescriptionPage.jsx`

```jsx
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  ShoppingCart,
  Eye,
} from 'lucide-react'
import { toast } from 'react-toastify'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import BookTestModal from '@/features/booking/components/BookTestModal'
import {
  uploadPrescription,
  getMyPrescriptions,
} from '@/services/prescription.service'

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
  analyzed: { bg: 'bg-blue-50', text: 'text-blue-600', icon: CheckCircle2 },
  booked: { bg: 'bg-green-50', text: 'text-green-600', icon: CheckCircle2 },
  expired: { bg: 'bg-gray-50', text: 'text-gray-600', icon: AlertCircle },
}

const UploadPrescriptionPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [bookModal, setBookModal] = useState({ open: false, test: null })

  // Fetch prescriptions on mount
  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const { data } = await getMyPrescriptions()
      setPrescriptions(data?.data || [])
    } catch (error) {
      toast.error('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload JPG, PNG, or PDF')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    setUploadFile(file)
  }

  // Handle upload
  const handleUpload = useCallback(async () => {
    if (!uploadFile) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('prescription', uploadFile)

      const { data } = await uploadPrescription(formData)

      toast.success('Prescription analyzed successfully!')
      setUploadFile(null)
      setPrescriptions((prev) => [data.data, ...prev])
      setSelectedPrescription(data.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [uploadFile])

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  // Book a single test
  const handleBookTest = (test) => {
    setBookModal({ open: true, test })
  }

  // Book all recommended tests
  const handleBookAll = (prescription) => {
    // Open modal with first test, user can add more
    const firstTest = prescription.recommendedTests[0]?.test
    setBookModal({ open: true, test: firstTest || null })
  }

  return (
    <section className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Prescription</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload your prescription and get AI-powered test recommendations
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white border border-border rounded-xl p-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-border p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload size={28} className="text-primary" />
          </div>

          {uploadFile ? (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">{uploadFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                JPG, PNG, or PDF up to 10MB
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            className="hidden"
          />
        </div>

        {/* Upload Button */}
        {uploadFile && (
          <div className="mt-4 flex items-center gap-3">
            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={uploading}
            >
              {uploading ? 'Analyzing...' : 'Analyze Prescription'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setUploadFile(null)}
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Selected Prescription Results */}
      {selectedPrescription && (
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            AI Recommendations
          </h2>

          {selectedPrescription.recommendedTests?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedPrescription.recommendedTests.map((item) => (
                  <div
                    key={item.test?._id}
                    className="border border-border rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">
                          {item.test?.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.test?.category?.name}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        ₹{item.test?.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      <span>Sample: {item.test?.sampleType}</span>
                      <span>•</span>
                      <span>TAT: {item.test?.reportTime}</span>
                    </div>
                    <Button
                      onClick={() => handleBookTest(item.test)}
                      className="w-full mt-3"
                      size="sm"
                    >
                      <ShoppingCart size={14} className="mr-2" />
                      Book Now
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={() => handleBookAll(selectedPrescription)}>
                  Book All Tests
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No matching tests found in our catalog
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try browsing our{' '}
                <button
                  onClick={() => navigate('/booking/tests')}
                  className="text-primary hover:underline"
                >
                  test catalog
                </button>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Prescription History */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Prescription History
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No prescriptions uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => {
              const statusStyle = STATUS_STYLES[prescription.status] || STATUS_STYLES.pending
              const StatusIcon = statusStyle.icon

              return (
                <div
                  key={prescription._id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition cursor-pointer"
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Prescription #{prescription._id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(prescription.createdAt).toLocaleDateString()} •{' '}
                        {prescription.recommendedTests?.length || 0} tests recommended
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      <StatusIcon size={12} className="inline mr-1" />
                      {prescription.status}
                    </span>
                    <Eye size={16} className="text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Book Test Modal */}
      <BookTestModal
        open={bookModal.open}
        onClose={() => setBookModal({ open: false, test: null })}
        preselectedTest={bookModal.test}
        onBooked={() => {
          fetchPrescriptions()
          setBookModal({ open: false, test: null })
        }}
      />
    </section>
  )
}

export default UploadPrescriptionPage
```

---

## Step 9: Frontend — Wire Into SidebarPage

### File: `frontend/src/pages/SidebarPage.jsx`

**Add import at top:**
```js
import UploadPrescriptionPage from '@/features/prescription/components/UploadPrescriptionPage'
```

**Add before the generic fallback (before `const Icon = config.icon`):**
```js
if (slug === 'upload-prescription') {
  return (
    <DashboardLayout>
      <UploadPrescriptionPage />
    </DashboardLayout>
  )
}
```

---

## Step 10: Frontend — Update sidebarPages.js Config

### File: `frontend/src/constants/sidebarPages.js`

**Change the upload-prescription entry:**

```js
// Before
'upload-prescription': page(
  'Upload Prescription',
  'Attach a prescription to a booking.',
  Upload,
  { resource: 'bookings', action: 'create' },
  'myBookings'
),

// After
'upload-prescription': page(
  'Upload Prescription',
  'Upload a prescription and get AI-powered test recommendations.',
  Upload,
  { resource: 'bookings', action: 'create' },
  null
),
```

---

## Files Summary

### Backend (Create)
| File | Purpose |
|------|---------|
| `backend/controllers/prescriptionController.js` | Upload + AI analysis + match tests |
| `backend/routes/prescriptionRoutes.js` | API routes |

### Backend (Modify)
| File | Change |
|------|--------|
| `backend/models/Prescription.js` | Enhanced schema with user, AI text, matched tests, status |
| `backend/server.js` | Mount prescription routes |
| `backend/.env.example` | Add OPENAI_API_KEY |

### Frontend (Create)
| File | Purpose |
|------|---------|
| `frontend/src/services/prescription.service.js` | API calls |
| `frontend/src/features/prescription/components/UploadPrescriptionPage.jsx` | Full upload + results UI |

### Frontend (Modify)
| File | Change |
|------|--------|
| `frontend/src/constants/api.js` | Add PRESCRIPTIONS endpoints |
| `frontend/src/pages/SidebarPage.jsx` | Add upload-prescription slug handler |
| `frontend/src/constants/sidebarPages.js` | Update config (remove myBookings dataSource) |

---

## Testing Checklist

- [ ] Upload JPG/PNG prescription → AI analyzes → tests matched
- [ ] Upload PDF prescription → works same as image
- [ ] Invalid file type → shows error toast
- [ ] File > 10MB → shows error toast
- [ ] No matching tests → shows "browse catalog" link
- [ ] "Book Now" on recommended test → opens BookTestModal with preselected test
- [ ] "Book All" → opens BookTestModal
- [ ] After booking → prescription status changes to "booked"
- [ ] Prescription history shows all past uploads
- [ ] Non-logged-in user → redirected to login
- [ ] OpenAI API failure → graceful fallback, shows raw extracted text

---

## AI Prompt Template

```
Extract all medical test names from this prescription.
Return a JSON object with a "tests" array.
Each test should have a "testName" field.
Only include diagnostic test names (e.g., CBC, Blood Sugar, Thyroid).
Do not include medications, diagnoses, or doctor notes.
Example: {"tests": [{"testName": "Complete Blood Count"}, {"testName": "Blood Sugar Fasting"}]}
```

---

## Estimated Effort

| Task | Hours |
|------|-------|
| Backend model + controller + routes | 2-3 hrs |
| Frontend upload page + service | 2-3 hrs |
| Integration + testing | 1-2 hrs |
| **Total** | **5-8 hrs** |
