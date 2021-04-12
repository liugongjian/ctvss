import { getDevicePreview } from '@/api/device'

export default class Screen {
  public deviceId: string
  public inProtocol: string
  public deviceName?: string
  public url?: string
  public type?: string
  public codec?: string
  private loading: boolean
  public loaded: boolean
  public retry?: boolean
  public isLive?: boolean
  public isFullscreen?: boolean
  public streamSize?: number
  public streamNum?: number

  constructor() {
    this.deviceId = ''
    this.inProtocol = ''
    this.url = ''
    this.type = ''
    this.codec = ''
    this.streamSize = 0
    this.streamNum = undefined
    this.loading = false
    this.loaded = false
    this.retry = false
    this.isLive = true
    this.isFullscreen = false
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
      const res: any = await getDevicePreview({
        deviceId: this.deviceId,
        inProtocol: this.inProtocol,
        streamNum: this.streamNum
      })
      if (res.playUrl) {
        this.url = res.playUrl.flvUrl
        this.codec = res.video.codec
      }
      this.retry = false
    } catch (e) {
      if (e.code === 5) {
        this.retry = true
      }
    } finally {
      this.loading = false
    }
  }

  public reset() {
    this.deviceId = ''
    this.url = ''
    this.type = ''
    this.codec = ''
    this.streamSize = 0
    this.streamNum = undefined
    this.loading = false
    this.loaded = false
    this.retry = false
    this.isLive = true
  }

  public fullscreen() {
    this.isFullscreen = true
  }

  public exitFullscreen() {
    this.isFullscreen = false
  }
}
