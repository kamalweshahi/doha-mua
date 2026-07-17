import type { NextFunction, Request, Response } from 'express'
import { isAdminRole } from '../services/roles'

export default function adminEnforce(request: Request, response: Response, next: NextFunction) {
  const currentUser = request.currentUser
  if (!currentUser || !isAdminRole(currentUser.role)) {
    return next({ status: 403, message: 'Administrator access is required.' })
  }

  next()
}
