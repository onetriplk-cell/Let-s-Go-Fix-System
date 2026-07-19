import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LogOut, MoonStar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { useThemeStore } from '@/store/theme-store'
import { TopBar } from '@/components/layout/top-bar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeToggle } from '@/components/common/theme-toggle'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  phone: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile)
  const setProfile = useAuthStore((s) => s.setProfile)
  const queryClient = useQueryClient()

  const { data: customerProfile } = useQuery({
    queryKey: ['customer-profile', profile?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('profile_id', profile!.id)
        .single()
      return data
    },
    enabled: !!profile,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name,
        phone: profile.phone ?? '',
        emergencyContactName: customerProfile?.emergency_contact_name ?? '',
        emergencyContactPhone: customerProfile?.emergency_contact_phone ?? '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, customerProfile])

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileForm) => {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: values.fullName, phone: values.phone })
        .eq('id', profile!.id)
      if (profileError) throw profileError

      const { error: customerError } = await supabase
        .from('customer_profiles')
        .update({
          emergency_contact_name: values.emergencyContactName,
          emergency_contact_phone: values.emergencyContactPhone,
        })
        .eq('profile_id', profile!.id)
      if (customerError) throw customerError

      return values
    },
    onSuccess: (values) => {
      if (profile) setProfile({ ...profile, full_name: values.fullName, phone: values.phone ?? null })
      queryClient.invalidateQueries({ queryKey: ['customer-profile'] })
      toast.success('Profile updated')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const theme = useThemeStore((s) => s.theme)

  return (
    <div>
      <TopBar title="Profile" subtitle="Manage your account" />

      <div className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:max-w-2xl sm:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Personal details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((v) => updateProfile.mutate(v))} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" {...register('fullName')} />
                {errors.fullName && <p className="text-xs text-red-600 dark:text-red-400">{errors.fullName.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emergencyContactName">Emergency contact name</Label>
                <Input id="emergencyContactName" {...register('emergencyContactName')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="emergencyContactPhone">Emergency contact phone</Label>
                <Input id="emergencyContactPhone" {...register('emergencyContactPhone')} />
              </div>
              <Button type="submit" variant="brand" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <MoonStar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Dark mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {theme === 'dark' ? 'Currently on' : 'Currently off'}
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600">Let's Go Fix — prototype build</p>
      </div>
    </div>
  )
}
