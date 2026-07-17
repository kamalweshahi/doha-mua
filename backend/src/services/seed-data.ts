import User, { Role } from '../models/User'
import Course, { CourseStatus } from '../models/Course'
import Lesson, { VideoStatus } from '../models/Lesson'
import { Op } from 'sequelize'
import Purchase, { PaymentProvider, PurchaseStatus } from '../models/Purchase'
import Availability from '../models/Availability'
import Appointment, { AppointmentStatus, BookingLanguage } from '../models/Appointment'
import { NotificationType } from '../models/Notification'
import Notification from '../models/Notification'
import { hashPassword } from '../utils/password'
import { ADMIN_EMAIL, USER_EMAIL, ensureDemoAccounts } from './demo-accounts'
import BookingPayment, { BookingPaymentStatus } from '../models/BookingPayment'
import { getWebsiteContent } from './website-content'

export async function seedData() {
  await ensureDemoAccounts()
  const student = await User.findOne({ where: { email: USER_EMAIL } })
  if (!student) return
  const [secondStudent] = await User.findOrCreate({ where: { email: 'maya@doha-mua.local' }, defaults: { firstName: 'Maya', lastName: 'Cohen', email: 'maya@doha-mua.local', password: hashPassword('Student1234'), role: Role.Student } })
  const bridalCourse = {
    title: 'Bridal Artistry: The Signature Glow',
    titleEn: 'Bridal Artistry: The Signature Glow',
    titleAr: 'فن مكياج العرائس: الإشراقة المميزة',
    shortDescriptionEn: 'Create luminous, enduring bridal makeup that looks refined in person and on camera.',
    shortDescriptionAr: 'أتقني مكياج عروس مشرق وثابت يبدو راقياً أمام العين والكاميرا.',
    description: 'Build a polished, luminous bridal makeup look from skin preparation through a photo-ready, long-wearing finish.',
    descriptionEn: 'Build a polished, luminous bridal makeup look from thoughtful skin preparation through a photo-ready, long-wearing finish. Learn how to balance texture, light and definition for an elegant result that still feels like the bride.',
    descriptionAr: 'تعلّمي تنفيذ إطلالة عروس مصقولة ومشرقة، من تحضير البشرة بعناية حتى اللمسات النهائية الثابتة والجاهزة للتصوير. ستتقنين موازنة القوام والإضاءة والتحديد للحصول على نتيجة أنيقة تحافظ على جمال العروس الطبيعي.',
    price: '249.00',
    salePrice: '199.00',
    isFeatured: true,
    imageName: '',
    instructorName: 'DOHA MUA',
    instructorNameEn: 'Doha MUA',
    instructorNameAr: 'ضحى لفن المكياج',
    instructorBio: 'Professional makeup artist and educator.',
    instructorBioEn: 'Doha is a professional makeup artist and educator known for refined bridal looks, thoughtful technique and calm, practical teaching.',
    instructorBioAr: 'ضحى خبيرة مكياج ومدرّبة متخصصة بإطلالات العرائس الراقية، تجمع في تعليمها بين التقنية الدقيقة والأسلوب العملي الهادئ.',
    status: CourseStatus.Published
  }
  const softGlamCourse = {
    title: 'Modern Soft Glam Essentials',
    titleEn: 'Modern Soft Glam Essentials',
    titleAr: 'أساسيات المكياج الناعم العصري',
    shortDescriptionEn: 'Master polished skin, seamless eyes and balanced color for modern soft-glam looks.',
    shortDescriptionAr: 'أتقني البشرة المصقولة ودمج ظلال العيون وتوازن الألوان لإطلالات ناعمة عصرية.',
    description: 'A confidence-building course on refined complexion, seamless eyes and intentional color for everyday and occasion makeup.',
    descriptionEn: 'Develop a reliable soft-glam routine with refined complexion work, seamless eye blending and intentional color choices. The techniques adapt easily from everyday makeup to special occasions.',
    descriptionAr: 'ابني روتيناً موثوقاً للمكياج الناعم من خلال إتقان توحيد البشرة ودمج ظلال العيون واختيار الألوان بوعي. يمكن تكييف التقنيات بسهولة من الإطلالات اليومية إلى المناسبات الخاصة.',
    price: '159.00',
    salePrice: null,
    isFeatured: true,
    imageName: '',
    instructorName: 'DOHA MUA',
    instructorNameEn: 'Doha MUA',
    instructorNameAr: 'ضحى لفن المكياج',
    instructorBio: 'Professional makeup artist and educator.',
    instructorBioEn: 'Doha is a professional makeup artist and educator who makes polished techniques approachable and repeatable.',
    instructorBioAr: 'ضحى خبيرة مكياج ومدرّبة تقدّم التقنيات الاحترافية بأسلوب واضح وسهل التطبيق والتكرار.',
    status: CourseStatus.Published
  }
  const [course] = await Course.findOrCreate({ where: { title: bridalCourse.title }, defaults: bridalCourse })
  const [secondCourse] = await Course.findOrCreate({ where: { title: softGlamCourse.title }, defaults: softGlamCourse })
  await course.update(bridalCourse)
  await secondCourse.update(softGlamCourse)
  const lessons = [
    { titleEn: 'The bridal skin ritual', titleAr: 'طقوس تحضير بشرة العروس', descriptionEn: 'Assess, prepare and layer skincare so the complexion stays hydrated, smooth and luminous throughout the celebration.', descriptionAr: 'تعلّمي تقييم البشرة وتحضيرها وترتيب طبقات العناية لتحافظ على ترطيبها ونعومتها وإشراقتها طوال الاحتفال.', position: 1, videoId: 'bridal/skin-ritual' },
    { titleEn: 'Soft sculpted eyes', titleAr: 'تحديد ناعم للعينين', descriptionEn: 'Create graceful dimension with seamless transitions that remain elegant in person and balanced on camera.', descriptionAr: 'اصنعي عمقاً ناعماً بانتقالات مدمجة تبدو أنيقة على الطبيعة ومتوازنة أمام الكاميرا.', position: 2, videoId: 'bridal/soft-eyes' },
    { titleEn: 'The ceremony-proof finish', titleAr: 'لمسات نهائية تدوم طوال الحفل', descriptionEn: 'Set and refine every layer, then prepare a focused touch-up plan for a long and emotional wedding day.', descriptionAr: 'ثبّتي كل طبقة بدقة وجهّزي خطة رتوش عملية تحافظ على الإطلالة خلال يوم زفاف طويل ومليء بالمشاعر.', position: 3, videoId: 'bridal/finish' }
  ]
  for (const lessonData of lessons) {
    const values = { ...lessonData, title: lessonData.titleEn, description: lessonData.descriptionEn, courseId: course.id, videoProvider: 'future', videoStatus: VideoStatus.NotUploaded }
    const [lesson] = await Lesson.findOrCreate({ where: { courseId: course.id, position: lessonData.position }, defaults: values })
    await lesson.update(values)
  }
  const softGlamLesson = { courseId: secondCourse.id, title: 'The polished base', titleEn: 'The polished base', titleAr: 'أساس البشرة المصقولة', description: 'Choose texture and coverage for soft, dimensional skin.', descriptionEn: 'Choose compatible textures and build coverage strategically for skin that looks smooth, fresh and dimensional.', descriptionAr: 'اختاري التركيبات المتناسقة وابني التغطية بذكاء للحصول على بشرة ناعمة ومنتعشة وذات أبعاد طبيعية.', position: 1, videoProvider: 'future', videoId: 'glam/polished-base', videoStatus: VideoStatus.NotUploaded }
  const [polishedBase] = await Lesson.findOrCreate({ where: { courseId: secondCourse.id, position: 1 }, defaults: softGlamLesson })
  await polishedBase.update(softGlamLesson)
  await Purchase.findOrCreate({ where: { userId: student.id, courseId: course.id }, defaults: { userId: student.id, courseId: course.id, amount: course.price, status: PurchaseStatus.Paid, provider: PaymentProvider.Manual, providerReference: 'seed-paid-001' } })
  const legacySlots = await Availability.findAll({ attributes: ['id'], where: { date: { [Op.between]: ['2026-01-01', '2026-12-31'] } } })
  if (legacySlots.length) { await Appointment.destroy({ where: { availabilityId: legacySlots.map(slot => slot.id) } }); await Availability.destroy({ where: { id: legacySlots.map(slot => slot.id) } }) }
  const dates: string[] = []
  for (let date = new Date('2027-01-04T12:00:00Z'); date <= new Date('2027-03-31T12:00:00Z'); date.setUTCDate(date.getUTCDate() + 1)) if (date.getUTCDay() !== 0) dates.push(date.toISOString().slice(0, 10))
  const slots: Availability[] = []
  for (const date of dates) for (const [startTime, endTime] of [['08:00', '11:00'], ['11:00', '14:00'], ['14:00', '17:00']]) {
    const [slot] = await Availability.findOrCreate({ where: { date, startTime }, defaults: { date, startTime, endTime, isAvailable: true } })
    slots.push(slot)
  }
  const [sampleAppointment] = await Appointment.findOrCreate({ where: { availabilityId: slots[0].id }, defaults: { userId: secondStudent.id, availabilityId: slots[0].id, brideName: 'Maya Cohen', email: secondStudent.email, phone: '050-555-0148', eventType: 'wedding', city: 'studio', venue: 'DOHA MUA studio', peopleCount: 1, preferredLanguage: BookingLanguage.English, notes: 'Soft rosy bridal look.', status: AppointmentStatus.Confirmed } })
  await BookingPayment.findOrCreate({ where: { appointmentId: sampleAppointment.id }, defaults: { userId: secondStudent.id, availabilityId: slots[0].id, appointmentId: sampleAppointment.id, amount: '100.00', currency: 'ILS', provider: 'manual', providerReference: 'seed-booking-fee-001', status: BookingPaymentStatus.Success } })
  await getWebsiteContent()
  await Notification.findOrCreate({ where: { message: 'Sample bridal booking received.' }, defaults: { type: NotificationType.Appointment, message: 'Sample bridal booking received.' } })
  await Notification.findOrCreate({ where: { message: `Sample course purchase from ${student.firstName}.` }, defaults: { type: NotificationType.Purchase, message: `Sample course purchase from ${student.firstName}.` } })
  await Promise.all([course.reload(), secondCourse.reload()])
}
