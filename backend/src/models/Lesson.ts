import { AllowNull, AutoIncrement, BelongsTo, Column, DataType, Default, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Course from './Course'
export enum VideoStatus { NotUploaded = 'NOT_UPLOADED', Processing = 'PROCESSING', Ready = 'READY' }
export enum VideoProvider { VdoCipher = 'VDOCIPHER' }

@Table({ tableName: 'lessons', underscored: true })
export default class Lesson extends Model {
  @PrimaryKey @AutoIncrement @Column(DataType.INTEGER.UNSIGNED) declare id: number
  @ForeignKey(() => Course) @AllowNull(false) @Column(DataType.INTEGER.UNSIGNED) declare courseId: number
  @AllowNull(false) @Column(DataType.STRING(180)) declare title: string
  @Column(DataType.STRING(180)) declare titleEn?: string
  @Column(DataType.STRING(180)) declare titleAr?: string
  @AllowNull(false) @Column(DataType.TEXT) declare description: string
  @Column(DataType.TEXT) declare descriptionEn?: string
  @Column(DataType.TEXT) declare descriptionAr?: string
  @AllowNull(false) @Column(DataType.INTEGER.UNSIGNED) declare position: number
  @Column(DataType.STRING(40)) declare videoProvider?: string
  @Column(DataType.STRING(255)) declare videoId?: string
  @AllowNull(false) @Default(VideoStatus.NotUploaded) @Column(DataType.ENUM(...Object.values(VideoStatus))) declare videoStatus: VideoStatus
  @Column(DataType.STRING(500)) declare playbackReference?: string
  @BelongsTo(() => Course) declare course: Course
}
