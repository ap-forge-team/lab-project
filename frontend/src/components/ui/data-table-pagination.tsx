import * as React from "react"
import { type Table } from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import Select from "./Select"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  enableRowSelection?: boolean
}

export function DataTablePagination<TData>({
  table,
  enableRowSelection = false,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-between">
      {enableRowSelection && (
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
      <div className="flex items-center justify-between gap-3 sm:ml-auto sm:justify-end sm:space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="hidden text-sm font-medium sm:inline">Rows per page</p>
          <Select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            options={[10, 20, 25, 30, 40, 50].map((ps) => ({ value: ps, label: String(ps) }))}
            size="sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="hidden size-8 lg:inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="size-4" />
            </button>
            <button
              className="size-8 inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="size-4" />
            </button>
            <button
              className="size-8 inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="size-4" />
            </button>
            <button
              className="hidden size-8 lg:inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
