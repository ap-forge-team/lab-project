import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getPatientDashboardStats } from '@/services/patientDashboard.service'
import { useCallback } from 'react'

export const usePatientDashboard = (params = {}) => {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['patient-dashboard', params],
    queryFn: () => getPatientDashboardStats(params),
    select: (res) => res.data?.data || res.data,
    staleTime: 0,
    refetchOnWindowFocus: false,
  })

  const refetchDashboard = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['patient-dashboard'] })
  }, [queryClient])

  return { ...query, refetchDashboard }
}
