import { getDevicePreview } from '@/api/device'

export default class Screen {
  public deviceId: string
  private url?: string
  private type?: string
  private loading: boolean
  private loaded: boolean

  constructor() {
    this.deviceId = ''
    this.url = ''
    this.type = ''
    this.loading = false
    this.loaded = false
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
    } catch (e) {
      console.error(e)
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
  }
}
