import User, { Role } from '../models/User'
import { hashPassword } from '../utils/password'

export const ADMIN_EMAIL = 'admin@doha-mua.local'
export const USER_EMAIL = 'student@doha-mua.local'

/**
 * Keeps the documented demo accounts deterministic even when Docker reuses
 * a database volume created by an older build or the password key changes.
 */
export async function ensureDemoAccounts() {
  const [admin] = await User.findOrCreate({
    where: { email: ADMIN_EMAIL },
    defaults: {
      firstName: 'Amelia',
      lastName: 'Rose',
      email: ADMIN_EMAIL,
      password: hashPassword('Admin1234'),
      role: Role.Admin
    }
  })

  admin.firstName = 'Amelia'
  admin.lastName = 'Rose'
  admin.password = hashPassword('Admin1234')
  admin.role = Role.Admin
  await admin.save()
  await admin.reload()

  const [user] = await User.findOrCreate({
    where: { email: USER_EMAIL },
    defaults: {
      firstName: 'Sofia',
      lastName: 'Levy',
      email: USER_EMAIL,
      password: hashPassword('User1234'),
      role: Role.Student
    }
  })

  user.firstName = 'Sofia'
  user.lastName = 'Levy'
  user.password = hashPassword('User1234')
  user.role = Role.Student
  await user.save()
  await user.reload()
}
