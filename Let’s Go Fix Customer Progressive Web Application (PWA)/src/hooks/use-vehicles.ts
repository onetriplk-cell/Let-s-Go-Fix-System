import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { Vehicle, VehicleType } from '@/types/database'

export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicle-types'],
    queryFn: async (): Promise<VehicleType[]> => {
      const { data, error } = await supabase.from('vehicle_types').select('*').order('name')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useVehicles() {
  const profile = useAuthStore((s) => s.profile)
  return useQuery({
    queryKey: ['vehicles', profile?.id],
    queryFn: async (): Promise<Vehicle[]> => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', profile!.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!profile,
  })
}

export interface NewVehicleInput {
  vehicleTypeId: string
  make: string
  model: string
  year?: number
  plateNumber: string
  color?: string
}

export function useAddVehicle() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)

  return useMutation({
    mutationFn: async (input: NewVehicleInput) => {
      const { error } = await supabase.from('vehicles').insert({
        customer_id: profile!.id,
        vehicle_type_id: input.vehicleTypeId,
        make: input.make,
        model: input.model,
        year: input.year,
        plate_number: input.plateNumber,
        color: input.color,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Vehicle added')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useSetPrimaryVehicle() {
  const queryClient = useQueryClient()
  const profile = useAuthStore((s) => s.profile)

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      await supabase
        .from('vehicles')
        .update({ is_primary: false })
        .eq('customer_id', profile!.id)
      const { error } = await supabase
        .from('vehicles')
        .update({ is_primary: true })
        .eq('id', vehicleId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Primary vehicle updated')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (vehicleId: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', vehicleId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] })
      toast.success('Vehicle removed')
    },
    onError: (error: Error) => toast.error(error.message),
  })
}
