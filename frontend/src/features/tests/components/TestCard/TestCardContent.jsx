import React from 'react'
import { Droplet, Clock, FlaskConical, Microscope } from 'lucide-react'

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

const TestCardContent = ({ category, sampleType, method, price, reportTime }) => {
  const catColor = getCategoryColor(category)

  return (
    <div className="flex flex-col flex-1 p-4 pt-3">
      <div>
        <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${catColor.bg} ${catColor.text}`}>
          {category || 'Uncategorised'}
        </span>
      </div>

      <div className="mt-2">
        <span className="font-mono text-sm font-bold text-primary">
          {price != null ? `₹${Number(price).toLocaleString('en-IN')}` : '—'}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Droplet size={12} className="shrink-0" />
          <span className="truncate">{sampleType || 'Blood'}</span>
          {reportTime && (
            <>
              <span className="text-border">•</span>
              <Clock size={12} className="shrink-0" />
              <span className="truncate">{reportTime}</span>
            </>
          )}
        </div>
        {method && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Microscope size={12} className="shrink-0" />
            <span className="truncate">{method}</span>
          </div>
        )}
      </dl>
    </div>
  )
}

export default TestCardContent
