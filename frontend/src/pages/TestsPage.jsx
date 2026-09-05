import React, { useEffect, useState, useMemo, useCallback } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { getAllTests } from '@/services/test.service'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Clock, Droplet, RefreshCw, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import useAuth from '@/hooks/useAuth'
import testsHeroImage from '@/assets/image/tests.png'
import { getIconById } from '@/components/icons/MedicalIcons'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'
import Pagination from '@/components/ui/Pagination'
import SearchInput from '@/components/ui/SearchInput'
import ViewToggle from '@/components/ui/ViewToggle'

const ICON_STYLES = {
  blood: { bg: 'bg-red-50', text: 'text-red-500' },
  flask: { bg: 'bg-teal-50', text: 'text-teal-500' },
  shield: { bg: 'bg-violet-50', text: 'text-violet-500' },
  heart: { bg: 'bg-pink-50', text: 'text-pink-500' },
  kidney: { bg: 'bg-orange-50', text: 'text-orange-500' },
  liver: { bg: 'bg-red-50', text: 'text-red-500' },
  thyroid: { bg: 'bg-pink-50', text: 'text-pink-500' },
  stomach: { bg: 'bg-teal-50', text: 'text-teal-500' },
  brain: { bg: 'bg-teal-50', text: 'text-teal-500' },
  user: { bg: 'bg-orange-50', text: 'text-orange-500' },
  dna: { bg: 'bg-blue-50', text: 'text-blue-500' },
  pill: { bg: 'bg-orange-50', text: 'text-orange-500' },
  ribbon: { bg: 'bg-pink-50', text: 'text-pink-500' },
  microscope: { bg: 'bg-blue-50', text: 'text-blue-500' },
  stethoscope: { bg: 'bg-teal-50', text: 'text-teal-500' },
}

const DEFAULT_ICON_STYLE = { bg: 'bg-blue-50', text: 'text-blue-500' }

const getTestIcon = (test) => {
  const iconName = test.icon?.name || 'flask'
  return getIconById(iconName)
}

const getTestIconStyle = (test) => {
  const iconName = test.icon?.name || 'flask'
  return ICON_STYLES[iconName] || DEFAULT_ICON_STYLE
}

const CATEGORY_COLORS = [
  { bg: 'bg-violet-100', text: 'text-violet-700' },
  { bg: 'bg-blue-100', text: 'text-blue-700' },
  { bg: 'bg-amber-100', text: 'text-amber-700' },
  { bg: 'bg-red-100', text: 'text-red-700' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  { bg: 'bg-sky-100', text: 'text-sky-700' },
  { bg: 'bg-rose-100', text: 'text-rose-700' },
  { bg: 'bg-teal-100', text: 'text-teal-700' },
]

const getCategoryColor = (name) => {
  const str = String(name || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}

const TestCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden animate-pulse">
    <div className="p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-20 mt-2"></div>
        </div>
      </div>
      <div className="flex items-center gap-6 mb-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
)

const TestsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [tests, setTests] = useState([])
  const [filteredTests, setFilteredTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })

  const categories = useMemo(() => [...new Set(tests.map(t => typeof t.category === 'object' ? t.category?.name : t.category).filter(Boolean))], [tests])
  const sampleTypes = useMemo(() => [...new Set(tests.map(t => t.sampleType || 'Blood').filter(Boolean))], [tests])

  const filterCategories = useMemo(() => [
    {
      key: 'category',
      label: 'Category',
      type: 'search-checkbox',
      searchPlaceholder: 'Search categories...',
      options: categories.map((cat) => ({ value: cat, label: cat })),
    },
    {
      key: 'sampleType',
      label: 'Sample Type',
      type: 'checkbox',
      options: sampleTypes.map((type) => ({ value: type, label: type })),
    },
    {
      key: 'status',
      label: 'Status',
      type: 'checkbox',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ], [categories, sampleTypes])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).reduce((count, val) => {
      if (Array.isArray(val)) return count + val.length
      return count
    }, 0)
  }, [activeFilters])

  const handleApplyFilters = useCallback((filters) => {
    setActiveFilters(filters)
    setPage(1)
  }, [])

  const applyFilters = (searchTerm, filters) => {
    let filtered = tests
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Category filter
    if (filters.category?.length) {
      filtered = filtered.filter((item) => {
        const catName = typeof item.category === 'object' ? item.category?.name : item.category
        return filters.category.includes(catName)
      })
    }
    
    // Sample Type filter
    if (filters.sampleType?.length) {
      filtered = filtered.filter((item) => {
        const itemSampleType = item.sampleType || 'Blood'
        return filters.sampleType.includes(itemSampleType)
      })
    }
    
    // Status filter
    if (filters.status?.length) {
      filtered = filtered.filter((item) => {
        const itemStatus = item.isActive ? 'active' : 'inactive'
        return filters.status.includes(itemStatus)
      })
    }
    
    setFilteredTests(filtered)
  }

  const fetchTests = async () => {
    try {
      const { data: res } = await getAllTests()
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setTests(list)
      setFilteredTests(list)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTests()
  }, [])

  useEffect(() => {
    if (tests.length > 0) {
      applyFilters(search, activeFilters)
    }
  }, [tests, searchParams])

  const handleBookNow = (item, type = 'test') => {
    if (!user?.token) {
      navigate(ROUTES.LOGIN, {
        state: {
          message: 'Please login to continue booking',
          redirectTo: '/booking/bookings',
        },
      })
    } else {
      navigate('/booking/bookings')
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    applyFilters(value, activeFilters)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setActiveFilters({})
    setFilteredTests(tests)
    setSortConfig({ key: null, direction: null })
    setPage(1)
  }

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' }
        if (prev.direction === 'desc') return { key: null, direction: null }
      }
      return { key, direction: 'asc' }
    })
  }

  const sortedTests = useMemo(() => {
    if (!sortConfig.key) return filteredTests
    return [...filteredTests].sort((a, b) => {
      let aVal, bVal
      switch (sortConfig.key) {
        case 'name': aVal = a.title || ''; bVal = b.title || ''; break
        case 'code': aVal = a.code || a.testCode || ''; bVal = b.code || b.testCode || ''; break
        case 'category': aVal = typeof a.category === 'object' ? a.category?.name || '' : a.category || ''; bVal = typeof b.category === 'object' ? b.category?.name || '' : b.category || ''; break
        case 'sampleType': aVal = a.sampleType || ''; bVal = b.sampleType || ''; break
        case 'price': aVal = a.price || 0; bVal = b.price || 0; break
        case 'tat': aVal = a.reportTime || ''; bVal = b.reportTime || ''; break
        case 'status': aVal = a.isActive ? 'active' : 'inactive'; bVal = b.isActive ? 'active' : 'inactive'; break
        default: return 0
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      }
      const cmp = String(aVal).localeCompare(String(bVal))
      return sortConfig.direction === 'asc' ? cmp : -cmp
    })
  }, [filteredTests, sortConfig])

  const currentItems = sortedTests.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.max(1, Math.ceil(sortedTests.length / pageSize))

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen pb-12 relative overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-white py-10 border-b border-border relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-2/5 hidden md:flex items-center justify-end">
            <img 
              src={testsHeroImage} 
              alt="Lab Tests" 
              className="w-full h-full object-contain object-right opacity-90"
            />
          </div>
          <div className="enterprise-container relative z-10">
            <h1 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-3">All Lab Tests</h1>
            <p className="text-muted-foreground text-base max-w-xl mb-4">
              Choose from 1200+ accurate lab tests across multiple health categories.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-4 py-2 rounded-full w-fit">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>All tests are conducted in NABL Accredited Laboratories</span>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="enterprise-container mt-6">
          {/* Desktop: Toolbar */}
          <div className="hidden sm:flex items-center justify-end gap-2">
            <div className="flex items-center gap-2">
              <SearchInput value={search} onChange={handleSearch} placeholder="Search tests by name or code..." />
              <FilterButton
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
                }}
                activeCount={activeFilterCount}
              />
              <ViewToggle value={viewMode} onChange={setViewMode} tooltips={false} />
            </div>
          </div>

          {/* Mobile: Search + Filter + View Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <SearchInput value={search} onChange={handleSearch} placeholder="Search tests by name or code..." className="flex-1" width="w-full" />
            <FilterButton
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
              }}
              activeCount={activeFilterCount}
            />
            <ViewToggle value={viewMode} onChange={setViewMode} tooltips={false} />
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition mb-4"
            >
              <RefreshCw size={16} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {/* Tests Grid */}
        <div className="enterprise-container py-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TestCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-20">No Tests Found</div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {currentItems.map((item) => {
                const category = typeof item.category === 'object' ? item.category?.name : item.category
                const status = item.isActive ? 'Active' : 'Inactive'
                
                return (
                  <div
                    key={item._id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => handleBookNow(item, 'test')}
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover border border-gray-100"
                          />
                        ) : (() => {
                          const TestIcon = getTestIcon(item)
                          const iconStyle = getTestIconStyle(item)
                          return (
                            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${iconStyle.bg}`}>
                              <TestIcon size={28} className={iconStyle.text} />
                            </div>
                          )
                        })()}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-bold text-base text-gray-900 truncate">{item.title}</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{item.code || item.testCode}</p>
                          {(() => {
                            const catColor = getCategoryColor(category)
                            return (
                              <span className={`inline-block mt-2 px-3 py-1 rounded-sm text-xs font-medium ${catColor.bg} ${catColor.text}`}>
                                {category}
                              </span>
                            )
                          })()}
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center gap-6 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Droplet size={16} className="text-blue-400" />
                          <div>
                            <p className="font-medium text-gray-900">{item.sampleType || 'Blood'}</p>
                            <p className="text-[10px] text-gray-400">Sample Type</p>
                          </div>
                        </div>
                        <div className="w-px h-8 bg-gray-200" />
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-orange-400" />
                          <div>
                            <p className="font-medium text-gray-900">{item.reportTime || '24 hrs'}</p>
                            <p className="text-[10px] text-gray-400">TAT</p>
                          </div>
                        </div>
                      </div>

                      {/* Price and Status */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <p className="text-lg font-bold text-gray-900">₹{item.price}</p>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className={`text-sm font-medium ${status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                            {status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Table View */
            <div className="rounded-xl border border-border bg-white">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead className="bg-accent text-left text-muted-foreground">
                    <tr>
                      {[
                        { key: 'name', label: 'Test Name' },
                        { key: 'code', label: 'Test Code' },
                        { key: 'category', label: 'Category' },
                        { key: 'sampleType', label: 'Sample Type' },
                        { key: 'price', label: 'Price (₹)' },
                        { key: 'tat', label: 'TAT' },
                        { key: 'status', label: 'Status' },
                      ].map((col) => (
                        <th key={col.key} className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleSort(col.key)}
                            className="flex items-center gap-1 text-xs font-semibold hover:text-foreground transition"
                          >
                            {col.label}
                            {sortConfig.key === col.key ? (
                              sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                            ) : (
                              <ChevronsUpDown size={14} className="text-muted-foreground" />
                            )}
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => {
                      const category = typeof item.category === 'object' ? item.category?.name : item.category
                      const status = item.isActive ? 'Active' : 'Inactive'
                      const catColor = getCategoryColor(category)
                      
                      return (
                        <tr
                          key={item._id}
                          className="cursor-pointer border-t border-border transition hover:bg-accent/40"
                          onClick={() => handleBookNow(item, 'test')}
                        >
                          <td className="px-4 py-3 font-medium text-foreground">{item.title}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.code || item.testCode || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-md px-2 py-1 text-xs font-medium ${catColor.bg} ${catColor.text}`}>
                              {category}
                            </span>
                          </td>
                          <td className="px-4 py-3">{item.sampleType || 'Blood'}</td>
                          <td className="px-4 py-3">{item.price != null ? Number(item.price).toLocaleString('en-IN') : '—'}</td>
                          <td className="px-4 py-3">{item.reportTime || '24 hrs'}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-md px-2 py-1 text-xs ${status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {!loading && sortedTests.length > 0 && (
            <div className="mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={sortedTests.length}
                onPageChange={setPage}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
                pageSizes={[8, 12, 24, 48]}
                itemName="tests"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {filterPanelOpen && (
        <FilterPanel
          isOpen={true}
          onClose={() => setFilterPanelOpen(null)}
          onApply={handleApplyFilters}
          position={filterPanelOpen}
          title="Filters"
          categories={filterCategories}
          activeFilters={activeFilters}
        />
      )}
    </PublicLayout>
  )
}

export default TestsPage
