import type { Request, Response } from 'express'
import { sign } from 'jsonwebtoken'
import authEnforce from './auth-enforce'
import config from '../config'
import User, { Role } from '../models/User'

describe('auth enforcement middleware', () => {
  afterEach(() => jest.restoreAllMocks())

  it('passes a 401 error when the authorization header is missing', async () => {
    const request = { get: jest.fn().mockReturnValue(undefined) } as unknown as Request
    const response = {} as Response
    const next = jest.fn()

    await authEnforce(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 401, message: 'Please login first.' })
  })

  it('passes a 401 error when the Bearer mechanism is missing', async () => {
    const request = { get: jest.fn().mockReturnValue('invalid-token') } as unknown as Request
    const response = {} as Response
    const next = jest.fn()

    await authEnforce(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 401, message: 'Invalid authorization header.' })
  })

  it('passes a 401 error when the JWT is invalid', async () => {
    const request = { get: jest.fn().mockReturnValue('Bearer invalid-jwt') } as unknown as Request
    const response = {} as Response
    const next = jest.fn()

    await authEnforce(request, response, next)

    expect(next).toHaveBeenCalledWith({
      status: 401,
      message: 'Your session is invalid. Please login again.'
    })
  })

  it('loads the user session and calls next without an error for a valid JWT', async () => {
    const values = {
      id: 7,
      firstName: 'Demo',
      lastName: 'Traveler',
      email: 'demo@example.com',
      phone: '',
      preferredLanguage: 'en' as const,
      role: Role.Student
    }
    const user = { get: (key?: string) => key ? values[key as keyof typeof values] : values } as unknown as User
    jest.spyOn(User, 'findByPk').mockResolvedValue(user)

    const jwt = sign({ sub: '7' }, config.app.jwtKey)
    const request = { get: jest.fn().mockReturnValue(`Bearer ${jwt}`) } as unknown as Request
    const response = {} as Response
    const next = jest.fn()

    await authEnforce(request, response, next)

    expect(User.findByPk).toHaveBeenCalledWith(7)
    expect(request.currentUser).toEqual(values)
    expect(next).toHaveBeenCalledWith()
  })
})
