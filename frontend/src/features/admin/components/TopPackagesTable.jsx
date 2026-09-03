import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { PackageOpen, Heart, Shield, Activity, Star, Zap } from 'lucide-react'

const pkgIcons = [PackageOpen, Heart, Shield, Activity, Star, Zap]
const pkgColors = [
  'bg-purple-100 text-purple-500',
  'bg-blue-100 text-blue-500',
  'bg-green-100 text-green-500',
  'bg-amber-100 text-amber-500',
  'bg-rose-100 text-rose-500',
]

const TopPackagesTable = ({ data }) => {
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-bold text-foreground">Top Packages (This Month)</h3>
        <button
          onClick={() => navigate(ROUTES.ADMIN_PACKAGES)}
          className="text-xs font-semibold text-primary hover:underline"
        >
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Package Name</th>
              <th className="text-right py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Total Bookings</th>
              <th className="text-right py-2.5 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((pkg, idx) => {
              const Icon = pkgIcons[idx % pkgIcons.length]
              return (
                <tr key={idx} className="border-b border-border/50 last:border-0">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pkgColors[idx % pkgColors.length]}`}>
                        <Icon size={14} />
                      </div>
                      <span className="font-semibold text-foreground text-[13px]">{pkg.title}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold text-foreground">{pkg.bookings}</td>
                  <td className="py-3 text-right font-semibold text-foreground">{formatCurrency(pkg.revenue)}</td>
                </tr>
              )
            })}
            {(!data || data.length === 0) && (
              <tr>
                <td colSpan={3} className="py-8 text-center text-muted-foreground text-xs">No package data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TopPackagesTable
