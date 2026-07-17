import Joi from 'joi'

export const websiteContentValidator = Joi.object({
  heroTitleEn: Joi.string().trim().min(2).max(180).required(), heroTitleAr: Joi.string().trim().min(2).max(180).required(),
  heroSubtitleEn: Joi.string().trim().min(5).max(500).required(), heroSubtitleAr: Joi.string().trim().min(5).max(500).required(),
  aboutEn: Joi.string().trim().min(10).max(5000).required(), aboutAr: Joi.string().trim().min(10).max(5000).required(),
  bridalDescriptionEn: Joi.string().trim().min(10).max(5000).required(), bridalDescriptionAr: Joi.string().trim().min(10).max(5000).required(),
  studioAddressEn: Joi.string().trim().min(5).max(500).required(), studioAddressAr: Joi.string().trim().min(5).max(500).required(),
  whatsappNumber: Joi.string().pattern(/^\d{8,15}$/).required(), contactEmail: Joi.string().trim().email({ tlds: false }).max(255).required()
})
