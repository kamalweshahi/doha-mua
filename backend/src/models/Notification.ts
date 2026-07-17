import { AllowNull, AutoIncrement, Column, DataType, Default, Model, PrimaryKey, Table } from 'sequelize-typescript'

export enum NotificationType { Purchase = 'purchase', Appointment = 'appointment' }

@Table({ tableName: 'notifications', underscored: true })
export default class Notification extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER.UNSIGNED) declare id: number
  @AllowNull(false) @Column(DataType.ENUM(...Object.values(NotificationType))) declare type: NotificationType
  @AllowNull(false) @Column(DataType.STRING(255)) declare message: string
  @AllowNull(false) @Default(false) @Column(DataType.BOOLEAN) declare isRead: boolean
}
