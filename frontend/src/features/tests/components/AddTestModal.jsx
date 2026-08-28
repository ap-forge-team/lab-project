import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  ArrowLeft,
  FileText,
  Percent,
  Droplet,
  Truck,
  Clock,
  Pencil,
  Info,
  UploadCloud,
} from 'lucide-react'
import { createTest, updateTest } from '@/services/test.service'
import { getCategories, getSubcategories } from '@/services/category.service'
import { getIconById, MedicalIcons } from '@/components/icons/MedicalIcons'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import useFormErrors from '@/hooks/useFormErrors'

const SAMPLE_TYPE_OPTIONS = [
  { value: 'blood', label: 'Blood' },
  { value: 'urine', label: 'Urine' },
  { value: 'saliva', label: 'Saliva' },
  { value: 'stool', label: 'Stool' },
  { value: 'sputum', label: 'Sputum' },
  { value: 'swab', label: 'Swab' },
  { value: 'plasma', label: 'Plasma' },
  { value: 'serum', label: 'Serum' },
  { value: 'csf', label: 'CSF (Cerebrospinal Fluid)' },
  { value: 'tissue', label: 'Tissue' },
  { value: 'semen', label: 'Semen' },
  { value: 'synovial_fluid', label: 'Synovial Fluid' },
  { value: 'other', label: 'Other' },
]

const COLLECTION_METHOD_OPTIONS = [
  { value: 'lab_collection', label: 'Lab Collection' },
  { value: 'home_collection', label: 'Home Collection' },
  { value: 'self_collection', label: 'Self Collection' },
  { value: 'healthcare_professional_collection', label: 'Healthcare Professional Collection' },
  { value: 'phlebotomy', label: 'Phlebotomy' },
  { value: 'swab_collection', label: 'Swab Collection' },
  { value: 'urine_collection', label: 'Urine Collection' },
  { value: 'stool_collection', label: 'Stool Collection' },
  { value: 'other', label: 'Other' },
]

const TAT_OPTIONS = [
  { value: '2_hrs', label: '2 Hours' },
  { value: '6_hrs', label: '6 Hours' },
  { value: '24_hrs', label: '24 Hours' },
  { value: '48_hrs', label: '48 Hours' },
]

const INITIAL_DATA = {
  testName: '',
  shortName: '',
  category: '',
  subCategory: '',
  icon: { name: 'Blood Drop', category: 'Hematology' },
  price: '',
  discount: '',
  offerPrice: '',
  tax: '',
  sampleType: '',
  collectionMethod: '',
  reportTime: '',
  fastingRequired: 'yes',
  shortDescription: '',
  preparationInstructions: '',
  reportIncludes: '',
  iconUpload: null,
}

const AddTestModal = ({ open, onClose, onCreated, initialData, testId, mode = 'create' }) => {
  const [creating, setCreating] = useState(false)
  const { errors, validate, onFieldChange } = useFormErrors()
  const [testData, setTestData] = useState(INITIAL_DATA)
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [iconPickerMode, setIconPickerMode] = useState('library')

  const buildErrors = (t) => ({
    testName: !t.testName ? 'Test name is required' : '',
    category: !t.category ? 'Category is required' : '',
    price: !t.price ? 'Price is required' : '',
    sampleType: !t.sampleType ? 'Sample type is required' : '',
    collectionMethod: !t.collectionMethod ? 'Collection method is required' : '',
    reportTime: !t.reportTime ? 'Report time is required' : '',
  })

  // Auto-calculate offer price whenever price or discount changes
  useEffect(() => {
    const price = parseFloat(testData.price)
    const discount = parseFloat(testData.discount)
    if (!isNaN(price) && !isNaN(discount)) {
      const offer = price - (price * discount) / 100
      setTestData((prev) => ({ ...prev, offerPrice: offer.toFixed(2) }))
    } else if (!isNaN(price)) {
      setTestData((prev) => ({ ...prev, offerPrice: price.toFixed(2) }))
    } else {
      setTestData((prev) => ({ ...prev, offerPrice: '' }))
    }
  }, [testData.price, testData.discount])

  // Load categories from backend when the modal opens
  useEffect(() => {
    if (!open) return
    let active = true
    getCategories()
      .then(({ data }) => {
        if (active) setCategories(data?.categories || [])
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [open])

  // Pre-fill form when initialData is provided (edit / duplicate mode)
  useEffect(() => {
    if (!open) return
    if (initialData) {
      const mapped = {
        testName: initialData.testName || initialData.title || initialData.name || '',
        shortName: initialData.shortName || '',
        category: initialData.category?._id || initialData.category || '',
        subCategory: initialData.subCategory?._id || initialData.subCategory || '',
        icon: initialData.icon || { name: 'Blood Drop', category: 'Hematology' },
        price: initialData.price ?? '',
        discount: initialData.discount ?? '',
        offerPrice: initialData.offerPrice ?? '',
        tax: initialData.tax ?? '',
        sampleType: initialData.sampleType || '',
        collectionMethod: initialData.collectionMethod || '',
        reportTime: initialData.reportTime || '',
        fastingRequired: initialData.fastingRequired ?? 'yes',
        shortDescription: initialData.shortDescription || '',
        preparationInstructions: initialData.preparationInstructions || '',
        reportIncludes: initialData.reportIncludes || '',
        iconUpload: initialData.iconUpload || null,
      }
      setTestData(mapped)
    } else {
      setTestData(INITIAL_DATA)
    }
  }, [open, initialData])

  // When a category is selected, load its subcategories + set the related icon
  useEffect(() => {
    if (!testData.category) {
      setSubcategories([])
      return
    }
    const selectedCat = categories.find((c) => String(c._id) === String(testData.category))
    if (selectedCat) {
      setTestData((prev) => ({
        ...prev,
        icon: { name: selectedCat.icon || 'flask', category: selectedCat.name },
      }))
    }
    getSubcategories({ category: testData.category })
      .then(({ data }) => setSubcategories(data?.subcategories || []))
      .catch(() => setSubcategories([]))
  }, [testData.category, categories])

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...testData, [name]: value }
    if (name === 'category') next.subCategory = ''
    setTestData(next)
    onFieldChange(name, buildErrors(next))
  }

  const handleFastingSelect = (val) => {
    setTestData((prev) => ({ ...prev, fastingRequired: val }))
  }

  const resetForm = () => {
    setTestData(INITIAL_DATA)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (creating) return
    if (!validate(buildErrors(testData))) return
    try {
      setCreating(true)
      const payload = new FormData()
      Object.entries(testData).forEach(([key, value]) => {
        if (key === 'icon') {
          payload.append(key, JSON.stringify(value))
        } else if (value !== null && value !== undefined) {
          const field = key === 'testName' ? 'title' : key
          payload.append(field, value)
        }
      })
      if (mode === 'edit' && testId) {
        await updateTest(testId, payload)
        toast.success('Test Updated Successfully')
      } else {
        await createTest(payload)
        toast.success('Test Created Successfully')
      }
      onCreated()
      onClose()
      resetForm()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const getCategoryIcon = () => {
    const Icon = getIconById(testData.icon?.name || 'flask')
    return <Icon size={22} className="text-blue-600" />
  }

  const handleIconSelect = (icon) => {
    setTestData((prev) => ({
      ...prev,
      icon: { ...prev.icon, name: icon.id },
      iconUpload: null,
    }))
    setIconPickerOpen(false)
  }

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setTestData((prev) => ({
        ...prev,
        iconUpload: reader.result,
      }))
      setIconPickerOpen(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit Test' : 'Create Test'}
      subtitle={mode === 'edit' ? 'Update laboratory test details' : 'Add a new laboratory test to your system'}
      onClose={onClose}
      size="xl"
      headerAction={
        <Button variant="outline" size="sm" onClick={onClose} type="button">
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Tests
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Information */}
        <section className="border border-gray-100 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText size={16} />
            </span>
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
          </div>

          <div className="grid md:grid-cols-[1fr_1fr_1fr_auto] gap-5 items-start">
            <div className="md:col-span-3 grid md:grid-cols-2 gap-5">
              <Input
                required
                label="Test Name"
                type="text"
                name="testName"
                placeholder="Enter test name"
                value={testData.testName}
                onChange={handleChange}
                error={errors.testName}
                hint="Enter full test name"
              />
              <Input
                label="Short Name (Optional)"
                type="text"
                name="shortName"
                placeholder="Enter short name"
                value={testData.shortName}
                onChange={handleChange}
                hint="Short name for reports (e.g. CBC)"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={testData.category}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <span className="text-xs text-red-500">{errors.category}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Sub Category (Optional)
                </label>
                <select
                  name="subCategory"
                  value={testData.subCategory}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select sub category</option>
                  {subcategories.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assigned Icon panel */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex flex-col items-center text-center gap-2 min-w-[180px]">
              <span className="text-sm font-medium text-gray-700">Assigned Icon</span>
              <div className="w-14 h-14 rounded-xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                {testData.iconUpload ? (
                  <img
                    src={testData.iconUpload}
                    alt="Test icon"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  getCategoryIcon()
                )}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {testData.iconUpload ? 'Custom Icon' : testData.icon.name}
              </div>
              <div className="text-xs text-gray-500">
                {testData.iconUpload ? 'Uploaded image' : `Category: ${testData.icon.category}`}
              </div>
              <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => { setIconPickerMode('library'); setIconPickerOpen(true) }}>
                <Pencil size={14} className="mr-1.5" />
                Change Icon
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border border-gray-100 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Percent size={16} />
            </span>
            <h3 className="font-semibold text-gray-900">Pricing</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            <Input
              required
              label="Price (₹)"
              type="number"
              name="price"
              placeholder="Enter price"
              value={testData.price}
              onChange={handleChange}
              error={errors.price}
            />
            <Input
              label="Discount (%)"
              type="number"
              name="discount"
              placeholder="Enter discount"
              value={testData.discount}
              onChange={handleChange}
              suffix="%"
            />
            <Input
              disabled
              label="Offer Price (₹)"
              type="text"
              name="offerPrice"
              placeholder="0.00"
              value={testData.offerPrice}
              hint="Calculated automatically"
            />
            <Input
              label="Tax (%)"
              type="number"
              name="tax"
              placeholder="Enter tax"
              value={testData.tax}
              onChange={handleChange}
              suffix="%"
            />
          </div>
        </section>

        {/* Test Information */}
        <section className="border border-gray-100 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <FileText size={16} />
            </span>
            <h3 className="font-semibold text-gray-900">Test Information</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Sample Type <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Droplet
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                />
                <select
                  name="sampleType"
                  value={testData.sampleType}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select sample type</option>
                  {SAMPLE_TYPE_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.sampleType && (
                <span className="text-xs text-red-500">{errors.sampleType}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Collection Method <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Truck
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  name="collectionMethod"
                  value={testData.collectionMethod}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select method</option>
                  {COLLECTION_METHOD_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.collectionMethod && (
                <span className="text-xs text-red-500">{errors.collectionMethod}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Report Time (TAT) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400"
                />
                <select
                  name="reportTime"
                  value={testData.reportTime}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select TAT</option>
                  {TAT_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.reportTime && (
                <span className="text-xs text-red-500">{errors.reportTime}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Fasting Required <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFastingSelect('yes')}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    testData.fastingRequired === 'yes'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleFastingSelect('no')}
                  className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    testData.fastingRequired === 'no'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-gray-200 text-gray-600'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="border border-gray-100 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <FileText size={16} />
            </span>
            <h3 className="font-semibold text-gray-900">Description</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <Textarea
              label="Short Description"
              rows="4"
              name="shortDescription"
              placeholder="Enter short description"
              value={testData.shortDescription}
              onChange={handleChange}
              maxLength={200}
              footer={`${testData.shortDescription.length}/200`}
            />
            <Textarea
              label="Preparation Instructions"
              rows="4"
              name="preparationInstructions"
              placeholder="Enter preparation instructions"
              value={testData.preparationInstructions}
              onChange={handleChange}
              maxLength={300}
              footer={`${testData.preparationInstructions.length}/300`}
            />
            <Textarea
              label="Report Includes"
              rows="4"
              name="reportIncludes"
              placeholder="Enter what will be included in report"
              value={testData.reportIncludes}
              onChange={handleChange}
              maxLength={300}
              footer={`${testData.reportIncludes.length}/300`}
            />
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={creating}>
            {mode === 'edit' ? 'Update Test' : 'Save & Next'}
            <ArrowLeft size={16} className="ml-1.5 rotate-180" />
          </Button>
        </div>
      </form>

      {/* Icon picker */}
      <Modal
        open={iconPickerOpen}
        title="Choose Icon"
        subtitle="Pick a built-in icon or upload a custom one"
        onClose={() => setIconPickerOpen(false)}
        size="md"
      >
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 mb-4">
          <button
            type="button"
            onClick={() => setIconPickerMode('library')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              iconPickerMode === 'library' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Library
          </button>
          <button
            type="button"
            onClick={() => setIconPickerMode('upload')}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              iconPickerMode === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Upload
          </button>
        </div>

        {iconPickerMode === 'library' ? (
          <div className="grid grid-cols-5 gap-3">
            {MedicalIcons.map((icon) => (
              <button
                key={icon.id}
                type="button"
                onClick={() => handleIconSelect(icon)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-colors ${
                  !testData.iconUpload && testData.icon?.name === icon.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <icon.Icon size={20} />
                <span className="text-[11px] font-medium">{icon.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-12 cursor-pointer hover:border-blue-300 transition-colors text-center">
            <span className="w-11 h-11 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
              <UploadCloud size={20} />
            </span>
            <span className="text-sm font-medium text-gray-800">
              {testData.iconUpload ? 'Custom icon selected' : 'Upload Icon'}
            </span>
            <span className="text-xs text-gray-400">SVG, PNG up to 2MB</span>
            <input
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={handleIconUpload}
            />
          </label>
        )}
      </Modal>
    </Modal>
  )
}

export default AddTestModal