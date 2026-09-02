import React, { useState } from 'react'
import { Download, Pencil } from 'lucide-react'
import { DashboardSectionHeader, EmptyState } from '@/components/Dashboard'
import { DataTable } from '@/components/ui/data-table'
import { createAdminBookingsColumns } from '@/features/admin/columns/admin-bookings.columns'
import { BOOKING_STATUS } from '@/constants/status'
import { Spinner } from '@/components/ui/Loader'
import Button from '@/components/ui/Button'
import ViewToggle from '@/components/ui/ViewToggle'
import useResponsiveView from '@/hooks/useResponsiveView'
import AdminBookingMobileCard from '@/features/admin/components/AdminBookingMobileCard'
import ReportViewerModal from '@/components/Dashboard/ReportViewerModal'

const AdminBookingsSection = ({
  loading,
  fetchError,
  onRetry,
  openEditModal,
  filteredBookings,
  tableRef,
  assistants = [],
  handleAssignAssistant,
}) => {
  const [previewReport, setPreviewReport] = useState(null)
  const [view, setView] = useResponsiveView()

  const columns = React.useMemo(
    () => createAdminBookingsColumns({ assistants, handleAssignAssistant }),
    [assistants, handleAssignAssistant]
  )

  const actions = React.useMemo(
    () => [
      {
        label: 'Edit Lab',
        icon: <Pencil size={14} />,
        iconColor: 'bg-amber-100 text-amber-600',
        onClick: openEditModal,
        disabled: (row) =>
          row.status === BOOKING_STATUS.COMPLETED || row.status === BOOKING_STATUS.CANCELLED,
      },
      {
        label: 'View Report',
        icon: <Download size={14} />,
        iconColor: 'bg-blue-100 text-blue-600',
        onClick: (row) => setPreviewReport(row.report),
        disabled: (row) => !row.report,
      },
    ],
    [openEditModal]
  )

  return (
    <div ref={tableRef} className="bg-white border border-border rounded-xl shadow-card mt-8 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <DashboardSectionHeader title="Recent Bookings" subtitle="Latest patient booking activity" />
        <ViewToggle view={view} onChange={setView} />
      </div>
      {loading ? (
        <Spinner />
      ) : fetchError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center mt-4">
          <p className="text-red-600 text-xs font-medium">{fetchError}</p>
          <Button onClick={onRetry} variant="outline" className="mt-3" size="sm">
            Retry
          </Button>
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState text="No Bookings Found" />
      ) : (
        <>
          {view === 'table' ? (
            <div className="mt-4 overflow-x-auto">
              <DataTable
                columns={columns}
                data={filteredBookings}
                enablePagination={true}
                enableSorting={true}
                pageSize={10}
                actions={actions}
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredBookings.map((booking) => (
                <AdminBookingMobileCard
                  key={booking._id}
                  booking={booking}
                  openEditModal={openEditModal}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ReportViewerModal
        isOpen={!!previewReport}
        onClose={() => setPreviewReport(null)}
        reportUrl={previewReport}
      />
    </div>
  )
}

export default AdminBookingsSection
