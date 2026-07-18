import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'

export default function SettingsPage() {
  const profile = useAuthStore((s) => s.profile)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Account and system configuration</p>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Admin account</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Name</span>
            <span className="font-medium text-slate-900">{profile?.full_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Role</span>
            <span className="font-medium capitalize text-slate-900">{profile?.role?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Phone</span>
            <span className="font-medium text-slate-900">{profile?.phone ?? '—'}</span>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-slate-400">
        Prototype build — system-wide settings (categories, pricing rules, notification templates) will be added as the project scope grows.
      </p>
    </div>
  )
}
