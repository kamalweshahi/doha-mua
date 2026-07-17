import { Router } from 'express'
import authEnforce from '../middlewares/auth-enforce'
import optionalAuth from '../middlewares/optional-auth'
import adminEnforce from '../middlewares/admin-enforce'
import bodyValidation from '../middlewares/body-validation'
import { imageUpload } from '../middlewares/file-upload'
import { createCourse, createLesson, deleteCourse, deleteLesson, getCourse, getProtectedLesson, listCourses, updateCourse, updateLesson } from '../controllers/courses/controller'
import { courseValidator, lessonValidator } from '../controllers/courses/validator'
const router = Router()
router.get('/', optionalAuth, listCourses)
router.get('/:id', optionalAuth, getCourse)
router.get('/:id/lessons/:lessonId/video', authEnforce, getProtectedLesson)
router.post('/', authEnforce, adminEnforce, imageUpload.single('image'), bodyValidation(courseValidator), createCourse)
router.put('/:id', authEnforce, adminEnforce, imageUpload.single('image'), bodyValidation(courseValidator), updateCourse)
router.delete('/:id', authEnforce, adminEnforce, deleteCourse)
router.post('/:id/lessons', authEnforce, adminEnforce, bodyValidation(lessonValidator), createLesson)
router.put('/:id/lessons/:lessonId', authEnforce, adminEnforce, bodyValidation(lessonValidator), updateLesson)
router.delete('/:id/lessons/:lessonId', authEnforce, adminEnforce, deleteLesson)
export default router
