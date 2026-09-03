import React from 'react'
import { Eye, Pencil, Copy, Trash2 } from 'lucide-react'

const PackageCardFooter = ({ pkg, onView, onEdit, onDuplicate, onDelete }) => {
  return (
    <div className="mt-auto pt-3 border-t border-border flex items-center justify-between px-4 pb-4">
      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        NABL Accredited Labs
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onView(pkg) }}
          className="rounded p-1 text-muted-foreground hover:text-primary hover:bg-primary/5 transition"
        >
          <Eye size={14} />
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(pkg) }}
            className="rounded p-1 text-muted-foreground hover:text-amber-500 hover:bg-amber-50 transition"
          >
            <Pencil size={14} />
          </button>
        )}
        {onDuplicate && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(pkg) }}
            className="rounded p-1 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition"
          >
            <Copy size={14} />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(pkg) }}
            className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 transition"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

export default PackageCardFooter
