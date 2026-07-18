import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Wrench } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

const PROVIDER_TYPES: { value: string; label: string }[] = [
  { value: 'garage', label: 'Garage' },
  { value: 'mechanic', label: 'Mechanic' },
  { value: 'tyre_shop', label: 'Tyre Shop' },
  { value: 'battery_service', label: 'Battery Service' },
  { value: 'tow_truck', label: 'Tow Truck' },
  { value: 'fuel_delivery', label: 'Emergency Fuel Delivery' },
  { value: 'electrician', label: 'Vehicle Electrician' },
]

const registerSchema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  businessName: z.string().min(2, 'Enter your business name'),
  providerType: z.string().min(1, 'Select a service type'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterForm) => {
    setSubmitting(true)

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName, role: 'provider' },
      },
    })

    if (error || !data.user) {
      toast.error(error?.message ?? 'Registration failed')
      setSubmitting(false)
      return
    }

    // profiles row is auto-created by the handle_new_user trigger.
    // Update phone, then create the provider_profiles row.
    await supabase.from('profiles').update({ phone: values.phone }).eq('id', data.user.id)

    const { error: providerError } = await supabase.from('provider_profiles').insert({
      profile_id: data.user.id,
      business_name: values.businessName,
      provider_type: values.providerType,
    })

    if (providerError) {
      toast.error(providerError.message)
      setSubmitting(false)
      return
    }

    toast.success('Registration submitted — pending admin verification.')
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Wrench className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Let's Go Fix</h1>
          <p className="text-sm text-slate-500">Register as a Service Provider</p>
        </div>

        <Card>
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">Your full name</Label>
                <Input id="fullName" placeholder="Kasun Perera" {...register('fullName')} />
                {errors.fullName && <p className="text-xs text-red-600">{errors.fullName.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="businessName">Business name</Label>
                <Input id="businessName" placeholder="Kasun Auto Garage" {...register('businessName')} />
                {errors.businessName && (
                  <p className="text-xs text-red-600">{errors.businessName.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="providerType">Service type</Label>
                <Controller
                  name="providerType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="providerType">
                        <SelectValue placeholder="Select a service type" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.providerType && (
                  <p className="text-xs text-red-600">{errors.providerType.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" placeholder="+94 77 123 4567" {...register('phone')} />
                {errors.phone && <p className="text-xs text-red-600">{errors.phone.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@garage.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" variant="brand" disabled={submitting} className="mt-2">
                {submitting ? 'Submitting…' : 'Register'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-slate-500">
              Already registered?{' '}
              <Link to="/login" className="font-medium text-brand-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
