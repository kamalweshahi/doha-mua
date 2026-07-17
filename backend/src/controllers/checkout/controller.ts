import type { NextFunction, Request, Response } from 'express'
import Course, { CourseStatus } from '../../models/Course'
import Purchase, { PaymentProvider, PurchaseStatus } from '../../models/Purchase'
import Notification, { NotificationType } from '../../models/Notification'
import User from '../../models/User'
import config from '../../config'
import { EmailEventType, sendEvent } from '../../services/email/email-service'

export type DemoPaymentResult = 'success' | 'failed' | 'cancelled'
export function purchaseStatusForResult(result: DemoPaymentResult) {
  return result === 'success' ? PurchaseStatus.Paid : result === 'failed' ? PurchaseStatus.Failed : PurchaseStatus.Cancelled
}
export function officialCourseAmount(course: Pick<Course, 'price' | 'salePrice'>) {
  const regular = Number(course.price)
  const sale = course.salePrice == null ? null : Number(course.salePrice)
  return sale != null && sale > 0 && sale < regular ? sale : regular
}

export async function checkout(request: Request, response: Response, next: NextFunction) {
  try {
    const course = await Course.findByPk(Number(request.body.courseId))
    if (!course || course.status !== CourseStatus.Published) return next({ status: 404, message: 'Course was not found.' })
    const status = purchaseStatusForResult(request.body.demoResult as DemoPaymentResult)
    const amount = officialCourseAmount(course).toFixed(2)
    const providerReference = `demo-${request.body.demoResult}-${Date.now()}`
    const [purchase, created] = await Purchase.findOrCreate({ where: { userId: request.currentUser!.id, courseId: course.id }, defaults: { userId: request.currentUser!.id, courseId: course.id, amount, status, provider: request.body.provider as PaymentProvider, providerReference } })
    if (!created && purchase.status === PurchaseStatus.Paid) return next({ status: 409, message: 'You already own this course.' })
    if (!created) { await purchase.update({ status, provider: request.body.provider, amount, providerReference }); await purchase.reload() }
    if (status !== PurchaseStatus.Paid) return response.status(created ? 201 : 200).json({ purchaseId: purchase.id, status: purchase.status, courseId: course.id, amount: Number(amount) })
    await Notification.create({ type: NotificationType.Purchase, message: `New course purchase: ${course.title}.` })
    const student = await User.findByPk(request.currentUser!.id)
    if (student) await Promise.all([sendEvent(student.email, EmailEventType.PurchaseCustomer, 'en', { name: student.fullName, courseTitle: course.title }), sendEvent(config.email.adminEmail, EmailEventType.PurchaseAdmin, 'en', { name: student.fullName, courseTitle: course.title })])
    response.status(created ? 201 : 200).json({ purchaseId: purchase.id, status: purchase.status, courseId: course.id, amount: Number(amount) })
  } catch (error) { next(error) }
}

export async function listMyPurchases(request: Request, response: Response, next: NextFunction) {
  try { response.json(await Purchase.findAll({ where: { userId: request.currentUser!.id }, include: [Course], order: [['createdAt', 'DESC']] })) } catch (error) { next(error) }
}
