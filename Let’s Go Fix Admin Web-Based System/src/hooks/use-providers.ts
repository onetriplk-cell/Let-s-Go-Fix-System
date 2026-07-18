import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { ProviderType, VerificationStatus } from '@/types/database'

export interface ProviderRow {
  profile_id: string
  business_name: string
  provider_type: ProviderType
  verification_status: VerificationStatus
  is_available: boolean
  rating_avg: number
  rating_count: number
  full_name: string
  phone: string | null
}

export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async (): Promise<ProviderRow[]> => {
      const { data, error } = await supabase
        .from('provider_profiles')
        .select(
          'profile_id, business_name, provider_type, verification_status, is_available, rating_avg, rating_count, profiles!inner(full_name, phone)',
        )
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data ?? []).map((row: any) => ({
        profile_id: row.profile_id,
        business_name: row.business_name,
        provider_type: row.provider_type,
        verification_status: row.verification_status,
        is_available: row.is_available,
        rating_avg: row.rating_avg,
        rating_count: row.rating_count,
        full_name: row.profiles?.full_name ?? '—',
        phone: row.profiles?.phone ?? null,
      }))
    },
  })
}

export function useUpdateProviderVerification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      profileId,
      status,
    }: {
      profileId: string
      status: VerificationStatus
    }) => {
      const { error } = await supabase
        .from('provider_profiles')
        .update({ verification_status: status })
        .eq('profile_id', profileId)

      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['providers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success(`Provider ${variables.status}`)
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
