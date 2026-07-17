export enum EmailEventType { NewBookingAdmin = 'NEW_BOOKING_ADMIN', BookingPending = 'BOOKING_PENDING', BookingConfirmed = 'BOOKING_CONFIRMED', BookingCancelled = 'BOOKING_CANCELLED', BookingRefundRequired = 'BOOKING_REFUND_REQUIRED', PurchaseCustomer = 'PURCHASE_CUSTOMER', PurchaseAdmin = 'PURCHASE_ADMIN' }
export type EmailLanguage = 'en' | 'ar'
export type EmailTemplateData = { name: string; reference?: string; date?: string; time?: string; courseTitle?: string }
export type RenderedEmail = { subject: string; text: string }

export function renderEmail(event: EmailEventType, language: EmailLanguage, data: EmailTemplateData): RenderedEmail {
  const ar = language === 'ar'
  const booking = `${data.date || ''} ${data.time || ''}`.trim()
  const templates: Record<EmailEventType, RenderedEmail> = {
    [EmailEventType.NewBookingAdmin]: { subject: `DOHA MUA · New booking ${data.reference || ''}`, text: `New booking request from ${data.name}. ${booking}` },
    [EmailEventType.BookingPending]: { subject: ar ? 'تم استلام دفعة الحجز وطلبك · DOHA MUA' : 'Booking fee received and request created · DOHA MUA', text: ar ? `مرحبًا ${data.name}، تم استلام دفعة الحجز وطلبك ${data.reference} بانتظار موافقة الإدارة. ${booking}` : `Hello ${data.name}, your booking fee was received and request ${data.reference} is pending management approval. ${booking}` },
    [EmailEventType.BookingConfirmed]: { subject: ar ? 'تم تأكيد حجزك · DOHA MUA' : 'Your booking is confirmed · DOHA MUA', text: ar ? `مرحبًا ${data.name}، تم تأكيد حجزك ${data.reference}. ${booking}` : `Hello ${data.name}, your booking ${data.reference} is confirmed. ${booking}` },
    [EmailEventType.BookingCancelled]: { subject: ar ? 'تم إلغاء حجزك · DOHA MUA' : 'Your booking was cancelled · DOHA MUA', text: ar ? `مرحبًا ${data.name}، تم إلغاء حجزك ${data.reference}.` : `Hello ${data.name}, your booking ${data.reference} was cancelled.` },
    [EmailEventType.BookingRefundRequired]: { subject: ar ? 'تم رفض الحجز ويلزم رد الدفعة · DOHA MUA' : 'Booking rejected — refund required · DOHA MUA', text: ar ? `مرحبًا ${data.name}، تم رفض حجزك ${data.reference} وتم تحويل دفعة الحجز إلى حالة تتطلب الاسترداد.` : `Hello ${data.name}, your booking ${data.reference} was rejected and its booking fee now requires a refund.` },
    [EmailEventType.PurchaseCustomer]: { subject: ar ? 'تم تأكيد شراء الدورة · DOHA MUA' : 'Course purchase confirmed · DOHA MUA', text: ar ? `مرحبًا ${data.name}، أصبح لديك وصول دائم إلى ${data.courseTitle}.` : `Hello ${data.name}, you now have permanent access to ${data.courseTitle}.` },
    [EmailEventType.PurchaseAdmin]: { subject: 'DOHA MUA · New course purchase', text: `${data.name} purchased ${data.courseTitle}.` }
  }
  return templates[event]
}
