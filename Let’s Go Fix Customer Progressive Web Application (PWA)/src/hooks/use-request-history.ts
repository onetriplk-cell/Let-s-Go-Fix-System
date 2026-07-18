import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

export interface HistoryRow {
  id: string
  status: string
  pickup_address: string | null
  final_price: number | null
  quoted_price: number | null
  requested_at: string
  category_name: string
  provider_name: string | null
  has_review: boolean
}

export function useRequestHistory() {
  const profile = useAuthStore((s) => s.profile)

  return useQuery({
    queryKey: ['request-history', profile?.id],
    queryFn: async (): Promise<HistoryRow[]> => {
      const { data, error } = await supabase
        .from('service_requests')
        .select(
          `id, status, pickup_address, final_price, quoted_price, requested_at,
           category:service_categories!inner(name),
           provider:provider_profiles(business_name),
           reviews(id)`,
        )
        .eq('customer_id', profile!.id)
        .order('requested_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row: any) => ({
        id: row.id,
        status: row.status,
        pickup_address: row.pickup_address,
        final_price: row.final_price,
        quoted_price: row.quoted_price,
        requested_at: row.requested_at,
        category_name: row.category?.name ?? '—',
        provider_name: row.provider?.business_name ?? null,
        has_review: (row.reviews ?? []).length > 0,
      }))
    },
    enabled: !!profile,
  })
}
