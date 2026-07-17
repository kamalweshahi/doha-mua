import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../../hooks/use-auth'
import useLanguage from '../../hooks/use-language'

export default function UserRoute() {
  const { jwt, user, isReady } = useAuth()
  const {tr}=useLanguage(); if (!isReady) return <div className="loading">{tr('accountLoading')}</div>
  if (!jwt || !user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return <Outlet />
}
