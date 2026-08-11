import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, HelpCircle, LogOut, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
import useClickOutside from '@/hooks/useClickOutside'

const TopBar = ({ onToggleSidebar }) => {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useClickOutside(() => setProfileOpen(false))

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
    setProfileOpen(false)
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left Side */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu */}
        {/* <button
          onClick={onToggleSidebar}
          className="text-muted-foreground hover:text-foreground transition p-1.5 rounded-lg hover:bg-accent"
        >
          <Menu size={20} />
        </button> */}

        {/* Search Bar */}
        {/* <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-border rounded-lg px-3 py-2 w-[300px] lg:w-[400px]">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search tests, packages, bookings..."
            className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
          />
        </div> */}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <button className="relative text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-accent">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Help */}
        <button className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-accent hidden sm:flex">
          <HelpCircle size={20} />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-accent transition"
          >
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-foreground leading-tight">{user?.name || 'User'}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <ChevronDown size={14} className={`text-muted-foreground transition-transform hidden sm:block ${profileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white border border-border rounded-xl shadow-lg overflow-hidden z-50"
              >
                {/* Profile Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white font-bold text-base">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="py-2">
                  <Link
                    to={ROUTES.HOME}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent transition"
                  >
                    Home
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-red-500 hover:bg-red-50 transition text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}

export default TopBar
