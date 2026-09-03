import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, FlaskConical, Calendar, CreditCard, MoreHorizontal } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, route: ROUTES.ADMIN },
  { key: 'tests', label: 'Tests', icon: FlaskConical, route: ROUTES.ADMIN_TESTS },
  { key: 'bookings', label: 'Bookings', icon: Calendar, route: ROUTES.ADMIN_BOOKINGS },
  { key: 'payments', label: 'Payments', icon: CreditCard, route: ROUTES.ADMIN_PAYMENTS },
  { key: 'more', label: 'More', icon: MoreHorizontal, route: null },
]

const MobileBottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (route) => {
    if (!route) return false
    return location.pathname === route || location.pathname.startsWith(route + '/')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.route)
          return (
            <button
              key={item.key}
              onClick={() => item.route && navigate(item.route)}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition min-w-[60px] ${
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default MobileBottomNav
