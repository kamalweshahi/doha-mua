import { AllowNull, AutoIncrement, Column, DataType, Default, HasMany, Index, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Purchase from './Purchase'
import Appointment from './Appointment'

export enum Role {
  Student = 'student',
  Admin = 'admin'
}

@Table({ tableName: 'users', underscored: true })
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare firstName: string

  @AllowNull(false)
  @Column(DataType.STRING(50))
  declare lastName: string

  @AllowNull(false)
  @Index({ unique: true })
  @Column(DataType.STRING(255))
  declare email: string

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare password: string

  @AllowNull(false)
  @Default(Role.Student)
  @Column(DataType.ENUM(...Object.values(Role)))
  declare role: Role
  @AllowNull(false) @Default(false) @Column(DataType.BOOLEAN) declare isBlocked: boolean
  @Column(DataType.STRING(30)) declare phone?: string | null
  @AllowNull(false) @Default('en') @Column(DataType.ENUM('en', 'ar')) declare preferredLanguage: 'en' | 'ar'

  @HasMany(() => Purchase, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare purchases: Purchase[]

  @HasMany(() => Appointment, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  declare appointments: Appointment[]

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
