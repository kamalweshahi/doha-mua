import { createContext } from 'react'
import type { JwtUser } from '../../../models/JwtUser'

export interface AuthContextValue {
  jwt: string
  user?: JwtUser
  isReady: boolean
  saveSession: (jwt: string, user: JwtUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export default AuthContext
