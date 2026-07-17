import type { JwtUser, Role } from '../models/JwtUser'

function normalizeRole(value: unknown): Role {
  return String(value).toLowerCase() === 'admin' ? 'admin' : 'student'
}

export function normalizeJwtUser(value: JwtUser): JwtUser {
  const candidate = (value ?? {}) as Partial<JwtUser>
  return {
    id: Number(candidate.id),
    firstName: String(candidate.firstName ?? '').trim(),
    lastName: String(candidate.lastName ?? '').trim(),
    email: String(candidate.email ?? '').trim().toLowerCase(),
    phone: String(candidate.phone ?? '').trim(),
    preferredLanguage: candidate.preferredLanguage === 'ar' ? 'ar' : 'en',
    role: normalizeRole(candidate.role),
    exp: candidate.exp
  }
}

export function getUserHomePath(user: Pick<JwtUser, 'role'>) {
  return user.role === 'admin' ? '/admin' : '/dashboard'
}
