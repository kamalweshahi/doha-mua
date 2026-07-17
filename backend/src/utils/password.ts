import { createHmac } from 'crypto'
import config from '../config'

export function hashPassword(password: string) {
  return createHmac('sha256', config.app.passwordKey).update(password).digest('hex')
}
