import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

export function useProviderDashboard() {
  const providerProfile = useAuthStore((s) => s.providerProfile)

  return useQuery({
    queryKey: ['provider-dashboard', providerProfile?.profile_id],
    queryFn: async () => {
      const providerId = providerProfile!.profile_id

      const [activeJobs, completedJobs, payments] = await Promise.all([
        supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', providerId)
          .in('status', ['accepted', 'provider_en_route', 'in_progress']),
        supabase
          .from('service_requests')
          .select('*', { count: 'exact', head: true })
          .eq('provider_id', providerId)
          .eq('status', 'completed'),
        supabase
          .from('payments')
          .select('amount, status')
          .eq('provider_id', providerId),
      ])

      const totalEarnings = (payments.data ?? [])
        .filter((p) => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0)

      return {
        activeJobCount: activeJobs.count ?? 0,
        completedJobCount: completedJobs.count ?? 0,
        totalEarnings,
      }
    },
    enabled: !!providerProfile,
  })
}
