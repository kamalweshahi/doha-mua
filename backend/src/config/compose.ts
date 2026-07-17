import defaultConfig from './default'

export default {
  ...defaultConfig,
  app: {
    ...defaultConfig.app,
    name: 'DOHA MUA',
    publicBackendUrl: process.env.MAKEUP_PUBLIC_BACKEND_URL || 'http://localhost:3000'
  },
  db: {
    ...defaultConfig.db,
    host: process.env.MAKEUP_DB_HOST || 'database'
  }
}
