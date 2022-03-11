/**
 * 录像片段
 */
export class Record {
  /* 开始时间（时间戳/秒） */
  public startTime: number
  /* 结束时间（时间戳/秒） */
  public endTime: number
  /* 片段时长(秒) */
  public duration: number
  /* 录像URL */
  public url: string
  /* 视频编码 */
  public codec: string
  /* 录像名称 */
  public templateName: string
  /* 视频缩略图 */
  public cover: string

  public index: number

  constructor(record: Record) {
    this.startTime = record.startTime
    this.endTime = record.endTime
    this.duration = record.duration
    this.url = record.url
    this.codec = record.codec
    this.templateName = record.templateName
    this.cover = record.cover
    this.index = record.index
  }
}
