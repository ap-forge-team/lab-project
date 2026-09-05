import React from 'react'
import { Search } from 'lucide-react'

const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '', width = 'w-64' }) => {
  return (
    <div className={`relative ${width} ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-9 pr-4 py-2.5 border border-border rounded-lg text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
      />
    </div>
  )
}

export default SearchInput
