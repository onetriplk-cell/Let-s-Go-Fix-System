import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [customers, providers, bookings, pendingProviders] = await Promise.all([
        supabase.from('customer_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('service_requests').select('*', { count: 'exact', head: true }),
        supabase
          .from('provider_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('verification_status', 'pending'),
      ])

      return {
        customerCount: customers.count ?? 0,
        providerCount: providers.count ?? 0,
        bookingCount: bookings.count ?? 0,
        pendingProviderCount: pendingProviders.count ?? 0,
      }
    },
  })
}

export function useRecentBookings() {
  return useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_requests')
        .select('id, status, pickup_address, quoted_price, requested_at')
        .order('requested_at', { ascending: false })
        .limit(8)

      if (error) throw error
      return data ?? []
    },
  })
}
