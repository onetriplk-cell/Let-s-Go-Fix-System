import { Outlet } from 'react-router-dom'
import { BottomNav } from './bottom-nav'

export function AppLayout() {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-50 pb-20">
      <Outlet />
      <BottomNav />
    </div>
  )
}
