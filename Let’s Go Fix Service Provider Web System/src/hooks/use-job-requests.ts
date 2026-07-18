import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { BookingStatus } from '@/types/database'

export interface JobRow {
  id: string
  status: BookingStatus
  pickup_address: string | null
  description: string | null
  quoted_price: number | null
  final_price: number | null
  requested_at: string
  customer_name: string
  customer_phone: string | null
  category_name: string
  vehicle_label: string
}

async function fetchJobs(providerId: string, filter: 'open' | 'mine') {
  let query = supabase
    .from('service_requests')
    .select(
      `id, status, pickup_address, description, quoted_price, final_price, requested_at,
       customer:customer_profiles!inner(profiles!inner(full_name, phone)),
       category:service_categories!inner(name),
       vehicle:vehicles!inner(make, model, plate_number)`,
    )
    .order('requested_at', { ascending: false })

  if (filter === 'open') {
    query = query.is('provider_id', null).eq('status', 'requested')
  } else {
    query = query.eq('provider_id', providerId)
  }

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((row: any) => ({
    id: row.id,
    status: row.status,
    pickup_address: row.pickup_address,
    description: row.description,
    quoted_price: row.quoted_price,
    final_price: row.final_price,
    requested_at: row.requested_at,
    customer_name: row.customer?.profiles?.full_name ?? '—',
    customer_phone: row.customer?.profiles?.phone ?? null,
    category_name: row.category?.name ?? '—',
    vehicle_label: row.vehicle
      ? `${row.vehicle.make} ${row.vehicle.model} (${row.vehicle.plate_number})`
      : '—',
  })) as JobRow[]
}

export function useOpenJobs() {
  const providerProfile = useAuthStore((s) => s.providerProfile)
  return useQuery({
    queryKey: ['job-requests', 'open'],
    queryFn: () => fetchJobs(providerProfile!.profile_id, 'open'),
    enabled: !!providerProfile,
    refetchInterval: 15_000,
  })
}

export function useMyJobs() {
  const providerProfile = useAuthStore((s) => s.providerProfile)
  return useQuery({
    queryKey: ['job-requests', 'mine'],
    queryFn: () => fetchJobs(providerProfile!.profile_id, 'mine'),
    enabled: !!providerProfile,
  })
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient()
  const providerProfile = useAuthStore((s) => s.providerProfile)

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const updates: Record<string, unknown> = { status }
      if (status === 'accepted') {
        updates.provider_id = providerProfile?.profile_id
        updates.accepted_at = new Date().toISOString()
      }
      if (status === 'completed') updates.completed_at = new Date().toISOString()

      const { error } = await supabase.from('service_requests').update(updates).eq('id', id)
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-requests'] })
      queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] })
      const label = variables.status.replaceAll('_', ' ')
      toast.success(`Job marked as ${label}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
