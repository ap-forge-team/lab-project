import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import {
  ArrowLeft,
  FileText,
  Package,
  IndianRupee,
} from 'lucide-react'
import { createPackage, updatePackage } from '@/services/package.service'
import { getCategories } from '@/services/category.service'
import { getAllTests } from '@/services/test.service'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
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

const AddPackageModal = ({ open, onClose, onCreated, initialData, packageId, mode = 'create', allTests: allTestsProp }) => {
  const [creating, setCreating] = useState(false)
  const { errors, validate, onFieldChange } = useFormErrors()
  const [packageData, setPackageData] = useState(INITIAL_DATA)
  const [categories, setCategories] = useState([])
  const [allTests, setAllTests] = useState(allTestsProp || [])
  const [testSearch, setTestSearch] = useState('')
  const initialDataLoaded = useRef(false)

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
      .then(({ data }) => {
        if (active) setCategories(data?.categories || [])
      })
      .catch(() => {})
    if (!allTestsProp) {
      getAllTests()
        .then(({ data }) => {
          if (active) setAllTests(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [])
        })
        .catch(() => {})
    }
    return () => { active = false }
  }, [open, allTestsProp])

  useEffect(() => {
    if (!open) return
    if (initialData) {
      initialDataLoaded.current = true
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
    } else {
      initialDataLoaded.current = false
      setPackageData(INITIAL_DATA)
    }
  }, [open, initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    const next = { ...packageData, [name]: value }
    setPackageData(next)
    onFieldChange(name, buildErrors(next))
  }

  const handleToggleTest = (testId) => {
    setPackageData((prev) => {
      const tests = prev.testsIncluded.includes(testId)
        ? prev.testsIncluded.filter((id) => id !== testId)
        : [...prev.testsIncluded, testId]
      const next = { ...prev, testsIncluded: tests }
      onFieldChange('testsIncluded', buildErrors(next))
      return next
    })
  }

  const resetForm = () => {
    setPackageData(INITIAL_DATA)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (creating) return
    if (!validate(buildErrors(packageData))) return
    try {
      setCreating(true)
      const payload = {
        title: packageData.title,
        category: packageData.category,
        price: Number(packageData.price),
        description: packageData.description,
        image: packageData.image,
        testsIncluded: packageData.testsIncluded,
        isActive: packageData.isActive,
      }
      if (mode === 'edit' && packageId) {
        await updatePackage(packageId, payload)
        toast.success('Package Updated Successfully')
      } else {
        await createPackage(payload)
        toast.success('Package Created Successfully')
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

  const filteredTests = allTests.filter((test) => {
    const term = testSearch.trim().toLowerCase()
    if (!term) return true
    return (test.title || test.name || '').toLowerCase().includes(term)
  })

  return (
    <Modal
      open={open}
      title={mode === 'edit' ? 'Edit Package' : 'Create Package'}
      subtitle={mode === 'edit' ? 'Update package details' : 'Add a new health-check package'}
      onClose={onClose}
      size="xl"
      headerAction={
        <Button variant="outline" size="sm" onClick={onClose} type="button">
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Packages
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

          <div className="grid md:grid-cols-2 gap-5">
            <Input
              required
              label="Package Title"
              type="text"
              name="title"
              placeholder="Enter package title"
              value={packageData.title}
              onChange={handleChange}
              error={errors.title}
              hint="Enter full package name"
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={packageData.category}
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
          </div>
        </section>

        {/* Pricing */}
        <section className="border border-gray-100 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <IndianRupee size={16} />
            </span>
            <h3 className="font-semibold text-gray-900">Pricing</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Input
              required
              label="Price (₹)"
              type="number"
              name="price"
              placeholder="Enter package price"
              value={packageData.price}
              onChange={handleChange}
              error={errors.price}
            />
          </div>
        </section>

        {/* Test Selection */}
        <section className="border border-gray-100 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <Package size={16} />
            </span>
            <h3 className="font-semibold text-gray-900">Tests Included</h3>
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold ml-auto">
              {packageData.testsIncluded.length} Selected
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tests to add..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {errors.testsIncluded && (
              <span className="text-xs text-red-500">{errors.testsIncluded}</span>
            )}

            {/* Selected tests chips */}
            {packageData.testsIncluded.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {packageData.testsIncluded.map((id) => {
                  const test = allTests.find((item) => item._id === id)
                  if (!test) return null
                  return (
                    <div
                      key={id}
                      className="bg-primary/10 border border-border rounded-lg px-3 py-2 flex items-center justify-between gap-3 min-w-[150px]"
                    >
                      <div>
                        <h4 className="text-xs font-medium text-foreground">{test.title || test.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">₹{test.price}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleTest(id)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Available tests list */}
            <div className="border border-gray-200 rounded-lg max-h-[200px] overflow-y-auto">
              {filteredTests.length === 0 ? (
                <p className="p-4 text-center text-sm text-gray-400">No tests found</p>
              ) : (
                filteredTests.map((test) => {
                  const isSelected = packageData.testsIncluded.includes(test._id)
                  return (
                    <button
                      key={test._id}
                      type="button"
                      onClick={() => handleToggleTest(test._id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left border-b border-gray-100 last:border-0 transition-colors ${
                        isSelected ? 'bg-primary/5 text-primary' : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div>
                        <span className="font-medium">{test.title || test.name}</span>
                        <span className="ml-2 text-xs text-gray-400">₹{test.price}</span>
                      </div>
                      {isSelected && <span className="text-primary text-xs font-semibold">✓ Selected</span>}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </section>

        {/* Description & Image */}
        <section className="border border-gray-100 rounded-xl p-5 bg-white">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
              <FileText size={16} />
            </span>
            <h3 className="font-semibold text-gray-900">Details</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <Textarea
              label="Description"
              rows="4"
              name="description"
              placeholder="Enter package description"
              value={packageData.description}
              onChange={handleChange}
              maxLength={500}
              footer={`${packageData.description.length}/500`}
            />
            <Input
              label="Image URL (optional)"
              type="text"
              name="image"
              placeholder="Enter image URL"
              value={packageData.image}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={creating} disabled={!packageData.title || !packageData.category || !packageData.price}>
            {mode === 'edit' ? 'Update Package' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AddPackageModal
