import React, { useState } from 'react'
import { Download, MapPin, Pencil, Settings, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react'
import { BOOKING_STATUS, PAYMENT_STATUS } from '@/constants/status'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import CopyIcon from '@/components/ui/CopyIcon'
import ReportViewerModal from './ReportViewerModal'
import EmptyState from '@/components/ui/EmptyState'

const BookingsTable = ({
  bookings,
  showPatient = true,
  showPayment = true,
  showReport = true,
  showAssistant = false,
  openManageModal,
  isAdmin = false,
  openEditModal,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: 'bookingDate', direction: 'desc' })
  const [previewReport, setPreviewReport] = useState(null)

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedBookings = React.useMemo(() => {
    const sortableItems = [...bookings]
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Handle nested fields
        if (sortConfig.key === 'testTitle') {
          aValue = a.test?.title || a.package?.title || ''
          bValue = b.test?.title || b.package?.title || ''
        }
        if (sortConfig.key === 'patientName') {
          aValue = a.patientName || ''
          bValue = b.patientName || ''
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [bookings, sortConfig])

  const SortHeader = ({ label, sortKey }) => (
    <th 
      className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground cursor-pointer hover:bg-accent transition-colors select-none group"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <span className="text-muted-foreground/50 group-hover:text-primary transition-colors">
          {sortConfig.key === sortKey ? (
            sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          ) : (
            <ArrowUpDown size={14} />
          )}
        </span>
      </div>
    </th>
  )

  return (
    <div className="w-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1000px] border-collapse">
          <thead className="bg-accent border-b border-border">
            <tr>
              <SortHeader label="Test/Package" sortKey="testTitle" />
              {showPatient && <SortHeader label="Patient" sortKey="patientName" />}
              <SortHeader label="Date" sortKey="bookingDate" />
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground">Time</th>
              <SortHeader label="Status" sortKey="status" />
              {isAdmin && (
                <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground">Assigned Lab</th>
              )}
              {showPayment && <SortHeader label="Payment" sortKey="paymentStatus" />}
              {showAssistant && (
                <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground">Assistant</th>
              )}
              {showReport && (
                <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground">Report</th>
              )}
              <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground w-24">
                {isAdmin ? 'Edit' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedBookings.map((item) => (
              <tr key={item._id} className="hover:bg-accent/50 transition-colors group">
                <td className="px-5 py-4 text-sm font-semibold text-foreground">
                  {item?.test?.title || item?.package?.title}
                </td>
                
                {showPatient && (
                  <td className="px-5 py-4">
                    <div className="font-semibold text-foreground text-sm">{item.patientName}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.phone}</div>
                  </td>
                )}
                
                <td className="px-5 py-4 text-sm text-muted-foreground">{item.bookingDate}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{item.bookingTime}</td>
                
                <td className="px-5 py-4">
                  <Badge status={item.status}>{item.status}</Badge>
                </td>
                
                {isAdmin && (
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-foreground">
                      {item.labOwner?.name || <span className="text-muted-foreground font-normal">Not Assigned</span>}
                    </div>
                    {item.labOwner?.labAddress && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="group/tooltip relative">
                          <p className="text-xs text-muted-foreground cursor-pointer flex items-center max-w-[180px]">
                            <MapPin size={12} className="mr-1 shrink-0" />
                            <span className="truncate">{item.labOwner.labAddress}</span>
                          </p>
                          <div className="absolute hidden group-hover/tooltip:block z-50 bg-foreground text-background text-xs rounded-lg p-2.5 w-64 left-0 top-5 shadow-xl">
                            {item.labOwner.labAddress}
                          </div>
                        </div>
                        <CopyIcon text={item.labOwner.labAddress} />
                      </div>
                    )}
                  </td>
                )}
                
                {showPayment && (
                  <td className="px-5 py-4">
                    <Badge status={item.paymentStatus}>{item.paymentStatus}</Badge>
                  </td>
                )}
                
                {showAssistant && (
                  <td className="px-5 py-4">
                    {item.assignedLabAssistant ? (
                      <>
                        <div className="text-sm font-semibold text-foreground">
                          {item.assignedLabAssistant.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.assignedLabAssistant.email}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </td>
                )}
                
                {showReport && (
                  <td className="px-5 py-4">
                    {item.report ? (
                      <Button
                        variant="success"
                        icon={<Download size={14} />}
                        expandableLabel="View Report"
                        onClick={() => setPreviewReport(item.report)}
                      />
                    ) : (
                      <span className="text-muted-foreground text-sm">Pending</span>
                    )}
                  </td>
                )}
                
                <td className="px-5 py-4">
                  {isAdmin ? (
                    <Button
                      onClick={() => openEditModal && openEditModal(item)}
                      disabled={item.status === BOOKING_STATUS.COMPLETED || item.status === BOOKING_STATUS.CANCELLED}
                      icon={<Pencil size={14} />}
                      expandableLabel="Edit Lab"
                    />
                  ) : (
                    <>
                      {item.status !== BOOKING_STATUS.COMPLETED && item.status !== BOOKING_STATUS.CANCELLED ? (
                        <Button
                          onClick={() => openManageModal && openManageModal(item)}
                          icon={<Settings size={14} />}
                          expandableLabel="Manage"
                        />
                      ) : item.status === BOOKING_STATUS.CANCELLED ? (
                        <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                          Cancelled
                        </span>
                      ) : null}
                    </>
                  )}
                </td>
              </tr>
            ))}
            
            {sortedBookings.length === 0 && (
              <tr>
                <td colSpan={10} className="px-5 py-10">
                  <EmptyState
                    title="No bookings found"
                    description="You don't have any bookings yet. Bookings will appear here once created."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <ReportViewerModal 
        isOpen={!!previewReport} 
        onClose={() => setPreviewReport(null)} 
        reportUrl={previewReport} 
      />
    </div>
  )
}

export default BookingsTable
