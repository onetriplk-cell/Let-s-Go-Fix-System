import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthListener } from '@/hooks/use-auth'
import { AppLayout } from '@/components/layout/app-layout'
import ProtectedRoute from '@/routes/protected-route'
import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'
import HomePage from '@/pages/home/home-page'
import VehiclesPage from '@/pages/vehicles/vehicles-page'
import RequestPage from '@/pages/request/request-page'
import TrackingPage from '@/pages/tracking/tracking-page'
import HistoryPage from '@/pages/history/history-page'
import ProfilePage from '@/pages/profile/profile-page'

function App() {
  useAuthListener()

  return (
    <>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/request" element={<RequestPage />} />
          <Route path="/tracking/:requestId" element={<TrackingPage />} />

          <Route element={<AppLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </>
  )
}

export default App
