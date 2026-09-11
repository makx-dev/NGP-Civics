import { Navigate, Outlet } from 'react-router-dom'
import { getAuth, getToken, isTokenExpired, clearAuth } from '../lib/auth'

export default function ProtectedRoute({ role }) {
  const token = getToken()
  const auth = getAuth()

  if (!token || isTokenExpired(token) || !auth || auth.role !== role) {
    clearAuth()
    return <Navigate to="/auth" replace />
  }
  return <Outlet />
}
