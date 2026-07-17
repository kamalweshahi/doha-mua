import type { NextFunction, Request, Response } from 'express'
import Course from '../../models/Course'
import Lesson, { VideoProvider, VideoStatus } from '../../models/Lesson'
import Purchase from '../../models/Purchase'
import { Role } from '../../models/User'
import * as videoService from '../../services/video-service'
import { bilingualFallback, getProtectedLesson } from './controller'

describe('bilingual course content fallback', () => {
  it('returns English course content when English is selected', () => {
    expect(bilingualFallback('Signature Glow', 'الإشراقة المميزة')).toBe('Signature Glow')
  })

  it('returns Arabic course content when Arabic is selected', () => {
    expect(bilingualFallback('الإشراقة المميزة', 'Signature Glow')).toBe('الإشراقة المميزة')
  })

  it('falls back to the available language without returning an empty value', () => {
    expect(bilingualFallback('', undefined, 'Signature Glow')).toBe('Signature Glow')
  })
})

describe('protected course video access', () => {
  const response = { json: jest.fn() } as unknown as Response
  const next = jest.fn() as NextFunction
  const currentUser = {
    id: 4,
    firstName: 'Maya',
    lastName: 'Cohen',
    email: 'maya@example.com',
    phone: '',
    preferredLanguage: 'en' as const,
    role: Role.Student
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(Course, 'findByPk').mockResolvedValue({ id: 8 } as Course)
  })

  afterEach(() => jest.restoreAllMocks())

  it('rejects a student who has not purchased the course before requesting an OTP', async () => {
    jest.spyOn(Lesson, 'findByPk').mockResolvedValue({ id: 3, courseId: 8 } as Lesson)
    jest.spyOn(Purchase, 'findOne').mockResolvedValue(null)
    const playbackRequest = jest.spyOn(videoService, 'createVdoCipherPlayback')
    const request = { params: { id: '8', lessonId: '3' }, currentUser } as unknown as Request

    await getProtectedLesson(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 403, message: 'Purchase this course to watch its lessons.' })
    expect(playbackRequest).not.toHaveBeenCalled()
  })

  it.each(['failed', 'cancelled'])('does not grant lesson access for a %s course payment', async () => {
    jest.spyOn(Lesson, 'findByPk').mockResolvedValue({ id: 3, courseId: 8 } as Lesson)
    const purchaseLookup = jest.spyOn(Purchase, 'findOne').mockResolvedValue(null)
    const request = { params: { id: '8', lessonId: '3' }, currentUser } as unknown as Request

    await getProtectedLesson(request, response, next)

    expect(purchaseLookup).toHaveBeenCalledWith({ where: { userId: 4, courseId: 8, status: 'paid' } })
    expect(next).toHaveBeenCalledWith({ status: 403, message: 'Purchase this course to watch its lessons.' })
  })

  it('rejects a lesson that belongs to another course', async () => {
    jest.spyOn(Lesson, 'findByPk').mockResolvedValue({ id: 3, courseId: 9 } as Lesson)
    const request = { params: { id: '8', lessonId: '3' }, currentUser } as unknown as Request

    await getProtectedLesson(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 404, message: 'Lesson was not found.' })
  })

  it('rejects a non-VdoCipher lesson after access is confirmed', async () => {
    jest.spyOn(Lesson, 'findByPk').mockResolvedValue({ id: 3, courseId: 8, videoProvider: 'legacy', videoStatus: VideoStatus.Ready, videoId: 'skin' } as Lesson)
    jest.spyOn(Purchase, 'findOne').mockResolvedValue({ id: 2 } as Purchase)
    const request = { params: { id: '8', lessonId: '3' }, currentUser } as unknown as Request

    await getProtectedLesson(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 409, message: 'This lesson is not configured for secure VdoCipher playback.' })
  })

  it('rejects a VdoCipher video that is not ready', async () => {
    jest.spyOn(Lesson, 'findByPk').mockResolvedValue({ id: 3, courseId: 8, videoProvider: VideoProvider.VdoCipher, videoStatus: VideoStatus.Processing, videoId: 'skin' } as Lesson)
    jest.spyOn(Purchase, 'findOne').mockResolvedValue({ id: 2 } as Purchase)
    const request = { params: { id: '8', lessonId: '3' }, currentUser } as unknown as Request

    await getProtectedLesson(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 409, message: 'This lesson video is still being prepared.' })
  })

  it('rejects a ready VdoCipher lesson with a missing Video ID', async () => {
    jest.spyOn(Lesson, 'findByPk').mockResolvedValue({ id: 3, courseId: 8, videoProvider: VideoProvider.VdoCipher, videoStatus: VideoStatus.Ready, videoId: '' } as Lesson)
    jest.spyOn(Purchase, 'findOne').mockResolvedValue({ id: 2 } as Purchase)
    const request = { params: { id: '8', lessonId: '3' }, currentUser } as unknown as Request

    await getProtectedLesson(request, response, next)

    expect(next).toHaveBeenCalledWith({ status: 422, message: 'This lesson is missing its VdoCipher Video ID.' })
  })

  it('returns fresh VdoCipher playback credentials for a purchased course', async () => {
    jest.spyOn(Lesson, 'findByPk').mockResolvedValue({ id: 3, courseId: 8, videoProvider: VideoProvider.VdoCipher, videoStatus: VideoStatus.Ready, videoId: 'skin-video-id' } as Lesson)
    jest.spyOn(Purchase, 'findOne').mockResolvedValue({ id: 2 } as Purchase)
    const playbackRequest = jest.spyOn(videoService, 'createVdoCipherPlayback').mockResolvedValue({ otp: 'short-lived-otp', playbackInfo: 'protected-playback-info' })
    const request = { params: { id: '8', lessonId: '3' }, currentUser } as unknown as Request

    await getProtectedLesson(request, response, next)

    expect(playbackRequest).toHaveBeenCalledWith('skin-video-id', currentUser)
    expect(response.json).toHaveBeenCalledWith({ provider: 'vdocipher', otp: 'short-lived-otp', playbackInfo: 'protected-playback-info', expiresIn: 300 })
  })
})
