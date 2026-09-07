import React from "react"
import { type ColumnDef } from "@tanstack/react-table"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import Select from "@/components/ui/Select"
import { BOOKING_STATUS, PAYMENT_STATUS } from "@/constants/status"

const statusStyles: Record<string, string> = {
  [BOOKING_STATUS.COMPLETED]: "bg-green-50 text-green-700",
  [BOOKING_STATUS.PENDING]: "bg-primary/10 text-primary",
  [BOOKING_STATUS.CANCELLED]: "bg-red-100 text-red-700",
  [BOOKING_STATUS.RESCHEDULED]: "bg-primary/10 text-primary",
  [BOOKING_STATUS.ASSIGNED]: "bg-primary/10 text-primary",
  [BOOKING_STATUS.REACHED]: "bg-accent text-secondary",
  [BOOKING_STATUS.SAMPLE_COLLECTED]: "bg-accent text-secondary",
  [PAYMENT_STATUS.PAID]: "bg-green-50 text-green-700",
  [PAYMENT_STATUS.UNPAID]: "bg-red-100 text-red-700",
  [PAYMENT_STATUS.FAILED]: "bg-red-100 text-red-700",
}

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block ${
      statusStyles[status] || "bg-primary/10 text-muted-foreground"
    }`}
  >
    {status}
  </span>
)

export interface Booking {
  _id: string
  patientName: string
  phone: string
  test?: { title: string; price: number }
  package?: { title: string; price: number }
  city: string
  bookingDate: string
  bookingTime: string
  assignedLabAssistant?: { _id: string; name: string; email: string } | null
  status: string
  paymentStatus: string
  sampleImages?: string[]
  report?: string | null
}

interface CreateLabOwnerBookingsColumnsParams {
  assistants: Array<{ _id: string; name: string }>
  handleAssignAssistant: (bookingId: string, assistantId: string) => void
}

export function createLabOwnerBookingsColumns({
  assistants,
  handleAssignAssistant,
}: CreateLabOwnerBookingsColumnsParams): ColumnDef<Booking, any>[] {
  return [
    {
      id: "patientName",
      accessorKey: "patientName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Patient" />
      ),
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div>
            <div className="font-medium text-foreground text-sm">
              {booking.patientName}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {booking.phone}
            </div>
          </div>
        )
      },
    },
    {
      id: "testTitle",
      accessorFn: (row) => row.test?.title || row.package?.title || "",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Test / Package" />
      ),
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div>
            <div className="font-medium text-foreground text-sm">
              {booking.test?.title || booking.package?.title}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {booking.city}
            </div>
          </div>
        )
      },
    },
    {
      id: "amount",
      accessorFn: (row) => row.test?.price || row.package?.price || 0,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.original.test?.price || row.original.package?.price
        return (
          <span className="font-mono font-bold text-sm text-primary">
            ₹{amount}
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
      cell: ({ row }) => {
        const booking = row.original
        return (
          <div>
            <div className="text-sm text-foreground">{booking.bookingDate}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {booking.bookingTime}
            </div>
          </div>
        )
      },
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
        return (
          <Select
            value=""
            onChange={(e) => { e.stopPropagation(); handleAssignAssistant(booking._id, e.target.value) }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Assign"
            options={assistants.map((assistant) => ({ value: assistant._id, label: assistant.name }))}
            size="sm"
          />
        )
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
        <StatusBadge status={row.getValue("paymentStatus")} />
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
