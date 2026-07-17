import type { NextFunction, Request, Response } from 'express'
import { MulterError } from 'multer'
import { UniqueConstraintError, ValidationError } from 'sequelize'

type HttpError = Error & { status?: number }

export default function respondError(error: HttpError, request: Request, response: Response, next: NextFunction) {
  if (error instanceof UniqueConstraintError) {
    const fields = Object.keys(error.fields || {})
    const message = fields.includes('email') ? 'Email is already in use.' : 'This record already exists.'
    return response.status(409).json({ message })
  }

  if (error instanceof ValidationError) {
    return response.status(422).json({ message: 'Please check the values you entered.' })
  }

  if (error instanceof MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE'
      ? 'Image cannot be larger than 5 MB.'
      : 'The image upload could not be completed.'
    return response.status(422).json({ message })
  }

  if (error?.message === 'Only image files are allowed.') {
    return response.status(422).json({ message: error.message })
  }

  response.status(error.status || 500).json({
    message: error.message || `Something went wrong. Event id: ${request.eventId}`
  })
}
