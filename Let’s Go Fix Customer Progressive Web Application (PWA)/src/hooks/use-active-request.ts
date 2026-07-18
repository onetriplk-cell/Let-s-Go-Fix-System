import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { ServiceRequest } from '@/types/database'

const ACTIVE_STATUSES = ['requested', 'accepted', 'provider_en_route', 'in_progress']

export function useActiveRequest() {
  const profile = useAuthStore((s) => s.profile)

  return useQuery({
    queryKey: ['active-request', profile?.id],
    queryFn: async (): Promise<ServiceRequest | null> => {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('customer_id', profile!.id)
        .in('status', ACTIVE_STATUSES)
        .order('requested_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!profile,
    refetchInterval: 10_000,
  })
}
