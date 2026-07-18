import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ProviderProfile } from '@/types/database'

export interface NearbyProvider extends ProviderProfile {
  lng: number
  lat: number
}

// Prototype-scope: pulls all available+verified providers with a known
// location. True proximity filtering would use PostGIS ST_DWithin against
// the customer's coordinates once volume justifies it server-side.
export function useNearbyProviders() {
  return useQuery({
    queryKey: ['nearby-providers'],
    queryFn: async (): Promise<NearbyProvider[]> => {
      const { data, error } = await supabase
        .from('provider_locations')
        .select(
          `provider_id, location, updated_at,
           provider:provider_profiles!inner(profile_id, business_name, provider_type, bio, verification_status, is_available, rating_avg, rating_count)`,
        )
        .eq('provider.verification_status', 'verified')
        .eq('provider.is_available', true)

      if (error) throw error

      return (data ?? [])
        .map((row: any) => {
          const coords = parsePostGisPoint(row.location)
          if (!coords || !row.provider) return null
          return {
            ...row.provider,
            lng: coords.lng,
            lat: coords.lat,
          } as NearbyProvider
        })
        .filter((p): p is NearbyProvider => p !== null)
    },
    refetchInterval: 20_000,
  })
}

// Supabase returns PostGIS geography as GeoJSON when selected directly.
function parsePostGisPoint(value: unknown): { lng: number; lat: number } | null {
  if (value && typeof value === 'object' && 'coordinates' in (value as any)) {
    const [lng, lat] = (value as any).coordinates
    return { lng, lat }
  }
  return null
}
