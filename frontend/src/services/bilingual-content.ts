import type { Course, Lesson } from '../models/Makeup'

export type SiteLanguage = 'en' | 'ar'

export function selectLocalized(language: SiteLanguage, english?: string | null, arabic?: string | null, legacy?: string | null) {
  const values = language === 'ar' ? [arabic, english, legacy] : [english, arabic, legacy]
  return values.find(value => value?.trim())?.trim() || ''
}

export function localizeCourse(course: Course, language: SiteLanguage) {
  const description = selectLocalized(language, course.descriptionEn, course.descriptionAr, course.description)
  return {
    title: selectLocalized(language, course.titleEn, course.titleAr, course.title),
    shortDescription: selectLocalized(language, course.shortDescriptionEn, course.shortDescriptionAr, description),
    description,
    instructorName: selectLocalized(language, course.instructorNameEn, course.instructorNameAr, course.instructorName),
    instructorBio: selectLocalized(language, course.instructorBioEn, course.instructorBioAr, course.instructorBio)
  }
}

export function localizeLesson(lesson: Lesson, language: SiteLanguage) {
  return {
    title: selectLocalized(language, lesson.titleEn, lesson.titleAr, lesson.title),
    description: selectLocalized(language, lesson.descriptionEn, lesson.descriptionAr, lesson.description)
  }
}
