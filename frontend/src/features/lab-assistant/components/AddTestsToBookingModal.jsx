import React, { useState, useEffect, useMemo } from 'react'
import { Search, FlaskConical, Package, Check } from 'lucide-react'
import { toast } from 'react-toastify'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { getAllTests } from '@/services/test.service'
import { getAllPackages } from '@/services/package.service'
import { addTestsToBooking } from '@/services/booking.service'

const AddTestsToBookingModal = ({ open, onClose, booking, onTestsAdded }) => {
  const [tests, setTests] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('tests')
  const [selectedTests, setSelectedTests] = useState([])
  const [selectedPackages, setSelectedPackages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      Promise.all([getAllTests(), getAllPackages()])
        .then(([testRes, pkgRes]) => {
          const testList = testRes?.data?.data || testRes?.data?.tests || testRes?.data || []
          const pkgList = pkgRes?.data?.data || pkgRes?.data?.packages || pkgRes?.data || []
          setTests(Array.isArray(testList) ? testList.filter((t) => t.isActive !== false) : [])
          setPackages(Array.isArray(pkgList) ? pkgList.filter((p) => p.isActive !== false) : [])
        })
        .catch(() => {
          toast.error('Failed to load tests and packages')
          setTests([])
          setPackages([])
        })
        .finally(() => setLoading(false))
    } else {
      setTests([])
      setPackages([])
      setSelectedTests([])
      setSelectedPackages([])
      setSearch('')
      setActiveTab('tests')
    }
  }, [open])

  const existingTestIds = useMemo(() => {
    if (!booking) return new Set()
    const ids = new Set()
    if (booking.test?._id) ids.add(booking.test._id)
    if (booking.additionalTests?.length) {
      booking.additionalTests.forEach((at) => {
        if (at.test?._id) ids.add(at.test._id)
      })
    }
    return ids
  }, [booking])

  const existingPackageIds = useMemo(() => {
    if (!booking) return new Set()
    const ids = new Set()
    if (booking.package?._id) ids.add(booking.package._id)
    if (booking.additionalPackages?.length) {
      booking.additionalPackages.forEach((ap) => {
        if (ap.package?._id) ids.add(ap.package._id)
      })
    }
    return ids
  }, [booking])

  const filteredTests = useMemo(() => {
    const term = search.trim().toLowerCase()
    return tests.filter((t) => {
      if (existingTestIds.has(t._id)) return false
      if (term) {
        return (
          t.title?.toLowerCase().includes(term) ||
          t.shortName?.toLowerCase().includes(term)
        )
      }
      return true
    })
  }, [tests, search, existingTestIds])

  const filteredPackages = useMemo(() => {
    const term = search.trim().toLowerCase()
    return packages.filter((p) => {
      if (existingPackageIds.has(p._id)) return false
      if (term) {
        return p.title?.toLowerCase().includes(term)
      }
      return true
    })
  }, [packages, search, existingPackageIds])

  const toggleTest = (testId) => {
    setSelectedTests((prev) =>
      prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]
    )
  }

  const togglePackage = (pkgId) => {
    setSelectedPackages((prev) =>
      prev.includes(pkgId) ? prev.filter((id) => id !== pkgId) : [...prev, pkgId]
    )
  }

  const handleSubmit = async () => {
    if (selectedTests.length === 0 && selectedPackages.length === 0) {
      toast.warning('Please select at least one test or package')
      return
    }
    setSubmitting(true)
    try {
      await addTestsToBooking(booking._id, {
        testIds: selectedTests,
        packageIds: selectedPackages,
      })
      toast.success('Tests/Packages added successfully')
      onTestsAdded?.()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add tests/packages')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTotal = useMemo(() => {
    const testsTotal = selectedTests.reduce((sum, id) => {
      const test = tests.find((t) => t._id === id)
      return sum + (test?.offerPrice || test?.price || 0)
    }, 0)
    const pkgsTotal = selectedPackages.reduce((sum, id) => {
      const pkg = packages.find((p) => p._id === id)
      return sum + (pkg?.price || 0)
    }, 0)
    return testsTotal + pkgsTotal
  }, [selectedTests, selectedPackages, tests, packages])

  const totalCount = selectedTests.length + selectedPackages.length

  return (
    <Modal open={open} title="Add Tests / Packages" onClose={onClose} size="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tests or packages..."
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'tests'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FlaskConical size={14} />
            Tests
            {selectedTests.length > 0 && (
              <span className="ml-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {selectedTests.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
              activeTab === 'packages'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package size={14} />
            Packages
            {selectedPackages.length > 0 && (
              <span className="ml-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {selectedPackages.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading...</div>
        ) : activeTab === 'tests' ? (
          filteredTests.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {search ? 'No tests match your search' : 'No available tests to add'}
            </div>
          ) : (
            <div className="max-h-[350px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
              {filteredTests.map((test) => {
                const isSelected = selectedTests.includes(test._id)
                const price = test.offerPrice || test.price || 0
                return (
                  <button
                    key={test._id}
                    type="button"
                    onClick={() => toggleTest(test._id)}
                    className={`w-full flex items-center gap-3 p-3 text-left transition hover:bg-accent/50 ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                        isSelected
                          ? 'bg-primary border-primary text-white'
                          : 'border-border'
                      }`}
                    >
                      {isSelected && <Check size={12} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{test.title}</p>
                      {test.shortName && (
                        <p className="text-[11px] text-muted-foreground">{test.shortName}</p>
                      )}
                    </div>
                    <span className="text-sm font-mono font-bold text-primary whitespace-nowrap">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </button>
                )
              })}
            </div>
          )
        ) : filteredPackages.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {search ? 'No packages match your search' : 'No available packages to add'}
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto border border-border rounded-lg divide-y divide-border">
            {filteredPackages.map((pkg) => {
              const isSelected = selectedPackages.includes(pkg._id)
              return (
                <button
                  key={pkg._id}
                  type="button"
                  onClick={() => togglePackage(pkg._id)}
                  className={`w-full flex items-center gap-3 p-3 text-left transition hover:bg-accent/50 ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                      isSelected
                        ? 'bg-primary border-primary text-white'
                        : 'border-border'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{pkg.title}</p>
                    {pkg.testsIncluded?.length > 0 && (
                      <p className="text-[11px] text-muted-foreground">{pkg.testsIncluded.length} tests included</p>
                    )}
                  </div>
                  <span className="text-sm font-mono font-bold text-primary whitespace-nowrap">
                    ₹{pkg.price.toLocaleString('en-IN')}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {totalCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
            <span className="text-sm text-foreground">
              {totalCount} item{totalCount > 1 ? 's' : ''} selected
            </span>
            <span className="text-sm font-bold font-mono text-primary">
              +₹{selectedTotal.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={totalCount === 0} loading={submitting}>
            Add Items
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default AddTestsToBookingModal
