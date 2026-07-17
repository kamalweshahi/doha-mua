import { AllowNull, AutoIncrement, Column, DataType, Default, Index, Model, PrimaryKey, Table } from 'sequelize-typescript'

@Table({ tableName: 'availability', underscored: true, indexes: [{ unique: true, fields: ['date', 'start_time'] }] })
export default class Availability extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER.UNSIGNED) declare id: number
  @AllowNull(false) @Index @Column(DataType.DATEONLY) declare date: string
  @AllowNull(false) @Index @Column(DataType.STRING(5)) declare startTime: string
  @AllowNull(false) @Column(DataType.STRING(5)) declare endTime: string
  @AllowNull(false) @Default(true) @Column(DataType.BOOLEAN) declare isAvailable: boolean
}
