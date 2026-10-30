import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import GatePage from './pages/GatePage'
import WalkInPage from './pages/WalkInPage'
import HousingPage from './pages/HousingPage'
import AttendeesPage from './pages/AttendeesPage'

function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#111827', color: '#f3f4f6', border: '1px solid #374151' },
          success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#111827' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="gate" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN','GATE_STAFF']}>
              <GatePage />
            </ProtectedRoute>
          } />
          <Route path="walk-in" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN','REGISTRATION_STAFF']}>
              <WalkInPage />
            </ProtectedRoute>
          } />
          <Route path="housing" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN','HOUSING_STAFF']}>
              <HousingPage />
            </ProtectedRoute>
          } />
          <Route path="attendees" element={<AttendeesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
