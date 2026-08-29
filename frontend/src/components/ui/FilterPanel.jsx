import React, { useState, useMemo, useEffect } from 'react'
import { X, Search, Check } from 'lucide-react'

const FilterPanel = ({
  isOpen,
  onClose,
  onApply,
  position = { top: 0, left: 0 },
  title = 'Filters',
  categories = [],
  activeFilters = {},
}) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.key || '')
  const [draftFilters, setDraftFilters] = useState(activeFilters)
  const [categorySearch, setCategorySearch] = useState('')

  useEffect(() => {
    if (isOpen) {
      setDraftFilters(activeFilters)
      setSelectedCategory(categories[0]?.key || '')
      setCategorySearch('')
    }
  }, [isOpen, activeFilters, categories])

  const activeCat = categories.find((c) => c.key === selectedCategory)

  const filteredOptions = useMemo(() => {
    if (!activeCat?.options) return []
    const term = categorySearch.trim().toLowerCase()
    if (!term) return activeCat.options
    return activeCat.options.filter((opt) => opt.label.toLowerCase().includes(term))
  }, [activeCat, categorySearch])

  const getActiveCount = (catKey) => {
    const val = draftFilters[catKey]
    if (Array.isArray(val)) return val.length
    if (val && typeof val === 'object' && (val.start || val.end)) return 1
    if (val) return 1
    return 0
  }

  const totalActiveCount = categories.reduce((sum, cat) => sum + getActiveCount(cat.key), 0)

  const toggleOption = (catKey, value) => {
    setDraftFilters((prev) => {
      const current = prev[catKey]
      if (Array.isArray(current)) {
        const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
        return { ...prev, [catKey]: next }
      }
      return { ...prev, [catKey]: [value] }
    })
  }

  const setDateRange = (catKey, field, value) => {
    setDraftFilters((prev) => {
      const current = prev[catKey] || {}
      return { ...prev, [catKey]: { ...current, [field]: value } }
    })
  }

  const removeFilter = (catKey, value) => {
    setDraftFilters((prev) => {
      const current = prev[catKey]
      if (Array.isArray(current)) {
        return { ...prev, [catKey]: current.filter((v) => v !== value) }
      }
      return { ...prev, [catKey]: undefined }
    })
  }

  const clearAll = () => {
    const empty = {}
    categories.forEach((cat) => { empty[cat.key] = undefined })
    setDraftFilters(empty)
  }

  const handleApply = () => {
    onApply(draftFilters)
    onClose()
  }

  const getOptionLabel = (catKey, value) => {
    const cat = categories.find((c) => c.key === catKey)
    const opt = cat?.options?.find((o) => o.value === value)
    return opt?.label || value
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[99]" onClick={onClose} />
      {/* Dropdown */}
      <div
        className="fixed bg-white border border-border rounded-xl shadow-xl z-[100] w-[680px] h-[450px] flex flex-col"
        style={{ top: position.top, left: position.left }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          {totalActiveCount > 0 && (
            <button onClick={clearAll} className="text-xs text-primary hover:underline">Clear all</button>
          )}
        </div>

        {/* Body: 3-column */}
        <div className="flex flex-1 min-h-0">
          {/* Left: Categories */}
          <div className="w-40 border-r border-border py-2 overflow-y-auto shrink-0">
            {categories.map((cat) => {
              const count = getActiveCount(cat.key)
              return (
                <button
                  key={cat.key}
                  onClick={() => { setSelectedCategory(cat.key); setCategorySearch('') }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition ${
                    selectedCategory === cat.key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className="bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Middle: Options */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Search Checkbox Type */}
            {activeCat?.type === 'search-checkbox' && (
              <div className="relative mb-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={activeCat.searchPlaceholder || 'Search...'}
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-border rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Date Range Type */}
            {activeCat?.type === 'date-range' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">From</label>
                  <input
                    type="date"
                    value={draftFilters[activeCat?.key]?.start || ''}
                    onChange={(e) => setDateRange(activeCat.key, 'start', e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">To</label>
                  <input
                    type="date"
                    value={draftFilters[activeCat?.key]?.end || ''}
                    onChange={(e) => setDateRange(activeCat.key, 'end', e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Checkbox / Search Checkbox Options */}
            {(activeCat?.type === 'checkbox' || activeCat?.type === 'search-checkbox') && (
              filteredOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No options available</p>
              ) : (
                <div className="space-y-1">
                  {filteredOptions.map((opt) => {
                    const checked = Array.isArray(draftFilters[activeCat?.key]) && draftFilters[activeCat.key].includes(opt.value)
                    return (
                      <label
                        key={opt.value}
                        onClick={() => toggleOption(activeCat.key, opt.value)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent cursor-pointer transition"
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${
                          checked ? 'bg-primary border-primary' : 'border-border'
                        }`}>
                          {checked && <Check size={12} className="text-white" />}
                        </div>
                        <span className="text-sm text-foreground">{opt.label}</span>
                      </label>
                    )
                  })}
                </div>
              )
            )}
          </div>

          {/* Right: Selected Summary */}
          <div className="w-52 border-l border-border py-3 px-4 overflow-y-auto shrink-0">
            {totalActiveCount === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No filters selected</p>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => {
                  const vals = draftFilters[cat.key]
                  if (!vals) return null

                  // Date range display
                  if (cat.type === 'date-range' && typeof vals === 'object') {
                    if (!vals.start && !vals.end) return null
                    return (
                      <div key={cat.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-foreground">{cat.label}</span>
                          <button onClick={() => setDraftFilters((p) => ({ ...p, [cat.key]: undefined }))} className="text-[10px] text-primary hover:underline">Clear</button>
                        </div>
                        <div className="space-y-1">
                          {vals.start && (
                            <div className="flex items-center justify-between bg-accent/50 rounded px-2 py-1">
                              <span className="text-xs text-foreground">From: {vals.start}</span>
                              <button onClick={() => setDateRange(cat.key, 'start', '')} className="text-muted-foreground hover:text-foreground ml-1 shrink-0">
                                <X size={12} />
                              </button>
                            </div>
                          )}
                          {vals.end && (
                            <div className="flex items-center justify-between bg-accent/50 rounded px-2 py-1">
                              <span className="text-xs text-foreground">To: {vals.end}</span>
                              <button onClick={() => setDateRange(cat.key, 'end', '')} className="text-muted-foreground hover:text-foreground ml-1 shrink-0">
                                <X size={12} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  // Array display (checkbox / search-checkbox)
                  const arr = Array.isArray(vals) ? vals : [vals]
                  if (arr.length === 0) return null
                  return (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-foreground">{cat.label}</span>
                        <button onClick={() => setDraftFilters((p) => ({ ...p, [cat.key]: undefined }))} className="text-[10px] text-primary hover:underline">Clear</button>
                      </div>
                      <div className="space-y-1">
                        {arr.map((v) => (
                          <div key={v} className="flex items-center justify-between bg-accent/50 rounded px-2 py-1">
                            <span className="text-xs text-foreground truncate">{getOptionLabel(cat.key, v)}</span>
                            <button onClick={() => removeFilter(cat.key, v)} className="text-muted-foreground hover:text-foreground ml-1 shrink-0">
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-lg transition">Cancel</button>
          <button onClick={handleApply} className="px-5 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition shadow-sm">Apply</button>
        </div>
      </div>
    </>
  )
}

export default FilterPanel
