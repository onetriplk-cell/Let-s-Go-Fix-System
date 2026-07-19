import { Outlet } from 'react-router-dom'
import { BottomNav } from './bottom-nav'
import { SidebarNav } from './sidebar-nav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 transition-colors sm:pl-60 dark:bg-slate-950">
      <SidebarNav />
      <div className="pb-20 sm:pb-0">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  )
}
