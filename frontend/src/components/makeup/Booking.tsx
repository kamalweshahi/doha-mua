import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import type { PublicAvailability } from '../../models/Makeup'
import { getAvailability } from '../../services/makeup-service'
import extractError from '../../services/extract-error'
import useLanguage from '../../hooks/use-language'
import useWebsiteContent from '../../hooks/use-website-content'
import BookingCalendar from './BookingCalendar'
import './Makeup.css'

export default function Booking() {
  const { language, t } = useLanguage()
  const { content } = useWebsiteContent()
  const [slots, setSlots] = useState<PublicAvailability[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void getAvailability()
      .then(setSlots)
      .catch(error => toast.error(extractError(error, language)))
      .finally(() => setLoading(false))
  }, [language])

  const studio = language === 'ar' ? content.studioAddressAr : content.studioAddressEn
  return <section className="makeup-page booking">
    <div className="section-intro">
      <p className="eyebrow">{t('STUDIO BRIDAL AVAILABILITY · 2027', 'مواعيد العرائس في الاستوديو · 2027')}</p>
      <h1>{t('Your moment, considered.', 'لحظتكِ، بكل عناية.')}</h1>
      <p>{language === 'ar' ? content.bridalDescriptionAr : content.bridalDescriptionEn}</p>
      <p>{studio}</p>
      <p>{t('This calendar is for availability viewing only. Bridal appointments cannot be reserved or paid for through the website.', 'هذا التقويم مخصص لعرض المواعيد المتاحة فقط. لا يمكن حجز مواعيد العرائس أو دفع رسومها عبر الموقع.')}</p>
    </div>
    <div className="availability-legend" aria-label={t('Availability status legend', 'دليل حالة المواعيد')}>
      <span className="available">{t('Available', 'متاح')}</span>
      <span className="unavailable">{t('Unavailable', 'غير متاح')}</span>
    </div>
    {loading ? <p className="loading" role="status">{t('Loading availability...', 'جارٍ تحميل المواعيد...')}</p> : <BookingCalendar slots={slots} />}
  </section>
}
