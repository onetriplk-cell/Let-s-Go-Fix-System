import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

export interface CreateRequestInput {
  vehicleId: string
  categoryId: string
  lng: number
  lat: number
  address: string
  description?: string
}

export function useCreateRequest() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)

  return useMutation({
    mutationFn: async (input: CreateRequestInput) => {
      const { data, error } = await supabase
        .from('service_requests')
        .insert({
          customer_id: profile!.id,
          vehicle_id: input.vehicleId,
          category_id: input.categoryId,
          pickup_location: `POINT(${input.lng} ${input.lat})`,
          pickup_address: input.address,
          description: input.description,
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-request'] })
      queryClient.invalidateQueries({ queryKey: ['request-history'] })
      toast.success('Request submitted — finding you help nearby')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
