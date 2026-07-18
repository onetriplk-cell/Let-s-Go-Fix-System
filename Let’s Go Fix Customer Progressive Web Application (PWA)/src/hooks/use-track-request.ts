import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface TrackedRequest {
  id: string
  status: string
  pickup_address: string | null
  pickup_lng: number | null
  pickup_lat: number | null
  description: string | null
  quoted_price: number | null
  final_price: number | null
  requested_at: string
  provider: {
    profile_id: string
    business_name: string
    provider_type: string
    rating_avg: number
  } | null
  providerLocation: { lng: number; lat: number } | null
}

export function useTrackRequest(requestId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['track-request', requestId],
    queryFn: async (): Promise<TrackedRequest> => {
      const { data, error } = await supabase
        .from('service_requests')
        .select(
          `id, status, pickup_address, pickup_location, description, quoted_price, final_price, requested_at,
           provider:provider_profiles(profile_id, business_name, provider_type, rating_avg)`,
        )
        .eq('id', requestId!)
        .single()

      if (error) throw error

      const pickupCoords = parsePoint(data.pickup_location)

      let providerLocation: { lng: number; lat: number } | null = null
      if (data.provider) {
        const { data: locData } = await supabase
          .from('provider_locations')
          .select('location')
          .eq('provider_id', (data.provider as any).profile_id)
          .maybeSingle()
        providerLocation = locData ? parsePoint(locData.location) : null
      }

      return {
        id: data.id,
        status: data.status,
        pickup_address: data.pickup_address,
        pickup_lng: pickupCoords?.lng ?? null,
        pickup_lat: pickupCoords?.lat ?? null,
        description: data.description,
        quoted_price: data.quoted_price,
        final_price: data.final_price,
        requested_at: data.requested_at,
        provider: (data.provider as any) ?? null,
        providerLocation,
      }
    },
    enabled: !!requestId,
    refetchInterval: 8_000,
  })

  useEffect(() => {
    if (!requestId) return
    const channel = supabase
      .channel(`track-request-${requestId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'service_requests', filter: `id=eq.${requestId}` },
        () => queryClient.invalidateQueries({ queryKey: ['track-request', requestId] }),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'provider_locations' },
        () => queryClient.invalidateQueries({ queryKey: ['track-request', requestId] }),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [requestId, queryClient])

  return query
}

function parsePoint(value: unknown): { lng: number; lat: number } | null {
  if (value && typeof value === 'object' && 'coordinates' in (value as any)) {
    const [lng, lat] = (value as any).coordinates
    return { lng, lat }
  }
  return null
}
