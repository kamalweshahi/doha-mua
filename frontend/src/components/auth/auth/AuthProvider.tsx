import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import type { JwtUser } from '../../../models/JwtUser'
import { getCurrentUser } from '../../../services/auth-service'
import { normalizeJwtUser } from '../../../services/auth-routing'
import { cleanLegacyAuthStorage, clearStoredSession, getStoredSession, storeSession } from '../../../services/auth-storage'
import AuthContext from './AuthContext'

function sameAccount(left: JwtUser, right: JwtUser) {
  return Number(left.id) === Number(right.id) && String(left.email ?? '').trim().toLowerCase() === String(right.email ?? '').trim().toLowerCase()
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const [restored] = useState(() => getStoredSession())
  const [jwt, setJwt] = useState(restored?.jwt || '')
  const [user, setUser] = useState<JwtUser | undefined>(restored ? normalizeJwtUser(restored.user) : undefined)
  const [isReady, setIsReady] = useState(!restored)
  const sessionVersion = useRef(0)

  const saveSession = useCallback((newJwt: string, sessionUser: JwtUser) => {
    sessionVersion.current += 1
    if (!newJwt || !sessionUser) throw new Error('The server returned an invalid session.')

    const normalizedUser = normalizeJwtUser(sessionUser)
    storeSession(newJwt, normalizedUser)
    setJwt(newJwt)
    setUser(normalizedUser)
    setIsReady(true)
  }, [])

  const logout = useCallback(() => {
    sessionVersion.current += 1
    clearStoredSession()
    setJwt('')
    setUser(undefined)
    setIsReady(true)
  }, [])

  // On refresh, restore both the JWT and the exact account/role from this tab
  // before validating with the server. This prevents an admin tab from being
  // redirected to the user area while another tab is signed in as a user.
  useEffect(() => {
    cleanLegacyAuthStorage()
    const stored = getStoredSession()

    if (!stored) {
      setIsReady(true)
      return
    }

    let active = true
    const bootstrapVersion = sessionVersion.current
    const storedUser = normalizeJwtUser(stored.user)

    setJwt(stored.jwt)
    setUser(storedUser)

    void getCurrentUser(stored.jwt)
      .then(currentUserValue => {
        if (!active || sessionVersion.current !== bootstrapVersion) return

        const currentUser = normalizeJwtUser(currentUserValue)
        if (!sameAccount(storedUser, currentUser)) {
          clearStoredSession()
          setJwt('')
          setUser(undefined)
          setIsReady(true)
          return
        }

        // The server remains authoritative for the role, but the session is
        // updated atomically so route guards never see a temporary user role.
        storeSession(stored.jwt, currentUser)
        setUser(currentUser)
        setIsReady(true)
      })
      .catch(() => {
        if (!active || sessionVersion.current !== bootstrapVersion) return
        clearStoredSession()
        setJwt('')
        setUser(undefined)
        setIsReady(true)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const expireSession = () => logout()
    window.addEventListener('doha-mua:session-expired', expireSession)
    return () => window.removeEventListener('doha-mua:session-expired', expireSession)
  }, [logout])

  const value = useMemo(
    () => ({ jwt, user, isReady, saveSession, logout }),
    [jwt, user, isReady, saveSession, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
