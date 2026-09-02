import usePermission from '@/hooks/usePermission'

const Can = ({ resource, action, children, fallback = null }) => {
  const { can } = usePermission()

  if (!can(resource, action)) {
    return fallback
  }

  return children
}

export default Can
