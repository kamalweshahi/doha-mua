import { Role } from '../models/User'
import { isAdminRole, normalizeRole } from './roles'

describe('role normalization', () => {
  it('accepts the admin enum and normalized admin strings', () => {
    expect(normalizeRole(Role.Admin)).toBe(Role.Admin)
    expect(normalizeRole(' ADMIN ')).toBe(Role.Admin)
    expect(isAdminRole('admin')).toBe(true)
  })

  it('defaults unknown values to user', () => {
    expect(normalizeRole(undefined)).toBe(Role.Student)
    expect(normalizeRole('manager')).toBe(Role.Student)
  })
})
