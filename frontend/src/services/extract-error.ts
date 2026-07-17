import axios from 'axios'

const arabicErrors: Array<[RegExp,string]> = [[/Google/i,'تعذر تسجيل الدخول باستخدام Google. يرجى المحاولة مرة أخرى.'],[/email or password|login/i,'البريد الإلكتروني أو كلمة المرور غير صحيحة.'],[/Israeli phone|phone number/i,'يرجى إدخال رقم هاتف إسرائيلي صالح.'],[/no longer available|choose another slot|available Monday|valid three-hour/i,'الموعد المحدد غير متاح. يرجى اختيار موعد آخر.'],[/recent booking|already used this email|too many booking/i,'تم إرسال طلب حديث بهذه البيانات. يرجى الانتظار قبل المحاولة مرة أخرى.'],[/policy|terms/i,'يرجى الموافقة على سياسة الحجز والشروط.'],[/purchase this course|access|forbidden|authorization/i,'ليس لديك صلاحية للوصول إلى هذا المحتوى.'],[/VdoCipher Video ID|missing.*Video ID/i,'يرجى إضافة معرّف فيديو VdoCipher صالح لهذا الدرس.'],[/secure video|video provider|video.*prepared/i,'تعذر تجهيز الفيديو الآمن. يرجى المحاولة مرة أخرى.'],[/required|complete every|at least one language/i,'يرجى إكمال جميع الحقول المطلوبة.'],[/network|server/i,'تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.']]
const safeEnglishErrors: Array<[RegExp,string]> = [[/Google/i,'Google login failed. Please try again.']]
export default function extractError(error: unknown, language: 'en'|'ar' = 'en') {
  let message = ''
  if (axios.isAxiosError(error)) {
    if (typeof error.response?.data === 'string') message = error.response.data
    else if (error.response?.data?.message) message = error.response.data.message
    else if (!error.response) message = 'Unable to connect to the server.'
  }
  if (!message && error instanceof Error) message = error.message
  if (language === 'ar') return arabicErrors.find(([pattern])=>pattern.test(message))?.[1] || 'حدث خطأ. يرجى المحاولة مرة أخرى.'
  return safeEnglishErrors.find(([pattern])=>pattern.test(message))?.[1] || message || 'Something went wrong. Please try again.'
}
