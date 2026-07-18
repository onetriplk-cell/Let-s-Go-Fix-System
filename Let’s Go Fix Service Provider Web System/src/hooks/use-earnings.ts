import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

export interface PaymentRow {
  id: string
  amount: number
  method: string
  status: string
  paid_at: string | null
  created_at: string
}

export function useEarnings() {
  const providerProfile = useAuthStore((s) => s.providerProfile)

  return useQuery({
    queryKey: ['earnings', providerProfile?.profile_id],
    queryFn: async (): Promise<PaymentRow[]> => {
      const { data, error } = await supabase
        .from('payments')
        .select('id, amount, method, status, paid_at, created_at')
        .eq('provider_id', providerProfile!.profile_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!providerProfile,
  })
}
