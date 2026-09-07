import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ListChecks, ChevronLeft, ChevronRight } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { usePackages } from '@/hooks/usePackages'

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

const HomePackageCard = ({ pkg, onClick }) => {
  const title = pkg.title || pkg.name || 'Untitled Package'
  const category = pkg.category?.name || pkg.category || 'Uncategorised'
  const catColor = getCategoryColor(category)
  const testCount = pkg.testsIncluded?.length || 0
  const testsList = (pkg.testsIncluded || []).slice(0, 4)

  return (
    <article
      onClick={onClick}
      className="flex-shrink-0 w-[300px] flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md cursor-pointer overflow-hidden snap-start"
    >
      {/* Header */}
      <div className="relative h-44 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
        {pkg.image ? (
          <img src={pkg.image} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={48} className="text-blue-200" />
          </div>
        )}
        <span className="absolute top-2.5 left-2.5 rounded-md px-2 py-0.5 text-[10px] font-semibold bg-emerald-500 text-white">
          Active
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground text-sm leading-snug" title={title}>
            {title}
          </h3>
          <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${catColor.bg} ${catColor.text}`}>
            {category}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-bold text-foreground">₹</span>
          <span className="text-xl font-bold text-foreground">{pkg.price?.toLocaleString('en-IN') || '0'}</span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ListChecks size={14} className="text-primary" />
          <span>{testCount} Tests Included</span>
        </div>

        {testsList.length > 0 && (
          <ul className="mt-3 space-y-1.5 flex-1">
            {testsList.map((test, i) => (
              <li key={test?._id || i} className="flex items-center gap-2 text-xs text-foreground">
                <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" className="text-primary" /></svg>
                </span>
                <span className="truncate">{test?.name || test?.title || 'Test'}</span>
              </li>
            ))}
            {testCount > 4 && (
              <li className="text-xs text-primary font-medium pl-6">+{testCount - 4} more tests</li>
            )}
          </ul>
        )}

        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5 text-xs text-muted-foreground">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
          NABL Accredited Labs
        </div>
      </div>
    </article>
  )
}

const PopularPackages = () => {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [canScrollLeft, setCanScrollLeft] = useState(false)

  const { data: packagesData, isLoading, isError } = usePackages()

  const packagesRes = packagesData?.data
  const packages = Array.isArray(packagesRes?.data) ? packagesRes.data : Array.isArray(packagesRes) ? packagesRes : []

  const activePackages = packages.filter((pkg) => pkg.isActive !== false).slice(0, 8)

  const handlePackageClick = (pkg) => {
    navigate(`${ROUTES.PACKAGES}?pkg=${pkg._id}`)
  }

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const children = Array.from(el.children)
    if (children.length <= 1) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const containerRect = el.getBoundingClientRect()
    const containerLeft = containerRect.left
    const containerRight = containerRect.right
    const firstChildRect = children[0].getBoundingClientRect()
    const lastChildRect = children[children.length - 1].getBoundingClientRect()
    setCanScrollLeft(firstChildRect.left < containerLeft - 2)
    setCanScrollRight(lastChildRect.right > containerRight + 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const timer = setTimeout(checkScroll, 150)
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      clearTimeout(timer)
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, activePackages.length])

  const getScrollAmount = () => {
    const el = scrollRef.current
    if (!el || !el.children[0]) return 320
    return el.children[0].offsetWidth
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: getScrollAmount(), behavior: 'smooth' })
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <section className="bg-white py-12">
        <div className="enterprise-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
            Popular Health Packages
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-[300px] bg-gray-50 border border-gray-100 rounded-xl overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (isError || activePackages.length === 0) {
    return null
  }

  return (
    <section className="bg-white py-12">
      <div className="enterprise-container">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
          Popular Health Packages
        </h2>

        <div className="relative group/scroll">
          <div
            ref={scrollRef}
            className="-mx-4 px-4 flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide lg:mx-0 lg:px-0 lg:justify-center lg:snap-none"
          >
            {activePackages.map((pkg) => (
              <HomePackageCard
                key={pkg._id}
                pkg={pkg}
                onClick={() => handlePackageClick(pkg)}
              />
            ))}
          </div>

          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 transition"
            >
              <ChevronLeft size={20} className="text-foreground" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white shadow-md rounded-full flex items-center justify-center border border-gray-200 transition"
            >
              <ChevronRight size={20} className="text-foreground" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default PopularPackages
