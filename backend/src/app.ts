import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import sequelize from './db/sequelize'
import config from './config'
import authRouter from './routers/auth'
import coursesRouter from './routers/courses'
import bookingsRouter from './routers/bookings'
import adminRouter from './routers/admin'
import checkoutRouter from './routers/checkout'
import contentRouter from './routers/content'
import authEnforce from './middlewares/auth-enforce'
import optionalAuth from './middlewares/optional-auth'
import notFound from './middlewares/not-found'
import logError from './middlewares/error/log-error'
import respondError from './middlewares/error/error-responder'
import { seedData } from './services/seed-data'
import { migrateSchema } from './services/schema-migrations'

const app = express()

app.use(cors({ origin: config.cors.origin }))
app.use(morgan('dev'))
app.use(express.json())
app.use('/images', express.static(path.resolve(config.app.uploadsDir)))

app.get('/health', (request, response) => response.json({ status: 'ok', service: 'doha-mua-backend', version: '1.0.0' }))
app.get('/api/version', (request, response) => response.json({ service: 'doha-mua-backend', version: '1.0.0', authContract: 'jwt-and-user' }))

app.use('/api/auth', authRouter)
app.use('/api/content', contentRouter)
app.use('/api/courses', coursesRouter)
app.use('/api/bookings', optionalAuth, bookingsRouter)
app.use('/api/checkout', authEnforce, checkoutRouter)
app.use('/api/admin', authEnforce, adminRouter)

app.use(notFound)
app.use(logError)
app.use(respondError)

export default app

export async function init() {
  await sequelize.authenticate()
  await migrateSchema()
  await sequelize.sync({ force: config.app.syncForce })
  await seedData()
}
