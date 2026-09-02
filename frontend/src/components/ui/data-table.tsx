import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { MoreVertical } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Action<TData> {
  label: string
  icon?: React.ReactNode
  iconColor?: string
  onClick: (row: TData) => void
  disabled?: boolean | ((row: TData) => boolean)
  variant?: "default" | "destructive"
  separator?: boolean
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageSize?: number
  searchColumn?: string
  searchPlaceholder?: string
  enablePagination?: boolean
  enableSorting?: boolean
  enableRowSelection?: boolean
  actions?: Action<TData>[]
  actionsHeader?: string
  className?: string
  rowClassName?: string
}

export function createActionsColumn<TData>(
  actions: Action<TData>[],
  header: string = "Actions"
): ColumnDef<TData, any> {
  return {
    id: "actions",
    header,
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const rowData = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center size-8 rounded-md hover:bg-muted transition-colors outline-none cursor-pointer">
            <MoreVertical size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {actions.map((action, index) => {
              const isDisabled =
                typeof action.disabled === "function"
                  ? action.disabled(rowData)
                  : action.disabled

              return (
                <React.Fragment key={action.label}>
                  {action.separator && index > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    onClick={() => action.onClick(rowData)}
                    disabled={isDisabled}
                    variant={action.variant}
                  >
                    {action.icon && (
                      <span
                        className={`inline-flex items-center justify-center size-6 rounded-md ${
                          action.iconColor || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {action.icon}
                      </span>
                    )}
                    {action.label}
                  </DropdownMenuItem>
                </React.Fragment>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageSize = 10,
  searchColumn,
  searchPlaceholder = "Search...",
  enablePagination = true,
  enableSorting = true,
  enableRowSelection = false,
  actions,
  actionsHeader = "Actions",
  className,
  rowClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const allColumns = React.useMemo(() => {
    if (!actions || actions.length === 0) return columns
    return [...columns, createActionsColumn<TData>(actions, actionsHeader)]
  }, [columns, actions, actionsHeader])

  const table = useReactTable({
    data,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    ...(enablePagination && {
      getPaginationRowModel: getPaginationRowModel(),
      initialState: { pagination: { pageSize } },
    }),
    ...(enableSorting && {
      getSortedRowModel: getSortedRowModel(),
      onSortingChange: setSorting,
    }),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    ...(enableRowSelection && {
      onRowSelectionChange: setRowSelection,
    }),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      ...(enableRowSelection && { rowSelection }),
    },
  })

  return (
    <div className={className}>
      {searchColumn && (
        <div className="flex items-center py-4">
          <input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 max-w-sm"
          />
        </div>
      )}
      <div className="rounded-md border">
        <Table className="min-w-[900px]">
          <TableHeader className="bg-primary/10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-border">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-semibold text-muted-foreground">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={rowClassName}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={allColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {enablePagination && (
        <div className="py-4">
          <DataTablePagination table={table} enableRowSelection={enableRowSelection} />
        </div>
      )}
    </div>
  )
}
