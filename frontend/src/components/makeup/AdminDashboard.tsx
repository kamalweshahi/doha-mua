import { BookOpen, CalendarDays, CreditCard, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { AdminDashboard as DashboardData, AdminPurchase, AdminUser, Appointment, AppointmentStatus, Availability, Course } from '../../models/Makeup'
import { createAvailability, getAdminAvailability, getAdminBookings, getAdminDashboard, getAdminNotifications, getAdminPurchases, getAdminUsers, getCourses, markNotificationRead, setStudentBlocked, updateAvailability, updateBookingStatus } from '../../services/makeup-service'
import extractError from '../../services/extract-error'
import useLanguage from '../../hooks/use-language'
import { localizeCourse } from '../../services/bilingual-content'
import { formatVisibleDate } from '../../services/format'
import { visibleLabel } from '../../services/visible-labels'
import useWebsiteContent from '../../hooks/use-website-content'
import './Makeup.css'

const statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
const appointmentSlots = [['08:00', '11:00'], ['11:00', '14:00'], ['14:00', '17:00']] as const

export default function AdminDashboard() {
  const { language, t, tr } = useLanguage()
  const { content } = useWebsiteContent()
  const [data, setData] = useState<DashboardData>()
  const [bookings, setBookings] = useState<Appointment[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [purchases, setPurchases] = useState<AdminPurchase[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [slots, setSlots] = useState<Availability[]>([])
  const [filter, setFilter] = useState<'ALL' | AppointmentStatus>('ALL')
  const [search, setSearch] = useState('')
  const [date, setDate] = useState('2027-01-04')
  const label = (status: AppointmentStatus) => ({ PENDING: tr('pending'), CONFIRMED: tr('confirmed'), CANCELLED: tr('cancelled'), COMPLETED: tr('completed') })[status]

  async function load() {
    try {
      const [dashboard, appointments, students, payments, availability, notifications, courseList] = await Promise.all([
        getAdminDashboard(), getAdminBookings(), getAdminUsers(), getAdminPurchases(), getAdminAvailability(), getAdminNotifications(), getCourses()
      ])
      setData({ ...dashboard, notifications })
      setBookings(appointments)
      setUsers(students)
      setPurchases(payments)
      setSlots(availability)
      setCourses(courseList)
    } catch (error) { toast.error(extractError(error, language)) }
  }

  useEffect(() => { void load() }, [language])
  const shown = useMemo(() => bookings.filter(item => filter === 'ALL' || item.status === filter), [bookings, filter])
  const shownUsers = useMemo(() => {
    const value = search.trim().toLowerCase()
    return users.filter(user => user.role === 'student' && (!value || `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(value)))
  }, [users, search])
  const unavailableSlots = useMemo(() => slots.filter(slot => !slot.isAvailable || slot.isBooked), [slots])

  async function action(work: () => Promise<unknown>, message: string) {
    try {
      await work()
      await load()
      toast.success(message)
    } catch (error) { toast.error(extractError(error, language)) }
  }

  async function ensureDate() {
    for (const [startTime, endTime] of appointmentSlots) {
      if (!slots.some(slot => slot.date === date && slot.startTime === startTime)) {
        await createAvailability({ date, startTime, endTime, isAvailable: true })
      }
    }
  }

  if (!data) return <p className="loading">{tr('loading')}</p>
  return <section className="makeup-page admin-page">
    <div className="page-title">
      <div><p className="eyebrow">DOHA MUA · {t('ADMIN', 'الإدارة')}</p><h1>{t('Operations overview', 'نظرة عامة على الإدارة')}</h1></div>
      <div><Link className="button-link" to="/admin/courses/new">{t('Add course', 'إضافة دورة')}</Link> <Link className="button-secondary" to="/admin/content">{t('Website content', 'محتوى الموقع')}</Link></div>
    </div>
    <div className="metric-grid">
      <article><Users /><strong>{data.students}</strong><span>{t('Students', 'الطلاب')}</span></article>
      <article><BookOpen /><strong>{data.courses}</strong><span>{tr('courses')}</span></article>
      <article><CreditCard /><strong>{data.purchases}</strong><span>{t('Purchases', 'المشتريات')}</span></article>
      <article><CalendarDays /><strong>{data.appointments}</strong><span>{t('Existing appointments', 'المواعيد الحالية')}</span></article>
    </div>

    <div className="admin-section">
      <h2>{t('Course management', 'إدارة الدورات')}</h2>
      <div className="admin-list">{courses.map(course => <article key={course.id}><div><strong>{localizeCourse(course, language).title}</strong><p>{visibleLabel(course.status, language)} · <bdi>{course.lessons.length}</bdi> {tr('lessons')} · {course.isFeatured ? t('Featured', 'مميزة') : t('Not featured', 'غير مميزة')} · <bdi>{course.salePrice != null ? `₪${course.salePrice} / ₪${course.price}` : `₪${course.price}`}</bdi></p></div><Link className="button-secondary" aria-label={`${t('Edit course', 'تعديل الدورة')}: ${localizeCourse(course, language).title}`} to={`/admin/courses/${course.id}/edit`}>{t('Edit', 'تعديل')}</Link></article>)}</div>
    </div>

    <div className="admin-section">
      <h2>{t('Existing appointment management', 'إدارة المواعيد الحالية')}</h2>
      <select aria-label={t('Filter appointments by status', 'تصفية المواعيد حسب الحالة')} value={filter} onChange={event => setFilter(event.target.value as typeof filter)}><option value="ALL">{t('All statuses', 'جميع الحالات')}</option>{statuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</select>
      <div className="admin-list">{shown.map(item => <article key={item.id}><div><strong><bdi>DM-{item.id}</bdi> · {item.brideName}</strong><p><bdi>{item.email} · {item.phone}</bdi></p><p>{visibleLabel(item.eventType, language)} · <bdi>{item.peopleCount}</bdi> {t('people', 'أشخاص')} · {language === 'ar' ? content.studioAddressAr : content.studioAddressEn}</p><p><bdi>{item.availability?.date ? formatVisibleDate(item.availability.date, language) : ''} {item.availability?.startTime}–{item.availability?.endTime}</bdi> · {t('Payment', 'الدفع')}: {visibleLabel(item.bookingPayment?.status || 'PENDING', language)} · <bdi>{item.bookingPayment?.amount || '100'} {item.bookingPayment?.currency || 'ILS'}</bdi></p></div><div><select aria-label={`${tr('status')}: ${item.brideName}`} value={item.status} onChange={event => void action(() => updateBookingStatus(item.id, event.target.value as AppointmentStatus, event.target.value === 'CANCELLED' ? 'management' : undefined), t('Appointment updated', 'تم تحديث الموعد'))}>{statuses.map(status => <option key={status} value={status}>{label(status)}</option>)}</select>{item.status !== 'CANCELLED' && <button onClick={() => void action(() => updateBookingStatus(item.id, 'CANCELLED', 'customer'), t('Customer cancellation recorded; fee remains non-refundable.', 'تم تسجيل إلغاء العميل؛ وتبقى الرسوم غير قابلة للاسترداد.'))}>{t('Record customer cancellation', 'تسجيل إلغاء العميل')}</button>}</div></article>)}</div>
    </div>

    <div className="admin-section">
      <h2>{t('Bridal availability management', 'إدارة مواعيد العرائس')}</h2>
      <p>{t('Select a 2027 date to block or reopen its three-hour time slots. Existing appointments stay unavailable.', 'اختاري تاريخًا من عام 2027 لحظر مواعيده ذات الثلاث ساعات أو إعادة فتحها. تبقى المواعيد الحالية غير متاحة.')}</p>
      <div className="inline-admin">
        <input aria-label={tr('date')} type="date" min="2027-01-01" max="2027-12-31" value={date} onChange={event => setDate(event.target.value)} />
        <button onClick={() => void action(ensureDate, t('Date opened', 'تم فتح التاريخ'))}>{t('Open date', 'فتح التاريخ')}</button>
        {slots.some(slot => slot.date === date) && <button onClick={() => void action(() => Promise.all(slots.filter(slot => slot.date === date && !slot.isBooked).map(slot => updateAvailability(slot.id, { date: slot.date, startTime: slot.startTime, endTime: slot.endTime, isAvailable: false }))), t('Date blocked', 'تم حظر التاريخ'))}>{t('Block date', 'حظر التاريخ')}</button>}
      </div>
      <div className="slot-admin">{slots.filter(slot => slot.date === date).map(slot => {
        const unavailable = !slot.isAvailable || slot.isBooked
        const status = slot.isBooked ? t('Booked', 'محجوز') : slot.isAvailable ? t('Available', 'متاح') : t('Blocked', 'محظور')
        return <button key={slot.id} disabled={slot.isBooked} className={unavailable ? 'muted' : ''} aria-label={`${slot.startTime}–${slot.endTime}: ${status}`} onClick={() => void action(() => updateAvailability(slot.id, { date: slot.date, startTime: slot.startTime, endTime: slot.endTime, isAvailable: !slot.isAvailable }), slot.isAvailable ? t('Slot blocked', 'تم حظر الموعد') : t('Slot reopened', 'تم فتح الموعد'))}><bdi>{slot.startTime}–{slot.endTime}</bdi> · {status}</button>
      })}</div>
      <h3>{t('Blocked and unavailable slots', 'المواعيد المحظورة وغير المتاحة')}</h3>
      {unavailableSlots.length === 0 ? <p>{t('No blocked slots.', 'لا توجد مواعيد محظورة.')}</p> : <div className="blocked-slot-list">{unavailableSlots.map(slot => <div key={slot.id}><bdi>{formatVisibleDate(slot.date, language)} · {slot.startTime}–{slot.endTime}</bdi><span>{slot.isBooked ? t('Booked', 'محجوز') : t('Blocked', 'محظور')}</span></div>)}</div>}
    </div>

    <div className="dashboard-columns">
      <section><h2>{t('Students', 'الطلاب')}</h2><input type="search" aria-label={t('Search students by name or email', 'البحث عن الطلاب بالاسم أو البريد')} placeholder={t('Search name or email', 'ابحث بالاسم أو البريد')} value={search} onChange={event => setSearch(event.target.value)} />{shownUsers.map(user => <article className="notification" key={user.id}><strong>{user.firstName} {user.lastName}</strong><span><bdi>{user.email}</bdi></span><Link to={`/admin/users/${user.id}`}>{t('View details', 'عرض التفاصيل')}</Link><button aria-label={`${user.isBlocked ? t('Unblock', 'إلغاء الحظر') : t('Block', 'حظر')}: ${user.firstName} ${user.lastName}`} onClick={() => void action(() => setStudentBlocked(user.id, !user.isBlocked), user.isBlocked ? t('Student unblocked', 'تم إلغاء حظر الطالب') : t('Student blocked', 'تم حظر الطالب'))}>{user.isBlocked ? t('Unblock', 'إلغاء الحظر') : t('Block', 'حظر')}</button></article>)}</section>
      <section><h2>{t('Purchases', 'المشتريات')}</h2>{purchases.map(item => <article className="notification" key={item.id}><strong>{item.course ? localizeCourse(item.course, language).title : ''}</strong><span><bdi>{item.user?.email} · ₪{item.amount}</bdi> · {visibleLabel(item.status, language)}{item.provider ? <> · {visibleLabel(item.provider, language)}</> : null}</span></article>)}</section>
    </div>
    <div className="admin-section"><h2>{t('Notifications', 'الإشعارات')}</h2>{data.notifications.map(note => <article className="notification" key={note.id}><strong>{note.type === 'purchase' ? t('Course purchase', 'شراء دورة') : t('Existing appointment', 'موعد حالي')}</strong><span>{language === 'ar' ? (note.type === 'purchase' ? 'تم استلام عملية شراء جديدة لدورة.' : 'تم استلام إشعار موعد.') : note.message}</span>{!note.isRead && <button aria-label={`${t('Mark notification as read', 'تحديد الإشعار كمقروء')}: ${note.id}`} onClick={() => void action(() => markNotificationRead(note.id), t('Marked as read', 'تم تحديده كمقروء'))}>{t('Mark as read', 'تحديد كمقروء')}</button>}</article>)}</div>
  </section>
}
