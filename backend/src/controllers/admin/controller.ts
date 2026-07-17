import type { NextFunction, Request, Response } from 'express'
import User from '../../models/User'
import Course from '../../models/Course'
import Purchase from '../../models/Purchase'
import Appointment from '../../models/Appointment'
import Notification from '../../models/Notification'
import Availability from '../../models/Availability'
import BookingPayment from '../../models/BookingPayment'
import { updateWebsiteContent as updateContentRecord } from '../content/controller'

export async function dashboard(request: Request, response: Response, next: NextFunction) {
  try {
    const [students, courses, purchases, appointments, notifications] = await Promise.all([
      User.count({ where: { role: 'student' } }), Course.count(), Purchase.count({ where: { status: 'paid' } }), Appointment.count(), Notification.findAll({ order: [['createdAt', 'DESC']], limit: 8 })
    ])
    response.json({ students, courses, purchases, appointments, notifications })
  } catch (error) { next(error) }
}
export async function listUsers(request: Request, response: Response, next: NextFunction) { try { response.json(await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] })) } catch (error) { next(error) } }
export async function getUserDetails(request: Request, response: Response, next: NextFunction) {
  try {
    const user = await User.findByPk(Number(request.params.id), { attributes: { exclude: ['password'] } })
    if (!user || user.role !== 'student') return next({ status: 404, message: 'Student was not found.' })
    const [purchases, bookings] = await Promise.all([
      Purchase.findAll({ where: { userId: user.id }, include: [Course], order: [['createdAt', 'DESC']] }),
      Appointment.findAll({ where: { userId: user.id }, include: [Availability, BookingPayment], order: [['createdAt', 'DESC']] })
    ])
    response.json({ user, purchases, bookings })
  } catch (error) { next(error) }
}
export async function listPurchases(request: Request, response: Response, next: NextFunction) { try { response.json(await Purchase.findAll({ include: [User, Course], order: [['createdAt', 'DESC']] })) } catch (error) { next(error) } }
export async function listNotifications(request: Request, response: Response, next: NextFunction) { try { response.json(await Notification.findAll({ order: [['createdAt', 'DESC']] })) } catch (error) { next(error) } }
export async function setUserBlocked(request: Request, response: Response, next: NextFunction) { try { const user = await User.findByPk(Number(request.params.id)); if (!user || user.role !== 'student') return next({ status: 404, message: 'Student was not found.' }); await user.update({ isBlocked: request.body.isBlocked === true }); await user.reload(); const { password, ...safeUser } = user.get({ plain: true }); response.json(safeUser) } catch (error) { next(error) } }
export async function markNotificationRead(request: Request, response: Response, next: NextFunction) { try { const notification = await Notification.findByPk(Number(request.params.id)); if (!notification) return next({ status: 404, message: 'Notification was not found.' }); await notification.update({ isRead: true }); await notification.reload(); response.json(notification) } catch (error) { next(error) } }
export const updateWebsiteContent = updateContentRecord
