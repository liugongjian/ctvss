/**
 * 录像管理器
 */
import axios from 'axios'
import { Record } from './Record'
import { getTimestamp } from '@/utils/date'
import { getDeviceRecords, getDeviceRecord, getDeviceRecordStatistic, editRecordName, getDeviceRecordRule, describeHeatMap, getDevicePreview } from '@/api/device'

export class RecordManager {
  /* 设备ID */
  public deviceId: number
  /* 设备协议 */
  public inProtocol: string
  /* 录像信息 */
  public recordInfo: any
  public roleId: string
  public realGroupId: string
  /* 分页大小 */
  public pageSize?: string

  private axiosSource

  private recordInterval

  public recordStatistic: Map<string, any>

  constructor(params: any) {
    this.deviceId = params.deviceId
    this.inProtocol = params.inProtocol
    this.recordInfo = params.recordInfo
    this.recordStatistic = new Map()
  }

  /**
   * 获取回放列表
   * @param startTime 开始时间（时间戳/秒）
   * @param endTime 结束时间（时间戳/秒）
   * @returns 录像文件列表(Promise)
   */
  public async getRecordList(startTime: number, endTime: number) {
    try {
      this.axiosSource && this.axiosSource.cancel()
      this.axiosSource = axios.CancelToken.source()
      const res = await getDeviceRecords({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        recordType: this.recordInfo.recordType,
        startTime,
        endTime,
        pageSize: 9999
      }, this.axiosSource.token)
      return res.records.map((record: any) => {
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
        type: type[this.recordInfo.recordType],
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
   * 获取行人时间段列表
   * 来自从化需求
   */
  public getHeatMapList() {

  }

  /**
   * 获取录制规则时间间隔
   * @returns 时间间隔（秒）
   */
  public async getRecordInterval() {
    const res = await getDeviceRecordRule({
      deviceId: this.deviceId
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
   * 获取本地录像地址
   */
  public async getLocalUrl(startTime: number) {
    this.axiosSource && this.axiosSource.cancel()
    this.axiosSource = axios.CancelToken.source()
    const endTime = startTime + 24 * 60 * 60 - 1
    let url
    let codec
    const res: any = await getDevicePreview({
      deviceId: this.deviceId,
      inProtocol: this.inProtocol,
      outNetwork: 'internet',
      type: 'vod',
      startTime,
      endTime,
      'self-defined-headers': {
        'role-id': this.roleId || '',
        'real-group-id': this.realGroupId || ''
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
