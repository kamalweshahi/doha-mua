import config from '../config'
import type { JwtUser } from '../middlewares/auth-enforce'
import { Role } from '../models/User'
import { createVdoCipherPlayback, VdoCipherServiceError } from './video-service'

describe('VdoCipher playback service', () => {
  const originalSecret = config.vdoCipher.apiSecret
  const user: JwtUser = {
    id: 12,
    firstName: 'Sofia',
    lastName: 'Levy',
    email: 'sofia@example.com',
    phone: '',
    preferredLanguage: 'en',
    role: Role.Student
  }

  beforeEach(() => { config.vdoCipher.apiSecret = 'test-api-secret' })
  afterEach(() => {
    config.vdoCipher.apiSecret = originalSecret
    jest.restoreAllMocks()
  })

  it('requests a short-lived OTP with a moving user watermark', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ otp: 'otp-value', playbackInfo: 'playback-value' })
    } as Response)

    await expect(createVdoCipherPlayback('video-123', user)).resolves.toEqual({ otp: 'otp-value', playbackInfo: 'playback-value' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('https://dev.vdocipher.com/api/videos/video-123/otp')
    expect(options?.method).toBe('POST')
    expect(options?.headers).toEqual(expect.objectContaining({ Authorization: 'Apisecret test-api-secret', 'Content-Type': 'application/json' }))
    const body = JSON.parse(String(options?.body)) as { ttl: number; annotate: string }
    const annotation = JSON.parse(body.annotate) as Array<Record<string, string>>
    expect(body.ttl).toBe(300)
    expect(annotation[0]).toEqual(expect.objectContaining({ type: 'rtext', interval: '5000', skip: '5000' }))
    expect(annotation[0].text).toContain('Sofia Levy')
    expect(annotation[0].text).toContain('sofia@example.com')
    expect(annotation[0].text).toContain('User #12')
  })

  it('returns a friendly configuration error when the API secret is missing', async () => {
    config.vdoCipher.apiSecret = ''
    await expect(createVdoCipherPlayback('video-123', user)).rejects.toEqual(expect.objectContaining({ status: 503, message: 'Secure video playback is not configured yet.' }))
  })

  it('returns a friendly error for a missing Video ID', async () => {
    await expect(createVdoCipherPlayback('  ', user)).rejects.toEqual(expect.objectContaining({ status: 422, message: 'This lesson is missing its VdoCipher Video ID.' }))
  })

  it('maps an invalid or unavailable video response without exposing provider details', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: false, status: 404 } as Response)
    await expect(createVdoCipherPlayback('invalid-video', user)).rejects.toEqual(expect.objectContaining({ status: 409, message: 'This video is not ready for secure playback. Please check its VdoCipher Video ID and status.' }))
  })

  it('rejects an invalid success response', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true, status: 200, json: async () => ({ otp: 'otp-only' }) } as Response)
    await expect(createVdoCipherPlayback('video-123', user)).rejects.toBeInstanceOf(VdoCipherServiceError)
  })

  it('maps network failures to a safe playback error', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('socket failed'))
    await expect(createVdoCipherPlayback('video-123', user)).rejects.toEqual(expect.objectContaining({ status: 502, message: 'Unable to reach the secure video provider. Please try again.' }))
  })
})
