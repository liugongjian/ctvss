
import { Player } from './Player'
import { EnhanceHTMLVideoElement } from '../types/Player'

export class Mp4Player extends Player {
  /**
   * 初始化
   */
  protected init() {
    const videoElement: EnhanceHTMLVideoElement = document.createElement('video')
    videoElement.controls = false
    this.container.innerHTML = ''
    this.container.append(videoElement)
    videoElement.src = this.url
    videoElement.type = 'video/mp4'
    videoElement.autoplay = true
    videoElement.crossOrigin = 'anonymous'
    videoElement.play()
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
   * 重新加载视频
   */
  public reloadPlayer() {
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
    this.isLoading = false
  }
}
