import React from 'react'
import { ListChecks } from 'lucide-react'

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

const PackageCardContent = ({ title, category, price, testsIncluded }) => {
  const catColor = getCategoryColor(category)
  const testCount = testsIncluded?.length || 0
  const testsList = (testsIncluded || []).slice(0, 4)

  return (
    <div className="flex flex-col flex-1 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground text-sm leading-snug" title={title}>
          {title}
        </h3>
        <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${catColor.bg} ${catColor.text}`}>
          {category || 'Uncategorised'}
        </span>
      </div>

      <div className="mt-2">
        <span className="font-mono text-sm font-bold text-primary">
          {price != null ? `₹${Number(price).toLocaleString('en-IN')}` : '—'}
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
  )
}

export default PackageCardContent
