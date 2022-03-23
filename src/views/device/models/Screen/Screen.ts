import axios from 'axios'
import { DeviceInfo, StreamInfo, Stream } from '@/components/VssPlayer/models/VssPlayer'
import { RecordManager } from '../Record/RecordManager'
import { Player } from '@/components/Player/models/Player'
import { getDevicePreview } from '@/api/device'

export class Screen {
  /* 播放器类型 */
  public type?: string
  /* 播放器实例 */
  public player: Player
  public isLive?: boolean
  public isLoading: Boolean
  public isFullscreen?: boolean
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
  /* 录像管理器实例 */
  public recordManager: RecordManager
  /* 录像类型 0-云端，1-本地 */
  public recordType: 0 | 1
  /* 当前时间（时间戳/秒），用于缓存恢复 */
  public currentRecordDatetime: number

  /**
   * ----------------
   * 文案
   * ----------------
   */
  public ERROR = {
    NO_RECORD: '该时段没有录像'
  }

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
    this.recordType = 0
    this.currentRecordDatetime = null
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
    this.recordManager && this.recordManager.destroy()
    this.axiosSource && this.axiosSource.cancel()
    this.constructor()
  }

  /**
   * ================================
   * 实时预览相关操作
   * ================================
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
      this.errorMsg = null
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
      this.errorMsg = e.message
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
   * ================================
   * 录像回放相关操作
   * ================================
   */
  /**
     * 初始化录像
     * 1) 初始化RecordManager录像管理器
     * 2) 获取当前所选日期一整天的录像列表
     * 3) 云端：获取第一段录像，本地：获取第一段时间的录像URL
     */
  public async initReplay() {
    if (!this.deviceId) return
    this.recordManager = new RecordManager({
      screen: this
    })
  }
}
