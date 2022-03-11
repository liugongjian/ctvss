
import { DeviceInfo } from '@/components/VssPlayer/models/VssPlayer'

export class Screen {
  public deviceInfo: DeviceInfo // ok

  public isLoading: Boolean
  public axiosSource: any
  public initialized: boolean

  // public urls?: any

  public deviceId: string
  public inProtocol: string
  public deviceName?: string
  public roleId?: string
  public realGroupId?: string
  public realGroupInProtocol?: string
  public type?: string
  public codec?: string
  public retry?: boolean
  public isLive?: boolean
  public isAi?: boolean
  public isFullscreen?: boolean
  public streamSize?: number
  public streamNum?: number
  public streams?: Array<any>
  public onCanPlay?: boolean
  public calendarFocus?: boolean
  public errorMsg?: string
  // 为录像组件时存储观看记录需要用到以下参数
  public replayType?: string
  public isCache?: boolean
  public allAddress?: any
  public volume?: any
  public ifScalePTZ?: boolean

  constructor() {
    this.deviceInfo = {
      deviceId: null,
      inProtocol: '',
      deviceName: ''
    }

    this.deviceId = ''
    this.inProtocol = ''
    this.roleId = ''
    this.realGroupId = ''
    this.realGroupInProtocol = ''
    this.type = ''
    this.codec = ''
    this.streamSize = 0
    this.streamNum = undefined
    this.streams = []
    this.isLoading = false
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
}
