import type { NextFunction, Request, Response } from 'express'
import adminEnforce from './admin-enforce'
import { Role } from '../models/User'

describe('admin enforcement middleware', () => {
  const response = {} as Response

  it('passes a 403 error when no authenticated user exists', () => {
    const request = {} as Request
    const next = jest.fn() as NextFunction

    adminEnforce(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 403, message: 'Administrator access is required.' })
  })

  it('passes a 403 error for a regular user', () => {
    const request = {
      currentUser: {
        id: 2,
        firstName: 'Demo',
        lastName: 'Traveler',
        email: 'user@doha-mua.local',
        role: Role.Student
      }
    } as Request
    const next = jest.fn() as NextFunction

    adminEnforce(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 403, message: 'Administrator access is required.' })
  })

  it('calls next without an error for an administrator', () => {
    const request = {
      currentUser: {
        id: 1,
        firstName: 'Kamal',
        lastName: 'Weshahi',
        email: 'admin@doha-mua.local',
        role: Role.Admin
      }
    } as Request
    const next = jest.fn() as NextFunction

    adminEnforce(request, response, next)

    expect(next).toHaveBeenCalledWith()
  })
})
