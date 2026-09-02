import React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

export interface AssistantRecord {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  labOwner?: string
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

export const assistantColumns: ColumnDef<AssistantRecord, any>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Assistant" />
    ),
    cell: ({ row }) => {
      const assistant = row.original
      const colorClass = getAvatarColor(assistant.name || "")
      const initials = assistant.name
        ? assistant.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "AS"
      return (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs shrink-0`}>
            {initials}
          </div>
          <div>
            <h3 className="text-xs font-medium text-foreground">{assistant.name}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              ID: {assistant._id.slice(-6)}
            </p>
          </div>
        </div>
      )
    },
  },
  {
    id: "email",
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.getValue("email")}</span>
    ),
  },
  {
    id: "phone",
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone" />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.getValue("phone") || "—"}</span>
    ),
  },
  {
    id: "status",
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      const isActive = role !== "inactive"
      return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold ${isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></span>
          {isActive ? "Active" : "Inactive"}
        </div>
      )
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.getValue("createdAt"))}</span>
    ),
  },
]
