/**
 * 录像管理器
 */
import axios from 'axios'
import { Record } from './Record'
import { Screen } from '../Screen/Screen'
import { getTimestamp, getLocaleDate, getDateByTime } from '@/utils/date'
import { getDeviceRecords, getDeviceRecordStatistic, getDeviceRecordRule, describeHeatMap, getDevicePreview, setRecordScale } from '@/api/device'
import { UserModule } from '@/store/modules/user'

export class RecordManager {
  /* 当前分屏 */
  private screen: Screen
  /* 录像列表 */
  public recordList: Record[]
  /* 录像日历统计 */
  public recordStatistic: Map<string, any>
  /* 已加载的录像日期 */
  public loadedRecordDates: Set<number>
  /* 当前正在播放的录像片段 */
  public currentRecord: Record
  /* 查找最新录像定时器 */
  public recordInterval: any
  /* 当前日期（时间戳/秒） */
  public currentDate: number
  /* 当前本地录像片段的起始时间 */
  public localStartTime: number
  /* 分页大小 */
  public pageSize?: string
  /* Axios Source */
  private axiosSource

  constructor(params: any) {
    this.screen = params.screen
    this.recordList = []
    this.recordStatistic = new Map()
    this.loadedRecordDates = new Set()
    this.currentRecord = null
    this.recordInterval = null
    this.currentDate = Math.floor(getLocaleDate().getTime() / 1000)
    this.localStartTime = null
    this.pageSize = null
    this.initReplay()
  }

  public destroy() {
    clearInterval(this.recordInterval)
    this.axiosSource && this.axiosSource.cancel()
  }

  public async initReplay() {
    try {
      this.screen.isLoading = true
      this.screen.errorMsg = null
      this.recordList = []
      this.currentRecord = null
      this.loadedRecordDates.clear()
      this.getRecordStatistic() // 获得最近两月录像统计
      this.recordList = await this.getRecordList(this.currentDate, this.currentDate + 24 * 60 * 60)
      this.loadedRecordDates.add(this.currentDate)
      if (this.recordList && this.recordList.length) {
        /**
         * 0云端：获取第一段录像
         * 1本地：获取URL
         */
        if (this.screen.recordType === 0) {
          this.currentRecord = this.recordList[0]
        } else {
          const res = await this.getLocalUrl(this.recordList[0].startTime)
          this.screen.codec = res.codec
          this.screen.url = res.url
        }
        this.getLatestRecord()
      } else {
        this.screen.errorMsg = this.screen.ERROR.NO_RECORD
      }
    } catch (e) {
      this.screen.errorMsg = e.message
    } finally {
      this.screen.isLoading = false
    }
  }

  /**
   * 加载指定日期的录像数据
   * @param date 日期
   * @param isConcat 是否合并到现有列表，如果false将覆盖现有列表并播放第一段
   * @param isSilence 静悄悄的更新，不出现Loading，不更新当前日期(currentDate)
   */
  public async getRecordListByDate(date: number, isConcat = false, isSilence = false) {
    try {
      if (!isSilence) {
        this.screen.errorMsg = null
        this.screen.isLoading = true
        this.currentDate = date
        this.recordList = []
      }
      if (!isConcat) {
        this.screen.player.pause()
        this.loadedRecordDates.clear()
      } else if (this.loadedRecordDates.has(date)) {
        return
      }
      // 在SET中存入日期，防止重复加载
      this.loadedRecordDates.add(date)
      const records = await this.getRecordList(date, date + 24 * 60 * 60)
      if (records) {
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
      } else if (!isSilence) {
        this.screen.errorMsg = this.screen.ERROR.NO_RECORD
      }
    } catch (e) {
      // 异常时删除日期
      this.loadedRecordDates.delete(date)
      if (!isConcat && !isSilence) {
        this.screen.errorMsg = e.message
      }
    } finally {
      if (!isSilence) this.screen.isLoading = false
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
    this.screen.errorMsg = null
    let record = this.getRecordByTime(time)
    const date = getDateByTime(time * 1000) / 1000
    if (record) {
      if (this.screen.recordType === 0) { // 云端录像
        if (!this.currentRecord || this.currentRecord.startTime !== record.startTime) {
          this.currentRecord = record
          this.currentRecord.offsetTime = time - record.startTime
        } else {
          this.currentRecord.offsetTime = null
          this.screen.player.seek(time - this.currentRecord.startTime)
        }
      } else { // 本地录像
        try {
          this.screen.isLoading = true
          const res = await this.getLocalUrl(time)
          this.screen.codec = res.codec
          this.screen.url = res.url
        } catch (e) {
          this.screen.errorMsg = e.message
        } finally {
          this.screen.isLoading = false
        }
      }
      this.currentDate = date
    } else {
      // 判断该日期是否存在SET中
      if (!this.loadedRecordDates.has(date)) {
        await this.getRecordListByDate(date, true, true)
      }
      const record = this.getRecordByTime(time)
      if (record) {
        record.offsetTime = time - this.currentRecord.startTime
        this.currentRecord = record || this.currentRecord
      } else {
        this.screen.player && this.screen.player.disposePlayer()
        this.screen.player = null
        this.screen.errorMsg = this.screen.ERROR.NO_RECORD // 无录像提示
        this.currentDate = date
        this.screen.isLoading = false
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
      const interval = await this.getRecordInterval()
      if (interval) {
        this.recordInterval = setInterval(async() => {
          console.log('定时轮询新录像', this.screen.deviceId)
          if (this.currentDate < getLocaleDate().getTime() / 1000) return
          const lastRecord = this.recordList[this.recordList.length - 1]
          const startTime = lastRecord.endTime - 3 * 60
          const endTime = Math.floor(new Date().getTime() / 1000)
          const records = await this.getRecordList(startTime, endTime)
          if (records) {
            this.recordList = this.recordList.concat(records)
          }
        }, interval * 1000)
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取回放列表
   * @param startTime 开始时间（时间戳/秒）
   * @param endTime 结束时间（时间戳/秒）
   * @returns 录像文件列表(Promise)
   */
  private async getRecordList(startTime: number, endTime: number) {
    try {
      // this.axiosSource && this.axiosSource.cancel()
      this.axiosSource = axios.CancelToken.source()
      const res = await getDeviceRecords({
        deviceId: this.screen.deviceId,
        inProtocol: this.screen.inProtocol,
        recordType: this.screen.recordType,
        startTime,
        endTime,
        pageSize: 9999
      }, this.axiosSource.token)
      return res.records.map((record: any, index: number) => {
        const currentEnd = getTimestamp(record.endTime)
        const threshold = +UserModule.tags.fixRecordGap
        record.endTime = currentEnd
        if (index + 1 < res.records.length) {
          const nextStart = getTimestamp(res.records[index + 1]['startTime'])
          record.endTime = (nextStart - currentEnd) / 1000 < threshold ? nextStart : currentEnd
          record.testdelta = (nextStart - getTimestamp(record.startTime))
        }
        return new Record({
          startTime: getTimestamp(record.startTime) / 1000,
          endTime: getTimestamp(record.endTime) / 1000,
          duration: record.duration,
          url: record.playUrl.hlsUrl,
          codec: record.video.codec,
          templateName: record.templateName,
          cover: record.cover
        })
      })
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取日历统计
   */
  public async getRecordStatistic(startTime?: number, endTime?: number) {
    try {
      if (!startTime) {
        // 获得最近两月录像统计
        const current = new Date()
        startTime = Math.floor(new Date(current.getFullYear(), current.getMonth() - 1).getTime() / 1000)
        endTime = Math.floor(new Date().getTime() / 1000)
      }
      const type = ['cloud', 'local']
      const res = await getDeviceRecordStatistic({
        type: type[this.screen.recordType],
        deviceId: this.screen.deviceId,
        inProtocol: this.screen.inProtocol,
        startTime: startTime,
        endTime: endTime
      })
      res.records.forEach((statistic: any) => {
        const monthArray = statistic.day.match(/\d+-\d+/)
        const month = monthArray ? monthArray[0] : null
        if (!this.recordStatistic.has(month)) {
          this.recordStatistic.set(month, new Set())
        }
        this.recordStatistic.get(month).add(statistic.day)
      })
    } catch (e) {
      console.log(e)
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
   * 获取行人时间段列表
   * 来自从化需求
   */
  public getHeatMapList() {

  }

  /**
   * 获取录制规则时间间隔
   * @returns 时间间隔（秒）
   */
  private async getRecordInterval() {
    const res = await getDeviceRecordRule({
      deviceId: this.screen.deviceId
    })
    return res.interval
  }

  /**
   * 分页获取录像列表
   */
  public getRecordListByPage() {

  }

  /**
   * 下载录像
   */
  public downloadRecord() {

  }

  /**
   * ================================
   * 本地录像相关操作
   * ================================
   */
  /**
   * 设置播放速率
   */
  public setPlaybackRate(playbackRate: number) {
    setRecordScale({
      deviceId: this.screen.deviceId,
      playUrl: this.screen.url,
      scale: playbackRate.toString()
    })
  }

  /**
   * 获取本地录像地址
   */
  private async getLocalUrl(startTime: number) {
    this.localStartTime = startTime
    // this.axiosSource && this.axiosSource.cancel()
    this.axiosSource = axios.CancelToken.source()
    const endTime = startTime + 24 * 60 * 60 - 1
    let url
    let codec
    const res: any = await getDevicePreview({
      deviceId: this.screen.deviceId,
      inProtocol: this.screen.inProtocol,
      type: 'vod',
      startTime,
      endTime,
      'self-defined-headers': {
        'role-id': this.screen.roleId || '',
        'real-group-id': this.screen.realGroupId || ''
      }
    }, this.axiosSource.token)
    if (res.playUrl) {
      url = res.playUrl.flvUrl
      codec = res.video.codec
    }
    return {
      url,
      codec
    }
  }
}
