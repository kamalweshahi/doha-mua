import { Navigate, Route, Routes } from 'react-router-dom'
import AdminRoute from '../../auth/AdminRoute'
import Login from '../../auth/login/Login'
import ProtectedRoute from '../../auth/ProtectedRoute'
import Register from '../../auth/register/Register'
import UserRoute from '../../auth/UserRoute'
import Home from '../../makeup/Home'
import Courses from '../../makeup/Courses'
import CourseDetail from '../../makeup/CourseDetail'
import Booking from '../../makeup/Booking'
import StudentDashboard from '../../makeup/StudentDashboard'
import AdminDashboard from '../../makeup/AdminDashboard'
import CourseForm from '../../makeup/CourseForm'
import Footer from '../footer/Footer'
import Header from '../header/Header'
import NotFound from '../not-found/NotFound'
import PolicyPage from '../../makeup/PolicyPage'
import FloatingWhatsApp from '../../common/FloatingWhatsApp'
import Profile from '../../makeup/Profile'
import WebsiteContentForm from '../../makeup/WebsiteContentForm'
import AdminUserDetail from '../../makeup/AdminUserDetail'

export default function Layout() {
  return (
    <div className="Layout">
      <Header />
      <FloatingWhatsApp />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />

          <Route path="/book" element={<Booking />} />
          <Route path="/privacy" element={<PolicyPage kind="privacy" />} /><Route path="/booking-policy" element={<PolicyPage kind="booking" />} /><Route path="/terms" element={<PolicyPage kind="terms" />} />
          <Route element={<UserRoute />}>
            <Route path="/dashboard" element={<StudentDashboard />} />
          </Route>
          <Route element={<ProtectedRoute />}><Route path="/profile" element={<Profile />} /></Route>

          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses/new" element={<CourseForm />} />
            <Route path="/admin/courses/:id/edit" element={<CourseForm />} />
            <Route path="/admin/content" element={<WebsiteContentForm />} />
            <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
