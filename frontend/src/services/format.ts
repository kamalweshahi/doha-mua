import type { SiteLanguage } from './bilingual-content'

export function formatVisibleDate(value: string, language: SiteLanguage) {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-IL' : 'en-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}
