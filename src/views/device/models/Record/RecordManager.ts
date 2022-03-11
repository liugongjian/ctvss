/**
 * 录像管理器
 */
import axios from 'axios'
import { Record } from './Record'
import { dateFormatInTable, dateFormat, durationFormatInTable, prefixZero, getLocaleDate, getTimestamp } from '@/utils/date'
import { getDeviceRecords, getDeviceRecord, getDeviceRecordStatistic, editRecordName, getDeviceRecordRule, describeHeatMap } from '@/api/device'

export class RecordManager {
  /* 设备ID */
  public deviceId: number
  /* 设备协议 */
  public inProtocol: string
  /* 录像类型(0-云端，1-本地) */
  public recordType: number
  /* 开始时间(时间戳/秒) */
  public startTime?: number
  /* 结束时间(时间戳/秒) */
  public endTime?: number
  /* 分页大小 */
  public pageSize?: string
  /* 录像片段列表 */
  // public list?: Record[]

  private axiosSource
  /* 当前客户端日期（时间戳/秒） */
  private currentDate: number

  private recordStatistic: Map<string, any> = new Map()

  constructor(params: any) {
    this.deviceId = params.deviceId
    this.inProtocol = params.inProtocol
    this.recordType = params.recordType
    // this.startTime = params.startTime
    // this.endTime = params.endTime
    // this.list = []
    this.currentDate = getLocaleDate().getTime() / 1000
  }

  /**
   * 获取回放列表
   * @param startTime 开始时间（时间戳/秒）
   * @returns 录像文件列表(Promise)
   */
  public async getRecordList(startTime?: number) {
    try {
      this.axiosSource && this.axiosSource.cancel()
      this.axiosSource = axios.CancelToken.source()
      const res = await getDeviceRecords({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        recordType: this.recordType,
        startTime: startTime || this.currentDate,
        endTime: this.currentDate + 24 * 60 * 60,
        pageSize: 9999
      }, this.axiosSource.token)
      return res.records.map((record: any, index: number) => {
        return new Record({
          startTime: getTimestamp(record.startTime) / 1000,
          endTime: getTimestamp(record.endTime) / 1000,
          duration: record.duration,
          url: record.playUrl.hlsUrl,
          codec: record.video.codec,
          templateName: record.templateName,
          cover: record.cover,
          index: index
        })
      })
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取日历统计
   */
  public async getRecordStatistic(startTime: number, endTime: number) {
    try {
      const res = await getDeviceRecordStatistic({
        type: this.recordType,
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
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
   * 定时轮询新录像 && 录像中行人时间段信息
   */
  public getLatestRecord() {

  }

  /**
   * 分页获取录像列表
   */
  public getRecordListByPage() {

  }

  /**
   * 获取行人时间段列表
   * 来自从化需求
   */
  public getHeatMap() {

  }

  /**
   * 下载录像
   */
  public downloadRecord() {

  }

  /**
   * 播放录像
   */
  public playRecord() {

  }
}
