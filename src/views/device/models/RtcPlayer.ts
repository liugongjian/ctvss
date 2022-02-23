// @ts-ignore
import { prepareUrl, srsRtcPlayerAsync } from '@/utils/webrtc'
import { BasePlayer } from './BasePlayer'

export class RtcPlayer extends BasePlayer {
  private rtc?: any
  private rtcConf: any

  public init() {
    if (!window.RTCPeerConnection) {
      throw new Error('当前浏览器不支持Webrtc播放器')
    }
    const videoElement: HTMLVideoElement = document.createElement('video')
    videoElement.controls = this.hasControl
    this.wrap.innerHTML = ''
    this.wrap.append(videoElement)

    const tempURL = this.allAddress.webrtcUrl ? this.allAddress.webrtcUrl : this.source

    this.rtcConf = prepareUrl(tempURL)
    this.rtc = srsRtcPlayerAsync()

    this.rtc.onaddstream = (event: any) => {
      videoElement.srcObject = event.stream
      this.autoPlayVideo(videoElement)
    }

    // 断连后尝试重新连接
    this.rtc.onconnectionstatechange = (state: string) => {
      if (state === 'disconnected') {
        this.retry(true)
      }
    }

    this.connectRtc()
    this.player = videoElement
  }

  /**
   * 进行WebRTC SDP协商
   */
  private connectRtc() {
    this.rtc.play(this.rtcConf.apiUrl, this.rtcConf.streamUrl).then(() => {
      // console.log(session)
    }).catch(() => {
      this.retry()
    })
  }

  /**
   * 重新拉流
   */
  private retry(immediate: boolean = false) {
    this.rtc.close()
    this.onRetry({
      immediate
    })
  }

  /**
   * 绑定事件
   */
  public bindEvent() {
    this.player.addEventListener('play', this.onPlay.bind(this))
    this.player.addEventListener('pause', this.onPause.bind(this))
    this.player.addEventListener('timeupdate', this.onTimeUpdate.bind(this))
    this.player.addEventListener('volumechange', this.onVolumeChange.bind(this))
    this.player.addEventListener('durationchange', this.onDurationChange.bind(this))
    this.player.addEventListener('ended', this.onEnded.bind(this))
    this.player.addEventListener('seeked', this.onSeeked.bind(this))
    this.player.addEventListener('progress', this.onBuffered.bind(this))
    this.player.addEventListener('loadstart', this.onLoadStart.bind(this))
    this.player.addEventListener('canplay', this.onCanplay.bind(this))
  }

  /**
   * 设置默认值
   */
  public setDefault() {
    this.player.playbackRate = this.playbackRate
  }

  /**
   * 设置默认值
   */
  public play() {
    this.player.play()
  }

  /**
   * 重新加载视频
   */
  public reloadPlayer() {
    this.player = null
    this.rtc.close()
    this.init()
  }

  /**
   * 暂停
   */
  public pause() {
    this.player.pause()
  }

  /**
   * Seek
   * @param time 秒
   */
  public seek(time: number) {
    this.player.currentTime = time
  }

  /**
   * 切换播放速度
   * @param playbackRate
   */
  public setPlaybackRate(playbackRate: number) {
    this.player.playbackRate = playbackRate
  }

  /**
   * 停止
   */
  public stop() {
    this.player.stop()
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    this.player.removeEventListener('play', this.onPlay)
    this.player.removeEventListener('pause', this.onPause)
    this.player.removeEventListener('timeupdate', this.onTimeUpdate)
    this.player.removeEventListener('ended', this.onEnded)
    this.player.removeEventListener('seeked', this.onSeeked)
    this.player.removeEventListener('progress', this.onBuffered)
    this.player.removeEventListener('loadstart', this.onLoadStart)
    this.player.removeEventListener('canplay', this.onCanplay)
    this.player.removeEventListener('volumechange', this.onVolumeChange)
    if (this.rtc) {
      this.rtc.pc && this.rtc.pc.connectionState !== 'close' && this.rtc.pc.removeStream(this.player.srcObject)
      this.rtc.close()
      this.rtc.pc = null
    }
  }
}
