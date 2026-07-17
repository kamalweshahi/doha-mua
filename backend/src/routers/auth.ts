import { Router } from 'express'
import bodyValidation from '../middlewares/body-validation'
import authEnforce from '../middlewares/auth-enforce'
import { changePassword, getCurrentUser, googleLogin, login, register, updateProfile } from '../controllers/auth/controller'
import { googleValidator, loginValidator, passwordValidator, profileValidator, registerValidator } from '../controllers/auth/validator'

const router = Router()

router.post('/register', bodyValidation(registerValidator), register)
router.post('/login', bodyValidation(loginValidator), login)
router.post('/google', bodyValidation(googleValidator), googleLogin)
router.get('/me', authEnforce, getCurrentUser)
router.put('/profile', authEnforce, bodyValidation(profileValidator), updateProfile)
router.put('/password', authEnforce, bodyValidation(passwordValidator), changePassword)

export default router
