import { useLocation } from 'react-router-dom'; import WhatsAppLink from './WhatsAppLink'
export default function FloatingWhatsApp(){const {pathname}=useLocation();if(pathname.startsWith('/admin'))return null;return <WhatsAppLink className="whatsapp-floating"/>}
