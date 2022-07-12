// @ts-ignore
import { prepareUrl, srsRtcPlayerAsync } from '../libs/webrtc'
import { Player } from './Player'

export class RtcPlayer extends Player {
  private rtc?: any
  private rtcConf: any

  protected async init() {
    if (!window.RTCPeerConnection) {
      throw new Error('当前浏览器不支持Webrtc播放器')
    }
    const videoElement: HTMLVideoElement = document.createElement('video')
    videoElement.controls = false
    this.container.innerHTML = ''
    this.container.append(videoElement)

    this.rtcConf = prepareUrl(this.url)
    this.rtc = srsRtcPlayerAsync()

    this.rtc.onaddstream = (event: any) => {
      videoElement.srcObject = event.stream
      this.startAutoPlay()
    }

    // 断连后尝试重新连接
    this.rtc.onconnectionstatechange = (state: string) => {
      if (state === 'disconnected') {
        this.retry(true)
      }
    }

    this.connectRtc()
    this.video = videoElement
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
   * 检测是否有音频
   */
  protected testHasAudio() {
    // @ts-ignore
    this.hasAudio = Boolean(this.video.srcObject && this.video.srcObject.getAudioTracks && this.video.srcObject.getAudioTracks().length)
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
  protected bindEvent() {
    this.video.addEventListener('play', this.onPlay.bind(this))
    this.video.addEventListener('pause', this.onPause.bind(this))
    this.video.addEventListener('timeupdate', this.onTimeUpdate.bind(this))
    this.video.addEventListener('volumechange', this.onVolumeChange.bind(this))
    this.video.addEventListener('durationchange', this.onDurationChange.bind(this))
    this.video.addEventListener('ended', this.onEnded.bind(this))
    this.video.addEventListener('seeked', this.onSeeked.bind(this))
    this.video.addEventListener('progress', this.onBuffered.bind(this))
    this.video.addEventListener('loadstart', this.onLoadStart.bind(this))
    this.video.addEventListener('canplay', this.onCanplay.bind(this))
  }

  /**
   * 重新加载视频
   */
  public reloadPlayer() {
    this.video = null
    this.rtc.close()
    this.init()
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    this.video.removeEventListener('play', this.onPlay)
    this.video.removeEventListener('pause', this.onPause)
    this.video.removeEventListener('timeupdate', this.onTimeUpdate)
    this.video.removeEventListener('ended', this.onEnded)
    this.video.removeEventListener('seeked', this.onSeeked)
    this.video.removeEventListener('progress', this.onBuffered)
    this.video.removeEventListener('loadstart', this.onLoadStart)
    this.video.removeEventListener('canplay', this.onCanplay)
    this.video.removeEventListener('volumechange', this.onVolumeChange)
    if (this.rtc) {
      this.rtc.pc && this.rtc.pc.connectionState !== 'close' && this.video.srcObject && this.rtc.pc.removeStream(this.video.srcObject)
      this.rtc.close()
      this.rtc.pc = null
    }
    this.isLoading = false
  }
}
