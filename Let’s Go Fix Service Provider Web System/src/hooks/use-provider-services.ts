import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { ServiceCategory } from '@/types/database'

export interface CategoryWithOffering extends ServiceCategory {
  offering_id: string | null
  is_offered: boolean
  custom_price: number | null
}

export function useProviderServices() {
  const providerProfile = useAuthStore((s) => s.providerProfile)

  return useQuery({
    queryKey: ['provider-services', providerProfile?.profile_id],
    queryFn: async (): Promise<CategoryWithOffering[]> => {
      const providerId = providerProfile!.profile_id

      const [{ data: categories, error: catError }, { data: offerings, error: offError }] = await Promise.all([
        supabase
          .from('service_categories')
          .select('*')
          .eq('provider_type', providerProfile!.provider_type)
          .order('name'),
        supabase.from('provider_services').select('*').eq('provider_id', providerId),
      ])

      if (catError) throw catError
      if (offError) throw offError

      const offeringMap = new Map((offerings ?? []).map((o) => [o.category_id, o]))

      return (categories ?? []).map((c) => {
        const offering = offeringMap.get(c.id)
        return {
          ...c,
          offering_id: offering?.id ?? null,
          is_offered: offering?.is_active ?? false,
          custom_price: offering?.price ?? null,
        }
      })
    },
    enabled: !!providerProfile,
  })
}

export function useToggleServiceOffering() {
  const queryClient = useQueryClient()
  const providerProfile = useAuthStore((s) => s.providerProfile)

  return useMutation({
    mutationFn: async ({
      category,
      enable,
    }: {
      category: CategoryWithOffering
      enable: boolean
    }) => {
      const providerId = providerProfile!.profile_id

      if (category.offering_id) {
        const { error } = await supabase
          .from('provider_services')
          .update({ is_active: enable })
          .eq('id', category.offering_id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('provider_services').insert({
          provider_id: providerId,
          category_id: category.id,
          is_active: enable,
        })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
