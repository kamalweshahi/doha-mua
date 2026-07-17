import { BookingPaymentStatus } from '../../models/BookingPayment'
import { bookingPaymentStatusForResult, paymentStatusAfterCancellation } from './controller'

describe('booking fee state rules', () => {
  it('keeps failed and cancelled payments out of the success path', () => {
    expect(bookingPaymentStatusForResult('failed')).toBe(BookingPaymentStatus.Failed)
    expect(bookingPaymentStatusForResult('cancelled')).toBe(BookingPaymentStatus.Cancelled)
    expect(bookingPaymentStatusForResult('success')).toBe(BookingPaymentStatus.Success)
  })
  it('requires a refund after management rejection', () => {
    expect(paymentStatusAfterCancellation(BookingPaymentStatus.Success, 'management')).toBe(BookingPaymentStatus.RefundRequired)
  })
  it('keeps a customer cancellation non-refundable', () => {
    expect(paymentStatusAfterCancellation(BookingPaymentStatus.Success, 'customer')).toBe(BookingPaymentStatus.Success)
  })
})
