import useLanguage from '../../hooks/use-language'
import useWebsiteContent from '../../hooks/use-website-content'

export type PolicyKind = 'privacy' | 'booking' | 'terms'

export default function PolicyPage({ kind }: { kind: PolicyKind }) {
  const { language, t } = useLanguage()
  const { content } = useWebsiteContent()
  const studio = language === 'ar' ? content.studioAddressAr : content.studioAddressEn
  const values = {
    privacy: [t('Privacy Policy', 'سياسة الخصوصية'), t('We collect only the information required to manage accounts, course access and course purchases. Personal information is kept securely and is not sold. The public bridal availability calendar does not collect customer details. Contact DOHA MUA to request access, correction or deletion.', 'نجمع فقط المعلومات اللازمة لإدارة الحسابات والوصول إلى الدورات وشراء الدورات. تُحفظ المعلومات بأمان ولا يتم بيعها. لا يجمع تقويم مواعيد العرائس العام بيانات العملاء. تواصلي مع DOHA MUA لطلب الوصول أو التصحيح أو الحذف.')],
    booking: [t('Bridal Availability Policy', 'سياسة مواعيد العرائس'), t('The bridal calendar is public and read-only. It shows whether each date and time is available or unavailable. The website does not accept bridal appointment requests, reservations, cancellations or bridal payments, and an available status does not hold a time slot.', 'تقويم مواعيد العرائس عام ومخصص للعرض فقط. يوضح ما إذا كان كل تاريخ ووقت متاحًا أو غير متاح. لا يستقبل الموقع طلبات مواعيد العرائس أو الحجوزات أو الإلغاءات أو دفعات العرائس، ولا تعني حالة «متاح» حجز الموعد مؤقتًا.')],
    terms: [t('Terms and Conditions', 'الشروط والأحكام'), t('Course purchases provide permanent personal access. Course materials may not be copied, shared or redistributed. The bridal calendar provides availability information only and does not create an appointment or payment obligation.', 'شراء الدورة يمنح وصولًا شخصيًا دائمًا. لا يجوز نسخ أو مشاركة أو إعادة توزيع مواد الدورة. يقدم تقويم مواعيد العرائس معلومات عن التوفر فقط ولا ينشئ موعدًا أو التزامًا بالدفع.')]
  } as const
  return <section className="makeup-page policy-page"><p className="eyebrow">DOHA MUA</p><h1>{values[kind][0]}</h1><p>{values[kind][1]}</p>{kind === 'booking' && <p><strong>{t('Studio information:', 'معلومات الاستوديو:')}</strong> {studio}</p>}<p>{t('Last updated: July 2026.', 'آخر تحديث: يوليو 2026.')}</p></section>
}
