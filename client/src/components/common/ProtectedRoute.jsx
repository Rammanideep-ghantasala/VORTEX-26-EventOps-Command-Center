import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (allowedRoles && !hasRole(...allowedRoles)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="glass-card p-8 text-center">
          <p className="text-rose-400 text-lg font-semibold">Access Denied</p>
          <p className="text-gray-400 text-sm mt-1">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }
  return children
}

