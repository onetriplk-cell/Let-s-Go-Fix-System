import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const profileSchema = z.object({
  businessName: z.string().min(2, 'Enter your business name'),
  bio: z.string().optional(),
  phone: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

const VERIFICATION_VARIANT = {
  pending: 'warning',
  verified: 'success',
  rejected: 'destructive',
  suspended: 'destructive',
} as const

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)
  const providerProfile = useAuthStore((s) => s.providerProfile)
  const setProviderProfile = useAuthStore((s) => s.setProviderProfile)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (providerProfile && profile) {
      reset({
        businessName: providerProfile.business_name,
        bio: providerProfile.bio ?? '',
        phone: profile.phone ?? '',
      })
    }
  }, [providerProfile, profile, reset])

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileForm) => {
      if (!providerProfile || !profile) throw new Error('Not loaded')

      const { error: providerError } = await supabase
        .from('provider_profiles')
        .update({ business_name: values.businessName, bio: values.bio })
        .eq('profile_id', providerProfile.profile_id)
      if (providerError) throw providerError

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone: values.phone })
        .eq('id', profile.id)
      if (profileError) throw profileError

      return values
    },
    onSuccess: (values) => {
      if (providerProfile) {
        setProviderProfile({ ...providerProfile, business_name: values.businessName, bio: values.bio ?? null })
      }
      queryClient.invalidateQueries({ queryKey: ['provider-dashboard'] })
      toast.success('Profile updated')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500">Manage your business information</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Business details</CardTitle>
          {providerProfile && (
            <Badge variant={VERIFICATION_VARIANT[providerProfile.verification_status]} className="capitalize">
              {providerProfile.verification_status}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => updateProfile.mutate(v))} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="businessName">Business name</Label>
              <Input id="businessName" {...register('businessName')} />
              {errors.businessName && <p className="text-xs text-red-600">{errors.businessName.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <Input id="phone" {...register('phone')} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">About your business</Label>
              <textarea
                id="bio"
                rows={3}
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                {...register('bio')}
              />
            </div>

            <div className="flex flex-col gap-1 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
              <span>Provider type: <span className="font-medium capitalize text-slate-700">{providerProfile?.provider_type.replaceAll('_', ' ')}</span></span>
              <span>Rating: <span className="font-medium text-slate-700">{providerProfile?.rating_avg.toFixed(1)} ({providerProfile?.rating_count} reviews)</span></span>
            </div>

            <Button type="submit" variant="brand" disabled={updateProfile.isPending} className="self-start">
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
