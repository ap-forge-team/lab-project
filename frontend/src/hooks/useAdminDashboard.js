import { useQuery } from '@tanstack/react-query'
import { getAdminDashboardStats } from '@/services/user.service'

export const useAdminDashboardStats = (params = {}) => {
  return useQuery({
    queryKey: ['admin-dashboard-stats', params],
    queryFn: () => getAdminDashboardStats(params),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  })
}
