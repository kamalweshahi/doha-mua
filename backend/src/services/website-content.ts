import WebsiteContent from '../models/WebsiteContent'

export const websiteContentDefaults = {
  id: 1,
  heroTitleEn: 'Beauty, refined with intention',
  heroTitleAr: 'جمال مصقول بعناية',
  heroSubtitleEn: 'Bridal artistry and professional makeup education by DOHA MUA.',
  heroSubtitleAr: 'فن مكياج العرائس وتعليم المكياج الاحترافي من DOHA MUA.',
  aboutEn: 'DOHA MUA creates refined, modern makeup with a calm and personal approach.',
  aboutAr: 'تقدّم DOHA MUA مكياجاً عصرياً راقياً بأسلوب هادئ وشخصي.',
  bridalDescriptionEn: 'Studio bridal makeup designed around your features, style and celebration.',
  bridalDescriptionAr: 'مكياج عروس داخل الاستوديو مصمم بما يناسب ملامحك وأسلوبك واحتفالك.',
  studioAddressEn: 'DOHA MUA studio — the full address is sent after booking confirmation.',
  studioAddressAr: 'استوديو DOHA MUA — يُرسل العنوان الكامل بعد تأكيد الحجز.',
  whatsappNumber: '972556800545',
  contactEmail: 'Kamalweshahi15@gmail.com'
}

export async function getWebsiteContent() {
  const [content] = await WebsiteContent.findOrCreate({ where: { id: 1 }, defaults: websiteContentDefaults })
  return content
}
