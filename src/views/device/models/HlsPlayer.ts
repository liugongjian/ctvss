// @ts-ignore
import Hls from 'hls.js'
import { BasePlayer } from './BasePlayer'

export class HlsPlayer extends BasePlayer {
  public hls?: any
  private manifestLoadingTimeOutMaxRetry = 3
  private manifestLoadingTimeOutRetryTimes = 0

  public init() {
    if (!Hls.isSupported()) {
      throw new Error('当前浏览器不支持Hls播放器')
    }
    const videoElement: HTMLVideoElement = document.createElement('video')
    videoElement.controls = this.hasControl
    this.wrap.innerHTML = ''
    this.wrap.append(videoElement)
    const hls = new Hls({
      manifestLoadingTimeOut: 5000,
      manifestLoadingMaxRetry: 3,
      maxBufferLength: 10
    })
    hls.loadSource(this.source)
    hls.attachMedia(videoElement)
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      this.autoPlayVideo(videoElement)
    })
    hls.on(Hls.Events.MANIFEST_LOADED, () => {
      this.manifestLoadingTimeOutRetryTimes = 0
    })
    hls.on(Hls.Events.ERROR, (event: string, data: any) => {
      if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT && this.manifestLoadingTimeOutRetryTimes < this.manifestLoadingTimeOutMaxRetry) {
        this.manifestLoadingTimeOutRetryTimes++
        hls.loadSource(this.source)
      }
    })
    this.hls = hls
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
    this.player.destroy()
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
    this.hls && this.hls.destroy()
  }
}
