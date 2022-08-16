import axios from 'axios'
import screenLogManager from './ScreenLogManager'
import { DeviceInfo, StreamInfo, Stream } from '@/components/VssPlayer/types/VssPlayer'
import { RecordManager } from '../Record/RecordManager'
import { Player } from '@/components/Player/services/Player'
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
  public lastIsMuted?: boolean
  public log?: {
    previewRequestId: string,
    previewStartTimestamp?: number
    previewEndTimestamp?: number
    previewError: string
    playerInitTimestamp?: number
    playerLoadstartTimestamp?: number
    playerCanplayTimstamp?: number
  }

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
  /* 当前时间（时间戳/秒），用于缓存恢复和同步向相邻录像时间 */
  public currentRecordDatetime: number
  /* 录像时间范围约束 */
  public datetimeRange?: { startTime: number; endTime: number; }

  /**
   * ----------------
   * 私有变量
   * ----------------
   */
  private _volume?: number
  private _isMuted?: boolean
  private _playbackRate?: number
  private _scale?: string

  /**
   * ----------------
   * 错误码 & 文案
   * ----------------
   */
  public ERROR_CODE = {
    NO_RECORD: 13,
    NO_STORE: 8,
    OUT_OF_RANGE: 14
  }
  public ERROR = {
    NO_RECORD: '该时段没有录像',
    NO_STORE: '视频资源包未包含存储',
    OUT_OF_RANGE: '超出时间范围'
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
    this.streams = []
    this.streamSize = null
    this.streamNum = null
    this.videoWidth = null
    this.videoHeight = null
    this.codec = null
    this.url = ''
    this.hasRtc = false
    this.recordType = 0
    this.currentRecordDatetime = null
    this._volume = null
    this._isMuted = null
    this._playbackRate = null
    this._scale = null
    this.log = {
      previewRequestId: null,
      previewStartTimestamp: null,
      previewEndTimestamp: null,
      previewError: null,
      playerInitTimestamp: null,
      playerLoadstartTimestamp: null,
      playerCanplayTimstamp: null
    }
    this.recordManager = new RecordManager({
      screen: this
    })
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

  /* 获取音量 */
  public get volume() {
    return (this.player && this.player.volume) || this._volume || 0.3
  }

  /* 存音量 */
  public set volume(volume) {
    this._volume = volume
  }

  /* 获取是否静音 */
  public get isMuted() {
    if (this.player) {
      return this.player.isMuted
    } else {
      return this._isMuted || false
    }
  }

  /* 存是否静音 */
  public set isMuted(isMuted) {
    this._isMuted = isMuted
  }

  /* 获取倍速 */
  public get playbackRate() {
    return (this.player && this.player.playbackRate) || this._playbackRate || 1
  }

  /* 存倍速 */
  public set playbackRate(playbackRate) {
    this._playbackRate = playbackRate
  }

  /* 获取缩放比例 */
  public get scale() {
    return (this.player && this.player.scale) || this._scale
  }

  /* 存缩放比例 */
  public set scale(scale) {
    this._scale = scale
  }

  /**
   * ----------------
   * 公共操作
   * ----------------
   */
  public init() {
    try {
      // 先销毁原有的录像列表和取消原有请求
      this.recordManager && this.recordManager.destroy()
      this.axiosSource && this.axiosSource.cancel()
      this.isLive ? this.initLive() : this.initReplay()
    } catch (e) {
      console.error(e)
      throw new Error(e.message)
    }
  }

  public fullscreen() {
    this.isFullscreen = true
  }

  public exitFullscreen() {
    this.isFullscreen = false
  }

  /**
   * 销毁
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
      this.axiosSource && this.axiosSource.cancel()
      this.axiosSource = axios.CancelToken.source()
      this.url = ''
      this.log.previewStartTimestamp = new Date().getTime()
      const res: any = await getDevicePreview({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        streamNum: this.streamNum,
        'self-defined-headers': {
          'role-id': this.roleId || '',
          'real-group-id': this.realGroupId || ''
        }
      }, this.axiosSource.token)
      this.log.previewEndTimestamp = new Date().getTime()
      this.log.previewRequestId = res.requestId
      if (res.playUrl) {
        this.url = this.getVideoUrl(res.playUrl)
        this.hasRtc = !!res.playUrl.webrtcUrl
        this.codec = res.video.codec
        const videoInfo = this.parseVideoInfo(res.videoInfo)
        this.videoWidth = videoInfo.videoWidth
        this.videoHeight = videoInfo.videoHeight
        if (this.streamNum && this.streams.length) {
          const stream = this.streams[this.streamNum - 1]
          if (stream) stream.streamStatus = 'on'
        }
      }
      this.isLoading = false
    } catch (e) {
      if (e.code !== -2 && e.code !== -1) {
        this.errorMsg = e.message
        this.log.previewError = e.message
        this.log.previewRequestId = e.requestId
        this.log.previewEndTimestamp = new Date().getTime()
        screenLogManager.addLog(this)
      }
      if (e.code !== -2) this.isLoading = false
      throw new Error(e.message)
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
    this.recordManager.init()
    // this.recordManager = new RecordManager({
    //   screen: this
    // })
  }
}