import { VideoProvider, VideoStatus } from '../../models/Lesson'
import { lessonValidator } from './validator'

describe('VdoCipher lesson validation', () => {
  const baseLesson = {
    titleEn: 'Skin preparation',
    descriptionEn: 'Prepare and balance the skin before makeup.',
    position: 1,
    videoProvider: VideoProvider.VdoCipher
  }

  it('requires a Video ID when a VdoCipher lesson is ready', async () => {
    await expect(lessonValidator.validateAsync({ ...baseLesson, videoStatus: VideoStatus.Ready, videoId: '' })).rejects.toThrow('A VdoCipher Video ID is required when the video is ready.')
  })

  it('accepts a ready VdoCipher lesson with a Video ID and no playback URL', async () => {
    await expect(lessonValidator.validateAsync({ ...baseLesson, videoStatus: VideoStatus.Ready, videoId: 'video-123', playbackReference: '' })).resolves.toEqual(expect.objectContaining({ videoId: 'video-123' }))
  })

  it('allows a VdoCipher lesson without a Video ID while it is processing', async () => {
    await expect(lessonValidator.validateAsync({ ...baseLesson, videoStatus: VideoStatus.Processing, videoId: '' })).resolves.toEqual(expect.objectContaining({ videoStatus: VideoStatus.Processing }))
  })
})
