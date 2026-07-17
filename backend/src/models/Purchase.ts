import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Index, Model, PrimaryKey, Table } from 'sequelize-typescript'
import User from './User'
import Course from './Course'

export enum PurchaseStatus { Pending = 'pending', Paid = 'paid', Failed = 'failed', Cancelled = 'cancelled', Refunded = 'refunded' }
export enum PaymentProvider { Manual = 'manual', PayPal = 'paypal', PayPlus = 'payplus' }

@Table({ tableName: 'purchases', underscored: true, indexes: [{ unique: true, fields: ['user_id', 'course_id'] }] })
export default class Purchase extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER.UNSIGNED) declare id: number
  @ForeignKey(() => User) @AllowNull(false) @Index @Column(DataType.INTEGER.UNSIGNED) declare userId: number
  @ForeignKey(() => Course) @AllowNull(false) @Index @Column(DataType.INTEGER.UNSIGNED) declare courseId: number
  @AllowNull(false) @Column(DataType.DECIMAL(10, 2)) declare amount: string
  @AllowNull(false) @Default(PurchaseStatus.Pending) @Column(DataType.ENUM(...Object.values(PurchaseStatus))) declare status: PurchaseStatus
  @AllowNull(false) @Default(PaymentProvider.Manual) @Column(DataType.ENUM(...Object.values(PaymentProvider))) declare provider: PaymentProvider
  @Column(DataType.STRING(255)) declare providerReference?: string
  @BelongsTo(() => User) declare user: User
  @BelongsTo(() => Course) declare course: Course
}
