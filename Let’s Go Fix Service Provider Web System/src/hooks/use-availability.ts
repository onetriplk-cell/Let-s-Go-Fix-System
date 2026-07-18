import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

export function useToggleAvailability() {
  const queryClient = useQueryClient()
  const providerProfile = useAuthStore((s) => s.providerProfile)
  const setProviderProfile = useAuthStore((s) => s.setProviderProfile)

  return useMutation({
    mutationFn: async (isAvailable: boolean) => {
      if (!providerProfile) throw new Error('No provider profile loaded')
      const { error } = await supabase
        .from('provider_profiles')
        .update({ is_available: isAvailable })
        .eq('profile_id', providerProfile.profile_id)
      if (error) throw error
      return isAvailable
    },
    onSuccess: (isAvailable) => {
      if (providerProfile) {
        setProviderProfile({ ...providerProfile, is_available: isAvailable })
      }
      queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] })
      toast.success(isAvailable ? "You're now online" : "You're now offline")
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
