import { getDevicePreview } from '@/api/device'

export default class Screen {
  public deviceId: string
  public deviceName?: string
  public url?: string
  private type?: string
  private loading: boolean
  public loaded: boolean
  public retry?: boolean
  public isLive?: boolean

  constructor() {
    this.deviceId = ''
    this.url = ''
    this.type = ''
    this.loading = false
    this.loaded = false
    this.retry = false
    this.isLive = true
  }

  public async getUrl() {
    if (!this.deviceId) {
      throw new Error('未设置DeviceId')
    }
    try {
      this.loading = true
      this.loaded = true
      const res: any = await getDevicePreview({
        deviceId: this.deviceId
      })
      if (res.playUrl) {
        this.url = res.playUrl.flvUrl
        this.type = res.videoCoding === 'h264' ? 'flv' : 'h265-flv'
      }
      this.retry = false
    } catch (e) {
      console.error(e.code)
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
    this.loading = false
    this.loaded = false
    this.retry = false
    this.isLive = true
  }
}
