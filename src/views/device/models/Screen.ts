import axios from 'axios'
import { getDevicePreview } from '@/api/device'

export default class Screen {
  [x: string]: any
  public deviceId: string
  public inProtocol: string
  public deviceName?: string
  public roleId?: string
  public realGroupId?: string
  public realGroupInProtocol?: string
  public url?: string
  public type?: string
  public codec?: string
  public loaded: boolean
  public retry?: boolean
  public isLive?: boolean
  public isFullscreen?: boolean
  public streamSize?: number
  public streamNum?: number
  public streams?: Array<any>
  private loading: boolean
  private axiosSource: any
  public onCanPlay?: boolean
  public calendarFocus?: boolean
  public errorMsg?: string
  // 为录像组件时存储观看记录需要用到以下参数
  public replayType?: string
  public currentDate?: any
  public currentTime?: number
  public isCache?: boolean
  public videoInfo?: string
  public allAddress?: any
  public volume?: any

  constructor() {
    this.deviceId = ''
    this.inProtocol = ''
    this.roleId = ''
    this.realGroupId = ''
    this.realGroupInProtocol = ''
    this.url = ''
    this.type = ''
    this.codec = ''
    this.streamSize = 0
    this.streamNum = undefined
    this.streams = []
    this.loading = false
    this.loaded = false
    this.retry = false
    this.isLive = true
    this.isFullscreen = false
    this.axiosSource = null
    this.onCanPlay = false
    this.calendarFocus = false
    this.errorMsg = ''
    this.replayType = 'cloud'
    this.currentDate = null
    this.currentTime = null
    this.isCache = false
    this.videoInfo = ''
    this.allAddress = ''
    this.volume = 30
  }

  public async getUrl() {
    if (!this.inProtocol) {
      throw new Error('未设置InProtocol')
    }
    if (!this.deviceId) {
      throw new Error('未设置DeviceId')
    }
    try {
      this.loading = true
      this.loaded = true
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
        this.url = res.playUrl.flvUrl
        this.allAddress = res.playUrl
        this.codec = res.video.codec
        this.videoInfo = res.videoInfo
      }
      this.retry = false
    } catch (e) {
      if (e.code === 5) {
        this.errorMsg = e.message
        this.retry = true
      }
    } finally {
      this.loading = false
    }
  }

  public reset() {
    this.deviceId = ''
    this.roleId = ''
    this.realGroupId = ''
    this.realGroupInProtocol = ''
    this.url = ''
    this.type = ''
    this.codec = ''
    this.streamSize = 0
    this.streamNum = undefined
    this.streams = []
    this.loading = false
    this.loaded = false
    this.retry = false
    this.isLive = true
    this.axiosSource && this.axiosSource.cancel()
    this.axiosSource = null
    this.replayType = 'cloud'
    this.currentDate = null
    this.currentTime = null
    this.isCache = false
    this.allAddress = ''
    this.volume = 30
  }

  public fullscreen() {
    this.isFullscreen = true
  }

  public exitFullscreen() {
    this.isFullscreen = false
  }
}
