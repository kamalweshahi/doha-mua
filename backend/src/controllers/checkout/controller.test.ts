import { PurchaseStatus } from '../../models/Purchase'
import { officialCourseAmount, purchaseStatusForResult } from './controller'

describe('demo course payments', () => {
  it('maps failed and cancelled results without granting paid status', () => {
    expect(purchaseStatusForResult('failed')).toBe(PurchaseStatus.Failed)
    expect(purchaseStatusForResult('cancelled')).toBe(PurchaseStatus.Cancelled)
  })
  it('uses the official server-side sale price and ignores invalid sale values', () => {
    expect(officialCourseAmount({ price: '249.00', salePrice: '199.00' })).toBe(199)
    expect(officialCourseAmount({ price: '249.00', salePrice: '300.00' })).toBe(249)
  })
})
