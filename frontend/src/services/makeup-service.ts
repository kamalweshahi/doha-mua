import http from './http'
import type { AdminDashboard, AdminPurchase, AdminUser, AdminUserDetail, Appointment, AppointmentStatus, Availability, BookingPaymentStatus, Course, Lesson, ProtectedVideoPlayback, WebsiteContent } from '../models/Makeup'
export type LessonInput = Pick<Lesson, 'position' | 'videoStatus'> & Partial<Pick<Lesson, 'titleEn' | 'titleAr' | 'descriptionEn' | 'descriptionAr' | 'videoProvider' | 'videoId' | 'playbackReference'>>
export async function getCourses() { return (await http.get<Course[]>('/courses')).data }
export async function getCourse(id: string | number) { return (await http.get<Course>(`/courses/${id}`)).data }
export async function createCourse(data: FormData) { return (await http.post<Course>('/courses', data)).data }
export async function updateCourse(id: number, data: FormData) { return (await http.put<Course>(`/courses/${id}`, data)).data }
export async function deleteCourse(id: number) { await http.delete(`/courses/${id}`) }
export async function createLesson(courseId: number, data: LessonInput) { return (await http.post<Lesson>(`/courses/${courseId}/lessons`, data)).data }
export async function updateLesson(courseId: number, lessonId: number, data: LessonInput) { return (await http.put<Lesson>(`/courses/${courseId}/lessons/${lessonId}`, data)).data }
export async function deleteLesson(courseId: number, lessonId: number) { await http.delete(`/courses/${courseId}/lessons/${lessonId}`) }
export async function getVideo(courseId: number, lessonId: number) { return (await http.get<ProtectedVideoPlayback>(`/courses/${courseId}/lessons/${lessonId}/video`)).data }
export type DemoPaymentResult = 'success' | 'failed' | 'cancelled'
export async function checkout(courseId: number, provider: 'paypal' | 'payplus', demoResult: DemoPaymentResult) { return (await http.post<{ purchaseId: number; status: string; courseId: number; amount: number }>('/checkout', { courseId, provider, demoResult })).data }
export async function getMyPurchases() { return (await http.get<AdminPurchase[]>('/checkout/mine')).data }
export async function getAvailability() { return (await http.get<Availability[]>('/bookings/availability')).data }
export type BookingResult = { paymentId?: number; paymentStatus: BookingPaymentStatus; feeAmount: number; feeCurrency: string; appointment: Appointment | null }
export async function book(payload: { availabilityId: number; brideName: string; email: string; phone: string; eventType: string; peopleCount: number; notes: string; preferredLanguage: 'en' | 'ar'; provider: 'paypal' | 'payplus'; demoResult: DemoPaymentResult; policyAccepted: boolean; website: string }) { return (await http.post<BookingResult>('/bookings', payload)).data }
export async function getMyBookings() { return (await http.get<Appointment[]>('/bookings/mine')).data }
export async function getAdminDashboard() { return (await http.get<AdminDashboard>('/admin/dashboard')).data }
export async function getAdminBookings() { return (await http.get<Appointment[]>('/bookings/admin/appointments')).data }
export async function updateBookingStatus(id: number, status: AppointmentStatus, cancellationBy?: 'management' | 'customer') { return (await http.put<Appointment>(`/bookings/admin/appointments/${id}`, { status, cancellationBy })).data }
export async function createAvailability(payload: Omit<Availability, 'id'>) { return (await http.post<Availability>('/bookings/admin/availability', payload)).data }
export async function updateAvailability(id: number, payload: Omit<Availability, 'id'>) { return (await http.put<Availability>(`/bookings/admin/availability/${id}`, payload)).data }
export async function getAdminUsers() { return (await http.get<AdminUser[]>('/admin/users')).data }
export async function getAdminUser(id: string | number) { return (await http.get<AdminUserDetail>(`/admin/users/${id}`)).data }
export async function setStudentBlocked(id: number, isBlocked: boolean) { return (await http.put<AdminUser>(`/admin/users/${id}/blocked`, { isBlocked })).data }
export async function getAdminPurchases() { return (await http.get<AdminPurchase[]>('/admin/purchases')).data }
export async function getAdminNotifications() { return (await http.get<AdminDashboard['notifications']>('/admin/notifications')).data }
export async function markNotificationRead(id: number) { return (await http.put(`/admin/notifications/${id}/read`)).data }
export async function getWebsiteContent() { return (await http.get<WebsiteContent>('/content')).data }
export async function updateWebsiteContent(payload: Omit<WebsiteContent, 'id'>) { return (await http.put<WebsiteContent>('/admin/content', payload)).data }
