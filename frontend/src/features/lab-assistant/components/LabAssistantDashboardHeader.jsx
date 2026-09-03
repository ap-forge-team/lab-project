import React, { useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import FilterButton from '@/components/ui/FilterButton'
import FilterPanel from '@/components/ui/FilterPanel'

const filterCategories = [
  {
    key: 'dateRange',
    label: 'Date Range',
    type: 'date-range',
  },
]

const LabAssistantDashboardHeader = ({ dateRange, onDateRangeChange }) => {
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
            Welcome back, Lab Assistant 👋
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            Here's an overview of your tasks and activities for today.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <FilterButton
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              setFilterPanelOpen({ top: rect.bottom + 8, left: Math.max(16, rect.right - 680) })
            }}
            activeCount={activeFilterCount}
            size="sm"
          />
        </div>
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

export default LabAssistantDashboardHeader
