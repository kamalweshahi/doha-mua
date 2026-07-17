import Joi from 'joi'

export const registerValidator = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({ 'any.required': 'First name is required.' }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({ 'any.required': 'Last name is required.' }),
  email: Joi.string().trim().lowercase().email({ tlds: false }).required().messages({ 'string.email': 'Please enter a valid email address.' }),
  password: Joi.string().min(4).max(80).required().messages({ 'string.min': 'Password must be at least 4 characters.' })
})

export const loginValidator = Joi.object({
  email: Joi.string().trim().lowercase().email({ tlds: false }).required().messages({ 'string.email': 'Please enter a valid email address.' }),
  password: Joi.string().min(4).max(80).required().messages({ 'string.min': 'Password must be at least 4 characters.' })
})

export const googleValidator = Joi.object({
  credential: Joi.string().required().messages({ 'any.required': 'Google credential is missing.' })
})

export const profileValidator = Joi.object({ firstName: Joi.string().trim().min(2).max(50).required(), lastName: Joi.string().trim().min(2).max(50).required(), phone: Joi.string().trim().max(30).allow(''), preferredLanguage: Joi.string().valid('en', 'ar').required() })
export const passwordValidator = Joi.object({ currentPassword: Joi.string().min(4).max(80).required(), newPassword: Joi.string().min(4).max(80).required(), confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required() })
