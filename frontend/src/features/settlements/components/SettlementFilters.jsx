import React from 'react'
import { Search, RotateCcw, Download } from 'lucide-react'
import Button from '@/components/ui/Button'

const SettlementFilters = ({
  status,
  setStatus,
  labOwner,
  setLabOwner,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  labOwners,
  onSearch,
  onReset,
  onExport,
  isAdmin,
}) => {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex flex-wrap items-end gap-4">
        {/* Status Filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Sent">Sent</option>
            <option value="Verified">Verified</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Lab Owner Filter (Admin only) */}
        {isAdmin && (
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">Lab Owner</label>
            <select
              value={labOwner}
              onChange={(e) => setLabOwner(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="">All Labs</option>
              {labOwners?.map((owner) => (
                <option key={owner._id} value={owner._id}>{owner.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* From Date */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">From</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* To Date */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">To</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button onClick={onSearch} className="flex items-center gap-2">
            <Search size={16} />
            Search
          </Button>
          <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
            <RotateCcw size={16} />
            Reset
          </Button>
          {isAdmin && (
            <Button onClick={onExport} variant="success" className="flex items-center gap-2">
              <Download size={16} />
              Export Excel
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettlementFilters
