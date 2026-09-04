import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const statusStyles = {
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-red-50 text-red-600',
}

const LabOwnerAssistantsTable = ({ data, view = 'table' }) => {
  const navigate = useNavigate()
  const list = data || []

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="font-serif text-base sm:text-lg font-bold text-foreground">Lab Assistants</h3>
        <button
          onClick={() => navigate(ROUTES.LAB_OWNER_ASSISTANTS)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      {view === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Assistant</th>
                <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Role</th>
                <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((assistant) => (
                <tr key={assistant._id} className="border-b border-border/50 last:border-0">
                  <td className="py-2.5 sm:py-3">
                    <span className="font-semibold text-foreground text-[13px]">{assistant.name}</span>
                  </td>
                  <td className="py-2.5 sm:py-3 text-muted-foreground text-xs">
                    {assistant.role || 'Lab Assistant'}
                  </td>
                  <td className="py-2.5 sm:py-3">
                    <span className={`px-2 sm:px-2.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-medium ${
                      assistant.isActive ? statusStyles.active : statusStyles.inactive
                    }`}>
                      {assistant.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 sm:py-8 text-center text-muted-foreground text-xs">No lab assistants</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((assistant) => {
            const initials = assistant.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'AS'
            const isActive = assistant.isActive
            return (
              <article key={assistant._id} className="flex flex-col rounded-xl border border-border bg-white shadow-sm transition hover:shadow-md overflow-hidden">
                <div className="p-3 pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-semibold text-[10px]">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground text-sm truncate">{assistant.name}</h4>
                        <p className="text-[11px] text-muted-foreground">{assistant.role || 'Lab Assistant'}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium ${isActive ? statusStyles.active : statusStyles.inactive}`}>
                      <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
          {list.length === 0 && (
            <p className="col-span-full py-6 text-center text-muted-foreground text-xs">No lab assistants</p>
          )}
        </div>
      )}
    </div>
  )
}

export default LabOwnerAssistantsTable
