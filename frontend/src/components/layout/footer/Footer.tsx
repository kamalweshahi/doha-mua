import { Link } from 'react-router-dom'
import useAuth from '../../../hooks/use-auth'
import './Footer.css'
import useLanguage from '../../../hooks/use-language'
import WhatsAppLink from '../../common/WhatsAppLink'

export default function Footer() {
  const { user } = useAuth()
  const { language,setLanguage,tr,t } = useLanguage()
  const homePath = user?.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <footer className="Footer">
      <div className="footer-brand">
        <Link to="/" className="brand">DOHA MUA</Link>
        <p>{tr('footerIntro')}</p><WhatsAppLink />
      </div>
      <nav className="footer-links" aria-label={t('Footer navigation','التنقل في تذييل الصفحة')}>
        <Link to="/courses">{tr('courses')}</Link>{user && <Link to={homePath}>{tr(user.role === 'admin' ? 'adminWorkspace' : 'myCourses')}</Link>}<Link to="/book">{tr('bridalBooking')}</Link><Link to="/privacy">{tr('privacy')}</Link><Link to="/booking-policy">{tr('bookingPolicy')}</Link><Link to="/terms">{tr('terms')}</Link><button className="footer-language" aria-label={language==='en'?'عرض الموقع بالعربية':'View site in English'} onClick={()=>setLanguage(language==='en'?'ar':'en')}>{language==='en'?'العربية':'English'}</button>
      </nav>
      <p className="footer-copy">© <bdi>{new Date().getFullYear()}</bdi> DOHA MUA. {tr('rights')}</p>
    </footer>
  )
}
