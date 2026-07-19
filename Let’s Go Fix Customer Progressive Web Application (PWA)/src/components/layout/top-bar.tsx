import { Bell, Search } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useCommandPaletteStore } from '@/store/command-palette-store'
import { ThemeToggle } from '@/components/common/theme-toggle'

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const profile = useAuthStore((s) => s.profile)
  const openPalette = useCommandPaletteStore((s) => s.setOpen)

  return (
    <header className="glass sticky top-0 z-30 border-b border-slate-200 px-4 py-3 safe-top sm:px-8 sm:py-4 dark:border-slate-800">
      <div className="mx-auto flex max-w-md items-center justify-between sm:max-w-5xl">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 sm:text-xl dark:text-slate-100">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => openPalette(true)}
            className="flex h-9 items-center gap-2 rounded-full px-3 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Quick actions (Ctrl+K)"
          >
            <Search className="h-4 w-4" />
            <span className="hidden text-xs md:inline">Search…</span>
          </button>
          <ThemeToggle className="sm:hidden" />
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-400">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
