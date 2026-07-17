import type { SiteLanguage } from './bilingual-content'

const labels: Record<string, [string, string]> = {
  pending: ['Pending', 'قيد الانتظار'], paid: ['Paid', 'مدفوع'], failed: ['Failed', 'فشل'], cancelled: ['Cancelled', 'ملغي'], refunded: ['Refunded', 'مسترد'], success: ['Successful','ناجح'], refund_required: ['Refund required','يتطلب الاسترداد'],
  manual: ['Manual', 'يدوي'], paypal: ['PayPal', 'PayPal'], payplus: ['PayPlus', 'PayPlus'],
  wedding: ['Wedding', 'زفاف'], engagement: ['Engagement', 'خطوبة'], other: ['Other event', 'مناسبة أخرى'], legacy: ['Other event', 'مناسبة أخرى'],
  NOT_UPLOADED: ['Not uploaded', 'لم يتم الرفع'], PROCESSING: ['Processing', 'قيد المعالجة'], READY: ['Ready', 'جاهز'],
  draft: ['Draft', 'مسودة'], published: ['Published', 'منشور']
}

export function visibleLabel(value: string | null | undefined, language: SiteLanguage) {
  if (!value) return ''
  const translated = labels[value] || labels[value.toLowerCase()]
  return translated ? translated[language === 'ar' ? 1 : 0] : value
}
