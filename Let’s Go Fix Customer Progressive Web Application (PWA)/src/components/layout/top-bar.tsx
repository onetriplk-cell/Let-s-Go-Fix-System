import { Bell } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const profile = useAuthStore((s) => s.profile)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur safe-top">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
