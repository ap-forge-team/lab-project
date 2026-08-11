import React, { createContext, useEffect, useState } from 'react'
import { getRoleById } from '@/services/role.service'
export const AuthContext = createContext()
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  // Restore User and fetch fresh permissions
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const savedUser = sessionStorage.getItem('user')
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser)
          if (parsedUser?.token) {
            setUser(parsedUser)
            if (parsedUser.roleId) {
              try {
                const { data } = await getRoleById(parsedUser.roleId)
                const permissions = data?.role?.permissions || data?.permissions || {}
                const updated = { ...parsedUser, permissions }
                setUser(updated)
                sessionStorage.setItem('user', JSON.stringify(updated))
              } catch {
                // If roleId is a string name, try fetching by name
                try {
                  const { data } = await getRoleById(parsedUser.role)
                  const permissions = data?.role?.permissions || data?.permissions || {}
                  const updated = { ...parsedUser, permissions }
                  setUser(updated)
                  sessionStorage.setItem('user', JSON.stringify(updated))
                } catch {
                  // Silently fail - use cached permissions
                }
              }
            }
          } else {
            sessionStorage.removeItem('user')
          }
        }
      } catch (error) {
        console.log(error)
        sessionStorage.removeItem('user')
      }
      setLoading(false)
    }
    restoreUser()
  }, [])
  // Login
  const login = (data) => {
    setUser(data)
    sessionStorage.setItem('user', JSON.stringify(data))
  }
  // Update permissions after fetching from role
  const setPermissions = (permissions) => {
    setUser((prev) => {
      const updated = { ...prev, permissions }
      sessionStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }
  // Logout
  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('user')
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        loading,
        setPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
