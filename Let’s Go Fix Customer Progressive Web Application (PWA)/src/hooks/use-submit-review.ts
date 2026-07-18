import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'

interface SubmitReviewInput {
  requestId: string
  providerId: string
  rating: number
  comment?: string
}

export function useSubmitReview() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)

  return useMutation({
    mutationFn: async (input: SubmitReviewInput) => {
      const { error } = await supabase.from('reviews').insert({
        request_id: input.requestId,
        customer_id: profile!.id,
        provider_id: input.providerId,
        rating: input.rating,
        comment: input.comment,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['request-history'] })
      toast.success('Thanks for your feedback')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
