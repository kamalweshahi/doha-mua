import { CheckCircle2, LockKeyhole, PlayCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Course, Lesson } from '../../models/Makeup'
import useAuth from '../../hooks/use-auth'
import useLanguage from '../../hooks/use-language'
import { checkout, getCourse, type DemoPaymentResult } from '../../services/makeup-service'
import extractError from '../../services/extract-error'
import { localizeCourse, localizeLesson } from '../../services/bilingual-content'
import VdoCipherPlayer from './VdoCipherPlayer'
import './Makeup.css'

type SelectedLesson = { id: number; title: string }

export default function CourseDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { language, t, tr } = useLanguage()
  const [course, setCourse] = useState<Course>()
  const [busy, setBusy] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<SelectedLesson>()
  const [result, setResult] = useState<'paid' | 'failed' | 'cancelled' | null>(null)

  useEffect(() => {
    if (id) void getCourse(id).then(setCourse).catch(error => toast.error(extractError(error, language)))
  }, [id, language])

  if (!course) return <p className="loading">{tr('loading')}</p>
  const active = course
  const content = localizeCourse(active, language)

  async function purchase(demoResult: DemoPaymentResult) {
    if (!user) return
    setBusy(true)
    try {
      const payment = await checkout(active.id, 'payplus', demoResult)
      setResult(payment.status as typeof result)
      if (payment.status === 'paid') {
        setCourse(await getCourse(active.id))
        toast.success(t('Your course is now in your library.', 'أصبحت الدورة الآن في مكتبتك.'))
      }
    } catch (error) { toast.error(extractError(error, language)) } finally { setBusy(false) }
  }

  function watch(lesson: Lesson) {
    const lessonContent = localizeLesson(lesson, language)
    if (lesson.videoStatus !== 'READY') return toast(t('Video coming soon', 'الفيديو قريبًا'))
    setSelectedLesson({ id: lesson.id, title: lessonContent.title })
  }

  const price = <span className="price-display">{active.salePrice != null && <del><bdi>₪{active.price.toFixed(0)}</bdi></del>}<bdi>₪{active.payablePrice.toFixed(0)}</bdi></span>

  return <section className="makeup-page course-detail">
    <div className="course-hero">{active.imageUrl && <img src={active.imageUrl} alt="" />}<div><p className="eyebrow">{t('Online masterclass', 'دورة احترافية عبر الإنترنت')}</p><h1>{content.title}</h1><p>{content.description}</p><p className="instructor"><strong>{t('With', 'مع')} {content.instructorName}</strong><br />{content.instructorBio}</p>{active.isPurchased ? <span className="owned"><CheckCircle2 size={18} />{tr('inLibrary')}</span> : user ? <div className="payment-choice">{price}<button disabled={busy} onClick={() => void purchase('success')}>{t('Demo payment: success', 'دفع تجريبي: ناجح')}</button><button disabled={busy} className="button-secondary" onClick={() => void purchase('failed')}>{t('Demo payment: fail', 'دفع تجريبي: فشل')}</button><button disabled={busy} className="button-secondary" onClick={() => void purchase('cancelled')}>{t('Demo payment: cancel', 'دفع تجريبي: إلغاء')}</button>{result && result !== 'paid' && <div className={`payment-result ${result}`} role="status"><strong>{result === 'failed' ? t('Payment failed', 'فشل الدفع') : t('Payment cancelled', 'تم إلغاء الدفع')}</strong><p>{t('Course access was not granted. You can try again.', 'لم يتم منح الوصول إلى الدورة. يمكنك المحاولة مرة أخرى.')}</p></div>}</div> : <Link className="button-link" to="/login">{t('Login to purchase', 'سجّلي الدخول للشراء')}</Link>}</div></div>
    <div className="lesson-list"><h2>{t('Course curriculum', 'محتوى الدورة')}</h2>{active.lessons.map(lesson => { const lessonContent = localizeLesson(lesson, language); return <article key={lesson.id}><span><bdi>{lesson.position}</bdi></span><div><h3>{lessonContent.title}</h3><p>{lessonContent.description}</p></div>{active.isPurchased ? <button aria-label={`${lesson.videoStatus === 'READY' ? t('Watch', 'مشاهدة') : t('Coming soon', 'قريبًا')}: ${lessonContent.title}`} onClick={() => watch(lesson)}><PlayCircle size={17} />{lesson.videoStatus === 'READY' ? t('Watch', 'مشاهدة') : t('Coming soon', 'قريبًا')}</button> : <LockKeyhole aria-label={t('Locked lesson', 'درس مقفل')} size={19} />}</article> })}</div>
    {selectedLesson && <VdoCipherPlayer courseId={active.id} lessonId={selectedLesson.id} lessonTitle={selectedLesson.title} onClose={() => setSelectedLesson(undefined)} />}
  </section>
}
