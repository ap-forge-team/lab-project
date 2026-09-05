import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ListChecks } from 'lucide-react'
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
      className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md cursor-pointer overflow-hidden"
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

        <div className="mt-2">
          <span className="font-mono text-sm font-bold text-primary">
            {pkg.price != null ? `₹${Number(pkg.price).toLocaleString('en-IN')}` : '—'}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ListChecks size={12} className="shrink-0" />
          <span>{testCount} Test{testCount !== 1 ? 's' : ''} Included</span>
        </div>

        {testsList.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {testsList.map((t) => {
              const testName = typeof t === 'object' ? (t.title || t.name) : ''
              if (!testName) return null
              return (
                <li key={typeof t === 'object' ? t._id : t} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                  <span className="truncate">{testName}</span>
                </li>
              )
            })}
            {testCount > 4 && (
              <li className="text-[11px] text-primary font-medium pl-6">+{testCount - 4} more tests</li>
            )}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-border px-4 pb-4">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          NABL Accredited Labs
        </span>
      </div>
    </article>
  )
}

const PopularPackages = () => {
  const navigate = useNavigate()

  const { data: packagesData, isLoading, isError } = usePackages()

  const packagesRes = packagesData?.data
  const packages = Array.isArray(packagesRes?.data) ? packagesRes.data : Array.isArray(packagesRes) ? packagesRes : []

  const activePackages = packages.filter((pkg) => pkg.isActive !== false).slice(0, 8)

  const handlePackageClick = (pkg) => {
    navigate(`${ROUTES.PACKAGES}?pkg=${pkg._id}`)
  }

  if (isLoading) {
    return (
      <section className="bg-white py-12">
        <div className="enterprise-container">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-10">
            Popular Health Packages
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden animate-pulse">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {activePackages.map((pkg) => (
            <HomePackageCard
              key={pkg._id}
              pkg={pkg}
              onClick={() => handlePackageClick(pkg)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default PopularPackages
