import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Package, Check } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { usePackages } from '@/hooks/usePackages'

const PopularPackages = () => {
  const navigate = useNavigate()

  const { data: packagesData, isLoading, isError } = usePackages()

  const packagesRes = packagesData?.data
  const packages = Array.isArray(packagesRes?.data) ? packagesRes.data : Array.isArray(packagesRes) ? packagesRes : []

  const activePackages = packages.filter((pkg) => pkg.isActive !== false).slice(0, 8)

  const handlePackageClick = (packageId) => {
    navigate(`${ROUTES.PACKAGES}?pkg=${packageId}`)
  }

  if (isLoading) {
    return (
      <section className="bg-white py-10 border-b border-border">
        <div className="enterprise-container">
          <h2 className="font-heading font-bold text-xl lg:text-2xl text-foreground text-center mb-8">
            Popular Health Packages
          </h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-[220px] lg:w-[240px] bg-gray-50 border border-gray-100 rounded-2xl p-5 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gray-200 mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
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
    <section className="bg-white py-10 border-b border-border">
      <div className="enterprise-container">
        <h2 className="font-heading font-bold text-xl lg:text-2xl text-foreground text-center mb-8">
          Popular Health Packages
        </h2>

        <div className="flex justify-center gap-4 flex-wrap">
          {activePackages.map((pkg) => {
            const testsCount = pkg.testsIncluded?.length || 0
            return (
              <div
                key={pkg._id}
                onClick={() => handlePackageClick(pkg._id)}
                className="w-[220px] lg:w-[240px] bg-gray-50 hover:bg-primary/5 border border-gray-100 hover:border-primary/20 rounded-2xl p-5 cursor-pointer transition group text-center"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition">
                  <Package size={28} className="text-primary" />
                </div>
                <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 min-h-[40px]">
                  {pkg.title}
                </h3>
                <p className="text-base font-bold text-primary mb-1">
                  ₹{pkg.price}
                </p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  <span>{testsCount} Tests</span>
                  <ChevronRight size={12} className="text-muted-foreground group-hover:text-primary transition" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PopularPackages
