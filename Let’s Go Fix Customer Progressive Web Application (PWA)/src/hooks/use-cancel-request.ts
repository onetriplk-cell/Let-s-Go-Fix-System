import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export function useCancelRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('service_requests')
        .update({ status: 'cancelled_by_customer', cancelled_at: new Date().toISOString() })
        .eq('id', requestId)
      if (error) throw error
    },
    onSuccess: (_data, requestId) => {
      queryClient.invalidateQueries({ queryKey: ['track-request', requestId] })
      queryClient.invalidateQueries({ queryKey: ['active-request'] })
      queryClient.invalidateQueries({ queryKey: ['request-history'] })
      toast.success('Request cancelled')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
