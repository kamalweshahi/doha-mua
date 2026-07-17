import { LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../../hooks/use-auth'
import './Header.css'
import useLanguage from '../../../hooks/use-language'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { language, setLanguage, t, tr } = useLanguage()
  const [open, setOpen] = useState(false)

  function logoutAndGoHome() {
    logout()
    navigate('/')
  }

  return (
    <header className="Header">
      <NavLink to="/" className="brand" aria-label={t('DOHA MUA home','الصفحة الرئيسية لـ DOHA MUA')}>
        <img src="/assets/doha-mua-logo.png" alt="DOHA MUA" />
      </NavLink>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={t('Menu','القائمة')}>{open ? <X/> : <Menu/>}</button><nav className={open ? 'open' : ''} aria-label={t('Main navigation','التنقل الرئيسي')} onClick={() => setOpen(false)}>
        <NavLink to="/">{t('Home','الرئيسية')}</NavLink><NavLink to="/courses">{t('Academy','الأكاديمية')}</NavLink><NavLink to="/book">{t('Bridal','العرائس')}</NavLink>
        {!user && <NavLink to="/login">{t('Account','الحساب')}</NavLink>}
        {user?.role === 'student' && <NavLink to="/dashboard">{t('My courses','دوراتي')}</NavLink>}
        {user && <NavLink to="/profile">{t('Profile','الملف الشخصي')}</NavLink>}
        {user?.role === 'admin' && <NavLink to="/admin">{tr('adminWorkspace')}</NavLink>}
      </nav>

      <button className="language" aria-label={language === 'en' ? 'عرض الموقع بالعربية' : 'View site in English'} onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}>{language === 'en' ? 'العربية' : 'English'}</button>{user ? (
        <div className="user-area">
          <span><bdi>{user.firstName} {user.lastName}</bdi>{user.role === 'admin' && <small className="role-badge">{t('Admin','الإدارة')}</small>}</span><button onClick={logoutAndGoHome} aria-label={t('Logout','تسجيل الخروج')}><LogOut size={17} /></button>
        </div>
      ) : <div className="header-spacer" />}
    </header>
  )
}
