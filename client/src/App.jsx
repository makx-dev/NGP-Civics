import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/citizen/dashboard" element={<Dashboard role="Citizen" />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/dashboard" element={<Dashboard role="Authority" />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
