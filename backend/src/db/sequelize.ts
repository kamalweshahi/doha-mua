import { Sequelize } from 'sequelize-typescript'
import config from '../config'
import User from '../models/User'
import Course from '../models/Course'
import Lesson from '../models/Lesson'
import Purchase from '../models/Purchase'
import Availability from '../models/Availability'
import Appointment from '../models/Appointment'
import Notification from '../models/Notification'
import BookingPayment from '../models/BookingPayment'
import WebsiteContent from '../models/WebsiteContent'

const sequelize = new Sequelize({
  dialect: 'mysql',
  models: [User, Course, Lesson, Purchase, Availability, Appointment, BookingPayment, Notification, WebsiteContent],
  logging: false,
  ...config.db
})

export default sequelize
