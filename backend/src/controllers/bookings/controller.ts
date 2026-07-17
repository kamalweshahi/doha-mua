import type { NextFunction, Request, Response } from 'express'
import { Op } from 'sequelize'
import sequelize from '../../db/sequelize'
import Availability from '../../models/Availability'
import Appointment, { AppointmentStatus } from '../../models/Appointment'
import BookingPayment, { BookingPaymentStatus } from '../../models/BookingPayment'
import User from '../../models/User'
import { EmailEventType, sendEvent } from '../../services/email/email-service'

const BOOKING_YEAR_START = '2027-01-01'
const BOOKING_YEAR_END = '2027-12-31'

export function paymentStatusAfterCancellation(current: BookingPaymentStatus, cancellationBy: 'management' | 'customer') {
  return cancellationBy === 'management' && current === BookingPaymentStatus.Success ? BookingPaymentStatus.RefundRequired : current
}

function publicAvailabilityView(slot: Availability, booked: boolean) {
  return {
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    status: slot.isAvailable && !booked ? 'AVAILABLE' as const : 'UNAVAILABLE' as const
  }
}

function adminAvailabilityView(slot: Availability, booked: boolean) {
  return {
    id: slot.id,
    date: slot.date,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isAvailable: slot.isAvailable,
    isBooked: booked
  }
}

async function bookedAvailabilityIds() {
  const appointments = await Appointment.findAll({
    attributes: ['availabilityId']
  })
  return new Set(appointments.map(item => item.availabilityId))
}

async function availabilitySlots() {
  return Availability.findAll({
    where: { date: { [Op.between]: [BOOKING_YEAR_START, BOOKING_YEAR_END] } },
    order: [['date', 'ASC'], ['startTime', 'ASC']]
  })
}

export async function listAvailability(request: Request, response: Response, next: NextFunction) {
  try {
    const [slots, bookedIds] = await Promise.all([availabilitySlots(), bookedAvailabilityIds()])
    response.json(slots
      .filter(slot => new Date(`${slot.date}T12:00:00`).getDay() !== 0)
      .map(slot => publicAvailabilityView(slot, bookedIds.has(slot.id))))
  } catch (error) { next(error) }
}

export async function listAdminAvailability(request: Request, response: Response, next: NextFunction) {
  try {
    const [slots, bookedIds] = await Promise.all([availabilitySlots(), bookedAvailabilityIds()])
    response.json(slots.map(slot => adminAvailabilityView(slot, bookedIds.has(slot.id))))
  } catch (error) { next(error) }
}

export async function listMyBookings(request: Request, response: Response, next: NextFunction) {
  try {
    response.json(await Appointment.findAll({ where: { userId: request.currentUser!.id }, include: [Availability, BookingPayment], order: [['createdAt', 'DESC']] }))
  } catch (error) { next(error) }
}

function validAvailability(date: string, startTime: string, endTime: string) {
  return date.startsWith('2027-')
    && new Date(`${date}T12:00:00`).getDay() !== 0
    && ({ '08:00': '11:00', '11:00': '14:00', '14:00': '17:00' } as Record<string, string>)[startTime] === endTime
}

export async function createAvailability(request: Request, response: Response, next: NextFunction) {
  try {
    if (!validAvailability(request.body.date, request.body.startTime, request.body.endTime)) return next({ status: 422, message: 'Availability must be a valid Monday–Saturday three-hour slot in 2027.' })
    const slot = await Availability.create(request.body)
    await slot.reload()
    response.status(201).json(adminAvailabilityView(slot, false))
  } catch (error) { next(error) }
}

export async function updateAvailability(request: Request, response: Response, next: NextFunction) {
  try {
    const slot = await Availability.findByPk(Number(request.params.id))
    if (!slot) return next({ status: 404, message: 'Availability slot was not found.' })
    if (!validAvailability(request.body.date, request.body.startTime, request.body.endTime)) return next({ status: 422, message: 'Availability must be a valid Monday–Saturday three-hour slot in 2027.' })
    const appointment = await Appointment.findOne({ where: { availabilityId: slot.id } })
    if (request.body.isAvailable && appointment) return next({ status: 409, message: 'A booked appointment cannot be marked available.' })
    await slot.update(request.body)
    await slot.reload()
    response.json(adminAvailabilityView(slot, Boolean(appointment)))
  } catch (error) { next(error) }
}

export async function deleteAvailability(request: Request, response: Response, next: NextFunction) {
  try {
    const slot = await Availability.findByPk(Number(request.params.id))
    if (!slot) return next({ status: 404, message: 'Availability slot was not found.' })
    const appointment = await Appointment.findOne({ where: { availabilityId: slot.id } })
    if (appointment) return next({ status: 409, message: 'A slot with an existing appointment cannot be removed.' })
    await slot.destroy()
    response.sendStatus(204)
  } catch (error) { next(error) }
}

export async function listAdminBookings(request: Request, response: Response, next: NextFunction) {
  try {
    response.json(await Appointment.findAll({ include: [Availability, User, BookingPayment], order: [['createdAt', 'DESC']] }))
  } catch (error) { next(error) }
}

export async function updateBookingStatus(request: Request, response: Response, next: NextFunction) {
  try {
    const booking = await Appointment.findByPk(Number(request.params.id), { include: [BookingPayment] })
    if (!booking) return next({ status: 404, message: 'Appointment was not found.' })
    const cancellationBy = (request.body.cancellationBy || 'management') as 'management' | 'customer'
    await sequelize.transaction(async transaction => {
      await booking.update({ status: request.body.status }, { transaction })
      if (request.body.status === AppointmentStatus.Cancelled && booking.bookingPayment) {
        const status = paymentStatusAfterCancellation(booking.bookingPayment.status, cancellationBy)
        if (status !== booking.bookingPayment.status) await booking.bookingPayment.update({ status }, { transaction })
      }
    })
    await booking.reload({ include: [Availability, User, BookingPayment] })
    const event = booking.status === AppointmentStatus.Confirmed ? EmailEventType.BookingConfirmed : booking.status === AppointmentStatus.Cancelled && cancellationBy === 'management' ? EmailEventType.BookingRefundRequired : booking.status === AppointmentStatus.Cancelled ? EmailEventType.BookingCancelled : null
    if (event) await sendEvent(booking.email, event, booking.preferredLanguage, { name: booking.brideName, reference: `DM-${booking.id}`, date: booking.availability.date, time: `${booking.availability.startTime}–${booking.availability.endTime}` })
    response.json(booking)
  } catch (error) { next(error) }
}
