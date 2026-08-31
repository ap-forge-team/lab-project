import React, { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'react-toastify'
import {
  ChevronRight,
  Package,
  UploadCloud,
  Info,
} from 'lucide-react'
import { createPackage, updatePackage } from '@/services/package.service'
import { getCategories } from '@/services/category.service'
import { getAllTests } from '@/services/test.service'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import useFormErrors from '@/hooks/useFormErrors'

const INITIAL_DATA = {
  title: '',
  category: '',
  price: '',
  description: '',
  image: '',
  testsIncluded: [],
  isActive: true,
}

const CreatePackageModal = ({ open, onClose, onCreated, initialData, packageId, mode = 'create' }) => {
  const [creating, setCreating] = useState(false)
  const { errors, validate, onFieldChange } = useFormErrors()
  const [packageData, setPackageData] = useState(INITIAL_DATA)
  const [categories, setCategories] = useState([])
  const [allTests, setAllTests] = useState([])
  const [testSearch, setTestSearch] = useState('')
  const [testDropdownOpen, setTestDropdownOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const testDropdownRef = useRef(null)
  const fileInputRef = useRef(null)

  const buildErrors = (p) => ({
    title: !p.title ? 'Package title is required' : '',
    category: !p.category ? 'Category is required' : '',
    price: !p.price ? 'Price is required' : '',
    testsIncluded: p.testsIncluded.length === 0 ? 'Select at least one test' : '',
  })

  useEffect(() => {
    if (!open) return
    let active = true
    getCategories()
      .then(({ data }) => { if (active) setCategories(data?.categories || []) })
      .catch(() => {})
    getAllTests()
      .then(({ data }) => {
        if (active) setAllTests(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [])
      })
      .catch(() => {})
    return () => { active = false }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (initialData) {
      const mapped = {
        title: initialData.title || initialData.name || '',
        category: initialData.category?._id || initialData.category || '',
        price: initialData.price ?? '',
        description: initialData.description || '',
        image: initialData.image || '',
        testsIncluded: initialData.testsIncluded?.map((t) => t?._id || t) || [],
        isActive: initialData.isActive ?? true,
      }
      setPackageData(mapped)
      if (initialData.image) setImagePreview(initialData.image)
    } else {
      setPackageData(INITIAL_DATA)
      setImagePreview(null)
      setImageFile(null)
    }
    setTestSearch('')
    setTestDropdownOpen(false)
  }, [open, initialData])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (testDropdownRef.current && !testDropdownRef.current.contains(e.target)) {
        setTestDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...packageData, [name]: value }
    setPackageData(next)
    onFieldChange(name, buildErrors(next))
  }

  const handleToggleTest = useCallback((testId) => {
    setPackageData((prev) => {
      const tests = prev.testsIncluded.includes(testId)
        ? prev.testsIncluded.filter((id) => id !== testId)
        : [...prev.testsIncluded, testId]
      const next = { ...prev, testsIncluded: tests }
      onFieldChange('testsIncluded', buildErrors(next))
      return next
    })
  }, [onFieldChange])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (creating) return
    if (!validate(buildErrors(packageData))) return
    try {
      setCreating(true)
      const formData = new FormData()
      formData.append('title', packageData.title)
      formData.append('category', packageData.category)
      formData.append('price', Number(packageData.price))
      formData.append('description', packageData.description)
      formData.append('testsIncluded', packageData.testsIncluded.join(','))
      formData.append('isActive', packageData.isActive)
      if (imageFile) {
        formData.append('image', imageFile)
      }
      if (mode === 'edit' && packageId) {
        await updatePackage(packageId, formData)
        toast.success('Package Updated Successfully')
      } else {
        await createPackage(formData)
        toast.success('Package Created Successfully')
      }
      onCreated()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setCreating(false)
    }
  }

  const filteredTests = allTests.filter((test) => {
    const term = testSearch.trim().toLowerCase()
    if (!term) return true
    return (test.title || test.name || '').toLowerCase().includes(term)
  })

  const formatPreviewPrice = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? `₹${num.toLocaleString('en-IN')}` : '₹0'
  }

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit Package' : 'Create Package'}
      subtitle="Add a new healthcare package to offer to your customers."
      onClose={onClose}
      size="full"
    >
      <div className="flex flex-col lg:flex-row gap-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5 min-w-0">
          {/* Package Title & Category */}
          <div className="rounded-xl border border-border p-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Package Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={packageData.title}
                  onChange={handleChange}
                  placeholder="Enter package title"
                  className="border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                />
                {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                <span className="text-xs text-muted-foreground">E.g. Basic Health Checkup</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={packageData.category}
                  onChange={handleChange}
                  className="border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
                {errors.category && <span className="text-xs text-red-500">{errors.category}</span>}
                <span className="text-xs text-muted-foreground">Choose a category for this package</span>
              </div>
            </div>
          </div>

          {/* Select Tests */}
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-semibold text-foreground">
                  Select Tests <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">Choose the tests to include in this package</p>
              </div>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                {packageData.testsIncluded.length} Tests Selected
              </span>
            </div>

            {packageData.testsIncluded.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {packageData.testsIncluded.map((id) => {
                  const test = allTests.find((item) => item._id === id)
                  if (!test) return null
                  return (
                    <span
                      key={id}
                      className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 flex items-center gap-2 text-sm text-primary font-medium"
                    >
                      {test.title || test.name}
                      <button type="button" onClick={() => handleToggleTest(id)} className="text-primary/60 hover:text-primary ml-1">×</button>
                    </span>
                  )
                })}
              </div>
            )}

            <div className="relative" ref={testDropdownRef}>
              <button
                type="button"
                onClick={() => setTestDropdownOpen(!testDropdownOpen)}
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-left bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition flex items-center justify-between"
              >
                <span className={packageData.testsIncluded.length > 0 ? 'text-foreground' : 'text-muted-foreground'}>Select tests</span>
                <svg className={`w-4 h-4 text-muted-foreground transition-transform ${testDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {errors.testsIncluded && <span className="text-xs text-red-500 mt-1 block">{errors.testsIncluded}</span>}

              {testDropdownOpen && (
                <div className="absolute z-[110] mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-[250px] overflow-hidden">
                  <div className="p-2 border-b border-border">
                    <input
                      type="text"
                      placeholder="Search tests..."
                      value={testSearch}
                      onChange={(e) => setTestSearch(e.target.value)}
                      className="w-full border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-[200px]">
                    {filteredTests.length === 0 ? (
                      <p className="p-3 text-center text-sm text-muted-foreground">No tests found</p>
                    ) : (
                      filteredTests.map((test) => {
                        const isSelected = packageData.testsIncluded.includes(test._id)
                        return (
                          <button
                            key={test._id}
                            type="button"
                            onClick={() => handleToggleTest(test._id)}
                            className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-accent transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                          >
                            <span className="text-foreground">{test.title || test.name}</span>
                            {isSelected && <span className="text-primary text-xs font-semibold">✓</span>}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price & Image */}
          <div className="rounded-xl border border-border p-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">
                  Package Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
                  <input
                    type="number"
                    name="price"
                    value={packageData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    min="1"
                    className="w-full border border-border rounded-lg pl-8 pr-3 py-2.5 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
                {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
                <span className="text-xs text-muted-foreground">Enter package price in INR</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-foreground">Package Image</label>
                <div className="border border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {imagePreview ? (
                    <div className="space-y-2">
                      <img src={imagePreview} alt="Preview" className="w-full h-20 object-cover rounded-lg" />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-muted-foreground truncate max-w-[100px]">{imageFile?.name || 'Uploaded image'}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); removeImage() }} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={24} className="mx-auto text-muted-foreground mb-1.5" />
                      <p className="text-sm font-medium text-foreground">Upload package image</p>
                      <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG or WEBP (Max. 2MB)</p>
                      <button type="button" className="mt-2 px-4 py-1.5 border border-border rounded-lg text-xs font-medium text-foreground hover:bg-accent transition">Choose File</button>
                    </>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border border-border p-5">
            <label className="text-sm font-semibold text-foreground block mb-2">Description</label>
            <textarea
              name="description"
              value={packageData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Enter package description"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Briefly describe the benefits and details of this package.</p>
          </div>

          {/* Status */}
          <div className="rounded-xl border border-border p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-foreground">Package Status</label>
              <div className="flex items-center gap-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setPackageData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${packageData.isActive ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${packageData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium text-foreground">{packageData.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <span className="text-xs text-muted-foreground">Inactive packages will not be shown to customers.</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={creating}>
              <Package size={16} className="mr-2" />
              {mode === 'edit' ? 'Update Package' : 'Create Package'}
            </Button>
          </div>
        </form>

        {/* Preview Panel */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Package Preview (As Customer Sees)</h3>

          {/* Preview 1: Image uploaded */}
          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 mb-2">
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">✓</span>
                1. Image Uploaded
              </span>
              <div className="rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 h-[120px] flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Package size={36} className="text-blue-300" />
                )}
              </div>
            </div>
            <div className="px-3 py-2.5">
              <h4 className="font-semibold text-foreground text-sm">{packageData.title || 'Package Title'}</h4>
              <p className="text-primary font-bold text-sm mt-0.5">{formatPreviewPrice(packageData.price)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{packageData.testsIncluded.length} Tests Included</p>
            </div>
          </div>

          {/* Preview 2: No Image, Category Illustration */}
          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 mb-2">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px]">✓</span>
                2. No Image, Category Illustration
              </span>
              <div className="rounded-lg overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 h-[120px] flex items-center justify-center">
                <svg width="70" height="70" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="30" fill="#E0E7FF" stroke="#A5B4FC" strokeWidth="1"/>
                  <rect x="28" y="25" width="24" height="30" rx="3" fill="#C7D2FE" stroke="#818CF8" strokeWidth="1"/>
                  <path d="M35 38 L45 38 M40 33 L40 43" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
            <div className="px-3 py-2.5">
              <h4 className="font-semibold text-foreground text-sm">{packageData.title || 'Package Title'}</h4>
              <p className="text-primary font-bold text-sm mt-0.5">{formatPreviewPrice(packageData.price)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{packageData.testsIncluded.length} Tests Included</p>
            </div>
          </div>

          {/* Preview 3: No Image, No Illustration */}
          <div className="rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="p-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-500 mb-2">
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px]">✓</span>
                3. No Image, No Illustration
              </span>
              <div className="rounded-lg overflow-hidden bg-gradient-to-br from-pink-50 to-rose-50 h-[120px] flex items-center justify-center">
                <svg width="50" height="50" viewBox="0 0 60 60" fill="none">
                  <circle cx="30" cy="30" r="25" fill="#FCE7F3" stroke="#F9A8D4" strokeWidth="1"/>
                  <path d="M30 20 C25 20 20 25 20 30 C20 38 30 45 30 45 C30 45 40 38 40 30 C40 25 35 20 30 20Z" fill="#F472B6" stroke="#EC4899" strokeWidth="1"/>
                </svg>
              </div>
            </div>
            <div className="px-3 py-2.5">
              <h4 className="font-semibold text-foreground text-sm">{packageData.title || 'Package Title'}</h4>
              <p className="text-primary font-bold text-sm mt-0.5">{formatPreviewPrice(packageData.price)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{packageData.testsIncluded.length} Tests Included</p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
            <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">Preview changes automatically based on image and category selection.</p>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default CreatePackageModal
