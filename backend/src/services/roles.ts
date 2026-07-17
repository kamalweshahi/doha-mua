import { Role } from '../models/User'

export function normalizeRole(value: unknown): Role {
  return String(value ?? '').trim().toLowerCase() === Role.Admin
    ? Role.Admin
    : Role.Student
}

export function isAdminRole(value: unknown) {
  return normalizeRole(value) === Role.Admin
}
