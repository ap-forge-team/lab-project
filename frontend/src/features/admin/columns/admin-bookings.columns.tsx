import React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { Clock } from "lucide-react"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { BOOKING_STATUS } from "@/constants/status"

const statusStyles: Record<string, string> = {
  [BOOKING_STATUS.COMPLETED]: "bg-green-50 text-green-700",
  [BOOKING_STATUS.PENDING]: "bg-amber-50 text-amber-600",
  [BOOKING_STATUS.CANCELLED]: "bg-red-100 text-red-700",
  [BOOKING_STATUS.RESCHEDULED]: "bg-orange-50 text-orange-600",
  [BOOKING_STATUS.ASSIGNED]: "bg-blue-50 text-blue-600",
  [BOOKING_STATUS.REACHED]: "bg-indigo-50 text-indigo-600",
  [BOOKING_STATUS.SAMPLE_COLLECTED]: "bg-purple-50 text-purple-600",
}

const statusDots: Record<string, string> = {
  [BOOKING_STATUS.COMPLETED]: "bg-green-500",
  [BOOKING_STATUS.PENDING]: "bg-amber-500",
  [BOOKING_STATUS.CANCELLED]: "bg-red-500",
  [BOOKING_STATUS.RESCHEDULED]: "bg-orange-500",
  [BOOKING_STATUS.ASSIGNED]: "bg-blue-500",
  [BOOKING_STATUS.REACHED]: "bg-indigo-500",
  [BOOKING_STATUS.SAMPLE_COLLECTED]: "bg-purple-500",
}

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium inline-flex items-center gap-1.5 ${
      statusStyles[status] || "bg-primary/10 text-muted-foreground"
    }`}
  >
    <span className={`w-1.5 h-1.5 rounded-full ${statusDots[status] || "bg-gray-400"}`}></span>
    {status}
  </span>
)

const paymentStyles: Record<string, string> = {
  Paid: "bg-green-50 text-green-700",
  Pending: "bg-amber-50 text-amber-600",
  Unpaid: "bg-red-100 text-red-700",
  Failed: "bg-red-100 text-red-700",
  Refunded: "bg-gray-50 text-gray-600",
}

const PaymentBadge = ({ status }: { status: string }) => (
  <span
    className={`px-2.5 py-0.5 rounded-md text-[11px] font-medium inline-block ${
      paymentStyles[status] || "bg-primary/10 text-muted-foreground"
    }`}
  >
    {status}
  </span>
)

export interface AdminBooking {
  _id: string
  patientName: string
  phone: string
  test?: { title: string; price: number; city?: string }
  package?: { title: string; price: number; city?: string }
  bookingDate: string
  bookingTime: string
  status: string
  paymentStatus: string
  totalAmount?: number
  report?: string | null
  assignedLabAssistant?: { _id: string; name: string; email: string } | null
  sampleImages?: string[]
}

interface CreateAdminBookingsColumnsParams {
  assistants?: Array<{ _id: string; name: string }>
  handleAssignAssistant?: (bookingId: string, assistantId: string) => void
}

export function createAdminBookingsColumns({
  assistants = [],
  handleAssignAssistant,
}: CreateAdminBookingsColumnsParams = {}): ColumnDef<AdminBooking, any>[] {
  return [
    {
      id: "patientName",
      accessorKey: "patientName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Patient" />
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-foreground text-sm">
            {row.original.patientName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {row.original.phone}
          </div>
        </div>
      ),
    },
    {
      id: "testTitle",
      accessorFn: (row) => row.test?.title || row.package?.title || "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Test / Package" />
      ),
      cell: ({ row }) => {
        const test = row.original.test
        const pkg = row.original.package
        const title = test?.title || pkg?.title || 'N/A'
        const city = test?.city || pkg?.city
        return (
          <div>
            <span className="text-sm font-semibold text-foreground block">
              {title}
            </span>
            {city && (
              <span className="text-xs text-muted-foreground">{city}</span>
            )}
          </div>
        )
      },
    },
    {
      id: "totalAmount",
      accessorFn: (row) => row.totalAmount || row.test?.price || row.package?.price || 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.original.totalAmount || row.original.test?.price || row.original.package?.price || 0
        return (
          <span className="text-sm font-semibold text-foreground">
            ₹{amount.toLocaleString('en-IN')}
          </span>
        )
      },
    },
    {
      id: "bookingDate",
      accessorKey: "bookingDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => (
        <div>
          <span className="text-sm text-foreground">{row.original.bookingDate}</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock size={10} />
            <span>{row.original.bookingTime}</span>
          </div>
        </div>
      ),
    },
    {
      id: "assignedLabAssistant",
      header: "Assistant",
      enableSorting: false,
      cell: ({ row }) => {
        const booking = row.original
        if (booking.assignedLabAssistant) {
          return (
            <div>
              <p className="text-sm font-medium text-foreground">
                {booking.assignedLabAssistant.name}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {booking.assignedLabAssistant.email}
              </p>
            </div>
          )
        }
        if (handleAssignAssistant) {
          return (
            <select
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => { e.stopPropagation(); handleAssignAssistant(booking._id, e.target.value) }}
              className="text-xs py-1.5 h-8 min-w-[140px] border border-border rounded-lg px-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground bg-card"
            >
              <option value="">Assign</option>
              {assistants.map((assistant) => (
                <option key={assistant._id} value={assistant._id}>
                  {assistant.name}
                </option>
              ))}
            </select>
          )
        }
        return <span className="text-xs text-muted-foreground">—</span>
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "paymentStatus",
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment" />
      ),
      cell: ({ row }) => (
        <PaymentBadge status={row.getValue("paymentStatus")} />
      ),
    },
    {
      id: "sampleImages",
      header: "Samples",
      enableSorting: false,
      cell: ({ row }) => {
        const images = row.original.sampleImages
        if (!images?.length) {
          return <span className="text-[11px] text-gray-400">No Samples</span>
        }
        return (
          <div className="flex items-center gap-1.5 flex-wrap max-w-[160px]">
            {images.slice(0, 3).map((image, index) => (
              <a
                key={index}
                href={image}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 hover:scale-110 transition-transform"
              >
                <img
                  src={image}
                  alt={`Sample ${index + 1}`}
                  className="w-10 h-10 rounded-md object-cover border border-border"
                />
              </a>
            ))}
            {images.length > 3 && (
              <span className="w-10 h-10 bg-primary/10 border border-border rounded-md flex items-center justify-center text-[10px] font-medium text-primary">
                +{images.length - 3}
              </span>
            )}
          </div>
        )
      },
    },
  ]
}
