import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Wrench } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { ThemeToggle } from '@/components/common/theme-toggle'
import type { Profile } from '@/types/database'

const registerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const setProfile = useAuthStore((s) => s.setProfile)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterForm) => {
    setSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName, role: 'customer' },
      },
    })

    if (error || !data.user) {
      toast.error(error?.message ?? 'Registration failed')
      setSubmitting(false)
      return
    }

    await supabase.from('profiles').update({ phone: values.phone }).eq('id', data.user.id)

    const { error: customerError } = await supabase.from('customer_profiles').insert({
      profile_id: data.user.id,
    })

    if (customerError) {
      toast.error(customerError.message)
      setSubmitting(false)
      return
    }

    if (data.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      setProfile(profile as Profile)
      toast.success('Account created')
      navigate('/home')
    } else {
      toast.success('Account created — please sign in.')
      navigate('/login')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div
        className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-40"
        style={{
          background:
            'radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--color-brand-200) 60%, transparent) 0%, transparent 70%)',
        }}
      />

      <ThemeToggle className="absolute right-4 top-4" />

      <div className="relative w-full max-w-sm sm:max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 sm:mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm shadow-brand-600/30 sm:h-14 sm:w-14 dark:bg-brand-500">
            <Wrench className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Get help on the road, fast</p>
        </div>

        <Card className="sm:shadow-md">
          <CardContent className="pt-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" placeholder="Nimal Perera" {...register('fullName')} />
                {errors.fullName && <p className="text-xs text-red-600 dark:text-red-400">{errors.fullName.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" placeholder="+94 77 123 4567" {...register('phone')} />
                {errors.phone && <p className="text-xs text-red-600 dark:text-red-400">{errors.phone.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" variant="brand" size="lg" disabled={submitting} className="mt-2">
                {submitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
