import { AllowNull, AutoIncrement, Column, DataType, Default, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Lesson from './Lesson'
import Purchase from './Purchase'

export enum CourseStatus { Draft = 'draft', Published = 'published' }

@Table({ tableName: 'courses', underscored: true })
export default class Course extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER.UNSIGNED) declare id: number
  @AllowNull(false) @Column(DataType.STRING(160)) declare title: string
  @Column(DataType.STRING(160)) declare titleEn?: string
  @Column(DataType.STRING(160)) declare titleAr?: string
  @Column(DataType.STRING(500)) declare shortDescriptionEn?: string
  @Column(DataType.STRING(500)) declare shortDescriptionAr?: string
  @AllowNull(false) @Column(DataType.TEXT) declare description: string
  @Column(DataType.TEXT) declare descriptionEn?: string
  @Column(DataType.TEXT) declare descriptionAr?: string
  @AllowNull(false) @Column(DataType.DECIMAL(10, 2)) declare price: string
  @Column(DataType.DECIMAL(10, 2)) declare salePrice?: string | null
  @AllowNull(false) @Default(false) @Column(DataType.BOOLEAN) declare isFeatured: boolean
  @AllowNull(false) @Column(DataType.STRING(255)) declare imageName: string
  @AllowNull(false) @Column(DataType.STRING(120)) declare instructorName: string
  @Column(DataType.STRING(120)) declare instructorNameEn?: string
  @Column(DataType.STRING(120)) declare instructorNameAr?: string
  @AllowNull(false) @Column(DataType.TEXT) declare instructorBio: string
  @Column(DataType.TEXT) declare instructorBioEn?: string
  @Column(DataType.TEXT) declare instructorBioAr?: string
  @AllowNull(false) @Default(CourseStatus.Draft) @Column(DataType.ENUM(...Object.values(CourseStatus))) declare status: CourseStatus
  @HasMany(() => Lesson, { onDelete: 'CASCADE', onUpdate: 'CASCADE' }) declare lessons: Lesson[]
  @HasMany(() => Purchase, { onDelete: 'CASCADE', onUpdate: 'CASCADE' }) declare purchases: Purchase[]
}
