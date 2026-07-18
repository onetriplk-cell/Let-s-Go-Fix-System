import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'

export default function ProtectedRoute() {
  const { profile, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">
        Loading…
      </div>
    )
  }

  if (!profile) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
