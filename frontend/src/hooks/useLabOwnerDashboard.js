import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getLabOwnerDashboardStats } from '@/services/labOwnerDashboard.service'
import { useCallback } from 'react'

export const useLabOwnerDashboard = (params = {}) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['lab-owner-dashboard', params],
    queryFn: () => getLabOwnerDashboardStats(params),
    select: (res) => res.data,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const refetchDashboard = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['lab-owner-dashboard'] })
  }, [queryClient])

  return { ...query, refetchDashboard }
}
