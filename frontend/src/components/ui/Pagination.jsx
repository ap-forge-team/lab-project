import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Pagination = ({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizes = [8, 12, 24, 48],
  itemName = 'items',
}) => {
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages = []
    const showAround = 1
    pages.push(1)
    const start = Math.max(2, page - showAround)
    const end = Math.min(totalPages - 1, page + showAround)
    if (start > 2) pages.push('ellipsis-start')
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    if (end < totalPages - 1) pages.push('ellipsis-end')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  const pageNumbers = useMemo(() => getPageNumbers(), [page, totalPages])

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  const showingText = (
    <p className="shrink-0">
      Showing {from} to {to} of {totalItems} {itemName}
    </p>
  )

  const pageSizeSelect = (
    <select
      aria-label="Items per page"
      value={pageSize}
      onChange={(e) => onPageSizeChange(Number(e.target.value))}
      className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
    >
      {pageSizes.map((size) => (
        <option key={size} value={size}>
          {size} per page
        </option>
      ))}
    </select>
  )

  const paginationButtons = (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="rounded-lg border border-border p-2 transition hover:bg-accent disabled:opacity-40"
      >
        <ChevronLeft size={17} />
      </button>
      {pageNumbers.map((item) => {
        if (typeof item === 'string' && item.startsWith('ellipsis')) {
          return (
            <span key={item} className="px-1">
              …
            </span>
          )
        }
        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 font-medium transition ${
              page === item
                ? 'bg-primary text-white'
                : 'hover:bg-accent text-foreground'
            }`}
          >
            {item}
          </button>
        )
      })}
      <button
        type="button"
        aria-label="Next page"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="rounded-lg border border-border p-2 transition hover:bg-accent disabled:opacity-40"
      >
        <ChevronRight size={17} />
      </button>
    </div>
  )

  if (totalItems === 0) return null

  return (
    <div className="flex flex-col gap-3 pb-2 text-sm text-muted-foreground">
      {/* Mobile: Row 1 - text + dropdown, Row 2 - pagination */}
      <div className="flex items-center justify-between sm:hidden">
        {showingText}
        {pageSizeSelect}
      </div>
      <div className="flex items-center justify-center sm:hidden">
        {paginationButtons}
      </div>

      {/* Desktop: Single row */}
      <div className="hidden items-center justify-between sm:flex">
        {showingText}
        {paginationButtons}
        {pageSizeSelect}
      </div>
    </div>
  )
}

export default Pagination
