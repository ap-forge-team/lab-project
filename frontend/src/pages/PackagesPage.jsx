import React from 'react'
import PublicLayout from '@/components/layout/PublicLayout'
import Packages from '@/components/Packages'
import testsHero from '@/assets/image/tests.png'

export default function PackagesPage() {
  return (
    <PublicLayout>
      <div className="bg-background min-h-screen pb-12 relative overflow-hidden">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-white py-10 border-b border-border relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 lg:w-2/5 hidden md:flex items-center justify-end">
            <img
              src={testsHero}
              alt="Health Packages"
              className="w-full h-full object-contain object-right opacity-90"
            />
          </div>
          <div className="enterprise-container relative z-10">
            <h1 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-3">All Health Packages</h1>
            <p className="text-muted-foreground text-base max-w-xl mb-4">
              Choose from our curated health packages designed to keep you and your family healthy.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/5 px-4 py-2 rounded-full w-fit">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>All packages include NABL Accredited Lab tests</span>
            </div>
          </div>
        </div>

        {/* Packages */}
        <Packages showAllPackages={true} />
      </div>
    </PublicLayout>
  )
}
