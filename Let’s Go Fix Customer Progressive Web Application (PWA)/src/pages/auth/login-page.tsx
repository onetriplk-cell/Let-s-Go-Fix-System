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

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const setProfile = useAuthStore((s) => s.setProfile)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginForm) => {
    setSubmitting(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      toast.error(error.message)
      setSubmitting(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    const role = (profile as Profile | null)?.role
    if (role !== 'customer') {
      await supabase.auth.signOut()
      toast.error('This account is not registered as a customer.')
      setSubmitting(false)
      return
    }

    setProfile(profile as Profile)
    toast.success('Welcome back')
    navigate('/home')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">
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
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl dark:text-slate-100">Let's Go Fix</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Roadside assistance, on demand</p>
        </div>

        <Card className="sm:shadow-md">
          <CardContent className="pt-5 sm:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-600 dark:text-red-400">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" variant="brand" size="lg" disabled={submitting} className="mt-2">
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              New here?{' '}
              <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
