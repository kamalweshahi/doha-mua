import { useContext } from 'react'
import AuthContext from '../components/auth/auth/AuthContext'

export default function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('AuthContext is missing')
  return auth
}
