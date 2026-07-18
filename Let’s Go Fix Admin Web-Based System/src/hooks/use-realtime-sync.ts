import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

const TABLE_QUERY_KEYS: Record<string, string[][]> = {
  service_requests: [['bookings'], ['recent-bookings'], ['dashboard-stats']],
  provider_profiles: [['providers'], ['dashboard-stats']],
  customer_profiles: [['customers'], ['dashboard-stats']],
  complaints: [['complaints']],
  payments: [['dashboard-stats']],
  profiles: [['customers']],
}

// Subscribes once for the whole app and invalidates the relevant TanStack
// Query caches whenever a watched table changes, so pages update live
// without a manual refresh. Pass enabled=false to skip subscribing (e.g.
// while logged out).
export function useRealtimeSync(enabled: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const channel = supabase.channel('admin-realtime-sync')

    for (const table of Object.keys(TABLE_QUERY_KEYS)) {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => {
          for (const key of TABLE_QUERY_KEYS[table]) {
            queryClient.invalidateQueries({ queryKey: key })
          }
        },
      )
    }

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, enabled])
}
