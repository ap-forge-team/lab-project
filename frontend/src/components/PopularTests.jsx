import React, { useRef, useState, useEffect, useMemo, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplet, Activity, Heart, Pill, FlaskConical, ArrowRight, ChevronRight, ChevronLeft, TestTube, Stethoscope, Microscope } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useTests } from '@/hooks/useTests'
import { useAuth } from '@/hooks/useAuth'
import { ROLES } from '@/constants/roles'

const categoryIcons = {
  'Blood Tests': <Droplet size={24} />,
  'Thyroid': <Activity size={24} />,
  'Cardiac': <Heart size={24} />,
  'Diabetes': <Pill size={24} />,
  'Vitamin': <FlaskConical size={24} />,
  'Liver': <TestTube size={24} />,
  'Kidney': <Microscope size={24} />,
  'General': <Stethoscope size={24} />,
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

const PopularTests = () => {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const { user } = useAuth()
  const isPatient = !user || user?.role === ROLES.PATIENT

  const { data: testsData, isLoading } = useTests()
  const tests = Array.isArray(testsData?.data?.data) ? testsData.data.data : Array.isArray(testsData?.data) ? testsData.data : []

  const categories = useMemo(() => {
    const categoryMap = {}
    tests.forEach((test) => {
      const category = typeof test.category === 'object' ? test.category?.name || 'Other' : test.category || 'Other'
      if (!categoryMap[category]) {
        categoryMap[category] = {
          title: category,
          tests: [],
          minPrice: Infinity,
        }
      }
      categoryMap[category].tests.push(test.title)
      if (test.price < categoryMap[category].minPrice) {
        categoryMap[category].minPrice = test.price
      }
    })

    return Object.values(categoryMap).map((cat) => ({
      icon: getCategoryIcon(cat.title),
      title: cat.title,
      desc: cat.tests.slice(0, 2).join(', ') + (cat.tests.length > 2 ? ' & more' : ''),
      price: cat.minPrice === Infinity ? 0 : cat.minPrice,
      count: cat.tests.length,
    }))
  }, [tests])

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
  }, [categories])

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: 'smooth' })
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -220, behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <section className="bg-white py-12 border-b border-border relative">
        <div className="enterprise-container">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-xs text-primary font-bold tracking-wider uppercase mb-2">
                Popular Tests
              </p>
              <h2 className="font-heading font-bold text-2xl lg:text-3xl text-foreground">
                Book tests by category
              </h2>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-[200px] bg-card border-l-[3px] border-l-primary/30 border-t border-r border-b border-border/50 rounded-sm p-5 min-h-[260px] flex flex-col animate-pulse">
                <div className="w-12 h-12 rounded-full bg-primary/10 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="flex-grow">
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-12 border-b border-border relative">
      <div className="enterprise-container">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="text-xs text-primary font-bold tracking-wider uppercase mb-2">
              Popular Tests
            </p>
            <h2 className="font-heading font-bold text-2xl lg:text-3xl text-foreground">
              Book tests by category
            </h2>
          </div>
          {isPatient && (
            <button
              onClick={() => navigate(ROUTES.TESTS)}
              className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition"
            >
              View all tests
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Categories Scroll */}
        <div className="relative group/scroll">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4"
          >
            {categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => navigate(ROUTES.TESTS)}
                className="flex-shrink-0 w-[200px] bg-card border-l-[3px] border-l-primary border-t border-r border-b border-border rounded-sm p-5 cursor-pointer hover:shadow-md transition min-h-[260px] flex flex-col"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {cat.icon}
                </div>
                <h3 className="font-heading font-bold text-sm lg:text-base text-foreground mb-2">
                  {cat.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4 flex-grow">
                  {cat.desc}
                </p>
                <p className="text-sm font-bold text-foreground mt-auto">
                  From ₹ {cat.price}
                </p>
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

        {/* Mobile View All */}
        {isPatient && (
          <div className="mt-6 sm:hidden">
            <button
              onClick={() => navigate(ROUTES.TESTS)}
              className="flex items-center justify-center gap-1 w-full text-sm font-semibold text-primary border border-primary rounded-lg py-2 hover:bg-primary hover:text-white transition"
            >
              View all tests
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default PopularTests
