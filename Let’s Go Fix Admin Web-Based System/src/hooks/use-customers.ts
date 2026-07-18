import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface CustomerRow {
  id: string
  full_name: string
  phone: string | null
  is_active: boolean
  created_at: string
  vehicle_count: number
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<CustomerRow[]> => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, is_active, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!profiles?.length) return []

      const ids = profiles.map((p) => p.id)
      const { data: vehicles } = await supabase
        .from('vehicles')
        .select('customer_id')
        .in('customer_id', ids)

      const vehicleCounts = new Map<string, number>()
      for (const v of vehicles ?? []) {
        vehicleCounts.set(v.customer_id, (vehicleCounts.get(v.customer_id) ?? 0) + 1)
      }

      return profiles.map((p) => ({
        ...p,
        vehicle_count: vehicleCounts.get(p.id) ?? 0,
      }))
    },
  })
}
