import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Star } from 'lucide-react'

const avatarColors = [
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]

const TopLabOwnersTable = ({ data }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold text-foreground">Top Lab Owners</h3>
        <button
          onClick={() => navigate(ROUTES.ADMIN_LAB_OWNERS)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Lab Owner</th>
              <th className="text-right py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Total Bookings</th>
              <th className="text-right py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Rating</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((owner, idx) => {
              const initials = owner.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              return (
                <tr key={idx} className="border-b border-border/50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${avatarColors[idx % avatarColors.length]}`}>
                        {initials}
                      </div>
                      <span className="font-semibold text-foreground text-[13px]">{owner.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold text-foreground">{owner.bookings}</td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      <span className="font-semibold text-foreground">{owner.rating}</span>
                    </div>
                  </td>
                </tr>
              )
            })}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted-foreground text-xs">No lab owner data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopLabOwnersTable
