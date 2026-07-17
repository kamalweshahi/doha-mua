import type { NextFunction, Request, Response } from 'express'
import authEnforce from './auth-enforce'

export default function optionalAuth(request: Request, response: Response, next: NextFunction) {
  if (!request.get('Authorization')) return next()
  return authEnforce(request, response, next)
}
