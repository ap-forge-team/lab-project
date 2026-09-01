import React, { useEffect, useState } from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import { getAllTests } from '@/services/test.service'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Clock, FlaskConical, Droplet, Activity, Heart, Pill, TestTube, Microscope, Stethoscope } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/Button'
import { InlineLoader } from '@/components/ui/Loader'
import useAuth from '@/hooks/useAuth'

const categoryIcons = {
  'Blood': <Droplet size={24} />,
  'Thyroid': <Activity size={24} />,
  'Cardiac': <Heart size={24} />,
  'Diabetes': <Pill size={24} />,
  'Vitamin': <FlaskConical size={24} />,
  'Liver': <TestTube size={24} />,
  'Kidney': <Microscope size={24} />,
  'General': <Stethoscope size={24} />,
  'Organ': <Activity size={24} />,
  'Hormone': <Activity size={24} />,
  'default': <FlaskConical size={24} />,
}

const getCategoryIcon = (categoryName) => {
  if (!categoryName) return categoryIcons.default
  const lowerName = categoryName.toLowerCase()
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (lowerName.includes(key.toLowerCase())) {
      return icon
    }
  }
  return categoryIcons.default
}

const TestCardSkeleton = () => (
  <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-200"></div>
    <div className="p-5">
      <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-4/5"></div>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-border/50">
        <div>
          <div className="h-3 bg-gray-200 rounded w-10 mb-1"></div>
          <div className="h-5 bg-gray-200 rounded w-14"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
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
  const initialCategory = searchParams.get('category') || 'All'
  const [activeCategory, setActiveCategory] = useState(initialCategory)

  const categories = ['All', ...new Set(tests.map(t => typeof t.category === 'object' ? t.category?.name : t.category).filter(Boolean))]

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
      const category = searchParams.get('category') || 'All'
      setActiveCategory(category)
      applyFilters(search, category)
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
    applyFilters(value, activeCategory)
  }

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    applyFilters(search, cat)
  }

  const applyFilters = (searchTerm, category) => {
    let filtered = tests
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (category !== 'All') {
      filtered = filtered.filter((item) => {
        const catName = typeof item.category === 'object' ? item.category?.name : item.category
        return catName === category
      })
    }
    setFilteredTests(filtered)
  }

  return (
    <PublicLayout>
      <div className="bg-background min-h-screen pb-12 relative overflow-hidden">
        {/* Page Hero */}
        <div className="bg-white py-12 border-b border-border">
          <div className="enterprise-container relative z-10">
            <div>
              <p className="text-xs text-primary font-bold tracking-wider uppercase mb-2">
                Diagnostic Tests
              </p>
              <h1 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-2">Browse Lab Tests</h1>
              <p className="text-muted-foreground text-sm lg:text-base max-w-xl">
                Explore certified diagnostic tests with home sample collection
              </p>
            </div>
          </div>
        </div>

        {/* Search and Categories */}
        {!loading && categories.length > 1 && (
          <div className="enterprise-container mt-6">
            {/* Search Bar - Left aligned, above filters */}
            <div className="w-full max-w-md mb-4">
              <div className="bg-white border border-border rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition shadow-sm">
                <Search size={18} className="text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Search tests by name..."
                  className="w-full outline-none text-sm text-foreground bg-transparent placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white border border-border text-foreground hover:bg-accent hover:text-primary shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tests Grid */}
        <div className="enterprise-container py-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TestCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredTests.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-20">No Tests Found</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((item) => (
                <div
                  key={item._id}
                  className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition flex flex-col"
                >
                  {/* Image */}
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-48 object-cover" 
                    />
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    {/* Category Badge */}
                    <span className="text-primary w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 mb-3">
                      {typeof item.category === 'object' ? item.category?.name : item.category}
                    </span>
                    {/* Title */}
                    <h2 className="font-heading font-bold text-base lg:text-lg text-foreground mb-2">{item.title}</h2>
                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2 flex-grow">
                      {item.description}
                    </p>
                    {/* Info Row */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-primary" />
                        <span>{item.reportTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FlaskConical size={12} className="text-primary" />
                        <span>Lab Certified</span>
                      </div>
                    </div>
                    {/* Bottom */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="text-lg font-bold text-foreground">₹{item.price}</p>
                      </div>
                      <Button onClick={() => handleBookNow(item, 'test')} size="sm">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}

export default TestsPage
