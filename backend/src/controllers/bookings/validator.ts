import Joi from 'joi'
import { AppointmentStatus } from '../../models/Appointment'
export const availabilityValidator = Joi.object({ date: Joi.string().pattern(/^2027-\d{2}-\d{2}$/).required(), startTime: Joi.string().valid('08:00', '11:00', '14:00').required(), endTime: Joi.string().valid('11:00', '14:00', '17:00').required(), isAvailable: Joi.boolean().required() })
export const appointmentStatusValidator = Joi.object({ status: Joi.string().valid(...Object.values(AppointmentStatus)).required(), cancellationBy: Joi.string().valid('management', 'customer') })
