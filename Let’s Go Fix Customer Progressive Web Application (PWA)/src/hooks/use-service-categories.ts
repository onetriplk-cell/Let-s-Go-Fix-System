import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ServiceCategory } from '@/types/database'

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: async (): Promise<ServiceCategory[]> => {
      const { data, error } = await supabase.from('service_categories').select('*').order('name')
      if (error) throw error
      return data ?? []
    },
  })
}
