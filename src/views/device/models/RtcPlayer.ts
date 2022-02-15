// @ts-ignore
import { prepareUrl, srsRtcPlayerAsync } from '@/utils/webrtc'
import { BasePlayer } from './BasePlayer'

export class RtcPlayer extends BasePlayer {
  public init() {
    if (!window.RTCPeerConnection) {
      throw new Error('当前浏览器不支持Webrtc播放器')
    }
    const videoElement: HTMLVideoElement = document.createElement('video')
    videoElement.controls = this.hasControl
    this.wrap.innerHTML = ''
    this.wrap.append(videoElement)

    const tempURL = this.allAddress.webrtcUrl ? this.allAddress.webrtcUrl : this.source

    const conf = prepareUrl(tempURL)
    // console.log('webrtcUrl------>prepareUrl', conf)
    const sdk = srsRtcPlayerAsync()
    sdk.onaddstream = (event: any) => {
      videoElement.srcObject = event.stream
      this.autoPlayVideo(videoElement)
    }

    sdk.play(conf.apiUrl, conf.streamUrl).then((session: any) => {
      console.log(session)
    }).catch((error: any) => {
      sdk.close()
      throw new Error(error)
    })
    this.player = videoElement
  }

  /**
   * 绑定事件
   */
  public bindEvent() {
    this.player.addEventListener('play', this.onPlay.bind(this))
    this.player.addEventListener('pause', this.onPause.bind(this))
    this.player.addEventListener('timeupdate', this.onTimeUpdate.bind(this))
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
  }
}
