import React, { useEffect, useState, useMemo, useCallback } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { getAllTests } from '@/services/test.service'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Clock, Droplet, Grid, List, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import useAuth from '@/hooks/useAuth'
import testsHeroImage from '@/assets/image/tests.png'
import { getIconById } from '@/components/icons/MedicalIcons'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'

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
  <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse shadow-sm">
    <div className="p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      </div>
      <div className="flex items-center gap-6 mb-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border/50">
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)

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
    setCurrentPage(1)
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
          redirectTo: ROUTES.BOOKING,
          selectedItem: item,
          bookingType: type,
        },
      })
    } else {
      navigate(ROUTES.BOOKING, {
        state: {
          selectedItem: item,
          bookingType: type,
        },
      })
    }
  }

  const handleSearch = (e) => {
    const value = e.target.value
    setSearch(value)
    applyFilters(value, activeFilters)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setActiveFilters({})
    setFilteredTests(tests)
    setCurrentPage(1)
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredTests.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

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
          <div className="bg-white border border-border rounded-xl p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 min-w-[200px]">
                <div className="bg-gray-50 border border-border rounded-lg px-4 py-2.5 flex items-center gap-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition">
                  <Search size={18} className="text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    placeholder="Search tests by name or code..."
                    className="w-full outline-none text-sm text-foreground bg-transparent placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              {/* Filter Button */}
              <FilterButton
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
                }}
                activeCount={activeFilterCount}
              />

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-primary/5 rounded-lg transition"
                >
                  <RefreshCw size={16} />
                  <span>Clear</span>
                </button>
              )}

              {/* View Toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-50 text-muted-foreground hover:bg-gray-100'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-50 text-muted-foreground hover:bg-gray-100'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
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
                    className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer group"
                    onClick={() => handleBookNow(item, 'test')}
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-12 h-12 rounded-full object-cover border-2 border-border"
                          />
                        ) : (() => {
                          const TestIcon = getTestIcon(item)
                          const iconStyle = getTestIconStyle(item)
                          return (
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconStyle.bg}`}>
                              <TestIcon size={24} className={iconStyle.text} />
                            </div>
                          )
                        })()}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-heading font-semibold text-base text-foreground truncate">{item.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.code}</p>
                          {(() => {
                            const catColor = getCategoryColor(category)
                            return (
                              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${catColor.bg} ${catColor.text}`}>
                                {category}
                              </span>
                            )
                          })()}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Info Row */}
                      <div className="flex items-center gap-5 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Droplet size={14} className="text-blue-500" />
                          <div>
                            <p className="font-medium text-foreground">{item.sampleType || 'Blood'}</p>
                            <p className="text-[10px]">Sample Type</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-orange-500" />
                          <div>
                            <p className="font-medium text-foreground">{item.reportTime || '24 hrs'}</p>
                            <p className="text-[10px]">TAT</p>
                          </div>
                        </div>
                      </div>

                      {/* Price and Status */}
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <p className="text-lg font-bold text-foreground">₹{item.price}</p>
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
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="bg-gray-50 border-b border-border">
                    <tr>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Test Name</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Code</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Category</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Sample Type</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Price</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">TAT</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Status</th>
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
                          className="border-b border-border last:border-0 hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => handleBookNow(item, 'test')}
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img 
                                  src={item.image} 
                                  alt={item.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-border"
                                />
                              ) : (() => {
                                const TestIcon = getTestIcon(item)
                                const iconStyle = getTestIconStyle(item)
                                return (
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconStyle.bg}`}>
                                    <TestIcon size={20} className={iconStyle.text} />
                                  </div>
                                )
                              })()}
                              <span className="font-medium text-foreground">{item.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{item.code || '—'}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${catColor.bg} ${catColor.text}`}>
                              {category}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{item.sampleType || 'Blood'}</td>
                          <td className="px-5 py-4 font-medium text-foreground">₹{item.price}</td>
                          <td className="px-5 py-4 text-muted-foreground">{item.reportTime || '24 hrs'}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              <span className={`text-xs font-medium ${status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                                {status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination - Always show when there are results */}
          {!loading && filteredTests.length > 0 && (
            <div className="flex items-center justify-between mt-8">
              <p className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTests.length)} of {filteredTests.length} tests
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  &lt;
                </button>
                {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = index + 1
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index
                  } else {
                    pageNumber = currentPage - 2 + index
                  }
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg transition ${currentPage === pageNumber ? 'bg-primary text-white' : 'border border-border hover:bg-gray-50'}`}
                    >
                      {pageNumber}
                    </button>
                  )
                })}
                {totalPages > 5 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <button
                      onClick={() => paginate(totalPages)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg transition ${currentPage === totalPages ? 'bg-primary text-white' : 'border border-border hover:bg-gray-50'}`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  &gt;
                </button>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="ml-4 px-3 py-2 text-sm border border-border rounded-lg bg-white cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value={8}>8 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </div>
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
