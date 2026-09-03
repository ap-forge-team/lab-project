import React, { useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import useAuth from '@/hooks/useAuth'
import FilterButton from '@/components/ui/FilterButton'
import FilterPanel from '@/components/ui/FilterPanel'

const filterCategories = [
  {
    key: 'dateRange',
    label: 'Date Range',
    type: 'date-range',
  },
]

const AdminDashboardHeader = ({ dateRange, onDateRangeChange }) => {
  const { user } = useAuth()
  const [filterPanelOpen, setFilterPanelOpen] = useState(null)

  const activeFilters = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return {}
    return {
      dateRange: {
        start: dateRange.from ? dateRange.from.toISOString().slice(0, 10) : '',
        end: dateRange.to ? dateRange.to.toISOString().slice(0, 10) : '',
      },
    }
  }, [dateRange])

  const activeFilterCount = useMemo(() => {
    const dr = activeFilters.dateRange
    if (!dr) return 0
    if (dr.start || dr.end) return 1
    return 0
  }, [activeFilters])

  const handleApplyFilters = useCallback((filters) => {
    const dr = filters.dateRange
    if (dr?.start || dr?.end) {
      onDateRangeChange({
        from: dr.start ? new Date(dr.start) : undefined,
        to: dr.end ? new Date(dr.end) : undefined,
      })
    } else {
      onDateRangeChange({ from: undefined, to: undefined })
    }
  }, [onDateRangeChange])

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.name || 'Admin'} 👋
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Here's what's happening with your lab testing platform today.
          </p>
        </div>

        <FilterButton
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
          }}
          activeCount={activeFilterCount}
        />
      </div>

      {filterPanelOpen && (
        <FilterPanel
          isOpen={true}
          onClose={() => setFilterPanelOpen(null)}
          onApply={handleApplyFilters}
          position={filterPanelOpen}
          title="Date Filter"
          categories={filterCategories}
          activeFilters={activeFilters}
        />
      )}
    </div>
  )
}

export default AdminDashboardHeader
