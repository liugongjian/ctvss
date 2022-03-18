import axios from 'axios'
import { DeviceInfo, StreamInfo, Stream } from '@/components/VssPlayer/models/VssPlayer'
import { RecordManager } from '../Record/RecordManager'
import { Record } from '../Record/Record'
import { Player } from '@/components/Player/models/Player'
import { getDevicePreview } from '@/api/device'
import { getLocaleDate, getDateByTime, currentTimeZeroMsec } from '@/utils/date'

export class Screen {
  /* 播放器类型 */
  public type?: string
  /* 播放器实例 */
  public player: Player
  public isLive?: boolean
  public isLoading: Boolean
  public isFullscreen?: boolean
  public isInitialized: boolean
  public axiosSource: any
  public errorMsg?: string
  public isCache?: boolean

  /**
   * ----------------
   * 设备相关属性
   * ----------------
   */
  public deviceId?: number
  public inProtocol?: string
  public deviceName?: string
  public roleId?: string
  public realGroupId?: string

  /**
   * ----------------
   * 实时预览相关属性
   * ----------------
   */
  /* 直播视频地址 */
  public url?: string
  /* 是否开启RTC切换 */
  public hasRtc?: boolean
  public streams: Stream[]
  public streamSize: number
  public streamNum: number
  public videoWidth: number
  public videoHeight: number
  public codec: string

  /**
   * ----------------
   * 录像回放相关操作
   * ----------------
   */
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
  /* 查找最新录像定时器 */
  private recordInterval: any
  /* 当前日期（时间戳/秒） */
  public currentDate: number
  // set\axisS \axisE
  /* set 已加载录像日期 */
  private recordsLoadedDates = new Set()

  constructor() {
    this.type = 'flv'
    this.player = null
    this.deviceId = null
    this.inProtocol = ''
    this.deviceName = ''
    this.roleId = null
    this.realGroupId = null
    this.isLive = null
    this.isLoading = false
    this.isInitialized = false
    this.isFullscreen = false
    this.axiosSource = null
    this.errorMsg = ''
    this.isCache = false
    this.streams = []
    this.streamSize = null
    this.streamNum = null
    this.videoWidth = null
    this.videoHeight = null
    this.codec = null
    this.url = ''
    this.hasRtc = false
    this.recordManager = null
    this.recordList = []
    this.currentRecord = null
    this.currentTime = null
    this.recordInterval = null
    this.currentDate = Math.floor(getLocaleDate().getTime() / 1000)
  }

  public get deviceInfo(): DeviceInfo {
    return {
      deviceId: this.deviceId,
      inProtocol: this.inProtocol,
      deviceName: this.deviceName,
      roleId: this.roleId,
      realGroupId: this.realGroupId
    }
  }

  public get streamInfo(): StreamInfo {
    return {
      streams: this.streams,
      streamSize: this.streamSize,
      streamNum: this.streamNum,
      videoWidth: this.videoWidth,
      videoHeight: this.videoHeight,
      codec: this.codec
    }
  }

  /**
   * ----------------
   * 公共操作
   * ----------------
   */
  public init() {
    this.isLive ? this.initLive() : this.initReplay()
  }

  public fullscreen() {
    this.isFullscreen = true
  }

  public exitFullscreen() {
    this.isFullscreen = false
  }

  /**
   * 销毁录像
   */
  public destroy() {
    clearInterval(this.recordInterval)
    this.axiosSource && this.axiosSource.cancel()
    this.constructor()
  }

  /**
   * ----------------
   * 实时预览相关操作
   * ----------------
   */
  /**
   * 初始化实时预览
   */
  private async initLive() {
    if (!this.deviceInfo.inProtocol) {
      throw new Error('未设置InProtocol')
    }
    if (!this.deviceInfo.deviceId) {
      throw new Error('未设置DeviceId')
    }
    try {
      this.isLoading = true
      this.isInitialized = true
      this.axiosSource = axios.CancelToken.source()
      const res: any = await getDevicePreview({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        streamNum: this.streamNum,
        'self-defined-headers': {
          'role-id': this.roleId || '',
          'real-group-id': this.realGroupId || ''
        }
      }, this.axiosSource.token)
      if (res.playUrl) {
        this.url = this.getVideoUrl(res.playUrl)
        this.hasRtc = !!res.playUrl.webrtcUrl
        this.codec = res.video.codec
        const videoInfo = this.parseVideoInfo(res.videoInfo)
        this.videoWidth = videoInfo.videoWidth
        this.videoHeight = videoInfo.videoHeight
      }
    } catch (e) {
      if (e.code === 5) {
        this.errorMsg = e.message
      }
    } finally {
      this.isLoading = false
    }
  }

  /**
   * 解析视频信息
   * @param videoInfoStr 视频信息JSON字符串
   * @returns { videoWidth, videoHeight }
   */
  private parseVideoInfo(videoInfoStr) {
    let videoWidth = null
    let videoHeight = null
    if (videoInfoStr) {
      const videoInfo = JSON.parse(videoInfoStr)
      videoWidth = videoInfo.Width
      videoHeight = videoInfo.Height
    }
    return {
      videoWidth,
      videoHeight
    }
  }

  /**
   * 根据视频类型获取URL
   * @param urlList URL列表
   * @returns url地址
   */
  private getVideoUrl(urlList: string[]) {
    const dict = {
      flv: 'flvUrl',
      hls: 'hlsUrl',
      rtc: 'webrtcUrl'
    }
    return urlList[dict[this.type]]
  }

  /**
   * ----------------
   * 录像回放相关操作
   * ----------------
   */
  /**
     * 初始化录像
     * 1) 初始化RecordManager录像管理器
     * 2) 获取当前所选日期一整天的录像列表
     * 3) 获取第一段录像
     */
  public async initReplay() {
    try {
      this.isLoading = true
      this.recordManager = new RecordManager({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        recordType: this.recordType
      })
      this.recordManager.getRecordStatistic() // 获得最近两月录像统计
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
   * 切换日期
   * @param date 日期
   * @param isConcat 是否合并到现有列表，如果false将覆盖现有列表并播放第一段
   */
  public async changeDate(date: number, isConcat = false) {
    try {
      this.currentDate = date
      this.isLoading = true
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
    } catch (e) {
      console.log(e)
    } finally {
      this.isLoading = false
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
      if (this.currentDate !== date) {
        await this.changeDate(date, true)
      }
      const record = this.getRecordByTime(time)
      if (record) {
        record.offsetTime = time - this.currentRecord.startTime
      }
      this.currentRecord = record || this.currentRecord
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
