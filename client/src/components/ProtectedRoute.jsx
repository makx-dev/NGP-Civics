import { Navigate, Outlet } from 'react-router-dom'
import { getAuth, getToken } from '../lib/auth'

export default function ProtectedRoute({ role }) {
  const auth = getAuth()
  if (!getToken() || !auth || auth.role !== role) return <Navigate to="/auth" replace />
  return <Outlet />
}
