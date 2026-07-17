export type Role = 'student' | 'admin'

export interface JwtUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredLanguage: 'en' | 'ar'
  role: Role
  iat?: number
  exp?: number
}
