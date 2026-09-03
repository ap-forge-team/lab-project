import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getLabAssistantDashboardStats } from '@/services/labAssistantDashboard.service'
import { useCallback } from 'react'

export const useLabAssistantDashboard = (params = {}) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['lab-assistant-dashboard', params],
    queryFn: () => getLabAssistantDashboardStats(params),
    select: (res) => res.data?.data || res.data,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const refetchDashboard = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['lab-assistant-dashboard'] })
  }, [queryClient])

  return { ...query, refetchDashboard }
}
