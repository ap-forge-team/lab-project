import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/services/category.service'

export const useCategories = (params) => {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => getCategories(params),
  })
}
