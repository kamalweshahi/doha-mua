import { bookingValidator } from './validator'

describe('bridal booking validation', () => {
  it('requires a real availability selection before a booking can be created', async () => {
    await expect(bookingValidator.validateAsync({ brideName: 'Sofia', phone: '050-555-1212' })).rejects.toBeDefined()
  })

  it('accepts a complete booking request for an availability slot', async () => {
    await expect(bookingValidator.validateAsync({ availabilityId: 4, brideName: 'Sofia Levy', email: 'sofia@example.com', phone: '050-555-1212', eventType: 'wedding', peopleCount: 1, preferredLanguage: 'en', provider: 'payplus', demoResult: 'success', policyAccepted: true, website: '', notes: '' })).resolves.toMatchObject({ availabilityId: 4 })
  })

  it('accepts the seeded local demo account email', async () => {
    await expect(bookingValidator.validateAsync({ availabilityId: 4, brideName: 'Sofia Levy', email: 'student@doha-mua.local', phone: '050-555-1212', eventType: 'wedding', peopleCount: 1, preferredLanguage: 'en', provider: 'payplus', demoResult: 'failed', policyAccepted: true, website: '', notes: '' })).resolves.toMatchObject({ email: 'student@doha-mua.local' })
  })

  it('rejects non-Israeli phone numbers', async () => { await expect(bookingValidator.validateAsync({ availabilityId: 4, brideName: 'Sofia Levy', email: 'sofia@example.com', phone: '+1 555 555 1212', eventType: 'wedding', peopleCount: 1, preferredLanguage: 'en', provider: 'payplus', demoResult: 'success', policyAccepted: true, website: '', notes: '' })).rejects.toBeDefined() })
})
