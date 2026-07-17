import type { NextFunction, Request, Response } from 'express'
import { JsonWebTokenError, TokenExpiredError, verify, type JwtPayload as LibraryJwtPayload } from 'jsonwebtoken'
import config from '../config'
import User, { Role } from '../models/User'
import { getSafeUserSession } from '../services/user-session'

export interface JwtUser {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  preferredLanguage: 'en' | 'ar'
  role: Role
}

type SessionPayload = LibraryJwtPayload & {
  sub?: string
  id?: number | string
  userId?: number | string
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: JwtUser
    }
  }
}

function getUserId(payload: SessionPayload) {
  const rawId = payload.sub ?? payload.id ?? payload.userId
  const userId = Number(rawId)
  return Number.isInteger(userId) && userId > 0 ? userId : undefined
}

export default async function authEnforce(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.get('Authorization')

  if (!authHeader) return next({ status: 401, message: 'Please login first.' })
  if (!authHeader.startsWith('Bearer ')) return next({ status: 401, message: 'Invalid authorization header.' })

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) return next({ status: 401, message: 'Please login first.' })

  let payload: SessionPayload

  try {
    const decoded = verify(token, config.app.jwtKey)
    if (typeof decoded === 'string') {
      return next({ status: 401, message: 'Your session is invalid. Please login again.' })
    }
    payload = decoded as SessionPayload
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next({ status: 401, message: 'Your session expired. Please login again.' })
    }
    if (error instanceof JsonWebTokenError) {
      return next({ status: 401, message: 'Your session is invalid. Please login again.' })
    }
    return next(error)
  }

  const userId = getUserId(payload)
  if (!userId) {
    return next({ status: 401, message: 'Your session is invalid. Please login again.' })
  }

  try {
    const user = await User.findByPk(userId)
    if (!user) {
      return next({ status: 401, message: 'This account is no longer available. Please login again.' })
    }
    if (user.isBlocked) return next({ status: 403, message: 'This account is blocked. Please contact DOHA MUA.' })

    // Always read model values through Sequelize's accessor. This is robust
    // when instances come from an older schema/volume or when decorated model
    // fields are not exposed as direct JavaScript properties.
    let sessionUser = getSafeUserSession(user)

    request.currentUser = sessionUser

    return next()
  } catch (error) {
    return next(error)
  }
}
