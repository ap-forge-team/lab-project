import React, { useContext, useState, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import { getMenuItemsForRole } from '@/constants/sidebarMenu'
import Logo from '@/components/ui/Logo'

const Sidebar = ({ isOpen, isCollapsed, onClose }) => {
  const { user, logout } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedItems, setExpandedItems] = useState({})

  const menuItems = useMemo(() => {
    return getMenuItemsForRole(user?.role || 'patient', user?.permissions)
  }, [user?.role, user?.permissions])

  useEffect(() => {
    const currentParent = menuItems.find(
      (item) =>
        item.children &&
        item.children.some((child) => location.pathname.startsWith(child.route))
    )
    if (currentParent) {
      setExpandedItems((prev) => ({ ...prev, [currentParent.label]: true }))
    }
  }, [location.pathname, menuItems])

  const isActive = (route) => {
    if (route === '/admin' || route === '/lab-owner' || route === '/lab-assistant' || route === '/booking') {
      return location.pathname === route
    }
    return location.pathname.startsWith(route)
  }

  const isChildActive = (item) => {
    return item.children?.some((child) => location.pathname.startsWith(child.route))
  }

  const toggleExpand = (label) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full border-border z-50 transition-all duration-300 flex flex-col
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Header */}
        <div className={`h-16 flex bg-white items-center border-border flex-shrink-0 ${isCollapsed ? 'justify-center px-2' : 'px-5 justify-between'}`}>
          {!isCollapsed && <Logo />}
          {isCollapsed && (
            <Link to={ROUTES.HOME} className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CU</span>
            </Link>
          )}
          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground transition p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 bg-white md:rounded-md md:ml-3 md:my-3">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const hasChildren = item.children?.length > 0
              const active = isActive(item.route) || isChildActive(item)
              const expanded = expandedItems[item.label]

              return (
                <li key={item.label}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={`w-full flex items-center gap-3 rounded-lg transition text-sm font-medium
                          ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                          ${active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          }
                        `}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <Icon size={20} className="flex-shrink-0" />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1 text-left">{item.label}</span>
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                            />
                          </>
                        )}
                      </button>
                      <AnimatePresence>
                        {expanded && !isCollapsed && (
                          <motion.ul
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden ml-4 mt-1 space-y-0.5"
                          >
                            {item.children.map((child) => (
                              <li key={child.route}>
                                <Link
                                  to={child.route}
                                  className={`block px-3 py-2 rounded-lg text-sm transition
                                    ${location.pathname === child.route
                                      ? 'bg-primary/10 text-primary font-medium'
                                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }
                                  `}
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.route}
                      className={`flex items-center gap-3 rounded-lg transition text-sm font-medium
                        ${isCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'}
                        ${active
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        }
                      `}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

      </aside>
    </>
  )
}

export default Sidebar
