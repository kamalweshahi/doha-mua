import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { VIDEO_PROVIDERS, VIDEO_STATUSES, type VideoStatus } from '../../models/Makeup'
import { createCourse, createLesson, getCourse, updateCourse, updateLesson } from '../../services/makeup-service'
import extractError from '../../services/extract-error'
import useLanguage from '../../hooks/use-language'

type LessonDraft = {
  id?: number
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  videoProvider: string
  videoId: string
  videoStatus: '' | VideoStatus
  playbackReference: string
}

const blankLesson: LessonDraft = {
  titleEn: '',
  titleAr: '',
  descriptionEn: '',
  descriptionAr: '',
  videoProvider: '',
  videoId: '',
  videoStatus: '',
  playbackReference: ''
}

const blankCourse = {
  titleEn: '',
  titleAr: '',
  shortDescriptionEn: '',
  shortDescriptionAr: '',
  descriptionEn: '',
  descriptionAr: '',
  instructorNameEn: '',
  instructorNameAr: '',
  instructorBioEn: '',
  instructorBioAr: '',
  price: '',
  salePrice: '',
  status: '',
  isFeatured: false
}

export default function CourseForm() {
  const { id } = useParams()
  const editing = Boolean(id)
  const { language, t } = useLanguage()
  const navigate = useNavigate()
  const [image, setImage] = useState<File | null>(null)
  const [draft, setDraft] = useState(blankCourse)
  const [lessons, setLessons] = useState<LessonDraft[]>([{ ...blankLesson }])
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id) return
    void getCourse(id).then(course => {
      setDraft({
        titleEn: course.titleEn || '',
        titleAr: course.titleAr || '',
        shortDescriptionEn: course.shortDescriptionEn || '',
        shortDescriptionAr: course.shortDescriptionAr || '',
        descriptionEn: course.descriptionEn || '',
        descriptionAr: course.descriptionAr || '',
        instructorNameEn: course.instructorNameEn || '',
        instructorNameAr: course.instructorNameAr || '',
        instructorBioEn: course.instructorBioEn || '',
        instructorBioAr: course.instructorBioAr || '',
        price: String(course.price),
        salePrice: course.salePrice == null ? '' : String(course.salePrice),
        status: course.status,
        isFeatured: course.isFeatured
      })
      setLessons(course.lessons.length ? course.lessons.map(lesson => ({
        id: lesson.id,
        titleEn: lesson.titleEn || '',
        titleAr: lesson.titleAr || '',
        descriptionEn: lesson.descriptionEn || '',
        descriptionAr: lesson.descriptionAr || '',
        videoProvider: lesson.videoProvider || '',
        videoId: lesson.videoId || '',
        videoStatus: lesson.videoStatus,
        playbackReference: lesson.playbackReference || ''
      })) : [{ ...blankLesson }])
    }).catch(error => toast.error(extractError(error, language)))
  }, [id, language])

  const updateLessonDraft = (index: number, key: keyof LessonDraft, value: string) => {
    setLessons(current => current.map((lesson, lessonIndex) => lessonIndex === index ? { ...lesson, [key]: value } : lesson))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!editing && !image) return toast.error(t('Please select a course image.', 'يرجى اختيار صورة للدورة.'))
    if (lessons.some(lesson => !lesson.videoProvider)) return toast.error(t('Please select a video provider for every lesson.', 'يرجى اختيار مزود الفيديو لكل درس.'))
    if (lessons.some(lesson => !lesson.videoStatus)) return toast.error(t('Please select a video status for every lesson.', 'يرجى اختيار حالة الفيديو لكل درس.'))
    if (lessons.some(lesson => lesson.videoProvider === VIDEO_PROVIDERS.VdoCipher && lesson.videoStatus === VIDEO_STATUSES.Ready && !lesson.videoId.trim())) {
      return toast.error(t('A VdoCipher Video ID is required when a lesson is ready.', 'معرّف فيديو VdoCipher مطلوب عندما يكون الدرس جاهزًا.'))
    }

    setBusy(true)
    const form = new FormData()
    Object.entries(draft).forEach(([key, value]) => form.append(key, String(value)))
    if (image) form.append('image', image)

    try {
      const course = editing ? await updateCourse(Number(id), form) : await createCourse(form)
      await Promise.all(lessons.map((lesson, index) => {
        const { id: lessonId, ...values } = lesson
        const payload = { ...values, videoStatus: values.videoStatus as VideoStatus, position: index + 1 }
        return lessonId ? updateLesson(course.id, lessonId, payload) : createLesson(course.id, payload)
      }))
      toast.success(editing ? t('Course updated.', 'تم تحديث الدورة.') : t('Course created.', 'تم إنشاء الدورة.'))
      navigate('/admin')
    } catch (error) {
      toast.error(extractError(error, language))
    } finally {
      setBusy(false)
    }
  }

  const courseField = (key: Exclude<keyof typeof blankCourse, 'isFeatured'>, label: string, multiline = false) => <label>{label}{multiline
    ? <textarea value={String(draft[key])} onChange={event => setDraft({ ...draft, [key]: event.target.value })} />
    : <input value={String(draft[key])} onChange={event => setDraft({ ...draft, [key]: event.target.value })} />}</label>

  return <section className="form-panel course-editor">
    <p className="eyebrow">DOHA MUA · {t('ADMIN', 'الإدارة')}</p>
    <h1>{editing ? t('Edit course', 'تعديل الدورة') : t('Add a course', 'إضافة دورة')}</h1>
    <form onSubmit={event => void submit(event)}>
      <fieldset><legend>{t('English content', 'المحتوى الإنجليزي')}</legend>{courseField('titleEn', t('Course title in English', 'عنوان الدورة بالإنجليزية'))}{courseField('shortDescriptionEn', t('Short description in English', 'الوصف المختصر بالإنجليزية'), true)}{courseField('descriptionEn', t('Full description in English', 'الوصف الكامل بالإنجليزية'), true)}{courseField('instructorNameEn', t('Instructor name in English', 'اسم المدرّبة بالإنجليزية'))}{courseField('instructorBioEn', t('Instructor biography in English', 'نبذة المدرّبة بالإنجليزية'), true)}</fieldset>
      <fieldset dir="rtl"><legend>{t('Arabic content', 'المحتوى العربي')}</legend>{courseField('titleAr', t('Course title in Arabic', 'عنوان الدورة بالعربية'))}{courseField('shortDescriptionAr', t('Short description in Arabic', 'الوصف المختصر بالعربية'), true)}{courseField('descriptionAr', t('Full description in Arabic', 'الوصف الكامل بالعربية'), true)}{courseField('instructorNameAr', t('Instructor name in Arabic', 'اسم المدرّبة بالعربية'))}{courseField('instructorBioAr', t('Instructor biography in Arabic', 'نبذة المدرّبة بالعربية'), true)}</fieldset>
      <fieldset><legend>{t('Shared course settings', 'إعدادات الدورة المشتركة')}</legend><label>{t('Regular price', 'السعر العادي')}<input type="number" min="0" value={draft.price} onChange={event => setDraft({ ...draft, price: event.target.value })} required /></label><label>{t('Sale price (optional)', 'سعر التخفيض (اختياري)')}<input type="number" min="0.01" value={draft.salePrice} onChange={event => setDraft({ ...draft, salePrice: event.target.value })} /></label><label className="policy"><input type="checkbox" checked={draft.isFeatured} onChange={event => setDraft({ ...draft, isFeatured: event.target.checked })} /><span>{t('Feature this course on the homepage', 'عرض هذه الدورة في الصفحة الرئيسية')}</span></label><label>{t('Publication status', 'حالة النشر')}<select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value })} required><option value="">{t('Please select', 'يرجى الاختيار')}</option><option value="draft">{t('Draft', 'مسودة')}</option><option value="published">{t('Published', 'منشور')}</option></select></label><label>{editing ? t('Replace course image (optional)', 'استبدال صورة الدورة (اختياري)') : t('Course image', 'صورة الدورة')}<input type="file" accept="image/*" onChange={event => setImage(event.target.files?.[0] || null)} required={!editing} /></label></fieldset>
      <fieldset><legend>{t('Lessons', 'الدروس')}</legend>{lessons.map((lesson, index) => <fieldset key={lesson.id || index}>
        <legend>{t('Lesson', 'الدرس')} <bdi>{index + 1}</bdi></legend>
        <div className="bilingual-fields"><div><h3>{t('English content', 'المحتوى الإنجليزي')}</h3><label>{t('Lesson title in English', 'عنوان الدرس بالإنجليزية')}<input value={lesson.titleEn} onChange={event => updateLessonDraft(index, 'titleEn', event.target.value)} /></label><label>{t('Lesson description in English', 'وصف الدرس بالإنجليزية')}<textarea value={lesson.descriptionEn} onChange={event => updateLessonDraft(index, 'descriptionEn', event.target.value)} /></label></div><div dir="rtl"><h3>{t('Arabic content', 'المحتوى العربي')}</h3><label>{t('Lesson title in Arabic', 'عنوان الدرس بالعربية')}<input value={lesson.titleAr} onChange={event => updateLessonDraft(index, 'titleAr', event.target.value)} /></label><label>{t('Lesson description in Arabic', 'وصف الدرس بالعربية')}<textarea value={lesson.descriptionAr} onChange={event => updateLessonDraft(index, 'descriptionAr', event.target.value)} /></label></div></div>
        <label>{t('Video provider', 'مزود الفيديو')}<select value={lesson.videoProvider} onChange={event => updateLessonDraft(index, 'videoProvider', event.target.value)} required><option value="">{t('Please select a video provider', 'يرجى اختيار مزود الفيديو')}</option><option value={VIDEO_PROVIDERS.VdoCipher}>VdoCipher</option>{lesson.videoProvider && lesson.videoProvider !== VIDEO_PROVIDERS.VdoCipher && <option value={lesson.videoProvider}>{t('Existing provider', 'المزود الحالي')}: {lesson.videoProvider}</option>}</select></label>
        <label>{t('VdoCipher Video ID', 'معرّف فيديو VdoCipher')}<input value={lesson.videoId} onChange={event => updateLessonDraft(index, 'videoId', event.target.value)} required={lesson.videoProvider === VIDEO_PROVIDERS.VdoCipher && lesson.videoStatus === VIDEO_STATUSES.Ready} /></label>
        <label>{t('Video status', 'حالة الفيديو')}<select value={lesson.videoStatus} onChange={event => updateLessonDraft(index, 'videoStatus', event.target.value)} required><option value="">{t('Please select', 'يرجى الاختيار')}</option><option value={VIDEO_STATUSES.NotUploaded}>{t('Not uploaded', 'لم يتم الرفع')}</option><option value={VIDEO_STATUSES.Processing}>{t('Processing', 'قيد المعالجة')}</option><option value={VIDEO_STATUSES.Ready}>{t('Ready', 'جاهز')}</option></select></label>
        {lesson.videoProvider === VIDEO_PROVIDERS.VdoCipher
          ? <p className="form-hint">{t('VdoCipher playback credentials are generated securely. No permanent playback URL is required.', 'يتم إنشاء بيانات تشغيل VdoCipher بشكل آمن، ولا يلزم رابط تشغيل دائم.')}</p>
          : <label>{t('Playback reference', 'مرجع التشغيل')}<input type="url" value={lesson.playbackReference} onChange={event => updateLessonDraft(index, 'playbackReference', event.target.value)} /></label>}
        {lessons.length > 1 && <button type="button" aria-label={`${t('Remove lesson', 'حذف الدرس')} ${index + 1}`} onClick={() => setLessons(current => current.filter((_, lessonIndex) => lessonIndex !== index))}>{t('Remove lesson', 'حذف الدرس')}</button>}
      </fieldset>)}</fieldset>
      <button type="button" onClick={() => setLessons(current => [...current, { ...blankLesson }])}>{t('Add lesson', 'إضافة درس')}</button>
      <button disabled={busy}>{busy ? t('Please wait...', 'يرجى الانتظار...') : editing ? t('Save course', 'حفظ الدورة') : t('Create course', 'إنشاء الدورة')}</button>
      <Link className="button-secondary" to="/admin">{t('Cancel', 'إلغاء')}</Link>
    </form>
  </section>
}
