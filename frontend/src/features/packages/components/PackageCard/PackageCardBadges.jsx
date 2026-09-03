import React from 'react'

const PackageCardBadges = ({ isActive: active }) => {
  return (
    <div className="px-4 pb-4 pt-3 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-muted-foreground font-medium w-14 shrink-0">Status:</span>
        <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          {active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          NABL Accredited Labs
        </span>
      </div>
    </div>
  )
}

export default PackageCardBadges
