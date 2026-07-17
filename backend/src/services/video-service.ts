import config from '../config'
import type { JwtUser } from '../middlewares/auth-enforce'

export const VDOCIPHER_OTP_TTL_SECONDS = 300
const VDOCIPHER_REQUEST_TIMEOUT_MS = 10_000

export type VdoCipherPlaybackCredentials = {
  otp: string
  playbackInfo: string
}

type VdoCipherResponse = {
  otp?: unknown
  playbackInfo?: unknown
}

export class VdoCipherServiceError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'VdoCipherServiceError'
  }
}

function watermarkText(user: JwtUser) {
  const fullName = `${user.firstName} ${user.lastName}`.replace(/\s+/g, ' ').trim()
  return `${fullName} • ${user.email} • User #${user.id}`
}

function watermarkAnnotation(user: JwtUser) {
  return JSON.stringify([{
    type: 'rtext',
    text: watermarkText(user),
    alpha: '0.60',
    color: '0xFFFFFF',
    size: '14',
    interval: '5000',
    skip: '5000'
  }])
}

export async function createVdoCipherPlayback(
  videoId: string,
  user: JwtUser
): Promise<VdoCipherPlaybackCredentials> {
  const apiSecret = config.vdoCipher.apiSecret.trim()
  const cleanVideoId = videoId.trim()

  if (!apiSecret) {
    throw new VdoCipherServiceError(503, 'Secure video playback is not configured yet.')
  }
  if (!cleanVideoId) {
    throw new VdoCipherServiceError(422, 'This lesson is missing its VdoCipher Video ID.')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), VDOCIPHER_REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(`https://dev.vdocipher.com/api/videos/${encodeURIComponent(cleanVideoId)}/otp`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Apisecret ${apiSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ttl: VDOCIPHER_OTP_TTL_SECONDS,
        annotate: watermarkAnnotation(user)
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      if ([400, 404, 409, 422].includes(response.status)) {
        throw new VdoCipherServiceError(409, 'This video is not ready for secure playback. Please check its VdoCipher Video ID and status.')
      }
      if ([401, 403].includes(response.status)) {
        throw new VdoCipherServiceError(503, 'Secure video playback is temporarily unavailable.')
      }
      throw new VdoCipherServiceError(502, 'The secure video provider could not prepare this lesson. Please try again.')
    }

    let payload: VdoCipherResponse
    try {
      payload = await response.json() as VdoCipherResponse
    } catch {
      throw new VdoCipherServiceError(502, 'The secure video provider returned an invalid response. Please try again.')
    }

    if (typeof payload.otp !== 'string' || !payload.otp || typeof payload.playbackInfo !== 'string' || !payload.playbackInfo) {
      throw new VdoCipherServiceError(502, 'The secure video provider returned an invalid response. Please try again.')
    }

    return { otp: payload.otp, playbackInfo: payload.playbackInfo }
  } catch (error) {
    if (error instanceof VdoCipherServiceError) throw error
    if (error instanceof Error && error.name === 'AbortError') {
      throw new VdoCipherServiceError(504, 'The secure video provider took too long to respond. Please try again.')
    }
    throw new VdoCipherServiceError(502, 'Unable to reach the secure video provider. Please try again.')
  } finally {
    clearTimeout(timeout)
  }
}
