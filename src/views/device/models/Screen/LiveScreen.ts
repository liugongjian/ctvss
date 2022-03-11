import axios from 'axios'
import { Screen } from './Screen'
import { StreamInfo } from '@/components/VssPlayer/models/VssPlayer'
import { getDevicePreview } from '@/api/device'

export class LiveScreen extends Screen {
  public streamInfo: StreamInfo // ok
  public url?: string // ok
  public hasRtc?: boolean // ok

  constructor() {
    super()
    this.streamInfo = {
      streams: [],
      streamSize: null,
      streamNum: null,
      videoWidth: null,
      videoHeight: null
    }
    this.url = ''
    this.hasRtc = false
  }

  /**
   * 初始化录像
   */
  public async init() {
    if (!this.deviceInfo.inProtocol) {
      throw new Error('未设置InProtocol')
    }
    if (!this.deviceInfo.deviceId) {
      throw new Error('未设置DeviceId')
    }
    try {
      this.isLoading = true
      this.initialized = true
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
        this.url = this.getVideoUrl(res.playUrl)
        this.hasRtc = !!res.playUrl.webrtcUrl
        // this.urls = res.playUrl
        this.codec = res.video.codec
        const videoInfo = this.parseVideoInfo(res.videoInfo)
        this.streamInfo.videoWidth = videoInfo.videoWidth
        this.streamInfo.videoHeight = videoInfo.videoHeight
      }
      // this.retry = false
    } catch (e) {
      if (e.code === 5) {
        this.errorMsg = e.message
        // this.retry = true
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
}
