import type { NextFunction, Request, Response } from 'express'
import Course, { CourseStatus } from '../../models/Course'
import Lesson, { VideoProvider, VideoStatus } from '../../models/Lesson'
import Purchase, { PurchaseStatus } from '../../models/Purchase'
import { Role } from '../../models/User'
import { removeUploadedImage } from '../../services/uploaded-image'
import { createVdoCipherPlayback, VDOCIPHER_OTP_TTL_SECONDS } from '../../services/video-service'

function imageUrl(imageName: string) { return imageName.startsWith('http') ? imageName : `/images/${imageName}` }
export function bilingualFallback(...values: Array<string | null | undefined>) {
  return values.find(value => value?.trim())?.trim() || ''
}
function courseValues(body: Record<string, unknown>, course?: Course) {
  const value = (key: keyof Course) => body[key as string] as string | undefined ?? course?.[key] as string | undefined
  return {
    ...body,
    title: bilingualFallback(value('titleEn'), value('titleAr'), course?.title),
    description: bilingualFallback(value('descriptionEn'), value('descriptionAr'), course?.description),
    instructorName: bilingualFallback(value('instructorNameEn'), value('instructorNameAr'), course?.instructorName),
    instructorBio: bilingualFallback(value('instructorBioEn'), value('instructorBioAr'), course?.instructorBio)
  }
}
function lessonValues(body: Record<string, unknown>, lesson?: Lesson) {
  const value = (key: keyof Lesson) => body[key as string] as string | undefined ?? lesson?.[key] as string | undefined
  return {
    ...body,
    title: bilingualFallback(value('titleEn'), value('titleAr'), lesson?.title),
    description: bilingualFallback(value('descriptionEn'), value('descriptionAr'), lesson?.description)
  }
}
function courseView(course: Course, includeVideoAdminFields = false, owned = false) {
  const lessons = (course.lessons || []).sort((a, b) => a.position - b.position).map(lesson => ({
    id: lesson.id,
    title: bilingualFallback(lesson.titleEn, lesson.titleAr, lesson.title),
    titleEn: lesson.titleEn || null,
    titleAr: lesson.titleAr || null,
    description: bilingualFallback(lesson.descriptionEn, lesson.descriptionAr, lesson.description),
    descriptionEn: lesson.descriptionEn || null,
    descriptionAr: lesson.descriptionAr || null,
    position: lesson.position,
    videoStatus: lesson.videoStatus,
    ...(includeVideoAdminFields ? {
      videoProvider: lesson.videoProvider || null,
      videoId: lesson.videoId || null,
      playbackReference: lesson.playbackReference || null
    } : {})
  }))
  return {
    id: course.id,
    title: bilingualFallback(course.titleEn, course.titleAr, course.title),
    titleEn: course.titleEn || null,
    titleAr: course.titleAr || null,
    shortDescription: bilingualFallback(course.shortDescriptionEn, course.shortDescriptionAr, course.descriptionEn, course.descriptionAr, course.description),
    shortDescriptionEn: course.shortDescriptionEn || null,
    shortDescriptionAr: course.shortDescriptionAr || null,
    description: bilingualFallback(course.descriptionEn, course.descriptionAr, course.description),
    descriptionEn: course.descriptionEn || null,
    descriptionAr: course.descriptionAr || null,
    price: Number(course.price),
    salePrice: course.salePrice == null ? null : Number(course.salePrice),
    payablePrice: course.salePrice == null ? Number(course.price) : Number(course.salePrice),
    isFeatured: course.isFeatured,
    imageUrl: imageUrl(course.imageName),
    instructorName: bilingualFallback(course.instructorNameEn, course.instructorNameAr, course.instructorName),
    instructorNameEn: course.instructorNameEn || null,
    instructorNameAr: course.instructorNameAr || null,
    instructorBio: bilingualFallback(course.instructorBioEn, course.instructorBioAr, course.instructorBio),
    instructorBioEn: course.instructorBioEn || null,
    instructorBioAr: course.instructorBioAr || null,
    status: course.status,
    lessons,
    isPurchased: owned
  }
}
async function findCourse(id: number) { return Course.findByPk(id, { include: [Lesson] }) }

export async function listCourses(request: Request, response: Response, next: NextFunction) {
  try {
    const isAdmin = request.currentUser?.role === Role.Admin
    const courses = await Course.findAll({ where: isAdmin ? undefined : { status: CourseStatus.Published }, include: [Lesson], order: [['createdAt', 'DESC']] })
    let owned = new Set<number>()
    if (request.currentUser) {
      const purchases = await Purchase.findAll({ attributes: ['courseId'], where: { userId: request.currentUser.id, status: PurchaseStatus.Paid } })
      owned = new Set(purchases.map(purchase => purchase.courseId))
    }
    response.json(courses.map(course => courseView(course, isAdmin, owned.has(course.id))))
  } catch (error) { next(error) }
}

export async function getCourse(request: Request, response: Response, next: NextFunction) {
  try {
    const course = await findCourse(Number(request.params.id))
    if (!course || (course.status !== CourseStatus.Published && request.currentUser?.role !== Role.Admin)) return next({ status: 404, message: 'Course was not found.' })
    const purchase = request.currentUser ? await Purchase.findOne({ where: { userId: request.currentUser.id, courseId: course.id, status: PurchaseStatus.Paid } }) : null
    const owned = Boolean(purchase) || request.currentUser?.role === Role.Admin
    response.json(courseView(course, request.currentUser?.role === Role.Admin, owned))
  } catch (error) { next(error) }
}

export async function createCourse(request: Request, response: Response, next: NextFunction) {
  try {
    if (!request.file) return next({ status: 422, message: 'Course image is required.' })
    const course = await Course.create({ ...courseValues(request.body), imageName: request.file.filename })
    await course.reload({ include: [Lesson] })
    response.status(201).json(courseView(course))
  } catch (error) { if (request.file) await removeUploadedImage(request.file.filename); next(error) }
}

export async function updateCourse(request: Request, response: Response, next: NextFunction) {
  try {
    const course = await Course.findByPk(Number(request.params.id))
    if (!course) return next({ status: 404, message: 'Course was not found.' })
    const previousImageName = course.imageName
    await course.update({ ...courseValues(request.body, course), imageName: request.file?.filename || previousImageName })
    await course.reload({ include: [Lesson] })
    if (request.file && previousImageName !== course.imageName) await removeUploadedImage(previousImageName)
    response.json(courseView(course))
  } catch (error) { if (request.file) await removeUploadedImage(request.file.filename); next(error) }
}

export async function deleteCourse(request: Request, response: Response, next: NextFunction) {
  try { const course = await Course.findByPk(Number(request.params.id)); if (!course) return next({ status: 404, message: 'Course was not found.' }); const imageName = course.imageName; await course.destroy(); await removeUploadedImage(imageName); response.sendStatus(204) } catch (error) { next(error) }
}

export async function createLesson(request: Request, response: Response, next: NextFunction) {
  try { const course = await Course.findByPk(Number(request.params.id)); if (!course) return next({ status: 404, message: 'Course was not found.' }); const lesson = await Lesson.create({ ...lessonValues(request.body), courseId: course.id }); await lesson.reload(); response.status(201).json(lesson) } catch (error) { next(error) }
}
export async function updateLesson(request: Request, response: Response, next: NextFunction) {
  try { const lesson = await Lesson.findByPk(Number(request.params.lessonId)); if (!lesson || lesson.courseId !== Number(request.params.id)) return next({ status: 404, message: 'Lesson was not found.' }); await lesson.update(lessonValues(request.body, lesson)); await lesson.reload(); response.json(lesson) } catch (error) { next(error) }
}
export async function deleteLesson(request: Request, response: Response, next: NextFunction) {
  try { const lesson = await Lesson.findByPk(Number(request.params.lessonId)); if (!lesson || lesson.courseId !== Number(request.params.id)) return next({ status: 404, message: 'Lesson was not found.' }); await lesson.destroy(); response.sendStatus(204) } catch (error) { next(error) }
}
export async function getProtectedLesson(request: Request, response: Response, next: NextFunction) {
  try {
    const course = await Course.findByPk(Number(request.params.id))
    if (!course) return next({ status: 404, message: 'Course was not found.' })
    const lesson = await Lesson.findByPk(Number(request.params.lessonId))
    if (!lesson || lesson.courseId !== course.id) return next({ status: 404, message: 'Lesson was not found.' })
    const isAdmin = request.currentUser!.role === Role.Admin
    const purchase = isAdmin ? true : await Purchase.findOne({ where: { userId: request.currentUser!.id, courseId: lesson.courseId, status: PurchaseStatus.Paid } })
    if (!purchase) return next({ status: 403, message: 'Purchase this course to watch its lessons.' })
    if (lesson.videoProvider !== VideoProvider.VdoCipher) return next({ status: 409, message: 'This lesson is not configured for secure VdoCipher playback.' })
    if (lesson.videoStatus !== VideoStatus.Ready) return next({ status: 409, message: 'This lesson video is still being prepared.' })
    if (!lesson.videoId?.trim()) return next({ status: 422, message: 'This lesson is missing its VdoCipher Video ID.' })

    const playback = await createVdoCipherPlayback(lesson.videoId, request.currentUser!)
    response.json({
      provider: VideoProvider.VdoCipher.toLowerCase(),
      ...playback,
      expiresIn: VDOCIPHER_OTP_TTL_SECONDS
    })
  } catch (error) { next(error) }
}
