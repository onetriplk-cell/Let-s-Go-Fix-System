import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthListener } from '@/hooks/use-auth'
import { AppLayout } from '@/components/layout/app-layout'
import ProtectedRoute from '@/routes/protected-route'
import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'
import DashboardPage from '@/pages/dashboard/dashboard-page'
import RequestsPage from '@/pages/requests/requests-page'
import ServicesPage from '@/pages/services/services-page'
import EarningsPage from '@/pages/earnings/earnings-page'
import ProfilePage from '@/pages/profile/profile-page'

function App() {
  useAuthListener()

  return (
    <>
      <Toaster richColors position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App
