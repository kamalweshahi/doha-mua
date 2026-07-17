import type { NextFunction, Request, Response } from 'express'
import type { ObjectSchema } from 'joi'

type JoiValidationError = Error & {
  details?: Array<{ message: string }>
}

export default function bodyValidation(schema: ObjectSchema) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      request.body = await schema.validateAsync(request.body, { abortEarly: false, stripUnknown: true })
      next()
    } catch (error) {
      const validationError = error as JoiValidationError
      next({
        status: 422,
        message: validationError.details?.map(detail => detail.message).join(' ') || 'Please check the form fields.'
      })
    }
  }
}
