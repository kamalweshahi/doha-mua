export default {
  app: {
    port: Number(process.env.MAKEUP_PORT || 3000),
    name: 'DOHA MUA',
    syncForce: process.env.MAKEUP_SYNC_FORCE === 'true',
    jwtKey: process.env.MAKEUP_JWT_KEY || 'change-me-in-production',
    passwordKey: process.env.MAKEUP_PASSWORD_KEY || 'change-me-in-production',
    publicBackendUrl: process.env.MAKEUP_PUBLIC_BACKEND_URL || 'http://localhost:3000',
    uploadsDir: process.env.MAKEUP_UPLOADS_DIR || 'uploads/makeup'
  },
  db: {
    host: process.env.MAKEUP_DB_HOST || 'localhost',
    port: Number(process.env.MAKEUP_DB_PORT || 3306),
    username: process.env.MAKEUP_DB_USER || 'root',
    password: process.env.MAKEUP_DB_PASSWORD || '',
    database: process.env.MAKEUP_DB_NAME || 'makeup_atelier'
  },
  google: {
    clientId: process.env.MAKEUP_GOOGLE_CLIENT_ID || ''
  },
  cors: {
    origin: process.env.MAKEUP_CORS_ORIGIN || '*'
  },
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true', provider: process.env.EMAIL_PROVIDER || '', from: process.env.EMAIL_FROM || '', adminEmail: process.env.ADMIN_EMAIL || 'Kamalweshahi15@gmail.com',
    smtp: { host: process.env.SMTP_HOST || '', port: Number(process.env.SMTP_PORT || 0), user: process.env.SMTP_USER || '', password: process.env.SMTP_PASSWORD || '' }, resendApiKey: process.env.RESEND_API_KEY || ''
  },
  vdoCipher: {
    apiSecret: process.env.VDOCIPHER_API_SECRET || ''
  }
}
