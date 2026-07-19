import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'sonner'
import { useAuthListener } from '@/hooks/use-auth'
import { AppLayout } from '@/components/layout/app-layout'
import { PageFade } from '@/components/common/motion'
import { CommandPalette } from '@/components/common/command-palette'
import ProtectedRoute from '@/routes/protected-route'
import LoginPage from '@/pages/auth/login-page'
import RegisterPage from '@/pages/auth/register-page'
import HomePage from '@/pages/home/home-page'
import VehiclesPage from '@/pages/vehicles/vehicles-page'
import RequestPage from '@/pages/request/request-page'
import TrackingPage from '@/pages/tracking/tracking-page'
import HistoryPage from '@/pages/history/history-page'
import ProfilePage from '@/pages/profile/profile-page'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/request" element={<PageFade><RequestPage /></PageFade>} />
          <Route path="/tracking/:requestId" element={<PageFade><TrackingPage /></PageFade>} />

          <Route element={<AppLayout />}>
            <Route path="/home" element={<PageFade><HomePage /></PageFade>} />
            <Route path="/vehicles" element={<PageFade><VehiclesPage /></PageFade>} />
            <Route path="/history" element={<PageFade><HistoryPage /></PageFade>} />
            <Route path="/profile" element={<PageFade><ProfilePage /></PageFade>} />
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  useAuthListener()

  return (
    <>
      <Toaster richColors position="top-center" />
      <CommandPalette />
      <AnimatedRoutes />
    </>
  )
}

export default App
