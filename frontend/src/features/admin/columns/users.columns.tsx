import React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"

export interface UserRecord {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  createdAt: string
  updatedAt?: string
}

const roleBadgeColor: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  lab_owner: "bg-blue-100 text-blue-700",
  lab_assistant: "bg-amber-100 text-amber-700",
  patient: "bg-gray-100 text-gray-600",
}

const avatarColors = [
  "bg-blue-100 text-blue-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-amber-100 text-amber-600",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-600",
  "bg-red-100 text-red-600",
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

const formatLastLogin = (dateStr: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(dateStr)
}

export const userColumns: ColumnDef<UserRecord, any>[] = [
  {
    id: "name",
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const user = row.original
      const colorClass = getAvatarColor(user.name || "")
      const initials = user.name
        ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U"
      return (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs shrink-0`}>
            {initials}
          </div>
          <div>
            <h3 className="text-xs font-medium text-foreground">{user.name}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{user.email}</p>
          </div>
        </div>
      )
    },
  },
  {
    id: "role",
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      const displayRole = role?.replace(/_/g, " ")
      const colorClass = roleBadgeColor[role] || "bg-gray-100 text-gray-600"
      return (
        <span className={`${colorClass} px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize`}>
          {displayRole}
        </span>
      )
    },
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
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const user = row.original
      const isActive = user.role !== "inactive"
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
      <DataTableColumnHeader column={column} title="Registered On" />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatDate(row.getValue("createdAt"))}</span>
    ),
  },
  {
    id: "updatedAt",
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{formatLastLogin(row.getValue("updatedAt"))}</span>
    ),
  },
]
