import React from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const DashboardShell = ({ badge, title, subtitle, children }) => {
  return (
    <DashboardLayout>
      <div className="bg-background min-h-screen pb-10">
        <div className="bg-tertiary">
          <div className="enterprise-container py-8 text-white">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1 rounded-full text-[10px] mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
              {badge}
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-white">{title}</h1>
            {subtitle && <p className="text-white/40 text-sm mt-1 max-w-lg">{subtitle}</p>}
          </div>
        </div>
        <div className="enterprise-container py-6">{children}</div>
      </div>
    </DashboardLayout>
  )
}

export default DashboardShell
