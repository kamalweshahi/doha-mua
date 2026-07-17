import type { JwtUser } from '../models/JwtUser'
import { normalizeJwtUser } from './auth-routing'
import http from './http'

export type RegisterPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type AuthSession = {
  jwt: string
  user: JwtUser
}

function normalizeAuthSession(session: AuthSession): AuthSession {
  if (!session.jwt || !session.user) throw new Error('The server returned an invalid session.')
  return { jwt: session.jwt, user: normalizeJwtUser(session.user) }
}

export async function register(payload: RegisterPayload) {
  const response = await http.post<AuthSession>('/auth/register', payload)
  return normalizeAuthSession(response.data)
}

export async function login(payload: LoginPayload) {
  const response = await http.post<AuthSession>('/auth/login', payload)
  return normalizeAuthSession(response.data)
}

export async function googleLogin(credential: string) {
  const response = await http.post<AuthSession>('/auth/google', { credential })
  return normalizeAuthSession(response.data)
}

export async function getCurrentUser(jwt?: string) {
  const response = await http.get<JwtUser>('/auth/me', jwt ? {
    headers: { Authorization: `Bearer ${jwt}` }
  } : undefined)
  return response.data
}

export async function updateProfile(payload: Pick<JwtUser, 'firstName' | 'lastName' | 'phone' | 'preferredLanguage'>) { return (await http.put<JwtUser>('/auth/profile', payload)).data }
export async function changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) { await http.put('/auth/password', payload) }
