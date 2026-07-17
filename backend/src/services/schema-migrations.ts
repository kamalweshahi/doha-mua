import { DataTypes } from 'sequelize'
import sequelize from '../db/sequelize'
import { AppointmentStatus, BookingLanguage } from '../models/Appointment'
import { VideoStatus } from '../models/Lesson'
import { PurchaseStatus } from '../models/Purchase'

type ColumnMap = Record<string, unknown>
type DatabaseIndex = { name: string; unique?: boolean; fields: Array<{ attribute: string }> }

/**
 * Keeps persisted Docker databases compatible with the current models.
 * Sequelize sync without `alter` intentionally does not mutate existing tables.
 */
export async function migrateSchema() {
  const queryInterface = sequelize.getQueryInterface()
  const tables = await queryInterface.showAllTables()
  if (tables.includes('users')) {
    const userColumns = await queryInterface.describeTable('users') as ColumnMap
    if (!userColumns.is_blocked) await queryInterface.addColumn('users', 'is_blocked', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false })
    if (!userColumns.phone) await queryInterface.addColumn('users', 'phone', { type: DataTypes.STRING(30), allowNull: true })
    if (!userColumns.preferred_language) await queryInterface.addColumn('users', 'preferred_language', { type: DataTypes.ENUM('en', 'ar'), allowNull: false, defaultValue: 'en' })
  }
  if (tables.includes('courses')) {
    const courseColumns = await queryInterface.describeTable('courses') as ColumnMap
    const addCourseColumn = async (name: string, definition: Parameters<typeof queryInterface.addColumn>[2]) => {
      if (!courseColumns[name]) await queryInterface.addColumn('courses', name, definition)
    }
    await addCourseColumn('title_en', { type: DataTypes.STRING(160), allowNull: true })
    await addCourseColumn('title_ar', { type: DataTypes.STRING(160), allowNull: true })
    await addCourseColumn('short_description_en', { type: DataTypes.STRING(500), allowNull: true })
    await addCourseColumn('short_description_ar', { type: DataTypes.STRING(500), allowNull: true })
    await addCourseColumn('description_en', { type: DataTypes.TEXT, allowNull: true })
    await addCourseColumn('description_ar', { type: DataTypes.TEXT, allowNull: true })
    await addCourseColumn('instructor_name_en', { type: DataTypes.STRING(120), allowNull: true })
    await addCourseColumn('instructor_name_ar', { type: DataTypes.STRING(120), allowNull: true })
    await addCourseColumn('instructor_bio_en', { type: DataTypes.TEXT, allowNull: true })
    await addCourseColumn('instructor_bio_ar', { type: DataTypes.TEXT, allowNull: true })
    await addCourseColumn('sale_price', { type: DataTypes.DECIMAL(10, 2), allowNull: true })
    await addCourseColumn('is_featured', { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false })
    await sequelize.query('UPDATE courses SET title_en = title WHERE title_en IS NULL')
    await sequelize.query('UPDATE courses SET description_en = description WHERE description_en IS NULL')
    await sequelize.query('UPDATE courses SET instructor_name_en = instructor_name WHERE instructor_name_en IS NULL')
    await sequelize.query('UPDATE courses SET instructor_bio_en = instructor_bio WHERE instructor_bio_en IS NULL')
  }
  if (tables.includes('lessons')) {
    const lessonColumns = await queryInterface.describeTable('lessons') as ColumnMap
    if (!lessonColumns.title_en) await queryInterface.addColumn('lessons', 'title_en', { type: DataTypes.STRING(180), allowNull: true })
    if (!lessonColumns.title_ar) await queryInterface.addColumn('lessons', 'title_ar', { type: DataTypes.STRING(180), allowNull: true })
    if (!lessonColumns.description_en) await queryInterface.addColumn('lessons', 'description_en', { type: DataTypes.TEXT, allowNull: true })
    if (!lessonColumns.description_ar) await queryInterface.addColumn('lessons', 'description_ar', { type: DataTypes.TEXT, allowNull: true })
    if (!lessonColumns.video_provider) await queryInterface.addColumn('lessons', 'video_provider', { type: DataTypes.STRING(40), allowNull: true })
    if (!lessonColumns.video_id) await queryInterface.addColumn('lessons', 'video_id', { type: DataTypes.STRING(255), allowNull: true })
    if (!lessonColumns.video_status) await queryInterface.addColumn('lessons', 'video_status', { type: DataTypes.ENUM(...Object.values(VideoStatus)), allowNull: false, defaultValue: VideoStatus.NotUploaded })
    if (!lessonColumns.playback_reference) await queryInterface.addColumn('lessons', 'playback_reference', { type: DataTypes.STRING(500), allowNull: true })
    await sequelize.query('UPDATE lessons SET title_en = title WHERE title_en IS NULL')
    await sequelize.query('UPDATE lessons SET description_en = description WHERE description_en IS NULL')
    if (lessonColumns.video_url) { await sequelize.query("UPDATE lessons SET playback_reference = video_url, video_provider = 'legacy', video_status = 'READY' WHERE video_url IS NOT NULL AND video_url <> '' AND playback_reference IS NULL"); await queryInterface.removeColumn('lessons', 'video_url') }
  }
  if (tables.includes('purchases')) {
    await queryInterface.changeColumn('purchases', 'status', { type: DataTypes.ENUM(...Object.values(PurchaseStatus)), allowNull: false, defaultValue: PurchaseStatus.Pending })
  }
  if (!tables.includes('appointments')) return

  const columns = await queryInterface.describeTable('appointments') as ColumnMap
  const appointmentIndexes = await queryInterface.showIndex('appointments') as unknown as DatabaseIndex[]
  const uniqueAvailabilityIndexes = appointmentIndexes.filter(index => index.unique && index.fields.some(field => field.attribute === 'availability_id'))
  const hasAvailabilityForeignKeyIndex = appointmentIndexes.some(index => !index.unique && index.fields.length === 1 && index.fields[0].attribute === 'availability_id')
  if (uniqueAvailabilityIndexes.length && !hasAvailabilityForeignKeyIndex) await queryInterface.addIndex('appointments', ['availability_id'], { name: 'appointments_availability_fk_idx' })
  for (const index of uniqueAvailabilityIndexes) await queryInterface.removeIndex('appointments', index.name)
  const add = async (name: string, definition: Parameters<typeof queryInterface.addColumn>[2]) => {
    if (!columns[name]) await queryInterface.addColumn('appointments', name, definition)
  }

  await add('email', { type: DataTypes.STRING(180), allowNull: true })
  await add('event_type', { type: DataTypes.STRING(80), allowNull: true })
  await add('city', { type: DataTypes.STRING(100), allowNull: true })
  await add('people_count', { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 })
  await add('preferred_language', { type: DataTypes.ENUM(...Object.values(BookingLanguage)), allowNull: false, defaultValue: BookingLanguage.English })

  // Preserve legacy bookings while giving new public bookings stricter validation.
  await queryInterface.changeColumn('appointments', 'status', { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'requested' })
  await sequelize.query("UPDATE appointments SET email = CONCAT('legacy-booking-', id, '@doha-mua.local') WHERE email IS NULL OR email = ''")
  await sequelize.query("UPDATE appointments SET event_type = 'legacy' WHERE event_type IS NULL OR event_type = ''")
  await sequelize.query("UPDATE appointments SET city = 'Israel' WHERE city IS NULL OR city = ''")
  await sequelize.query("UPDATE appointments SET status = 'PENDING' WHERE status = 'requested'")
  await sequelize.query("UPDATE appointments SET status = UPPER(status) WHERE status IN ('confirmed', 'cancelled')")

  await queryInterface.changeColumn('appointments', 'email', { type: DataTypes.STRING(180), allowNull: false })
  await queryInterface.changeColumn('appointments', 'event_type', { type: DataTypes.STRING(80), allowNull: false })
  await queryInterface.changeColumn('appointments', 'city', { type: DataTypes.STRING(100), allowNull: false })
  await queryInterface.changeColumn('appointments', 'user_id', { type: DataTypes.INTEGER.UNSIGNED, allowNull: true })
  await queryInterface.changeColumn('appointments', 'status', { type: DataTypes.ENUM(...Object.values(AppointmentStatus)), allowNull: false, defaultValue: AppointmentStatus.Pending })
}
