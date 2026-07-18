import { Menu, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import { useUIStore } from '@/store/ui-store'
import { Button } from '@/components/ui/button'

export function Topbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const profile = useAuthStore((s) => s.profile)

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">{profile?.full_name ?? 'Admin'}</p>
          <p className="text-xs capitalize text-slate-400">{profile?.role?.replace('_', ' ')}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
          {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'A'}
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
