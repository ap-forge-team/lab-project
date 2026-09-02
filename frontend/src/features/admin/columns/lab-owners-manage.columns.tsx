import React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import CopyIcon from "@/components/ui/CopyIcon"
import { MapPin, ChevronRight } from "lucide-react"

export interface LabOwnerRecord {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  labAddress?: string
  servicePincodes?: string[]
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt?: string
}

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-amber-100 text-amber-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
  "bg-red-100 text-red-600",
  "bg-indigo-100 text-indigo-600",
]

const getAvatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

export const labOwnerManageColumns: ColumnDef<LabOwnerRecord, any>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lab Owner" />
    ),
    cell: ({ row }) => {
      const owner = row.original
      const colorClass = getAvatarColor(owner.name || "")
      const initials = owner.name
        ? owner.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "LO"
      return (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs shrink-0`}>
            {initials}
          </div>
          <div>
            <h3 className="text-xs font-medium text-foreground">{owner.name}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ID: {owner._id.slice(-6)}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    id: "contact",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      const owner = row.original
      return (
        <div className="text-xs">
          <p className="text-foreground">{owner.email}</p>
          <p className="text-muted-foreground mt-0.5">{owner.phone || '—'}</p>
        </div>
      )
    },
  },
  {
    id: "labAddress",
    accessorKey: "labAddress",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lab Location" />
    ),
    cell: ({ table, row }) => {
      const address = row.getValue<string>("labAddress")
      if (!address) return <p className="text-xs text-muted-foreground">—</p>

      const isLastRow = row.index === table.getRowModel().rows.length - 1

      return (
        <div className="flex items-center gap-1.5 w-max max-w-[220px]">
          <MapPin size={14} className="text-muted-foreground shrink-0" />
          <div className="group/tooltip relative flex-1 min-w-0">
            <p className="truncate text-xs text-muted-foreground cursor-pointer">
              {address}
            </p>
            <div
              className={`absolute hidden group-hover/tooltip:block z-[9999] bg-foreground text-background text-xs rounded-lg p-2.5 w-max max-w-[80vw] whitespace-normal break-words left-0 shadow-xl ${
                isLastRow ? "bottom-5" : "top-5"
              }`}
            >
              {address}
            </div>
          </div>
          <CopyIcon text={address} />
        </div>
      )
    },
  },
  {
    id: "servicePincodes",
    accessorKey: "servicePincodes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Service Areas" />
    ),
    cell: ({ row }) => {
      const pincodes = row.getValue("servicePincodes") as string[] | undefined
      const count = pincodes?.length || 0
      if (count === 0) return <p className="text-xs text-muted-foreground">—</p>
      return (
        <div className="flex items-center gap-1.5">
          <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-full text-[10px] font-semibold">
            {count} Area{count !== 1 ? 's' : ''}
          </span>
          <ChevronRight size={14} className="text-muted-foreground" />
        </div>
      )
    },
  },
  {
    id: "status",
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const owner = row.original
      const isActive = owner.role !== "inactive"
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></span>
          {isActive ? "Active" : "Inactive"}
        </div>
      )
    },
  },
]
