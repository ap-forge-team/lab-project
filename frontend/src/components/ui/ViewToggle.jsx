import React from 'react'
import { Grid2X2, List } from 'lucide-react'
import Tooltip from '@mui/material/Tooltip'

const ViewToggle = ({ value, onChange, onGridClick, tooltips = true, className = '' }) => {
  const isActive = (v) => value === v || (v === 'grid' && value === 'card') || (v === 'list' && value === 'table')

  const GridButton = () => (
    <button
      type="button"
      aria-label="Grid view"
      onClick={() => onGridClick ? onGridClick() : onChange('grid')}
      className={`rounded p-1.5 transition ${isActive('grid') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
    >
      <Grid2X2 size={18} />
    </button>
  )

  const ListButton = () => (
    <button
      type="button"
      aria-label="List view"
      onClick={() => onChange('list')}
      className={`rounded p-1.5 transition ${isActive('list') ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
    >
      <List size={18} />
    </button>
  )

  return (
    <div className={`flex items-center rounded-lg border border-border p-1 ${className}`}>
      {tooltips ? (
        <>
          <Tooltip title="Grid View" arrow placement="top">
            <span><GridButton /></span>
          </Tooltip>
          <Tooltip title="List View" arrow placement="top">
            <span><ListButton /></span>
          </Tooltip>
        </>
      ) : (
        <>
          <GridButton />
          <ListButton />
        </>
      )}
    </div>
  )
}

export default ViewToggle
