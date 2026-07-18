import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { BookingStatus } from '@/types/database'

export interface BookingRow {
  id: string
  status: BookingStatus
  pickup_address: string | null
  quoted_price: number | null
  final_price: number | null
  requested_at: string
  customer_name: string
  provider_name: string | null
  category_name: string
}

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async (): Promise<BookingRow[]> => {
      const { data, error } = await supabase
        .from('service_requests')
        .select(
          `id, status, pickup_address, quoted_price, final_price, requested_at,
           customer:customer_profiles!inner(profiles!inner(full_name)),
           provider:provider_profiles(business_name),
           category:service_categories!inner(name)`,
        )
        .order('requested_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row: any) => ({
        id: row.id,
        status: row.status,
        pickup_address: row.pickup_address,
        quoted_price: row.quoted_price,
        final_price: row.final_price,
        requested_at: row.requested_at,
        customer_name: row.customer?.profiles?.full_name ?? '—',
        provider_name: row.provider?.business_name ?? null,
        category_name: row.category?.name ?? '—',
      }))
    },
  })
}
