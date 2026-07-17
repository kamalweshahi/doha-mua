import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Index, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Appointment from './Appointment'
import Availability from './Availability'
import User from './User'

export enum BookingPaymentStatus {
  Pending = 'PENDING', Success = 'SUCCESS', Failed = 'FAILED', Cancelled = 'CANCELLED',
  RefundRequired = 'REFUND_REQUIRED', Refunded = 'REFUNDED'
}

@Table({ tableName: 'booking_payments', underscored: true, indexes: [{ fields: ['user_id'] }, { fields: ['availability_id'] }, { fields: ['appointment_id'] }] })
export default class BookingPayment extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER.UNSIGNED) declare id: number
  @ForeignKey(() => User) @AllowNull(false) @Index @Column(DataType.INTEGER.UNSIGNED) declare userId: number
  @ForeignKey(() => Availability) @AllowNull(false) @Index @Column(DataType.INTEGER.UNSIGNED) declare availabilityId: number
  @ForeignKey(() => Appointment) @Index @Column(DataType.INTEGER.UNSIGNED) declare appointmentId?: number | null
  @AllowNull(false) @Column(DataType.DECIMAL(10, 2)) declare amount: string
  @AllowNull(false) @Column(DataType.STRING(3)) declare currency: string
  @AllowNull(false) @Column(DataType.STRING(30)) declare provider: string
  @Column(DataType.STRING(255)) declare providerReference?: string | null
  @AllowNull(false) @Default(BookingPaymentStatus.Pending) @Column(DataType.ENUM(...Object.values(BookingPaymentStatus))) declare status: BookingPaymentStatus
  @BelongsTo(() => User) declare user: User
  @BelongsTo(() => Availability) declare availability: Availability
  @BelongsTo(() => Appointment) declare appointment?: Appointment
}
