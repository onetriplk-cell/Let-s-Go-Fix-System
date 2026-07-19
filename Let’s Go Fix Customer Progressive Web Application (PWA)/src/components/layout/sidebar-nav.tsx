import { NavLink } from 'react-router-dom'
import { Home, Car, ClipboardList, User, Wrench, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { useCommandPaletteStore } from '@/store/command-palette-store'

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/vehicles', label: 'Vehicles', icon: Car },
  { to: '/history', label: 'History', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: User },
]

export function SidebarNav() {
  const openPalette = useCommandPaletteStore((s) => s.setOpen)

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white sm:flex dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30 dark:bg-brand-500">
          <Wrench className="h-4.5 w-4.5" />
        </div>
        <span className="text-base font-semibold text-slate-900 dark:text-slate-100">Let's Go Fix</span>
      </div>

      <div className="px-3 pb-2">
        <button
          onClick={() => openPalette(true)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500 dark:hover:border-slate-700 dark:hover:text-slate-300"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" /> Search
          </span>
          <kbd className="rounded border border-slate-200 px-1 text-[10px] dark:border-slate-700">⌘K</kbd>
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600 dark:bg-brand-400" />
                )}
                <Icon className={cn('h-5 w-5', isActive && 'fill-brand-100 dark:fill-brand-500/20')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-900">
        <p className="text-xs text-slate-400 dark:text-slate-500">Let's Go Fix</p>
        <ThemeToggle />
      </div>
    </aside>
  )
}
