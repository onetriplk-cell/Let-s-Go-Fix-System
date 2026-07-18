import { Menu, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { useUIStore } from '@/store/ui-store'
import { useToggleAvailability } from '@/hooks/use-availability'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const profile = useAuthStore((s) => s.profile)
  const providerProfile = useAuthStore((s) => s.providerProfile)
  const toggleAvailability = useToggleAvailability()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-4">
        {providerProfile && (
          <div className="flex items-center gap-2">
            <Switch
              checked={providerProfile.is_available}
              onCheckedChange={(checked) => toggleAvailability.mutate(checked)}
              disabled={toggleAvailability.isPending || providerProfile.verification_status !== 'verified'}
            />
            <span className="text-sm text-slate-600">
              {providerProfile.is_available ? 'Online' : 'Offline'}
            </span>
            {providerProfile.verification_status !== 'verified' && (
              <Badge variant="warning" className="capitalize">
                {providerProfile.verification_status}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {providerProfile?.business_name ?? profile?.full_name ?? 'Provider'}
            </p>
            <p className="text-xs text-slate-400">{profile?.full_name}</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'P'}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
