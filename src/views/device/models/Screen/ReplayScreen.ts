
import { getLocaleDate, getDateByTime } from '@/utils/date'
import { Screen } from './Screen'
import { RecordManager } from '../Record/RecordManager'
import { Record } from '../Record/Record'
import { Player } from '@/components/Player/models/Player'

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
  /* 播放器实例 */
  public player: Player
  /* 查找最新录像定时器 */
  private recordInterval: any
  /* 当前日期（时间戳/秒） */
  private currentDate: number

  constructor() {
    super()
    this.recordManager = null
    this.recordList = []
    this.currentRecord = null
    this.currentTime = null
    this.player = null
    this.recordInterval = null
    this.currentDate = Math.floor(getLocaleDate().getTime() / 1000)
  }

  /**
   * 初始化录像
   * 1) 初始化RecordManager录像管理器
   * 2) 获取当前所选日期一整天的录像列表
   * 3) 获取第一段录像
   */
  public async init() {
    try {
      this.isLoading = true
      this.recordManager = new RecordManager({
        deviceId: this.deviceInfo.deviceId,
        inProtocol: this.deviceInfo.inProtocol,
        recordType: this.recordType
      })
      this.recordList = await this.recordManager.getRecordList(this.currentDate, this.currentDate + 24 * 60 * 60)
      this.currentRecord = this.recordList[0]
      this.getLatestRecord()
    } catch (e) {
      console.log(e)
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 销毁录像
   */
  public destroy() {
    clearInterval(this.recordInterval)
  }

  /**
   * 切换日期
   * @param date 日期
   * @param isConcat 是否合并到现有列表，如果false将覆盖现有列表并播放第一段
   */
  public async changeDate(date: number, isConcat = false) {
    this.currentDate = date
    const records = await this.recordManager.getRecordList(date, date + 24 * 60 * 60)
    if (!records) return
    if (isConcat) {
      // 如果切换的日期大于现在的日期，则往后添加，否则往前添加
      if (date > this.currentDate) {
        this.recordList = this.recordList.concat(records)
      } else {
        this.recordList = records.concat(this.recordList)
      }
    } else {
      this.recordList = records
      this.currentRecord = this.recordList[0]
    }
  }

  /**
   * 跳转到指定的时间
   * 1) 获取指定时间的录像片段，在录像列表中寻找，如果未找到则根据日期添加新列表
   * 2) 如果指定时间的录像!==当前片段，切换currentRecord，并设置初始时间
   * 3) 如果指定时间的录像===当前片段，执行seek()
   * @param time 跳转的目标时间（时间戳/秒）
   */
  public async seek(time: number) {
    let record = this.getRecordByTime(time)
    const date = getDateByTime(time * 1000) / 1000
    if (record) {
      if (!this.currentRecord || this.currentRecord.startTime !== record.startTime) {
        this.currentRecord = record
        this.currentRecord.offsetTime = time - record.startTime
      } else {
        this.currentRecord.offsetTime = null
        this.player.seek(time - this.currentRecord.startTime)
      }
      this.currentDate = date
    } else {
      await this.changeDate(date, true)
      this.currentRecord = this.getRecordByTime(time) || this.currentRecord
      if (this.currentRecord) {
        this.currentRecord.offsetTime = time - this.currentRecord.startTime
      }
    }
  }

  /**
   * 播放下一段
   */
  public playNextRecord() {
    const nextRecord = this.recordList.find(record => record.startTime >= this.currentRecord.endTime)
    if (nextRecord) {
      this.currentRecord = nextRecord
      const date = getDateByTime(this.currentRecord.startTime * 1000) / 1000
      this.currentDate = date
    }
  }

  /**
   * 根据指定时间查找当前录像列表中的录像片段
   * @param time 指定时间（时间戳/秒）
   * @returns 录像片段
   */
  private getRecordByTime(time: number) {
    return this.recordList.find(record => {
      return (time! >= record.startTime) && (time! < record.endTime)
    })
  }

  /**
   * 定时轮询新录像 && 录像中行人时间段信息
   * 1) 如果当前时间小于今日0点，则不加载最新录像
   * 1) 获取录制规则
   * 2) 获取最后一段录像的endTime作为最新录像的startTime查询参数
   * 3) 查询最新录像
   * 4) 合并数组
   */
  private async getLatestRecord() {
    if (!this.recordList.length) return
    try {
      const interval = await this.recordManager.getRecordInterval()
      if (interval) {
        this.recordInterval = setInterval(async() => {
          if (this.currentDate < getLocaleDate().getTime() / 1000) return
          const lastRecord = this.recordList[this.recordList.length - 1]
          const startTime = lastRecord.endTime - 3 * 60
          const endTime = Math.floor(new Date().getTime() / 1000)
          const records = await this.recordManager.getRecordList(startTime, endTime)
          if (records) {
            this.recordList = this.recordList.concat(records)
          }
        }, interval * 1000)
      }
    } catch (e) {
      console.log(e)
    }
  }
}
