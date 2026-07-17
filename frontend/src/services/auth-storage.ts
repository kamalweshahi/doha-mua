import type { JwtUser } from '../models/JwtUser'

const SESSION_KEY = 'doha-mua.auth.session.v1'
const OLD_SESSION_KEY = 'voyanta.auth.session.v2'
const LEGACY_JWT_KEY = 'jwt'
const LEGACY_CURRENT_JWT_KEY = 'voyanta.auth.jwt'

type StoredSession = {
  jwt: string
  user: JwtUser
}

function clearLegacyTokens() {
  sessionStorage.removeItem(LEGACY_JWT_KEY)
  sessionStorage.removeItem(LEGACY_CURRENT_JWT_KEY)
  localStorage.removeItem(LEGACY_JWT_KEY)
  localStorage.removeItem(LEGACY_CURRENT_JWT_KEY)
}

export function getStoredSession(): StoredSession | undefined {
  const raw = sessionStorage.getItem(SESSION_KEY) || sessionStorage.getItem(OLD_SESSION_KEY)
  if (!raw) return undefined

  try {
    const parsed = JSON.parse(raw) as StoredSession
    if (!parsed.jwt || !parsed.user || !Number.isFinite(Number(parsed.user.id))) return undefined
    sessionStorage.setItem(SESSION_KEY, raw)
    sessionStorage.removeItem(OLD_SESSION_KEY)
    return parsed
  } catch {
    return undefined
  }
}

export function getStoredJwt() {
  return getStoredSession()?.jwt || ''
}

export function storeSession(jwt: string, user: JwtUser) {
  if (!jwt || !user) throw new Error('The server returned an invalid session.')
  clearLegacyTokens()
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ jwt, user } satisfies StoredSession))
}

export function clearStoredSession() {
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(OLD_SESSION_KEY)
  clearLegacyTokens()
}

// Auth is deliberately kept in sessionStorage so every browser tab can stay
// signed in with a different account. Nothing is shared through localStorage.
export function cleanLegacyAuthStorage() {
  clearLegacyTokens()
}
