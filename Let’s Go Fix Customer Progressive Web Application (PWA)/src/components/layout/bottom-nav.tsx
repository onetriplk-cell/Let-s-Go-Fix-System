import { NavLink } from 'react-router-dom'
import { Home, Car, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/vehicles', label: 'Vehicles', icon: Car },
  { to: '/history', label: 'History', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 safe-bottom sm:hidden dark:border-slate-800">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-600',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5', isActive && 'fill-brand-100 dark:fill-brand-500/20')} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
