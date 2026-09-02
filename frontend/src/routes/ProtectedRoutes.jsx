import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'
import { ROUTES } from '@/constants/routes'
const ProtectedRoute = ({ children, roles, resource, action }) => {
  const { user, loading } = useContext(AuthContext)
  if (loading) {
    return <h1>Loading...</h1>
  }
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.HOME} />
  }
  if (resource && action) {
    const hasPermission = user.permissions?.[resource]?.[action] === true
    if (!hasPermission) {
      return <Navigate to={ROUTES.HOME} />
    }
  }
  return children
}
export default ProtectedRoute
