import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/use-auth'
import useLanguage from '../../hooks/use-language'

export default function AdminRoute() {
  const { jwt, user, isReady } = useAuth()
  const {tr}=useLanguage(); if (!isReady) return <div className="loading">{tr('adminChecking')}</div>
  if (!jwt || !user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}
