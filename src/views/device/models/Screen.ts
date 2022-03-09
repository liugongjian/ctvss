import axios from 'axios'
import { DeviceInfo, StreamInfo } from '@/components/VssPlayer/models/VssPlayer'
import { getDevicePreview } from '@/api/device'
import { e } from 'mathjs'

export default class Screen {
  public deviceInfo: DeviceInfo // ok
  public streamInfo: StreamInfo // ok
  public url?: string // ok
  public urlList: Array<string> // ok

  public deviceId: string
  public inProtocol: string
  public deviceName?: string
  public roleId?: string
  public realGroupId?: string
  public realGroupInProtocol?: string
  public type?: string
  public codec?: string
  public loaded: boolean
  public retry?: boolean
  public isLive?: boolean
  public isAi?: boolean
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
  public allAddress?: any
  public volume?: any
  public ifScalePTZ?: boolean

  constructor() {
    this.deviceInfo = {
      deviceId: '',
      inProtocol: '',
      deviceName: ''
    }
    this.streamInfo = {
      streams: [],
      streamSize: null,
      streamNum: null,
      videoWidth: null,
      videoHeight: null
    }

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
    this.isAi = false
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
    this.ifScalePTZ = false
  }

  public async getUrl() {
    if (!this.deviceInfo.inProtocol) {
      throw new Error('未设置InProtocol')
    }
    if (!this.deviceInfo.deviceId) {
      throw new Error('未设置DeviceId')
    }
    try {
      this.loading = true
      this.loaded = true
      this.axiosSource = axios.CancelToken.source()
      const res: any = await getDevicePreview({
        deviceId: this.deviceInfo.deviceId,
        inProtocol: this.deviceInfo.inProtocol,
        streamNum: this.streamInfo.streamNum,
        'self-defined-headers': {
          'role-id': this.roleId || '',
          'real-group-id': this.realGroupId || ''
        }
      }, this.axiosSource.token)
      if (res.playUrl) {
        this.url = res.playUrl.flvUrl
        this.urlList = res.playUrl
        this.codec = res.video.codec
        const videoInfo = this.parseVideoInfo(res.videoInfo)
        this.streamInfo.videoWidth = videoInfo.videoWidth
        this.streamInfo.videoHeight = videoInfo.videoHeight
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
    this.isAi = false
    this.axiosSource && this.axiosSource.cancel()
    this.axiosSource = null
    this.replayType = 'cloud'
    this.currentDate = null
    this.currentTime = null
    this.isCache = false
    this.allAddress = ''
    this.volume = 30
    this.ifScalePTZ = false
  }

  public fullscreen() {
    this.isFullscreen = true
  }

  public exitFullscreen() {
    this.isFullscreen = false
  }

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
}
