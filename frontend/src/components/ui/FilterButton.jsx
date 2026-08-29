import React from 'react'
import { SlidersHorizontal } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'

const FilterButton = ({ onClick, activeCount = 0 }) => {
  return (
    <Tooltip title="Filters" arrow placement="top">
      <button
        onClick={onClick}
        className="relative flex items-center justify-center px-3 py-3 border border-border rounded-lg text-muted-foreground hover:bg-accent transition"
      >
        <SlidersHorizontal size={16} />
        {activeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {activeCount}
          </span>
        )}
      </button>
    </Tooltip>
  )
}

export default FilterButton
