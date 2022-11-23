import { Player } from './Player'
import { EnhanceHTMLVideoElement, PlayerConfig } from '../types/Player'
import FlvJS from 'flv.js/src/flv.js'

/**
 * FLV播放器
 * 基于flv.js
 */
export class FlvPlayer extends Player {
  private flv?: any
  private mseError = false
  private mseErrorCount = 0

  constructor(config: PlayerConfig) {
    super(config)
    this.init()
    this.bindEvent()
    this.setDefault()
  }

  /**
   * 初始化
   */
  protected init() {
    if (!FlvJS.isSupported()) {
      throw new Error('当前浏览器不支持Flv播放器')
    }
    FlvJS.LoggingControl.enableError = false
    FlvJS.LoggingControl.enableWarn = false
    const videoElement: EnhanceHTMLVideoElement = document.createElement('video')
    videoElement.controls = false
    videoElement.poster = this.poster
    this.container.innerHTML = ''
    this.container.append(videoElement)
    const flvPlayer = FlvJS.createPlayer({
      type: 'flv',
      isLive: true,
      url: this.url,
      stashInitialSize: this.isLive ? 128 : 384 // 减少首帧显示等待时长
    })
    flvPlayer.attachMediaElement(videoElement)
    flvPlayer.load()
    flvPlayer.play()
    flvPlayer.on(FlvJS.Events.ERROR, (e: any) => {
      // 网络错误
      if (e === FlvJS.ErrorTypes.NETWORK_ERROR) {
        this.isDebug && console.log('NETWORK_ERROR', e)
        this.onRetry()
      }
      // 视频解码错误
      if (e === FlvJS.ErrorTypes.MSE_ERROR && !this.mseError) {
        this.isDebug && console.log('MSE_ERROR', e, this.mseErrorCount)
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
    flvPlayer.on(FlvJS.Events.METADATA_ARRIVED, (e: any) => {
      this.isDebug && console.log('METADATA_ARRIVED', e)
    })
    flvPlayer.on(FlvJS.Events.SCRIPTDATA_ARRIVED, (e: any) => {
      this.isDebug && console.log('SCRIPTDATA_ARRIVED', e)
      this.mseError = false
    })
    flvPlayer.on(FlvJS.Events.METADATA_ARRIVED, (e: any) => {
      this.isDebug && console.log('LOADING_COMPLETE', e)
    })
    flvPlayer.on(FlvJS.Events.MEDIA_ENDED, () => {
      this.onRetry()
    })
    this.flv = flvPlayer
    this.video = videoElement
  }

  /**
   * 绑定事件
   */
  protected bindEvent() {
    this.video.addEventListener('play', this.onPlay.bind(this))
    this.video.addEventListener('pause', this.onPause.bind(this))
    this.video.addEventListener('timeupdate', this.onTimeUpdate.bind(this))
    this.video.addEventListener('volumechange', this.onVolumeChange.bind(this))
    this.video.addEventListener('ratechange', this.onRateChange.bind(this))
    this.video.addEventListener('ended', this.onEnded.bind(this))
    this.video.addEventListener('seeked', this.onSeeked.bind(this))
    this.video.addEventListener('progress', this.onBuffered.bind(this))
    this.video.addEventListener('loadstart', this.onLoadStart.bind(this))
    this.video.addEventListener('canplay', this.onCanplay.bind(this))
  }

  /**
   * 销毁播放器
   */
  public disposePlayer() {
    this.video.removeEventListener('play', this.onPlay)
    this.video.removeEventListener('pause', this.onPause)
    this.video.removeEventListener('timeupdate', this.onTimeUpdate)
    this.video.removeEventListener('volumechange', this.onVolumeChange)
    this.video.removeEventListener('ratechange', this.onRateChange)
    this.video.removeEventListener('ended', this.onEnded)
    this.video.removeEventListener('seeked', this.onSeeked)
    this.video.removeEventListener('progress', this.onBuffered)
    this.video.removeEventListener('loadstart', this.onLoadStart)
    this.video.removeEventListener('canplay', this.onCanplay)
    this.flv && this.flv.destroy()
    this.flv = null
    this.isLoading = false
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
   * 回调事件
   * 当进行预加载
   */
  protected onBuffered() {
    if (this.video.buffered.length) {
      this.bufferedTime = this.video.buffered.end(this.video.buffered.length - 1)
      this.config.onBuffered && this.config.onBuffered(this.bufferedTime)
      this.isLive && this.catchTime()
    }
  }

  /**
   * 解决直播延时累加，进行追帧设置
   */
  private catchTime() {
    const delta = this.bufferedTime - this.currentTime

    // 延迟过大，通过跳帧的方式更新视频
    if (delta > 10 || delta < 0) {
      this.seek(this.bufferedTime)
      return
    }

    // 追帧
    if (delta > 1) {
      this.setPlaybackRate(1.2)
    } else {
      this.setPlaybackRate(1)
    }
  }
}
