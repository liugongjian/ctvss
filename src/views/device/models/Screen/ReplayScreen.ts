import { Screen } from './Screen'
import { RecordManager } from '../Record/RecordManager'
import { Record } from '../Record/Record'

export interface RecordInfo {
  currentDate: number;
  currentTIme: number;
}

export class ReplayScreen extends Screen {
  /* 录像类型 */
  public recordType: number
  /* 录像管理器实例 */
  public recordManager: RecordManager
  /* 录像列表 */
  public recordList: Record[]
  /* 当前正在播放的录像片段 */
  public currentRecord: Record
  /* 当前播放时间（时间戳/秒） */
  public currentTime: number

  constructor() {
    super()
    this.recordManager = null
    this.recordList = []
    this.currentRecord = null
    this.currentTime = null
  }

  /**
   * 初始化录像
   * 1）初始化RecordManager录像管理器
   * 2）获取录像列表
   * 3）获取第一段录像
   */
  public async init() {
    try {
      this.isLoading = true
      this.recordManager = new RecordManager({
        deviceId: this.deviceInfo.deviceId,
        inProtocol: this.deviceInfo.inProtocol,
        recordType: this.recordType
      })
      this.recordList = await this.recordManager.getRecordList()
      this.currentRecord = this.recordList[0]
    } catch (e) {
      console.log(e)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 根据指定时间查找当前录像列表中的录像片段
   * @param time 指定时间（时间戳/秒）
   * @returns 录像片段
   */
  public getRecordByTime(time: number) {
    console.log(time)
    const record = this.recordList.find(record => {
      return (time! >= record.startTime) && (time! <= record.endTime)
    })
    console.log(record)
    return record
  }
}
