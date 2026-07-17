import { Router } from 'express'
import adminEnforce from '../middlewares/admin-enforce'
import bodyValidation from '../middlewares/body-validation'
import { createAvailability, createBooking, deleteAvailability, listAdminBookings, listAvailability, listMyBookings, updateAvailability, updateBookingStatus } from '../controllers/bookings/controller'
import { appointmentStatusValidator, availabilityValidator, bookingValidator } from '../controllers/bookings/validator'
import bookingRateLimit from '../middlewares/booking-rate-limit'
import authEnforce from '../middlewares/auth-enforce'
const router = Router()
router.get('/availability', listAvailability)
router.get('/mine', authEnforce, listMyBookings)
router.post('/', authEnforce, bookingRateLimit, bodyValidation(bookingValidator), createBooking)
router.get('/admin/appointments', adminEnforce, listAdminBookings)
router.put('/admin/appointments/:id', adminEnforce, bodyValidation(appointmentStatusValidator), updateBookingStatus)
router.post('/admin/availability', adminEnforce, bodyValidation(availabilityValidator), createAvailability)
router.put('/admin/availability/:id', adminEnforce, bodyValidation(availabilityValidator), updateAvailability)
router.delete('/admin/availability/:id', adminEnforce, deleteAvailability)
export default router
