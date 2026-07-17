import Joi from 'joi'
import { CourseStatus } from '../../models/Course'
import { VideoProvider, VideoStatus } from '../../models/Lesson'

const fields = {
  titleEn: Joi.string().trim().min(3).max(160).empty(''),
  titleAr: Joi.string().trim().min(3).max(160).empty(''),
  shortDescriptionEn: Joi.string().trim().min(10).max(500).empty(''),
  shortDescriptionAr: Joi.string().trim().min(10).max(500).empty(''),
  descriptionEn: Joi.string().trim().min(20).max(5000).empty(''),
  descriptionAr: Joi.string().trim().min(20).max(5000).empty(''),
  price: Joi.number().min(0).max(10000).required(),
  salePrice: Joi.number().greater(0).less(Joi.ref('price')).max(10000).empty('').allow(null),
  isFeatured: Joi.boolean().required(),
  instructorNameEn: Joi.string().trim().min(2).max(120).empty(''),
  instructorNameAr: Joi.string().trim().min(2).max(120).empty(''),
  instructorBioEn: Joi.string().trim().min(10).max(2000).empty(''),
  instructorBioAr: Joi.string().trim().min(10).max(2000).empty(''),
  status: Joi.string().valid(...Object.values(CourseStatus)).required()
}
export const courseValidator = Joi.object(fields)
  .or('titleEn', 'titleAr')
  .or('descriptionEn', 'descriptionAr')
  .or('instructorNameEn', 'instructorNameAr')
  .or('instructorBioEn', 'instructorBioAr')
  .messages({ 'any.required': 'Please complete every required course field.', 'object.missing': 'Please complete at least one language for every required course field.' })
export const lessonValidator = Joi.object({
  titleEn: Joi.string().trim().min(3).max(180).empty(''),
  titleAr: Joi.string().trim().min(3).max(180).empty(''),
  descriptionEn: Joi.string().trim().min(10).max(2000).empty(''),
  descriptionAr: Joi.string().trim().min(10).max(2000).empty(''),
  position: Joi.number().integer().min(1).max(1000).required(),
  videoProvider: Joi.string().trim().max(40).allow(''),
  videoId: Joi.when('videoProvider', {
    is: VideoProvider.VdoCipher,
    then: Joi.when('videoStatus', {
      is: VideoStatus.Ready,
      then: Joi.string().trim().max(255).required().messages({
        'any.required': 'A VdoCipher Video ID is required when the video is ready.',
        'string.empty': 'A VdoCipher Video ID is required when the video is ready.'
      }),
      otherwise: Joi.string().trim().max(255).allow('')
    }),
    otherwise: Joi.string().trim().max(255).allow('')
  }),
  videoStatus: Joi.string().valid(...Object.values(VideoStatus)).required(),
  playbackReference: Joi.string().uri({ scheme: ['https'] }).max(500).allow('')
}).or('titleEn', 'titleAr').or('descriptionEn', 'descriptionAr')
