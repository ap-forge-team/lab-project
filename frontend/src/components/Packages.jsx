import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPackages } from '@/services/package.service'
import { ROUTES } from '@/constants/routes'
import useAuth from '@/hooks/useAuth'
import { toast } from 'react-toastify'
import { ArrowRight, ChevronRight, ChevronLeft, Check, Search, ChevronDown, Shield, Grid, List, RefreshCw, Eye, X } from 'lucide-react'
import FilterPanel from '@/components/ui/FilterPanel'
import FilterButton from '@/components/ui/FilterButton'


const getBadge = (item) => {
  if (item.badge) return item.badge
  const title = item.title?.toLowerCase() || ''
  if (title.includes('popular') || title.includes('basic')) return { label: 'Popular', color: 'bg-blue-100 text-blue-700' }
  if (title.includes('best') || title.includes('comprehensive')) return { label: 'Best Seller', color: 'bg-green-100 text-green-700' }
  if (title.includes('new') || title.includes('advanced')) return { label: 'New', color: 'bg-purple-100 text-purple-700' }
  if (title.includes('senior')) return { label: 'Popular', color: 'bg-blue-100 text-blue-700' }
  return null
}

const PackageDetailsModal = ({ item, onClose, handleBookNow }) => {
  const testsList = item?.testsIncluded || []
  const category = typeof item?.category === 'object' ? item?.category?.name : item?.category

  if (!item) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition"
        >
          <X size={18} className="text-foreground" />
        </button>

        {/* Image */}
        {item.image ? (
          <div className="relative h-56 overflow-hidden rounded-t-2xl">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="relative h-56 overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <span className="text-6xl">🩺</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Title & Category */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="font-heading font-bold text-2xl text-foreground">{item.title}</h2>
            {category && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full whitespace-nowrap">
                {category}
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{item.description}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-xl font-bold text-foreground">₹</span>
            <span className="text-3xl font-bold text-foreground">{item.price}</span>
          </div>

          {/* Tests count */}
          <p className="text-sm text-muted-foreground mb-5">
            {testsList.length} Tests Included
          </p>

          {/* Divider */}
          <div className="border-t border-border my-4"></div>

          {/* Tests List */}
          <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Tests Included</h4>
          {testsList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
              {testsList.map((test, i) => (
                <div
                  key={test?._id || i}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span>{test?.name || test?.title || 'Test'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-6">No Tests Available</p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield size={16} className="text-primary" />
              <span>NABL Accredited Labs</span>
            </div>
            <div className="flex-1"></div>
            <button
              onClick={() => handleBookNow(item, 'package')}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              Book Now
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PackageCard = ({ item, handleBookNow, onViewDetails }) => {
  const testsList = item.testsIncluded || []
  const category = typeof item.category === 'object' ? item.category?.name : item.category

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <span className="text-4xl">🩺</span>
          </div>
        )}
        {/* Category Badge on Image */}
        {category && (
          <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full bg-white/90 text-primary shadow-sm">
            {category}
          </span>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-heading font-bold text-lg text-foreground leading-snug line-clamp-1 mb-2">
          {item.title}
        </h3>

        {/* Description preview */}
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-1 mb-3">
            {item.description}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-lg font-bold text-foreground">₹</span>
          <span className="text-2xl font-bold text-foreground">{item.price}</span>
        </div>

        {/* Tests count */}
        <p className="text-sm text-muted-foreground mb-4">
          {testsList.length} Tests Included
        </p>

        {/* Tests list - show 3-4 tests */}
        <div className="flex-1 mb-4">
          {testsList.length > 0 ? (
            <ul className="space-y-2">
              {testsList.slice(0, 3).map((test, i) => (
                <li
                  key={test?._id || i}
                  className="text-sm text-foreground flex items-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  <span className="line-clamp-1">{test?.name || test?.title || 'Test'}</span>
                </li>
              ))}
              {testsList.length > 3 && (
                <li className="text-sm text-primary font-medium flex items-center gap-2 pl-7">
                  +{testsList.length - 3} more tests
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No Tests Available</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield size={16} className="text-primary" />
            <span>NABL Accredited</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails(item)
              }}
              className="w-9 h-9 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition"
              title="View Details"
            >
              <Eye size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleBookNow(item, 'package')
              }}
              className="flex items-center bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const PackageTableRow = ({ item, handleBookNow, onViewDetails }) => {
  const testsList = item.testsIncluded || []
  const category = typeof item.category === 'object' ? item.category?.name : item.category

  return (
    <tr className="border-b border-border last:border-0 hover:bg-gray-50 transition">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-10 h-10 rounded-lg object-cover border border-border"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <span className="text-lg">🩺</span>
            </div>
          )}
          <span className="font-medium text-foreground">{item.title}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-muted-foreground">{category || '—'}</td>
      <td className="px-5 py-4 font-medium text-foreground">₹{item.price}</td>
      <td className="px-5 py-4 text-muted-foreground">{testsList.length}</td>
      <td className="px-5 py-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails(item)
          }}
          className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition"
          title="View Details"
        >
          <Eye size={16} />
        </button>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleBookNow(item, 'package')
          }}
          className="flex items-center bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          Book Now
        </button>
      </td>
    </tr>
  )
}

const PackageSkeleton = ({ viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <tr className="border-b border-border animate-pulse">
        <td className="px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-40"></div>
          </div>
        </td>
        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
        <td className="px-5 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
      </tr>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="flex items-baseline gap-1 mb-1">
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-24 mb-4"></div>
        <div className="border-t border-gray-200 my-2"></div>
        <div className="space-y-2 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200"></div>
              <div className="h-3 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  )
}

const Packages = ({ showAllPackages = false }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('Sort by Popularity')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [viewMode, setViewMode] = useState('grid')
  const [activeFilters, setActiveFilters] = useState({})
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data: res } = await getAllPackages()
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
        setPackages(list)
      } catch (error) {
        toast.error('Failed to load packages')
      } finally {
        setLoading(false)
      }
    }
    fetchPackages()
  }, [])

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll)
      checkScroll()
      return () => scrollElement.removeEventListener('scroll', checkScroll)
    }
  }, [packages])

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const handleBookNow = (item, type = 'package') => {
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

  const categoryOptions = useMemo(() => {
    const cats = new Set()
    packages.forEach(pkg => {
      if (pkg.category) {
        const catName = typeof pkg.category === 'object' ? pkg.category.name : pkg.category
        if (catName) cats.add(catName)
      }
    })
    return Array.from(cats).map(c => ({ value: c, label: c }))
  }, [packages])

  const filterCategories = useMemo(() => [
    {
      key: 'name',
      label: 'Package Name',
      type: 'search-checkbox',
      searchPlaceholder: 'Search packages...',
      options: packages.map(pkg => ({ value: pkg.title, label: pkg.title })),
    },
    {
      key: 'category',
      label: 'Category',
      type: 'checkbox',
      options: categoryOptions,
    },
  ], [packages, categoryOptions])

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

  const clearFilters = () => {
    setSearchQuery('')
    setActiveFilters({})
    setCurrentPage(1)
  }

  const filteredPackages = useMemo(() => {
    let result = [...packages]

    // Hide inactive packages by default
    result = result.filter(pkg => pkg.isActive !== false)

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(pkg =>
        pkg.title?.toLowerCase().includes(query) ||
        pkg.description?.toLowerCase().includes(query)
      )
    }

    // Name filter
    if (activeFilters.name?.length) {
      result = result.filter(pkg => activeFilters.name.includes(pkg.title))
    }

    // Category filter
    if (activeFilters.category?.length) {
      result = result.filter(pkg => {
        const catName = typeof pkg.category === 'object' ? pkg.category.name : pkg.category
        return activeFilters.category.includes(catName)
      })
    }

    // Sort
    if (sortBy === 'Sort by Price: Low to High') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'Sort by Price: High to Low') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0))
    } else if (sortBy === 'Sort by Name') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }

    return result
  }, [packages, searchQuery, activeFilters, sortBy])

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage)
  const paginatedPackages = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredPackages.slice(start, start + itemsPerPage)
  }, [filteredPackages, currentPage, itemsPerPage])

  const indexOfFirstItem = (currentPage - 1) * itemsPerPage
  const indexOfLastItem = currentPage * itemsPerPage

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, activeFilters])

  const validPackages = packages

  return (
    <section className="py-6 bg-background">
      <div className="enterprise-container">
        {/* Search and Filters Bar */}
        {showAllPackages && (
          <div className="bg-white border border-border rounded-xl p-4 shadow-sm mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 min-w-[200px]">
                <div className="bg-gray-50 border border-border rounded-lg px-4 py-2.5 flex items-center gap-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition">
                  <Search size={18} className="text-muted-foreground flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search packages by name..."
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

              {/* Sort Dropdown */}
              <div className="relative min-w-[180px]">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 bg-gray-50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition cursor-pointer"
                >
                  <option value="Sort by Popularity">Sort by Popularity</option>
                  <option value="Sort by Price: Low to High">Sort by Price: Low to High</option>
                  <option value="Sort by Price: High to Low">Sort by Price: High to Low</option>
                  <option value="Sort by Name">Sort by Name</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>

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
        )}

        {/* Loading */}
        {loading ? (
          <div className={`${showAllPackages && viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'relative group/scroll'}`}>
            {showAllPackages ? (
              viewMode === 'grid' ? (
                [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <PackageSkeleton key={i} viewMode="grid" />
                ))
              ) : (
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead className="bg-gray-50 border-b border-border">
                      <tr>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Package Name</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Category</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Price</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Tests</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Status</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <PackageSkeleton key={i} viewMode="list" />
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div ref={scrollRef} className="flex gap-6 overflow-x-auto pb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="min-w-[300px] max-w-[340px] w-[340px] flex-shrink-0">
                    <PackageSkeleton viewMode="grid" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : showAllPackages ? (
          paginatedPackages.length === 0 ? (
            <div className="bg-white/50 border border-border rounded-xl p-8 text-center text-muted-foreground">
              <p className="text-sm">No health packages found matching your criteria.</p>
              <p className="text-xs mt-1 opacity-70">Try adjusting your search or filters.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <>
              {/* Grid View */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedPackages.map((item, index) => (
                  <PackageCard key={item._id || index} item={item} handleBookNow={handleBookNow} onViewDetails={setSelectedPackage} />
                ))}
              </div>

              {/* Pagination - Always show when there are results */}
              {!loading && filteredPackages.length > 0 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPackages.length)} of {filteredPackages.length} packages
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                          onClick={() => setCurrentPage(pageNumber)}
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
                          onClick={() => setCurrentPage(totalPages)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition ${currentPage === totalPages ? 'bg-primary text-white' : 'border border-border hover:bg-gray-50'}`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
            </>
          ) : (
            <>
              {/* Table View */}
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead className="bg-gray-50 border-b border-border">
                      <tr>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Package Name</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Category</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Price</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Tests</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">View</th>
                        <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPackages.map((item, index) => (
                        <PackageTableRow key={item._id || index} item={item} handleBookNow={handleBookNow} onViewDetails={setSelectedPackage} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination - Always show when there are results */}
              {!loading && filteredPackages.length > 0 && (
                <div className="flex items-center justify-between mt-8">
                  <p className="text-sm text-muted-foreground">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPackages.length)} of {filteredPackages.length} packages
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
                          onClick={() => setCurrentPage(pageNumber)}
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
                          onClick={() => setCurrentPage(totalPages)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition ${currentPage === totalPages ? 'bg-primary text-white' : 'border border-border hover:bg-gray-50'}`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
            </>
          )
        ) : validPackages.length === 0 ? (
          <div className="bg-white/50 border border-border rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-sm">No health packages are currently available.</p>
            <p className="text-xs mt-1 opacity-70">Check back later or contact support to configure packages.</p>
          </div>
        ) : (
          /* Scroll layout for homepage */
          <div className="relative group/scroll">
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto pb-4"
            >
              {validPackages.map((item, index) => (
                <div key={item._id || index} className="min-w-[300px] max-w-[340px] w-[340px] flex-shrink-0">
                  <PackageCard item={item} handleBookNow={handleBookNow} onViewDetails={setSelectedPackage} />
                </div>
              ))}
            </div>

            {/* Scroll Left Button */}
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-accent transition hidden md:flex opacity-0 group-hover/scroll:opacity-100"
              >
                <ChevronLeft size={20} className="text-foreground" />
              </button>
            )}

            {/* Scroll Right Button */}
            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-border rounded-full flex items-center justify-center shadow-md hover:bg-accent transition hidden md:flex"
              >
                <ChevronRight size={20} className="text-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Mobile View All - only show on homepage */}
        {!showAllPackages && (
          <div className="mt-6 sm:hidden">
            <button
              onClick={() => navigate(ROUTES.PACKAGES)}
              className="flex items-center justify-center gap-1 w-full text-sm font-semibold text-primary border border-primary rounded-lg py-2 hover:bg-primary hover:text-white transition"
            >
              View all packages
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Package Details Modal */}
      {selectedPackage && (
        <PackageDetailsModal
          item={selectedPackage}
          onClose={() => setSelectedPackage(null)}
          handleBookNow={handleBookNow}
        />
      )}

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
    </section>
  )
}

export default Packages
