import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthListener } from '@/hooks/use-auth'
import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { useAuthStore } from '@/store/auth-store'
import { AppLayout } from '@/components/layout/app-layout'
import ProtectedRoute from '@/routes/protected-route'
import LoginPage from '@/pages/auth/login-page'
import DashboardPage from '@/pages/dashboard/dashboard-page'
import CustomersPage from '@/pages/customers/customers-page'
import ProvidersPage from '@/pages/providers/providers-page'
import BookingsPage from '@/pages/bookings/bookings-page'
import ServicesPage from '@/pages/services/services-page'
import ComplaintsPage from '@/pages/complaints/complaints-page'
import SettingsPage from '@/pages/settings/settings-page'

function App() {
  useAuthListener()
  const isAuthenticated = useAuthStore((s) => !!s.profile)
  useRealtimeSync(isAuthenticated)

  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/complaints" element={<ComplaintsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App
