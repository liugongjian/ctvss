// @ts-ignore
import flvjs from 'flv.js/src/flv.js'
import { BasePlayer } from './BasePlayer'

export class FlvPlayer extends BasePlayer {
  public flv?: any
  private mseError = false
  private mseErrorCount = 0

  public init() {
    if (!flvjs.isSupported()) {
      throw new Error('当前浏览器不支持Flv播放器')
    }
    flvjs.LoggingControl.enableError = false
    flvjs.LoggingControl.enableWarn = false
    const videoElement: HTMLVideoElement = document.createElement('video')
    videoElement.controls = this.hasControl
    this.wrap.innerHTML = ''
    this.wrap.append(videoElement)
    const flvPlayer = flvjs.createPlayer({
      type: 'flv',
      isLive: true,
      url: this.source,
      hasAudio: false
    })
    flvPlayer.attachMediaElement(videoElement)
    flvPlayer.load()
    flvPlayer.play()
    flvPlayer.on(flvjs.Events.ERROR, (e: any) => {
      // 网络错误
      if (e === flvjs.ErrorTypes.NETWORK_ERROR) {
        console.log('NETWORK_ERROR', e)
        this.onRetry()
      }
      // 视频解码错误
      if (e === flvjs.ErrorTypes.MSE_ERROR && !this.mseError) {
        console.log('MSE_ERROR', e, this.mseErrorCount)
        this.mseError = true
        this.mseErrorCount++
        // 先尝试reload播放器，如果5次无法继续播放，则重新渲染播放器
        if (this.mseErrorCount <= 5) {
          this.reloadPlayer()
        } else {
          this.onRetry({
            immediate: true
          })
        }
      }
    })
    flvPlayer.on(flvjs.Events.METADATA_ARRIVED, (e: any) => {
      console.log('METADATA_ARRIVED', e)
    })
    flvPlayer.on(flvjs.Events.SCRIPTDATA_ARRIVED, (e: any) => {
      console.log('SCRIPTDATA_ARRIVED', e)
      this.mseError = false
    })
    flvPlayer.on(flvjs.Events.METADATA_ARRIVED, (e: any) => {
      console.log('LOADING_COMPLETE', e)
    })
    flvPlayer.on(flvjs.Events.MEDIA_ENDED, () => {
      if (this.isLive) {
        this.onRetry()
      }
    })
    this.flv = flvPlayer
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
    this.flv.unload()
    this.flv.load()
    this.flv.play()
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
    this.flv && this.flv.destroy()
  }
}
