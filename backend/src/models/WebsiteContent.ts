import { AllowNull, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

@Table({ tableName: 'website_content', underscored: true, timestamps: true })
export default class WebsiteContent extends Model {
  @PrimaryKey @Column(DataType.INTEGER.UNSIGNED) declare id: number
  @AllowNull(false) @Column(DataType.STRING(180)) declare heroTitleEn: string
  @AllowNull(false) @Column(DataType.STRING(180)) declare heroTitleAr: string
  @AllowNull(false) @Column(DataType.STRING(500)) declare heroSubtitleEn: string
  @AllowNull(false) @Column(DataType.STRING(500)) declare heroSubtitleAr: string
  @AllowNull(false) @Column(DataType.TEXT) declare aboutEn: string
  @AllowNull(false) @Column(DataType.TEXT) declare aboutAr: string
  @AllowNull(false) @Column(DataType.TEXT) declare bridalDescriptionEn: string
  @AllowNull(false) @Column(DataType.TEXT) declare bridalDescriptionAr: string
  @AllowNull(false) @Column(DataType.STRING(500)) declare studioAddressEn: string
  @AllowNull(false) @Column(DataType.STRING(500)) declare studioAddressAr: string
  @AllowNull(false) @Column(DataType.STRING(30)) declare whatsappNumber: string
  @AllowNull(false) @Column(DataType.STRING(255)) declare contactEmail: string
}
