import Joi from 'joi'
import { PaymentProvider } from '../../models/Purchase'
export const checkoutValidator = Joi.object({ courseId: Joi.number().integer().positive().required(), provider: Joi.string().valid(PaymentProvider.PayPal, PaymentProvider.PayPlus).required().messages({ 'any.only': 'Choose a payment provider.' }), demoResult: Joi.string().valid('success', 'failed', 'cancelled').required() })
