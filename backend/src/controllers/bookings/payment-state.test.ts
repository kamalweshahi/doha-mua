import { BookingPaymentStatus } from '../../models/BookingPayment'
import { paymentStatusAfterCancellation } from './controller'

describe('legacy bridal payment state rules', () => {
  it('requires a refund after management rejection', () => {
    expect(paymentStatusAfterCancellation(BookingPaymentStatus.Success, 'management')).toBe(BookingPaymentStatus.RefundRequired)
  })
  it('keeps a customer cancellation non-refundable', () => {
    expect(paymentStatusAfterCancellation(BookingPaymentStatus.Success, 'customer')).toBe(BookingPaymentStatus.Success)
  })
})
