import type { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'crypto'

declare global {
  namespace Express {
    interface Request {
      eventId?: string
    }
  }
}

export default function logError(error: unknown, request: Request, response: Response, next: NextFunction) {
  request.eventId = randomUUID()
  console.error(`[${request.eventId}]`, error)
  next(error)
}
