import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Wrench,
  ClipboardList,
  Tags,
  AlertTriangle,
  Settings,
  Wrench as Logo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui-store'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/providers', label: 'Providers', icon: Wrench },
  { to: '/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/services', label: 'Service Categories', icon: Tags },
  { to: '/complaints', label: 'Complaints', icon: AlertTriangle },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-slate-200 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Logo className="h-4 w-4" />
        </div>
        {sidebarOpen && (
          <span className="truncate text-sm font-semibold text-slate-900">Let's Go Fix</span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 scrollbar-thin">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
