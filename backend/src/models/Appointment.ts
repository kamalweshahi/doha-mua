import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript'
import User from './User'
import Availability from './Availability'
import BookingPayment from './BookingPayment'

export enum AppointmentStatus { Pending = 'PENDING', Confirmed = 'CONFIRMED', Cancelled = 'CANCELLED', Completed = 'COMPLETED' }
export enum BookingLanguage { English = 'en', Arabic = 'ar' }

@Table({ tableName: 'appointments', underscored: true, indexes: [{ fields: ['user_id'] }, { fields: ['availability_id'] }, { fields: ['email'] }] })
export default class Appointment extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER.UNSIGNED) declare id: number
  @ForeignKey(() => User) @Column(DataType.INTEGER.UNSIGNED) declare userId?: number
  @ForeignKey(() => Availability) @AllowNull(false) @Column(DataType.INTEGER.UNSIGNED) declare availabilityId: number
  @AllowNull(false) @Column(DataType.STRING(120)) declare brideName: string
  @AllowNull(false) @Column(DataType.STRING(180)) declare email: string
  @AllowNull(false) @Column(DataType.STRING(30)) declare phone: string
  @AllowNull(false) @Column(DataType.STRING(160)) declare venue: string
  @AllowNull(false) @Column(DataType.STRING(80)) declare eventType: string
  @AllowNull(false) @Column(DataType.STRING(100)) declare city: string
  @AllowNull(false) @Default(1) @Column(DataType.INTEGER.UNSIGNED) declare peopleCount: number
  @AllowNull(false) @Default(BookingLanguage.English) @Column(DataType.ENUM(...Object.values(BookingLanguage))) declare preferredLanguage: BookingLanguage
  @Column(DataType.TEXT) declare notes?: string
  @AllowNull(false) @Default(AppointmentStatus.Pending) @Column(DataType.ENUM(...Object.values(AppointmentStatus))) declare status: AppointmentStatus
  @BelongsTo(() => User) declare user: User
  @BelongsTo(() => Availability) declare availability: Availability
  @HasOne(() => BookingPayment) declare bookingPayment?: BookingPayment
}
