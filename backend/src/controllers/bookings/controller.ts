import type { NextFunction, Request, Response } from 'express'
import { Op, UniqueConstraintError } from 'sequelize'
import sequelize from '../../db/sequelize'
import Availability from '../../models/Availability'
import Appointment, { AppointmentStatus } from '../../models/Appointment'
import BookingPayment, { BookingPaymentStatus } from '../../models/BookingPayment'
import User from '../../models/User'
import Notification, { NotificationType } from '../../models/Notification'
import config from '../../config'
import { EmailEventType, sendEvent } from '../../services/email/email-service'
import { verifyCaptcha } from '../../services/captcha-service'

export type BookingDemoResult = 'success' | 'failed' | 'cancelled'
export function bookingPaymentStatusForResult(result: BookingDemoResult) {
  return result === 'success' ? BookingPaymentStatus.Success : result === 'failed' ? BookingPaymentStatus.Failed : BookingPaymentStatus.Cancelled
}
export function paymentStatusAfterCancellation(current: BookingPaymentStatus, cancellationBy: 'management' | 'customer') {
  return cancellationBy === 'management' && current === BookingPaymentStatus.Success ? BookingPaymentStatus.RefundRequired : current
}
function availabilityView(slot: Availability, booked = false) { return { id: slot.id, date: slot.date, startTime: slot.startTime, endTime: slot.endTime, isAvailable: slot.isAvailable && !booked } }
function slotIsValid(slot: Availability) { return slot.isAvailable && slot.date.startsWith('2027-') && new Date(`${slot.date}T12:00:00`).getDay() !== 0 && ['08:00', '11:00', '14:00'].includes(slot.startTime) }
function paymentDefaults(request: Request, status: BookingPaymentStatus) { return { userId: request.currentUser!.id, availabilityId: request.body.availabilityId, amount: config.bookingFee.amount.toFixed(2), currency: config.bookingFee.currency, provider: request.body.provider, providerReference: `demo-${request.body.demoResult}-${Date.now()}`, status } }

export async function listAvailability(request: Request, response: Response, next: NextFunction) {
  try {
    const slots = await Availability.findAll({ where: { date: { [Op.between]: ['2027-01-01', '2027-12-31'] } }, order: [['date', 'ASC'], ['startTime', 'ASC']] })
    const booked = await Appointment.findAll({ attributes: ['availabilityId'], where: { status: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] } })
    const bookedIds = new Set(booked.map(item => item.availabilityId))
    response.json(slots.map(slot => availabilityView(slot, bookedIds.has(slot.id))).filter(slot => new Date(`${slot.date}T12:00:00`).getDay() !== 0))
  } catch (error) { next(error) }
}

export async function createBooking(request: Request, response: Response, next: NextFunction) {
  try {
    if (!await verifyCaptcha(request.body.captchaToken)) return next({ status: 422, message: 'CAPTCHA verification failed.' })
    const result = request.body.demoResult as BookingDemoResult
    const paymentStatus = bookingPaymentStatusForResult(result)
    if (result !== 'success') {
      const slot = await Availability.findByPk(request.body.availabilityId)
      if (!slot || !slotIsValid(slot)) return next({ status: 422, message: 'Please choose an available Monday–Saturday date in 2027.' })
      const payment = await BookingPayment.create(paymentDefaults(request, paymentStatus))
      return response.status(201).json({ paymentId: payment.id, paymentStatus: payment.status, feeAmount: Number(payment.amount), feeCurrency: payment.currency, appointment: null })
    }

    const duplicate = await Appointment.findOne({ where: { createdAt: { [Op.gte]: new Date(Date.now() - 90_000) }, [Op.or]: [{ email: request.body.email }, { phone: request.body.phone }] } })
    if (duplicate) return next({ status: 429, message: 'A recent booking request already used this email or phone. Please wait before trying again.' })
    const appointment = await sequelize.transaction(async transaction => {
      const slot = await Availability.findByPk(request.body.availabilityId, { transaction, lock: transaction.LOCK.UPDATE })
      if (!slot || !slotIsValid(slot)) throw { status: 422, message: 'Please choose an available Monday–Saturday date in 2027.' }
      const existing = await Appointment.findOne({ where: { availabilityId: slot.id, status: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] }, transaction, lock: transaction.LOCK.UPDATE })
      if (existing) throw { status: 409, message: 'That appointment time was just booked. Please choose another slot.' }
      const created = await Appointment.create({ availabilityId: slot.id, brideName: request.body.brideName, email: request.body.email, phone: request.body.phone, eventType: request.body.eventType, peopleCount: request.body.peopleCount, preferredLanguage: request.body.preferredLanguage, notes: request.body.notes, venue: 'DOHA MUA studio', city: 'studio', userId: request.currentUser!.id, status: AppointmentStatus.Pending }, { transaction })
      await BookingPayment.create({ ...paymentDefaults(request, BookingPaymentStatus.Success), appointmentId: created.id }, { transaction })
      await Notification.create({ type: NotificationType.Appointment, message: `New paid bridal booking request from ${request.body.brideName}.` }, { transaction })
      return created
    })
    await appointment.reload({ include: [Availability, BookingPayment] })
    const details = { name: appointment.brideName, reference: `DM-${appointment.id}`, date: appointment.availability.date, time: `${appointment.availability.startTime}–${appointment.availability.endTime}` }
    await Promise.all([sendEvent(config.email.adminEmail, EmailEventType.NewBookingAdmin, 'en', details), sendEvent(appointment.email, EmailEventType.BookingPending, appointment.preferredLanguage, details)])
    response.status(201).json({ paymentStatus: BookingPaymentStatus.Success, feeAmount: config.bookingFee.amount, feeCurrency: config.bookingFee.currency, appointment })
  } catch (error) { if (error instanceof UniqueConstraintError) return next({ status: 409, message: 'That appointment time was just booked. Please choose another slot.' }); next(error) }
}

export async function listMyBookings(request: Request, response: Response, next: NextFunction) { try { response.json(await Appointment.findAll({ where: { userId: request.currentUser!.id }, include: [Availability, BookingPayment], order: [['createdAt', 'DESC']] })) } catch (error) { next(error) } }
function validAvailability(date: string, startTime: string, endTime: string) { return date.startsWith('2027-') && new Date(`${date}T12:00:00`).getDay() !== 0 && ({ '08:00': '11:00', '11:00': '14:00', '14:00': '17:00' } as Record<string,string>)[startTime] === endTime }
export async function createAvailability(request: Request, response: Response, next: NextFunction) { try { if (!validAvailability(request.body.date,request.body.startTime,request.body.endTime)) return next({ status: 422, message: 'Availability must be a valid Monday–Saturday three-hour slot in 2027.' }); const slot = await Availability.create(request.body); await slot.reload(); response.status(201).json(slot) } catch (error) { next(error) } }
export async function updateAvailability(request: Request, response: Response, next: NextFunction) { try { const slot = await Availability.findByPk(Number(request.params.id)); if (!slot) return next({ status: 404, message: 'Availability slot was not found.' }); if (!validAvailability(request.body.date,request.body.startTime,request.body.endTime)) return next({ status: 422, message: 'Availability must be a valid Monday–Saturday three-hour slot in 2027.' }); await slot.update(request.body); await slot.reload(); response.json(slot) } catch (error) { next(error) } }
export async function deleteAvailability(request: Request, response: Response, next: NextFunction) { try { const slot = await Availability.findByPk(Number(request.params.id)); if (!slot) return next({ status: 404, message: 'Availability slot was not found.' }); const appointment = await Appointment.findOne({ where: { availabilityId: slot.id, status: [AppointmentStatus.Pending, AppointmentStatus.Confirmed] } }); if (appointment) return next({ status: 409, message: 'Cancel the existing appointment before removing this slot.' }); await slot.destroy(); response.sendStatus(204) } catch (error) { next(error) } }
export async function listAdminBookings(request: Request, response: Response, next: NextFunction) { try { response.json(await Appointment.findAll({ include: [Availability, User, BookingPayment], order: [['createdAt', 'DESC']] })) } catch (error) { next(error) } }

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
