import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Auth from './pages/Auth'
import CitizenDashboard from './pages/CitizenDashboard'
import Dashboard from './pages/Dashboard'
import MyIssues from './pages/MyIssues'
import ReportIssue from './pages/ReportIssue'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<ProtectedRoute role="user" />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/issues" element={<MyIssues />} />
          <Route path="/issues/:id" element={<MyIssues />} />
          <Route path="/citizen/report" element={<ReportIssue />} />
        </Route>
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/dashboard" element={<Dashboard role="Authority" />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
