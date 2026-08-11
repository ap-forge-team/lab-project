import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

const usePermission = () => {
  const { user } = useContext(AuthContext)

  const permissions = user?.permissions || {}

  const can = (resource, action) => {
    if (!permissions[resource]) return false
    return permissions[resource][action] === true
  }

  const canAny = (resource) => {
    if (!permissions[resource]) return []
    return Object.entries(permissions[resource])
      .filter(([, allowed]) => allowed)
      .map(([action]) => action)
  }

  const hasAnyPermission = () => {
    return Object.keys(permissions).length > 0
  }

  return { can, canAny, hasAnyPermission, permissions }
}

export default usePermission
