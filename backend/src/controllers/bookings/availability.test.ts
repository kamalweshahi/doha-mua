import type { NextFunction, Request, Response } from 'express'
import Availability from '../../models/Availability'
import Appointment from '../../models/Appointment'
import { listAdminAvailability, listAvailability } from './controller'

const slots = [
  { id: 1, date: '2027-01-04', startTime: '08:00', endTime: '11:00', isAvailable: true },
  { id: 2, date: '2027-01-04', startTime: '11:00', endTime: '14:00', isAvailable: true },
  { id: 3, date: '2027-01-04', startTime: '14:00', endTime: '17:00', isAvailable: false }
] as Availability[]

function responseMock() {
  return { json: jest.fn() } as unknown as Response
}

describe('bridal availability responses', () => {
  afterEach(() => jest.restoreAllMocks())

  it('returns only public date, time and availability status', async () => {
    jest.spyOn(Availability, 'findAll').mockResolvedValue(slots)
    jest.spyOn(Appointment, 'findAll').mockResolvedValue([{ availabilityId: 2 } as Appointment])
    const response = responseMock()
    const next = jest.fn() as NextFunction

    await listAvailability({} as Request, response, next)

    expect(next).not.toHaveBeenCalled()
    expect(response.json).toHaveBeenCalledWith([
      { date: '2027-01-04', startTime: '08:00', endTime: '11:00', status: 'AVAILABLE' },
      { date: '2027-01-04', startTime: '11:00', endTime: '14:00', status: 'UNAVAILABLE' },
      { date: '2027-01-04', startTime: '14:00', endTime: '17:00', status: 'UNAVAILABLE' }
    ])
    const payload = (response.json as jest.Mock).mock.calls[0][0] as Array<Record<string, unknown>>
    expect(payload.every(item => Object.keys(item).sort().join(',') === 'date,endTime,startTime,status')).toBe(true)
  })

  it('returns identifiers and booking state only to the admin controller', async () => {
    jest.spyOn(Availability, 'findAll').mockResolvedValue(slots)
    jest.spyOn(Appointment, 'findAll').mockResolvedValue([{ availabilityId: 2 } as Appointment])
    const response = responseMock()

    await listAdminAvailability({} as Request, response, jest.fn() as NextFunction)

    expect(response.json).toHaveBeenCalledWith([
      { id: 1, date: '2027-01-04', startTime: '08:00', endTime: '11:00', isAvailable: true, isBooked: false },
      { id: 2, date: '2027-01-04', startTime: '11:00', endTime: '14:00', isAvailable: true, isBooked: true },
      { id: 3, date: '2027-01-04', startTime: '14:00', endTime: '17:00', isAvailable: false, isBooked: false }
    ])
  })
})
